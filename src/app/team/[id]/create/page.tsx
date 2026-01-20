'use client';

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import {
  ArrowLeft,
  X,
  Upload,
  FileText,
  Tag,
  Loader2,
} from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TiptapEditor } from '@/common/components/Editor';
import { useImageUpload } from '@/common/components/Editor/hooks/useImageUpload';
import { API_BASE_URL } from '@/lib/api/config';
import { uploadFile } from '@/lib/api/upload';
import { getRecruit, updateRecruit } from '@/lib/api/recruit';
import { toast } from '@/lib/toast';
import type { BoardListResponse, FileResponse } from '@/lib/api/types';

interface RecruitFormData {
  title: string;
  content: string;
  tags: string[];
  startDate: string;
  endDate: string;
  files: File[];
}

function stripHtml(html: string): string {
  if (typeof document === 'undefined') return html;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export default function CreateRecruitPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const teamId = parseInt(params.id as string, 10);
  const { data: session, status } = useSession();
  const { upload: uploadImage } = useImageUpload();

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
    }
  }, [status, router]);

  const [formData, setFormData] = useState<RecruitFormData>({
    title: '',
    content: '',
    tags: [],
    startDate: '',
    endDate: '',
    files: [],
  });

  useEffect(() => {
    if (isEditMode && editId && session?.accessToken) {
      getRecruit(Number(editId), session.accessToken)
        .then((recruit) => {
          setFormData({
            title: recruit.title,
            content: recruit.content,
            tags: recruit.tags || [],
            startDate: recruit.startDate.split('T')[0],
            endDate: recruit.endDate ? recruit.endDate.split('T')[0] : '',
            files: [], // Files handling is tricky, might need separate logic or assume empty for now as API might not return file objects easily
          });
        })
        .catch((err) => {
          console.error(err);
          toast.error('공고 정보를 불러오는데 실패했습니다.');
          router.back();
        });
    }
  }, [isEditMode, editId, session?.accessToken, router]);

  // Draft Persistence Logic
  const DRAFT_KEY = `recruit-draft-${teamId}`;

  useEffect(() => {
    // Only load draft if NOT in edit mode
    if (!isEditMode && typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // Confirm with user if they want to restore (optional, but good UX)
          // For now, let's auto-restore for seamlessness, or maybe add a toast saying "Draft restored"
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            files: [], // Files cannot be restored from localStorage
          }));
          toast.success('작성 중인 내용을 불러왔습니다.');
        } catch (e) {
          console.error('Failed to parse draft', e);
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    }
  }, [isEditMode, teamId, DRAFT_KEY]);

  // Save draft on change (Debounced 1s)
  useEffect(() => {
    if (isEditMode) return; // Don't overwrite draft with edit data

    const timeoutId = setTimeout(() => {
      const draftData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, isEditMode, teamId, DRAFT_KEY]);

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RecruitFormData, string>>
  >({});
  const isComposingRef = useRef(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RecruitFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleContentChange = (html: string) => {
    setFormData((prev) => ({ ...prev, content: html }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: '' }));
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (formData.tags.includes(trimmed)) {
      setTagInput('');
      return;
    }
    if (formData.tags.length >= 5) {
      alert('태그는 최대 5개까지 추가할 수 있습니다.');
      return;
    }
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (formData.files.length + files.length > 5) {
      alert('파일은 최대 5개까지 업로드 가능합니다.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      alert('각 파일의 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setFormData((prev) => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RecruitFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }
    const contentText = stripHtml(formData.content).trim();
    if (!contentText) {
      newErrors.content = '내용을 입력해주세요';
    }
    if (!formData.startDate) {
      newErrors.startDate = '모집 시작일을 선택해주세요';
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = '모집 마감일은 시작일 이후여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (status === 'loading') {
      toast.error('잠시 후 다시 시도해주세요.');
      return;
    }

    const accessToken = session?.accessToken;
    if (!accessToken) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // 첨부파일 업로드
      const attachmentIds: number[] = [];
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          try {
            const fileResponse: FileResponse = await uploadFile(file, { accessToken });
            attachmentIds.push(fileResponse.id);
          } catch (uploadError) {
            console.error('파일 업로드 실패:', file.name, uploadError);
            throw new Error(`파일 업로드 실패: ${file.name}`);
          }
        }
      }

      const commonData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        teamId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      };



      // Board ID finding logic (needed for both create and update if update requires it)
      const boardsRes = await fetch(`${API_BASE_URL}/v1/community/boards`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
      if (!boardsRes.ok) throw new Error('게시판 정보를 불러오지 못했습니다.');
      const boardsResponse: BoardListResponse = await boardsRes.json();
      const recruitBoard = boardsResponse.boards.find((b) => b.isRecruitAllowed);
      if (!recruitBoard) throw new Error('모집공고 게시판을 찾을 수 없습니다.');

      const requestData = {
        boardId: recruitBoard.id,
        ...commonData,
      };

      if (isEditMode && editId) {
        await updateRecruit(Number(editId), requestData, { accessToken });
        toast.success('모집공고가 수정되었습니다.');
      } else {
        const response = await fetch(`${API_BASE_URL}/v1/community/recruits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '모집공고 작성에 실패했습니다.');
        }
        toast.success('팀원 모집글이 등록되었습니다.');
      }

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);

      router.refresh(); // Force refresh to update server components (invalidate cache)
      router.back();
    } catch (error) {
      console.error('모집공고 저장 실패:', error);
      const message = error instanceof Error ? error.message : '저장에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          목록으로
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {isEditMode ? '모집 공고 수정' : '새 모집 공고 작성'}
        </h1>
        <p className="mt-2 text-gray-500">
          팀원을 모집하기 위한 상세한 내용을 작성해주세요.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Section */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-900">
              전체 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="모집 공고 제목을 입력하세요 (ex. 프론트엔드 개발자 구합니다)"
              className={`w-full rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 ${errors.title
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/50'
                  : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900 bg-white placeholder:text-gray-400'
                }`}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-sm text-red-500 font-medium">
                <Loader2 className="h-4 w-4 animate-spin hidden" /> {/* Just to import Icon if needed, using AlertCircle instead if imported */}
                <span className="text-red-500 text-xs">{errors.title}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Date Section */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-900">
                모집 기간 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-gray-500">시작일</div>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-1 ${errors.startDate
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900'
                      }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-gray-500">마감일 (선택)</div>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
              {errors.startDate && <p className="text-xs text-red-500 font-medium">{errors.startDate}</p>}
              {errors.endDate && <p className="text-xs text-red-500 font-medium">{errors.endDate}</p>}
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-900">
                태그 / 기술 스택
              </label>
              <div className="min-h-[82px] rounded-lg border border-gray-200 p-3 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all bg-white">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rounded-full p-0.5 hover:bg-gray-200 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {formData.tags.length < 5 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing || isComposingRef.current) return;
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      onCompositionStart={() => { isComposingRef.current = true; }}
                      onCompositionEnd={() => { isComposingRef.current = false; }}
                      placeholder={formData.tags.length === 0 ? "태그 입력 + Enter" : "추가..."}
                      className="min-w-[100px] flex-1 border-none bg-transparent p-1 text-sm placeholder-gray-400 focus:outline-none focus:ring-0"
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400">최대 5개까지 등록 가능합니다.</p>
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-900">
              상세 내용 <span className="text-red-500">*</span>
            </label>
            <div className={`rounded-lg border overflow-hidden transition-all ${errors.content ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900'
              }`}>
              <TiptapEditor
                content={formData.content}
                onChange={handleContentChange}
                placeholder="팀 소개, 모집 배경, 활동 내용 등을 자유롭게 작성해주세요..."
                minHeight={400}
                maxCharacters={5000}
                showCharacterCount
                onImageUpload={uploadImage}
                error={!!errors.content}
              />
            </div>
            {errors.content && (
              <p className="text-xs text-red-500 font-medium">{errors.content}</p>
            )}
          </div>

          {/* Files Section */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-900">
              파일 첨부
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                {formData.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  >
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-1 rounded p-0.5 hover:bg-gray-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-center transition hover:border-gray-400 hover:bg-gray-100">
                <Upload className="mb-2 h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">클릭하여 파일 업로드</span>
                <span className="mt-1 text-xs text-gray-400">최대 5개, 각 10MB 이하 (이미지, 문서, 압축파일)</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                />
              </label>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                isEditMode ? '수정 완료' : '등록하기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
