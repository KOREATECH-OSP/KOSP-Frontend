'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import {
  ArrowLeft,
  X,
  Upload,
  Loader2,
  Type,
  FileText,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { API_BASE_URL } from '@/lib/api/config';
import { uploadFile } from '@/lib/api/upload';

interface TeamFormData {
  name: string;
  description: string;
  imageUrl: string;
}

const formSections = [
  { id: 'name', label: '팀 이름', icon: Type, required: true },
  { id: 'description', label: '팀 소개', icon: FileText, required: true },
  { id: 'image', label: '팀 이미지', icon: ImageIcon, required: false },
];

export default function CreateTeamPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
    }
  }, [status, router]);

  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    imageUrl: '',
  });

  const [previewImage, setPreviewImage] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<keyof TeamFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('name');

  const getSectionStatus = (sectionId: string): 'empty' | 'filled' | 'error' => {
    switch (sectionId) {
      case 'name':
        if (errors.name) return 'error';
        return formData.name.trim() ? 'filled' : 'empty';
      case 'description':
        if (errors.description) return 'error';
        return formData.description.trim() ? 'filled' : 'empty';
      case 'image':
        return previewImage ? 'filled' : 'empty';
      default:
        return 'empty';
    }
  };

  const handleInputChange = (field: keyof TeamFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await uploadFile(file, { accessToken: session.accessToken });
      setFormData((prev) => ({ ...prev, imageUrl: response.url }));
      toast.success('이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error('이미지 업로드에 실패했습니다.');
      setPreviewImage('');
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TeamFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '팀 이름을 입력해주세요';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = '팀 이름은 2~50자 사이여야 합니다';
    }

    if (!formData.description.trim()) {
      newErrors.description = '팀 소개를 입력해주세요';
    } else if (formData.description.length < 10) {
      newErrors.description = '팀 소개는 최소 10자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
      const response = await fetch(`${API_BASE_URL}/v1/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error(errorData.message || '로그인이 필요합니다.');
        }
        if (response.status === 403) {
          throw new Error(errorData.message || '권한이 없습니다.');
        }
        throw new Error(errorData.message || '팀 생성에 실패했습니다.');
      }

      toast.success('팀이 생성되었습니다!');
      router.push('/team');
    } catch (error) {
      console.error('팀 생성 실패:', error);
      const message = error instanceof Error ? error.message : '팀 생성에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredFilledCount = formSections.filter(
    (s) => s.required && getSectionStatus(s.id) === 'filled'
  ).length;
  const requiredCount = formSections.filter((s) => s.required).length;

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-[28px] font-bold tracking-tight text-gray-900">새 팀 만들기</h1>
                <p className="mt-2 text-[15px] text-gray-500">
                  프로젝트를 함께할 멋진 팀을 만들어보세요
                </p>
              </div>
              <Image
                src={require('@/assets/images/kori/11-09 M-1 응원 .png')}
                alt="응원하는 코리"
                width={120}
                height={120}
                className="w-12 sm:w-14 h-auto"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Section */}
              <section
                id="name"
                className="rounded-2xl border border-gray-200 bg-white p-6"
                onFocus={() => setActiveSection('name')}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        getSectionStatus('name') === 'filled'
                          ? 'bg-orange-500 text-white'
                          : getSectionStatus('name') === 'error'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Type className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-gray-900">팀 이름</h2>
                      <p className="text-[13px] text-gray-400">팀을 대표하는 이름을 지어주세요</p>
                    </div>
                  </div>
                  <span className="text-xs text-red-400">필수</span>
                </div>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onFocus={() => setActiveSection('name')}
                  placeholder="예: KOSP 프로젝트 팀"
                  className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none ${
                    errors.name ? 'border-red-400' : ''
                  }`}
                />
                {errors.name && (
                  <p className="mt-2 flex items-center gap-1 text-[13px] text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.name}
                  </p>
                )}
              </section>

              {/* Description Section */}
              <section
                id="description"
                className="rounded-2xl border border-gray-200 bg-white p-6"
                onFocus={() => setActiveSection('description')}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        getSectionStatus('description') === 'filled'
                          ? 'bg-orange-500 text-white'
                          : getSectionStatus('description') === 'error'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-gray-900">팀 소개</h2>
                      <p className="text-[13px] text-gray-400">팀에 대해 자세히 소개해주세요</p>
                    </div>
                  </div>
                  <span className="text-xs text-red-400">필수</span>
                </div>

                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onFocus={() => setActiveSection('description')}
                  placeholder="팀의 목표, 프로젝트 내용, 팀 문화 등을 자유롭게 작성해주세요..."
                  rows={5}
                  className={`w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none ${
                    errors.description ? 'border-red-400' : ''
                  }`}
                />
                <div className="mt-2 flex items-center justify-between">
                  {errors.description ? (
                    <p className="flex items-center gap-1 text-[13px] text-red-500">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.description}
                    </p>
                  ) : (
                    <span className="text-[12px] text-gray-400">최소 10자 이상</span>
                  )}
                  <span className="text-[12px] text-gray-400">{formData.description.length}자</span>
                </div>
              </section>

              {/* Image Section */}
              <section
                id="image"
                className="rounded-2xl border border-gray-200 bg-white p-6"
                onFocus={() => setActiveSection('image')}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      getSectionStatus('image') === 'filled'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-gray-900">
                      팀 이미지 <span className="font-normal text-gray-400">(선택)</span>
                    </h2>
                    <p className="text-[13px] text-gray-400">팀을 대표하는 이미지를 업로드하세요</p>
                  </div>
                </div>

                {previewImage ? (
                  <div className="relative">
                    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-gray-200">
                      <Image
                        src={previewImage}
                        alt="팀 이미지 미리보기"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-3 top-3 rounded-lg bg-black/60 p-2 text-white transition hover:bg-black/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 transition-all hover:border-orange-300 hover:bg-orange-50/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="mt-3 text-[14px] font-medium text-gray-600">
                      클릭하여 업로드
                    </span>
                    <span className="mt-1 text-[12px] text-gray-400">JPG, PNG, GIF (최대 5MB)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </section>

              {/* Submit Section */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Link
                  href="/team"
                  className="rounded-xl px-6 py-3 text-[14px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    '팀 만들기'
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
