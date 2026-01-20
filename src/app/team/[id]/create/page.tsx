'use client';

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import {
  ArrowLeft,
  X,
  Upload,
  FileText,
  Loader2,
  Sparkles,
  Calendar,
  Hash,
  Type,
  FileUp,
  CheckCircle2,
  AlertCircle,
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
  // Remove HTML tags using regex - safe for validation purposes only
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

const formSections = [
  { id: 'title', label: '제목', icon: Type },
  { id: 'period', label: '모집 기간', icon: Calendar },
  { id: 'tags', label: '기술 스택', icon: Hash },
  { id: 'content', label: '상세 내용', icon: Sparkles },
  { id: 'files', label: '첨부파일', icon: FileUp },
];

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

  const [activeSection, setActiveSection] = useState('title');

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
            files: [],
          });
        })
        .catch((err) => {
          console.error(err);
          toast.error('공고 정보를 불러오는데 실패했습니다.');
          router.back();
        });
    }
  }, [isEditMode, editId, session?.accessToken, router]);

  const DRAFT_KEY = `recruit-draft-${teamId}`;

  useEffect(() => {
    if (!isEditMode && typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            files: [],
          }));
          toast.success('작성 중인 내용을 불러왔습니다.');
        } catch (e) {
          console.error('Failed to parse draft', e);
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    }
  }, [isEditMode, teamId, DRAFT_KEY]);

  useEffect(() => {
    if (isEditMode) return;

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

  const getSectionStatus = (sectionId: string): 'empty' | 'filled' | 'error' => {
    switch (sectionId) {
      case 'title':
        if (errors.title) return 'error';
        return formData.title.trim() ? 'filled' : 'empty';
      case 'period':
        if (errors.startDate || errors.endDate) return 'error';
        return formData.startDate ? 'filled' : 'empty';
      case 'tags':
        return formData.tags.length > 0 ? 'filled' : 'empty';
      case 'content':
        if (errors.content) return 'error';
        return stripHtml(formData.content) ? 'filled' : 'empty';
      case 'files':
        return formData.files.length > 0 ? 'filled' : 'empty';
      default:
        return 'empty';
    }
  };

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
      toast.error('태그는 최대 5개까지 추가할 수 있습니다.');
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
      toast.error('파일은 최대 5개까지 업로드 가능합니다.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error('각 파일의 크기는 10MB를 초과할 수 없습니다.');
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
    const contentText = stripHtml(formData.content);
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

      localStorage.removeItem(DRAFT_KEY);

      router.refresh();
      router.back();
    } catch (error) {
      console.error('모집공고 저장 실패:', error);
      const message = error instanceof Error ? error.message : '저장에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = formSections.filter(s => getSectionStatus(s.id) === 'filled').length;
  const requiredCount = 3; // title, period, content

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2.5 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>돌아가기</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 sm:flex">
              <div className="flex items-center gap-1.5">
                {[...Array(requiredCount)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i < Math.min(completedCount, requiredCount)
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-slate-600">
                {Math.min(completedCount, requiredCount)}/{requiredCount} 필수 항목
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Sidebar - Progress Tracker */}
          <div className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900">작성 진행 상황</h3>
                  <p className="mt-1 text-xs text-slate-500">섹션을 클릭하여 이동하세요</p>
                </div>

                <nav className="space-y-1">
                  {formSections.map((section, index) => {
                    const Icon = section.icon;
                    const sectionStatus = getSectionStatus(section.id);
                    const isActive = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          isActive
                            ? 'bg-white/20'
                            : sectionStatus === 'filled'
                            ? 'bg-emerald-100 text-emerald-600'
                            : sectionStatus === 'error'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                        }`}>
                          {sectionStatus === 'filled' && !isActive ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : sectionStatus === 'error' && !isActive ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                            {section.label}
                          </div>
                          {sectionStatus === 'filled' && !isActive && (
                            <div className="text-xs text-emerald-600">완료</div>
                          )}
                        </div>
                        <div className={`text-xs font-medium ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    PRO TIP
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    구체적인 역할과 기술 스택을 명시하면 지원율이 <span className="font-semibold text-white">2배</span> 높아집니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-9">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5" />
                {isEditMode ? '공고 수정' : '새 공고 작성'}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {isEditMode ? '모집 공고 수정하기' : '팀원을 모집해보세요'}
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                매력적인 공고로 최고의 팀원을 찾아보세요.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Section */}
              <section
                id="title"
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
                  activeSection === 'title' ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200/80'
                }`}
                onFocus={() => setActiveSection('title')}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    getSectionStatus('title') === 'filled'
                      ? 'bg-emerald-100 text-emerald-600'
                      : getSectionStatus('title') === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Type className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">공고 제목</h2>
                    <p className="text-sm text-slate-500">한눈에 들어오는 매력적인 제목을 작성하세요</p>
                  </div>
                </div>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onFocus={() => setActiveSection('title')}
                  placeholder="예: React 프론트엔드 개발자를 찾습니다!"
                  className={`w-full rounded-xl border-2 bg-slate-50 px-5 py-4 text-lg font-medium transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none ${
                    errors.title
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-transparent focus:border-slate-900'
                  }`}
                />
                {errors.title && (
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.title}
                  </div>
                )}
              </section>

              {/* Period Section */}
              <section
                id="period"
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
                  activeSection === 'period' ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200/80'
                }`}
                onFocus={() => setActiveSection('period')}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    getSectionStatus('period') === 'filled'
                      ? 'bg-emerald-100 text-emerald-600'
                      : getSectionStatus('period') === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">모집 기간</h2>
                    <p className="text-sm text-slate-500">모집 시작일과 마감일을 설정하세요</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      시작일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      onFocus={() => setActiveSection('period')}
                      className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3.5 text-sm font-medium transition-all focus:bg-white focus:outline-none ${
                        errors.startDate
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-transparent focus:border-slate-900'
                      }`}
                    />
                    {errors.startDate && (
                      <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {errors.startDate}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      마감일 <span className="text-slate-400">(선택)</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      onFocus={() => setActiveSection('period')}
                      className="w-full rounded-xl border-2 border-transparent bg-slate-50 px-4 py-3.5 text-sm font-medium transition-all focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                    {errors.endDate && (
                      <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {errors.endDate}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Tags Section */}
              <section
                id="tags"
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
                  activeSection === 'tags' ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200/80'
                }`}
                onFocus={() => setActiveSection('tags')}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    getSectionStatus('tags') === 'filled'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">기술 스택 & 태그</h2>
                    <p className="text-sm text-slate-500">필요한 기술이나 역할을 태그로 추가하세요</p>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-transparent bg-slate-50 p-4 transition-all focus-within:border-slate-900 focus-within:bg-white">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                      >
                        <Hash className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/20"
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
                        onFocus={() => setActiveSection('tags')}
                        onKeyDown={(e) => {
                          if (e.nativeEvent.isComposing || isComposingRef.current) return;
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        onCompositionStart={() => { isComposingRef.current = true; }}
                        onCompositionEnd={() => { isComposingRef.current = false; }}
                        placeholder={formData.tags.length === 0 ? "React, TypeScript, Node.js 등..." : "태그 추가..."}
                        className="min-w-[150px] flex-1 bg-transparent px-2 py-1.5 text-sm font-medium placeholder-slate-400 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">Enter를 눌러 태그를 추가하세요. 최대 5개까지 등록 가능합니다.</p>
              </section>

              {/* Content Editor Section */}
              <section
                id="content"
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
                  activeSection === 'content' ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200/80'
                }`}
                onFocus={() => setActiveSection('content')}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    getSectionStatus('content') === 'filled'
                      ? 'bg-emerald-100 text-emerald-600'
                      : getSectionStatus('content') === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">상세 내용</h2>
                    <p className="text-sm text-slate-500">팀과 프로젝트에 대해 자세히 설명해주세요</p>
                  </div>
                </div>

                <div className={`rounded-xl border-2 overflow-hidden transition-all ${
                  errors.content ? 'border-red-300' : 'border-transparent focus-within:border-slate-900'
                }`}>
                  <TiptapEditor
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="팀 소개, 프로젝트 목표, 필요한 역할, 활동 일정 등을 자유롭게 작성해주세요..."
                    minHeight={400}
                    maxCharacters={5000}
                    showCharacterCount
                    onImageUpload={uploadImage}
                    error={!!errors.content}
                  />
                </div>
                {errors.content && (
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.content}
                  </div>
                )}
              </section>

              {/* Files Section */}
              <section
                id="files"
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
                  activeSection === 'files' ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200/80'
                }`}
                onFocus={() => setActiveSection('files')}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    getSectionStatus('files') === 'filled'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <FileUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">첨부파일</h2>
                    <p className="text-sm text-slate-500">관련 문서나 이미지를 첨부하세요</p>
                  </div>
                </div>

                {formData.files.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {formData.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                          <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 transition-all hover:border-slate-400 hover:bg-slate-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Upload className="h-6 w-6 text-slate-600" />
                  </div>
                  <span className="mt-4 text-sm font-semibold text-slate-700">파일을 드래그하거나 클릭하여 업로드</span>
                  <span className="mt-1 text-xs text-slate-500">PNG, JPG, PDF, DOC, ZIP (최대 5개, 각 10MB)</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                  />
                </label>
              </section>

              {/* Submit Section */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="text-white">
                  <h3 className="text-lg font-semibold">모든 준비가 완료되었나요?</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    작성 완료 후 공고가 즉시 게시됩니다
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-slate-900 shadow-lg transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {isEditMode ? '수정 완료' : '공고 등록하기'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
