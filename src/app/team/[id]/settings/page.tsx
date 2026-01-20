'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  X,
  Upload,
  Loader2,
  Settings,
  Type,
  FileText,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { getTeam, updateTeam } from '@/lib/api/team';
import { uploadFile } from '@/lib/api/upload';
import { toast } from '@/lib/toast';

interface TeamFormData {
  name: string;
  description: string;
  imageUrl: string;
}

const formSections = [
  { id: 'name', label: '팀 이름', icon: Type },
  { id: 'description', label: '팀 소개', icon: FileText },
  { id: 'image', label: '팀 이미지', icon: ImageIcon },
];

export default function TeamSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = parseInt(params.id as string, 10);
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('name');
  const [errors, setErrors] = useState<Partial<Record<keyof TeamFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    imageUrl: '',
  });

  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function loadTeam() {
      try {
        const team = await getTeam(teamId);
        setFormData({
          name: team.name,
          description: team.description || '',
          imageUrl: team.imageUrl || '',
        });
        setPreviewImage(team.imageUrl || '');
      } catch (error) {
        console.error('팀 정보 로드 실패:', error);
        toast.error('팀 정보를 불러오는데 실패했습니다.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    }

    if (teamId) {
      loadTeam();
    }
  }, [teamId, router]);

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

    // 미리보기 설정
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 파일 업로드
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
      setPreviewImage(formData.imageUrl);
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTeam(
        teamId,
        {
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl || undefined,
        },
        session.accessToken
      );
      toast.success('팀 정보가 수정되었습니다.');
      router.push(`/team/${teamId}`);
      router.refresh();
    } catch (error) {
      console.error('팀 정보 수정 실패:', error);
      const message = error instanceof Error ? error.message : '팀 정보 수정에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = formSections.filter((s) => getSectionStatus(s.id) === 'filled').length;
  const requiredCount = 2; // name, description

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
                  <h3 className="text-sm font-semibold text-slate-900">설정 항목</h3>
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
                          document
                            .getElementById(section.id)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            isActive
                              ? 'bg-white/20'
                              : sectionStatus === 'filled'
                              ? 'bg-emerald-100 text-emerald-600'
                              : sectionStatus === 'error'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                          }`}
                        >
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
                        <div
                          className={`text-xs font-medium ${isActive ? 'text-white/60' : 'text-slate-400'}`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                    <Users className="h-3.5 w-3.5" />
                    TIP
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    매력적인 팀 소개로 더 많은 지원자를 모집해보세요.
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
                <Settings className="h-3.5 w-3.5" />
                팀 설정
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                팀 정보 수정
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                팀의 기본 정보를 수정하세요.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Section */}
              <section
                id="name"
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
                  activeSection === 'name'
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200/80'
                }`}
                onFocus={() => setActiveSection('name')}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      getSectionStatus('name') === 'filled'
                        ? 'bg-emerald-100 text-emerald-600'
                        : getSectionStatus('name') === 'error'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Type className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">팀 이름</h2>
                    <p className="text-sm text-slate-500">팀을 대표하는 이름을 입력하세요</p>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onFocus={() => setActiveSection('name')}
                  placeholder="예: KOSP 프로젝트 팀"
                  className={`w-full rounded-xl border-2 bg-slate-50 px-5 py-4 text-lg font-medium transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-transparent focus:border-slate-900'
                  }`}
                />
                {errors.name && (
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </div>
                )}
              </section>

              {/* Description Section */}
              <section
                id="description"
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
                  activeSection === 'description'
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200/80'
                }`}
                onFocus={() => setActiveSection('description')}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      getSectionStatus('description') === 'filled'
                        ? 'bg-emerald-100 text-emerald-600'
                        : getSectionStatus('description') === 'error'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">팀 소개</h2>
                    <p className="text-sm text-slate-500">팀에 대해 자세히 소개해주세요</p>
                  </div>
                </div>

                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onFocus={() => setActiveSection('description')}
                  placeholder="팀의 목표, 프로젝트 내용, 팀 문화 등을 자유롭게 작성해주세요..."
                  rows={6}
                  className={`w-full resize-none rounded-xl border-2 bg-slate-50 px-5 py-4 text-base leading-relaxed transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none ${
                    errors.description
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-transparent focus:border-slate-900'
                  }`}
                />
                {errors.description && (
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description}
                  </div>
                )}
              </section>

              {/* Image Section */}
              <section
                id="image"
                className={`rounded-2xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
                  activeSection === 'image'
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200/80'
                }`}
                onFocus={() => setActiveSection('image')}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      getSectionStatus('image') === 'filled'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">팀 이미지</h2>
                    <p className="text-sm text-slate-500">팀을 대표하는 이미지를 업로드하세요</p>
                  </div>
                </div>

                {previewImage ? (
                  <div className="relative">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200">
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
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 transition-all hover:border-slate-400 hover:bg-slate-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Upload className="h-6 w-6 text-slate-600" />
                    </div>
                    <span className="mt-4 text-sm font-semibold text-slate-700">
                      클릭하여 이미지 업로드
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      JPG, PNG, GIF (최대 5MB)
                    </span>
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
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="text-white">
                  <h3 className="text-lg font-semibold">변경사항을 저장하시겠습니까?</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    저장 후 팀 상세 페이지로 이동합니다
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
                        저장 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        저장하기
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
