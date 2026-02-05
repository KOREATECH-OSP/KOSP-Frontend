'use client';

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import {
  ArrowLeft,
  X,
  Loader2,
  Calendar,
  Hash,
  Type,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import { TiptapEditor } from '@/common/components/Editor';
import { useImageUpload } from '@/common/components/Editor/hooks/useImageUpload';
import { API_BASE_URL } from '@/lib/api/config';
import { getRecruit, updateRecruit } from '@/lib/api/recruit';
import { toast } from '@/lib/toast';
import type { BoardListResponse } from '@/lib/api/types';

interface RecruitFormData {
  title: string;
  content: string;
  tags: string[];
  startDate: string;
  endDate: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

const formSections = [
  { id: 'title', label: '공고 제목', icon: Type, required: true },
  { id: 'period', label: '모집 기간', icon: Calendar, required: true },
  { id: 'tags', label: '기술 스택', icon: Hash, required: false },
  { id: 'content', label: '상세 내용', icon: FileText, required: true },
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
  const [errors, setErrors] = useState<Partial<Record<keyof RecruitFormData, string>>>({});
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
      default:
        return 'empty';
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
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
      const commonData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        teamId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      const boardsRes = await fetch(`${API_BASE_URL}/v1/community/boards`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
            Authorization: `Bearer ${accessToken}`,
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

  const requiredFilledCount = formSections.filter(
    (s) => s.required && getSectionStatus(s.id) === 'filled'
  ).length;
  const requiredCount = formSections.filter((s) => s.required).length;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Top Navigation */}
      <div className="sticky top-14 z-30 border-b border-gray-200 bg-white md:top-[50px]">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>나가기</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {[...Array(requiredCount)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    i < requiredFilledCount ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {requiredFilledCount}/{requiredCount}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-10">
        <div className="flex gap-10">
          {/* Left Sidebar - Step Navigation */}
          <div className="hidden w-[200px] shrink-0 lg:block">
            <div className="sticky top-32 md:top-28">
              <nav className="space-y-1">
                {formSections.map((section, index) => {
                  const sectionStatus = getSectionStatus(section.id);
                  const isActive = activeSection === section.id;
                  const Icon = section.icon;

                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document
                          .getElementById(section.id)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                        isActive
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold ${
                          sectionStatus === 'filled'
                            ? 'bg-orange-500 text-white'
                            : sectionStatus === 'error'
                              ? 'bg-red-500 text-white'
                              : isActive
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {sectionStatus === 'filled' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-orange-600' : ''}`}>
                        {section.label}
                      </span>
                      {section.required && sectionStatus !== 'filled' && (
                        <span className="ml-auto text-[10px] text-red-400">필수</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="flex-1 max-w-[720px]">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
                {isEditMode ? '모집공고 수정' : '새 모집공고 작성'}
              </h1>
              <p className="mt-2 text-[15px] text-gray-500">
                매력적인 공고로 최고의 팀원을 찾아보세요
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Section */}
              <section
                id="title"
                className="rounded-2xl border border-gray-200 bg-white p-6"
                onFocus={() => setActiveSection('title')}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        getSectionStatus('title') === 'filled'
                          ? 'bg-orange-500 text-white'
                          : getSectionStatus('title') === 'error'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Type className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-gray-900">공고 제목</h2>
                      <p className="text-[13px] text-gray-400">눈에 띄는 제목을 작성하세요</p>
                    </div>
                  </div>
                  <span className="text-xs text-red-400">필수</span>
                </div>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onFocus={() => setActiveSection('title')}
                  placeholder="예: React 프론트엔드 개발자를 찾습니다"
                  className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none ${
                    errors.title ? 'border-red-400' : ''
                  }`}
                />
                {errors.title && (
                  <p className="mt-2 flex items-center gap-1 text-[13px] text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.title}
                  </p>
                )}
              </section>

              {/* Period Section */}
              <section
                id="period"
                className="rounded-2xl border border-gray-200 bg-white p-6"
                onFocus={() => setActiveSection('period')}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        getSectionStatus('period') === 'filled'
                          ? 'bg-orange-500 text-white'
                          : getSectionStatus('period') === 'error'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-gray-900">모집 기간</h2>
                      <p className="text-[13px] text-gray-400">언제까지 모집하나요?</p>
                    </div>
                  </div>
                  <span className="text-xs text-red-400">필수</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-[13px] font-medium text-gray-500">
                      시작일
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      onFocus={() => setActiveSection('period')}
                      className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 focus:border-orange-400 focus:outline-none ${
                        errors.startDate ? 'border-red-400' : ''
                      }`}
                    />
                  </div>
                  <ChevronRight className="mt-6 h-5 w-5 text-gray-300" />
                  <div className="flex-1">
                    <label className="mb-1.5 block text-[13px] font-medium text-gray-500">
                      마감일 <span className="text-gray-400">(선택)</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      onFocus={() => setActiveSection('period')}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>
                {(errors.startDate || errors.endDate) && (
                  <p className="mt-2 flex items-center gap-1 text-[13px] text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.startDate || errors.endDate}
                  </p>
                )}
              </section>

              {/* Tags Section */}
              <section
                id="tags"
                className="rounded-2xl border border-gray-200 bg-white p-6"
                onFocus={() => setActiveSection('tags')}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      getSectionStatus('tags') === 'filled'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-gray-900">기술 스택 & 태그</h2>
                    <p className="text-[13px] text-gray-400">필요한 기술이나 역할을 태그로 추가</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-3 focus-within:border-orange-400">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-[13px] font-medium text-white"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="rounded-full p-0.5 hover:bg-white/20"
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
                        onCompositionStart={() => {
                          isComposingRef.current = true;
                        }}
                        onCompositionEnd={() => {
                          isComposingRef.current = false;
                        }}
                        placeholder={
                          formData.tags.length === 0 ? 'React, TypeScript 등...' : '태그 추가'
                        }
                        className="min-w-[120px] flex-1 bg-transparent px-2 py-1.5 text-[14px] placeholder:text-gray-400 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[12px] text-gray-400">Enter로 태그 추가 (최대 5개)</p>
              </section>

              {/* Content Editor Section */}
              <section
                id="content"
                className="rounded-2xl border border-gray-200 bg-white p-6"
                onFocus={() => setActiveSection('content')}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        getSectionStatus('content') === 'filled'
                          ? 'bg-orange-500 text-white'
                          : getSectionStatus('content') === 'error'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-gray-900">상세 내용</h2>
                      <p className="text-[13px] text-gray-400">팀과 프로젝트를 자세히 소개하세요</p>
                    </div>
                  </div>
                  <span className="text-xs text-red-400">필수</span>
                </div>

                <div
                  className={`overflow-hidden rounded-xl ${errors.content ? 'ring-2 ring-red-400' : ''}`}
                >
                  <TiptapEditor
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="팀 소개, 프로젝트 목표, 필요한 역할, 활동 일정 등을 자유롭게 작성해주세요..."
                    minHeight={350}
                    maxCharacters={5000}
                    showCharacterCount
                    onImageUpload={uploadImage}
                    error={!!errors.content}
                  />
                </div>
                {errors.content && (
                  <p className="mt-2 flex items-center gap-1 text-[13px] text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.content}
                  </p>
                )}
              </section>

              {/* Submit Section */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl px-6 py-3 text-[14px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>{isEditMode ? '수정 완료' : '공고 등록'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
