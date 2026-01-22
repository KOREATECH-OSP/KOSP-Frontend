'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  User as UserIcon,
  Trash2,
  Save,
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { updateUser, deleteUser, getUserProfile } from '@/lib/api/user';

interface UserProfile {
  introduction: string;
  profileImage?: string;
  githubUrl: string;
}

export default function UserEditClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] Session:', { status, hasToken: !!session?.accessToken });
  }

  // 프로필 상태
  const [profile, setProfile] = useState<UserProfile>({
    introduction: '',
    githubUrl: '',
  });
  const [initialProfile, setInitialProfile] = useState<UserProfile>({
    introduction: '',
    githubUrl: '',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [previewImage, setPreviewImage] = useState<string | undefined>(
    profile.profileImage
  );

  // 변경사항 여부 확인
  const hasChanges = profile.introduction !== initialProfile.introduction;

  // 회원 탈퇴 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);

  // 프로필 데이터 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const userId = parseInt(session.user.id, 10);
        const profileData = await getUserProfile(userId);
        const loadedProfile = {
          introduction: profileData.introduction || '',
          profileImage: profileData.profileImage || undefined,
          githubUrl: profileData.githubUrl || '',
        };
        setProfile(loadedProfile);
        setInitialProfile(loadedProfile);
        if (profileData.profileImage) {
          setPreviewImage(profileData.profileImage);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('JPG, JPEG, PNG 형식만 업로드 가능합니다');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      setProfile((prev) => ({ ...prev, profileImage: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(undefined);
    setProfile((prev) => ({ ...prev, profileImage: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const token = session?.accessToken;
    const userId = session?.user?.id;
    if (status !== 'authenticated' || !userId || !token || typeof token !== 'string') {
      toast.error('로그인이 필요합니다. 다시 로그인해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(
        Number(userId),
        { introduction: profile.introduction },
        { accessToken: token }
      );
      toast.success('프로필이 수정되었습니다');
      router.push('/user');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('프로필 수정에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const token = session?.accessToken;
    const userId = session?.user?.id;
    if (status !== 'authenticated' || !userId || !token || typeof token !== 'string') {
      toast.error('로그인이 필요합니다. 다시 로그인해주세요.');
      return;
    }

    if (deleteConfirmText !== '회원탈퇴') {
      toast.error('"회원탈퇴"를 정확히 입력해주세요');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(Number(userId), { accessToken: token });
      toast.success('회원 탈퇴가 완료되었습니다');
      // signOut이 완료된 후 자동으로 홈으로 리다이렉트
      signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('회원 탈퇴에 실패했습니다');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // 로그인하지 않은 경우
  if (!session) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-gray-200 to-gray-300 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            <UserIcon className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          로그인이 필요합니다
        </h2>
        <p className="mb-8 text-center text-gray-500">
          프로필을 수정하려면 먼저 로그인해주세요
        </p>
        <Link
          href="/login"
          className="group relative overflow-hidden rounded-xl bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
        >
          <span className="relative z-10">로그인하기</span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gray-800 to-gray-700 transition-transform duration-300 group-hover:translate-x-0" />
        </Link>
      </div>
    );
  }

  // 프로필 로딩 중
  if (isLoadingProfile) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-gray-900 opacity-20" />
          </div>
          <p className="text-sm text-gray-500">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {/* 헤더 네비게이션 */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          돌아가기
        </button>
      </div>

      {/* 프로필 미리보기 히어로 카드 */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8">
        {/* 배경 패턴 */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* 프로필 이미지 미리보기 */}
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white/20 bg-gray-800 sm:h-32 sm:w-32">
            {previewImage ? (
              <Image
                src={previewImage}
                alt="프로필 미리보기"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-800">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* 프로필 정보 미리보기 */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="mb-1 text-2xl font-bold text-white sm:text-3xl">
              {session.user?.name || '사용자'}
            </h1>
            <p className="mb-3 text-sm text-gray-400">{session.user?.email}</p>
            {profile.introduction ? (
              <p className="max-w-md text-sm leading-relaxed text-gray-300">
                {profile.introduction}
              </p>
            ) : (
              <p className="text-sm italic text-gray-500">
                자기소개를 입력해주세요
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 왼쪽: 메인 편집 영역 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 프로필 이미지 업로드 섹션 */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">프로필 이미지</h2>
              <p className="text-xs text-gray-500">나를 표현하는 이미지를 업로드하세요</p>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                {/* 이미지 미리보기 (작은 버전) */}
                <div className="relative flex-shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-gray-100 bg-gray-50">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt="프로필"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserIcon className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 업로드 컨트롤 */}
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md"
                    >
                      <Upload className="h-4 w-4" />
                      이미지 업로드
                    </button>
                    {previewImage && (
                      <button
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        제거
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    JPG, JPEG, PNG 형식 · 최대 5MB
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* 자기소개 섹션 */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">자기소개</h2>
              <p className="text-xs text-gray-500">다른 사용자에게 보여질 소개글입니다</p>
            </div>

            <div className="p-6">
              <div className="relative">
                <textarea
                  value={profile.introduction}
                  onChange={(e) =>
                    setProfile({ ...profile, introduction: e.target.value })
                  }
                  rows={5}
                  maxLength={200}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm leading-relaxed transition-all placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-gray-100"
                  placeholder="안녕하세요! 저는 오픈소스에 관심이 많은 개발자입니다. 함께 성장해요!"
                />
                <div className="absolute bottom-3 right-3 rounded-lg bg-white/80 px-2 py-1 text-xs font-medium tabular-nums text-gray-400 backdrop-blur-sm">
                  <span className={profile.introduction.length > 180 ? 'text-amber-500' : ''}>
                    {profile.introduction.length}
                  </span>
                  /200
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 사이드바 */}
        <div className="space-y-6">
          {/* 계정 정보 (읽기 전용) */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">계정 정보</h3>
            </div>

            <div className="space-y-4 p-5">
              {/* 이메일 */}
              {session.user?.email && (
                <div>
                  <label className="mb-1.5 text-xs font-medium text-gray-500">
                    이메일
                  </label>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
                    {session.user.email}
                  </div>
                </div>
              )}

              {/* 이름 */}
              {session.user?.name && (
                <div>
                  <label className="mb-1.5 text-xs font-medium text-gray-500">
                    이름
                  </label>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
                    {session.user.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 비밀번호 변경 */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">보안</h3>
            </div>

            <div className="p-5">
              <p className="mb-4 text-sm text-gray-600">
                비밀번호를 변경하려면 비밀번호 찾기를 이용해주세요.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
              >
                비밀번호 찾기
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* 계정 비활성화 */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">위험 구역</h3>
            </div>
            <div className="p-5">
              <p className="mb-2 text-sm text-gray-600">
                계정 비활성화 시 로그인이 불가하며, 관련 데이터에 접근할 수 없습니다.
              </p>
              <p className="mb-4 text-xs text-gray-500">
                회원가입을 다시 하면 계정을 활성화할 수 있습니다.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
              >
                계정 비활성화
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 저장 바 - 변경사항 있을 때만 표시 */}
      {hasChanges && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <p className="hidden text-sm font-medium text-amber-600 sm:block">
              변경사항이 있습니다. 저장해주세요.
            </p>
            <div className="flex flex-1 gap-3 sm:flex-initial">
              <button
                onClick={() => router.back()}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:flex-initial"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    저장하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 여백 (고정 바 높이만큼) */}
      {hasChanges && <div className="h-24" />}

      {/* 계정 비활성화 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">계정 비활성화</h2>
            <div className="mb-6">
              <p className="text-gray-600">
                계정을 비활성화하면 로그인이 불가하며, 관련 데이터에 접근할 수 없습니다.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                회원가입을 다시 하면 계정을 활성화할 수 있습니다.
              </p>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  확인을 위해 <span className="font-semibold text-red-600">회원탈퇴</span>를 입력해주세요
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  placeholder="회원탈퇴"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== '회원탈퇴' || isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    처리 중...
                  </>
                ) : (
                  '비활성화'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
