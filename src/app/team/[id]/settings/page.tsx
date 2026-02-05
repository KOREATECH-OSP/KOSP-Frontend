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
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import Image from 'next/image';
import { getTeam, updateTeam, deleteTeam } from '@/lib/api/team';
import { uploadFile } from '@/lib/api/upload';
import { toast } from '@/lib/toast';
import { ensureEncodedUrl } from '@/lib/utils';

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

export default function TeamSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = parseInt(params.id as string, 10);
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
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
        setPreviewImage(ensureEncodedUrl(team.imageUrl || ''));
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

  const handleDeleteTeam = async () => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTeam(teamId, session.accessToken);
      toast.success('팀이 삭제되었습니다.');
      router.push('/team');
    } catch (error) {
      console.error('팀 삭제 실패:', error);
      const message = error instanceof Error ? error.message : '팀 삭제에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  const requiredFilledCount = formSections.filter(
    (s) => s.required && getSectionStatus(s.id) === 'filled'
  ).length;
  const requiredCount = formSections.filter((s) => s.required).length;

  if (isLoading) {
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
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white">
                <Settings className="h-3.5 w-3.5" />
                팀 설정
              </div>
              <h1 className="mt-4 text-[28px] font-bold tracking-tight text-gray-900">
                팀 정보 수정
              </h1>
              <p className="mt-2 text-[15px] text-gray-500">
                팀의 기본 정보를 수정하세요
              </p>
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
                      <p className="text-[13px] text-gray-400">팀을 대표하는 이름을 입력하세요</p>
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
                  rows={6}
                  className={`w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none ${
                    errors.description ? 'border-red-400' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-2 flex items-center gap-1 text-[13px] text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.description}
                  </p>
                )}
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
                    <h2 className="text-[15px] font-semibold text-gray-900">팀 이미지</h2>
                    <p className="text-[13px] text-gray-400">팀을 대표하는 이미지를 업로드하세요</p>
                  </div>
                </div>

                {previewImage ? (
                  <div className="relative">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200">
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
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 transition-all hover:border-orange-400 hover:bg-orange-50/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <span className="mt-4 text-sm font-semibold text-gray-700">
                      클릭하여 이미지 업로드
                    </span>
                    <span className="mt-1 text-xs text-gray-400">
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
                      저장 중...
                    </>
                  ) : (
                    '저장하기'
                  )}
                </button>
              </div>

              {/* Danger Zone - 팀 삭제 */}
              <section className="mt-8 rounded-2xl border-2 border-red-200 bg-red-50/50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold text-red-900">팀 삭제</h3>
                    <p className="mt-1 text-[13px] text-red-700">
                      팀을 삭제하면 모든 멤버와 초대, 모집공고가 함께 삭제됩니다.
                      <br />
                      <strong>이 작업은 되돌릴 수 없습니다.</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      팀 삭제하기
                    </button>
                  </div>
                </div>
              </section>
            </form>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-200 bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">정말 팀을 삭제하시겠습니까?</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  <strong>{formData.name}</strong> 팀과 함께 다음 항목이 영구적으로 삭제됩니다:
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                  <li>모든 팀원 정보</li>
                  <li>대기 중인 초대</li>
                  <li>모든 모집공고</li>
                </ul>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  계속하려면 <strong className="text-red-600">확인했습니다</strong>를 입력하세요
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="확인했습니다"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={isDeleting || deleteConfirmText !== '확인했습니다'}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    삭제하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
