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
  Camera,
  Save,
  AlertTriangle,
  Mail,
  Lock,
  X,
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [previewImage, setPreviewImage] = useState<string | undefined>(
    profile.profileImage
  );

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
        setProfile({
          introduction: profileData.introduction || '',
          profileImage: profileData.profileImage || undefined,
          githubUrl: profileData.githubUrl || '',
        });
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

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
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
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-20">
        <UserIcon className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          로그인이 필요합니다
        </h2>
        <p className="mb-6 text-gray-500">
          프로필을 수정하려면 로그인해주세요.
        </p>
        <Link
          href="/login"
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  // 프로필 로딩 중
  if (isLoadingProfile) {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </button>
      </div>

      {/* 메인 카드 - 프로필 수정 */}
      <div className="rounded-2xl border border-gray-200/70 bg-white">
        {/* 헤더 섹션 */}
        <div className="border-b border-gray-100 px-6 py-5">
          <h1 className="text-xl font-semibold text-gray-900">프로필 수정</h1>
          <p className="mt-1 text-sm text-gray-500">
            프로필 정보를 수정할 수 있습니다
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="space-y-8">
            {/* 프로필 이미지 */}
            <div>
              <label className="mb-4 block text-sm font-medium text-gray-900">
                프로필 이미지
              </label>

              <div className="flex items-center gap-6">
                {/* 이미지 미리보기 */}
                <div className="relative">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt="프로필 미리보기"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-900">
                        <UserIcon className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>
                  {/* 카메라 오버레이 */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-white shadow-sm transition-colors hover:bg-gray-800"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                {/* 버튼들 */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200/70 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    이미지 업로드
                  </button>
                  {previewImage && (
                    <button
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      이미지 제거
                    </button>
                  )}
                  <p className="text-xs text-gray-400">
                    JPG, PNG, GIF (최대 5MB)
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* 이메일 (읽기 전용) */}
            {session.user?.email && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={session.user.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200/70 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-500"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  이메일은 변경할 수 없습니다
                </p>
              </div>
            )}

            {/* 이름 (읽기 전용) */}
            {session.user?.name && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  이름
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={session.user.name}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200/70 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-500"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  이름은 변경할 수 없습니다
                </p>
              </div>
            )}

            {/* 자기소개 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                자기소개
              </label>
              <textarea
                value={profile.introduction}
                onChange={(e) =>
                  setProfile({ ...profile, introduction: e.target.value })
                }
                rows={4}
                maxLength={200}
                className="w-full resize-none rounded-xl border border-gray-200/70 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                placeholder="간단한 자기소개를 입력해주세요"
              />
              <p className="mt-2 text-right text-xs text-gray-400">
                {profile.introduction.length}/200
              </p>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-gray-200/70 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 섹션 */}
      <div className="mt-6 rounded-2xl border border-gray-200/70 bg-white">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Lock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">비밀번호 변경</h2>
              <p className="text-sm text-gray-500">
                비밀번호를 변경하려면 비밀번호 찾기를 이용해주세요
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              보안을 위해 비밀번호 변경은 로그인 페이지의{' '}
              <span className="font-medium text-gray-900">비밀번호 찾기</span> 기능을 이용해주세요.
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              비밀번호 찾기
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 계정 삭제 섹션 */}
      <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-red-900">계정 삭제</h3>
            <p className="mt-1 text-sm text-red-700/80">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수
              없습니다.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              계정 삭제하기
            </button>
          </div>
        </div>
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">회원 탈퇴</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="mb-4 rounded-xl bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">주의: 이 작업은 되돌릴 수 없습니다.</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>모든 게시글과 댓글이 삭제됩니다</li>
                      <li>팀 활동 기록이 삭제됩니다</li>
                      <li>챌린지 달성 기록이 삭제됩니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              <label className="mb-2 block text-sm font-medium text-gray-900">
                확인을 위해 <span className="font-bold text-red-600">&quot;회원탈퇴&quot;</span>를 입력해주세요
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-xl border border-gray-200/70 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                placeholder="회원탈퇴"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 rounded-xl border border-gray-200/70 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== '회원탈퇴' || isDeleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? '탈퇴 처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
