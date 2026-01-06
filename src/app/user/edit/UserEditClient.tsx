'use client';

import { useState, useRef } from 'react';
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
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { updateUser, changePassword, deleteUser } from '@/lib/api/user';

interface UserProfile {
  introduction: string;
  profileImage?: string;
  githubUrl: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserEditClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 상태
  const [profile, setProfile] = useState<UserProfile>({
    introduction: '',
    githubUrl: '',
  });

  const [previewImage, setPreviewImage] = useState<string | undefined>(
    profile.profileImage
  );

  // 비밀번호 변경 상태
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 회원 탈퇴 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);

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
    if (!session?.user?.id || !session?.accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(
        Number(session.user.id),
        { introduction: profile.introduction },
        { accessToken: session.accessToken }
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

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다';
    }
    if (!/[a-zA-Z]/.test(password)) {
      return '비밀번호에 영문자가 포함되어야 합니다';
    }
    if (!/[0-9]/.test(password)) {
      return '비밀번호에 숫자가 포함되어야 합니다';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return '비밀번호에 특수문자가 포함되어야 합니다';
    }
    return null;
  };

  const handleChangePassword = async () => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!passwordForm.currentPassword) {
      toast.error('현재 비밀번호를 입력해주세요');
      return;
    }

    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { accessToken: session.accessToken }
      );
      toast.success('비밀번호가 변경되었습니다');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id || !session?.accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (deleteConfirmText !== '회원탈퇴') {
      toast.error('"회원탈퇴"를 정확히 입력해주세요');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(Number(session.user.id), { accessToken: session.accessToken });
      toast.success('회원 탈퇴가 완료되었습니다');
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('회원 탈퇴에 실패했습니다');
    } finally {
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
                보안을 위해 정기적으로 비밀번호를 변경해주세요
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="space-y-4">
            {/* 현재 비밀번호 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                현재 비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200/70 py-3 pl-11 pr-11 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  placeholder="현재 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                새 비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200/70 py-3 pl-11 pr-11 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  placeholder="새 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                8자 이상, 영문/숫자/특수문자 포함
              </p>
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                새 비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200/70 py-3 pl-11 pr-11 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">
                    비밀번호가 일치하지 않습니다
                  </p>
                )}
            </div>

            {/* 변경 버튼 */}
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isChangingPassword ? '변경 중...' : '비밀번호 변경'}
            </button>
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
