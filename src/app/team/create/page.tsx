// app/teams/create/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {  Upload, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import KoriSupport from '@/assets/images/kori/11-06 L 응원 .png';
import InfoBox from '@/common/components/InfoBox';

type CategoryType = 'study' | 'project' | 'competition' | 'networking';

export default function CreateTeamPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'study' as CategoryType,
    maxMembers: 10,
    inviteMessage: '',
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 에러 제거
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '팀 이름을 입력해주세요';
    } else if (formData.title.length < 2) {
      newErrors.title = '팀 이름은 최소 2자 이상이어야 합니다';
    }

    if (!formData.description.trim()) {
      newErrors.description = '팀 설명을 입력해주세요';
    } else if (formData.description.length < 10) {
      newErrors.description = '팀 설명은 최소 10자 이상이어야 합니다';
    }

    if (!formData.inviteMessage.trim()) {
      newErrors.inviteMessage = '초대 메시지를 입력해주세요';
    }

    if (formData.maxMembers < 2) {
      newErrors.maxMembers = '최소 2명 이상이어야 합니다';
    } else if (formData.maxMembers > 100) {
      newErrors.maxMembers = '최대 100명까지 가능합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // API 호출 예시
    // try {
    //   const response = await fetch('/api/teams', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    //   });
    //   
    //   if (response.ok) {
    //     const team = await response.json();
    //     router.push('/teams');
    //   }
    // } catch (error) {
    //   console.error('Error creating team:', error);
    // }

    alert('팀이 생성되었습니다!');
    router.push('/team');
  };

  return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>내 팀으로 돌아가기</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">팀 만들기</h1>
          <p className="text-sm sm:text-base text-gray-600">
            새로운 팀을 만들고 함께 성장할 팀원들을 모집하세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 space-y-6">
            {/* 팀 이미지 */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                팀 이미지
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="relative">
                  <div
                    onClick={handleImageClick}
                    className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer group border-2 border-gray-200 hover:border-blue-500 transition-colors"
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="팀 이미지 미리보기"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg flex items-center justify-center bg-gray-100">
                        <Image
                          src={KoriSupport}
                          alt="팀 기본 아이콘"
                          width={48}
                          height={48}
                          className="w-10 h-10 sm:w-12 sm:h-12"
                        />
                      </div>
                    )}

                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  </div>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-3">
                    팀을 대표하는 이미지를 업로드하세요
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      이미지 선택
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                      >
                        이미지 제거
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG 형식 | 최대 5MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                팀 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="팀 이름을 입력하세요"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                팀 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="팀에 대한 설명을 입력하세요"
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length} / 500자
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <Link
              href="/team"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              팀 만들기
            </button>
          </div>
        </form>

        <InfoBox
          title="팀 생성 안내"
          items={[
            "팀을 만들면 자동으로 리더가 되어 팀을 관리할 수 있습니다",
            "팀 이름과 설명은 나중에 수정할 수 있습니다",
            "초대 메시지는 새로운 멤버에게 표시됩니다",
            "팀 카테고리에 맞는 활동을 진행해주세요",
          ]}
        />
      </div>
  );
}