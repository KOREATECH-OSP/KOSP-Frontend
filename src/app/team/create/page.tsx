'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import KoriSupport from '@/assets/images/kori/11-06 L 응원 .png';
import InfoBox from '@/common/components/InfoBox';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function CreateTeamPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
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
        setFormData((prev) => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '팀 이름을 입력해주세요';
    } else if (formData.name.length < 2) {
      newErrors.name = '팀 이름은 최소 2자 이상이어야 합니다';
    }

    if (!formData.description.trim()) {
      newErrors.description = '팀 설명을 입력해주세요';
    } else if (formData.description.length < 10) {
      newErrors.description = '팀 설명은 최소 10자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      alert('팀이 생성되었습니다!');
      router.push('/team');
    } catch (error) {
      console.error('팀 생성 실패:', error);
      alert('팀 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/team"
          className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>팀 목록으로 돌아가기</span>
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          팀 만들기
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          새로운 팀을 만들고 함께 성장할 팀원들을 모집하세요
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="space-y-6 p-6">
          {/* 팀 이미지 */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              팀 이미지
            </label>
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <div className="relative">
                <div
                  onClick={handleImageClick}
                  className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 transition-colors hover:border-blue-500"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="팀 이미지 미리보기"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
                      <Image
                        src={KoriSupport}
                        alt="팀 기본 아이콘"
                        width={48}
                        height={48}
                        className="h-10 w-10 sm:h-12 sm:w-12"
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-all group-hover:bg-black/40">
                    <Upload className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex-1">
                <p className="mb-3 text-sm text-gray-600">
                  팀을 대표하는 이미지를 업로드하세요
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    이미지 선택
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      이미지 제거
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
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
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-gray-900"
            >
              팀 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="팀 이름을 입력하세요"
              className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-gray-900"
            >
              팀 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="팀에 대한 설명을 입력하세요"
              rows={4}
              className={`w-full resize-none rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
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
        <div className="flex flex-col justify-end gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50 p-6 sm:flex-row">
          <Link
            href="/team"
            className="rounded-lg border border-gray-300 px-6 py-3 text-center text-gray-700 transition-colors hover:bg-white"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
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

      <InfoBox
        title="팀 생성 안내"
        items={[
          '팀을 만들면 자동으로 리더가 되어 팀을 관리할 수 있습니다',
          '팀 이름과 설명은 나중에 수정할 수 있습니다',
          '팀원 모집 공고를 작성하여 팀원을 모집할 수 있습니다',
        ]}
      />
    </div>
  );
}
