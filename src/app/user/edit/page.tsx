'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Upload, User as UserIcon, Trash2 } from 'lucide-react';

interface UserProfile {
  name: string;
  profileImage?: string;
  githubUrl: string;
  bio: string;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기존 프로필 데이터 (실제로는 API에서 가져와야 함)
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

    // API 호출하여 프로필 저장
    alert('프로필이 수정되었습니다!');
    router.push('/mypage');
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        '정말로 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.'
      )
    ) {
      if (confirm('마지막 확인입니다. 탈퇴하시겠습니까?')) {
        // API 호출하여 회원 탈퇴 처리
        alert('회원 탈퇴가 완료되었습니다.');
        router.push('/');
      }
    }
  };

  return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* 헤더 */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          돌아가기
        </button>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              프로필 수정
            </h1>

            <div className="space-y-6">
              {/* 프로필 이미지 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  프로필 이미지
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* 이미지 미리보기 */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt="프로필 미리보기"
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <UserIcon className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>

                  {/* 버튼들 */}
                  <div className="flex-1 w-full sm:w-auto space-y-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm inline-flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      이미지 업로드
                    </button>
                    {previewImage && (
                      <button
                        onClick={handleRemoveImage}
                        className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm inline-flex items-center justify-center gap-2 sm:ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        이미지 제거
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이름을 입력하세요"
                />
              </div>

              {/* GitHub URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={profile.githubUrl}
                  onChange={(e) =>
                    setProfile({ ...profile, githubUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/username"
                />
              </div>

              {/* 자기소개 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="간단한 자기소개를 입력해주세요"
                />
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                저장
              </button>
            </div>
          </div>
      </div>
        <button
          onClick={handleDeleteAccount}
            className="px-6 py-2 text-red-600 font-sans text-[12px]"
        >
          회원 탈퇴
        </button>
      </div>
  );
}