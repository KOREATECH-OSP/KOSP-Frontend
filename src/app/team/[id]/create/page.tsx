'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  FileText,
  Calendar,
  Tag,
  Info,
  Loader2,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TiptapEditor } from '@/common/components/Editor';
import { useImageUpload } from '@/common/components/Editor/hooks/useImageUpload';
import { API_BASE_URL } from '@/lib/api/config';
import { uploadFile } from '@/lib/api/upload';
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

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RecruitFormData, string>>
  >({});

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

      const boardsRes = await fetch(`${API_BASE_URL}/v1/community/boards`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
      if (!boardsRes.ok) {
        throw new Error('게시판 정보를 불러오지 못했습니다.');
      }
      const boardsResponse: BoardListResponse = await boardsRes.json();
      const recruitBoard = boardsResponse.boards.find((b) => b.isRecruitAllowed);

      if (!recruitBoard) {
        console.error('Available boards:', boardsResponse.boards);
        throw new Error('모집공고 게시판을 찾을 수 없습니다. 관리자에게 문의하세요.');
      }

      const response = await fetch(`${API_BASE_URL}/v1/community/recruits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          boardId: recruitBoard.id,
          title: formData.title,
          content: formData.content,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          teamId,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate
            ? new Date(formData.endDate).toISOString()
            : undefined,
          attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '모집공고 작성에 실패했습니다.');
      }

      toast.success('팀원 모집글이 등록되었습니다.');
      router.back();
    } catch (error) {
      console.error('모집공고 작성 실패:', error);
      const message = error instanceof Error ? error.message : '등록에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        돌아가기
      </button>

      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">새 모집 공고</h1>
        <p className="mt-1 text-sm text-gray-500">
          함께 성장할 팀원을 모집해보세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-3 block text-sm font-medium text-gray-900">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="모집 제목을 입력하세요"
            className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none ${
              errors.title
                ? 'border-red-300 bg-red-50 focus:border-red-400'
                : 'border-gray-200 focus:border-gray-400'
            }`}
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* 내용 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-3 block text-sm font-medium text-gray-900">
            내용 <span className="text-red-500">*</span>
          </label>
          <TiptapEditor
            content={formData.content}
            onChange={handleContentChange}
            placeholder="팀 소개, 모집 배경, 활동 내용 등을 자세히 작성해주세요"
            minHeight={250}
            maxCharacters={5000}
            showCharacterCount
            onImageUpload={uploadImage}
            error={!!errors.content}
            errorMessage={errors.content}
          />
        </div>

        {/* 모집 기간 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-3 block text-sm font-medium text-gray-900">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              모집 기간 <span className="text-red-500">*</span>
            </span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs text-gray-500">시작일</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none ${
                  errors.startDate
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 focus:border-gray-400'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs text-gray-500">
                마감일 (선택)
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none ${
                  errors.endDate
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 focus:border-gray-400'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* 태그 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-3 block text-sm font-medium text-gray-900">
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-gray-400" />
              태그
              <span className="font-normal text-gray-400">(최대 5개)</span>
            </span>
          </label>

          {/* 선택된 태그 */}
          {formData.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm font-medium text-gray-600"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 rounded-full p-0.5 transition hover:bg-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="예: React, TypeScript"
              disabled={formData.tags.length >= 5}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-gray-400 focus:outline-none disabled:bg-gray-50"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={formData.tags.length >= 5}
              className="rounded-lg border border-gray-200 px-3 py-2 text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 파일 첨부 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-3 block text-sm font-medium text-gray-900">
            <span className="flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-gray-400" />
              파일 첨부
              <span className="font-normal text-gray-400">
                (최대 5개, 각 10MB)
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-6 transition hover:border-gray-300 hover:bg-gray-50">
            <Upload className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">클릭하여 파일 업로드</p>
            <p className="mt-1 text-xs text-gray-400">
              이미지, PDF, 문서 파일 지원
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
            />
          </label>

          {formData.files.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 안내 */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200">
              <Info className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-900">
                작성 가이드
              </h3>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>- 모집하려는 포지션을 명확하게 작성해주세요</li>
                <li>- 팀의 목표와 활동 계획을 구체적으로 설명해주세요</li>
                <li>- 필요한 역량이나 기술 스택을 함께 안내하면 좋습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                등록 중...
              </>
            ) : (
              '등록하기'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
