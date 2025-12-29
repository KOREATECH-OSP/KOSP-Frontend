'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Upload,
  User as UserIcon,
  Trash2,
  Camera,
  Github,
  Save,
  AlertTriangle,
} from 'lucide-react';

interface UserProfile {
  name: string;
  profileImage?: string;
  githubUrl: string;
  bio: string;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: '김개발',
    githubUrl: 'https://github.com/kimdev',
    bio: '풀스택 개발자입니다. React와 Node.js를 주로 사용합니다.',
  });

  const [previewImage, setPreviewImage] = useState<string | undefined>(
    profile.profileImage
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다');
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

  const handleSave = () => {
    if (!profile.name.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    if (!profile.githubUrl.trim()) {
      alert('GitHub 주소를 입력해주세요');
      return;
    }

    alert('프로필이 수정되었습니다!');
    router.push('/user');
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        '정말로 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.'
      )
    ) {
      if (confirm('마지막 확인입니다. 탈퇴하시겠습니까?')) {
        alert('회원 탈퇴가 완료되었습니다.');
        router.push('/');
      }
    }
  };

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

      {/* 메인 카드 */}
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
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <UserIcon className="h-10 w-10 text-gray-400" />
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

            {/* 이름 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200/70 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                GitHub 주소 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Github className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={profile.githubUrl}
                  onChange={(e) =>
                    setProfile({ ...profile, githubUrl: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200/70 py-3 pl-11 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            {/* 자기소개 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                자기소개
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200/70 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                placeholder="간단한 자기소개를 입력해주세요"
              />
              <p className="mt-2 text-right text-xs text-gray-400">
                {profile.bio.length}/200
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Save className="h-4 w-4" />
              저장하기
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
              onClick={handleDeleteAccount}
              className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              계정 삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
