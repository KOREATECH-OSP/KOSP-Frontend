'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Upload, X, ArrowLeft, Loader2, Users, AlertCircle, Camera } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { API_BASE_URL } from '@/lib/api/config';
import { uploadFile } from '@/lib/api/upload';

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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
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
        toast.error('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
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
      // 이미지 파일이 있으면 먼저 업로드
      let imageUrl: string | undefined;
      if (imageFile) {
        try {
          const fileResponse = await uploadFile(imageFile, { accessToken });
          imageUrl = fileResponse.url;
        } catch (uploadError) {
          console.error('이미지 업로드 실패:', uploadError);
          throw new Error('이미지 업로드에 실패했습니다.');
        }
      }

      const response = await fetch(`${API_BASE_URL}/v1/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          imageUrl,
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

      toast.success('팀이 생성되었습니다.');
      router.push('/team');
    } catch (error) {
      console.error('팀 생성 실패:', error);
      const message = error instanceof Error ? error.message : '팀 생성에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          목록으로
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">팀 만들기</h1>
        <p className="mt-2 text-gray-500">
          프로젝트를 함께할 멋진 팀을 만들어보세요.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 팀 이미지 */}
          <div>
            <label className="mb-4 block text-sm font-bold text-gray-900">
              팀 대표 이미지
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative">
                <div
                  onClick={handleImageClick}
                  className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-gray-400 hover:bg-gray-100"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="팀 이미지"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Camera className="h-8 w-8" />
                      <span className="text-xs font-medium">이미지 업로드</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/10">
                  </div>
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-500 shadow-md hover:text-red-500 border border-gray-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex-1 pt-2">
                <h4 className="text-sm font-medium text-gray-900">이미지 가이드라인</h4>
                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                  <li>• 권장 사이즈: 500x500px 이상</li>
                  <li>• JPG, PNG, WEBP 형식 지원</li>
                  <li>• 파일 크기: 최대 5MB</li>
                </ul>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gray-100" />

          {/* 팀 이름 */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-bold text-gray-900"
              >
                팀 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="멋진 팀 이름을 입력해주세요"
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 ${errors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/50'
                    : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900 bg-white placeholder:text-gray-400'
                  }`}
              />
              {errors.name ? (
                <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">
                  2자 이상 입력해주세요.
                </p>
              )}
            </div>

            {/* 팀 설명 */}
            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-bold text-gray-900"
              >
                팀 소개 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="어떤 프로젝트를 진행하는 팀인가요? 팀의 목표나 비전을 자유롭게 소개해주세요."
                rows={6}
                className={`w-full resize-none rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 ${errors.description
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/50'
                    : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900 bg-white placeholder:text-gray-400'
                  }`}
              />
              {errors.description ? (
                <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </p>
              ) : (
                <div className="mt-1.5 flex justify-between text-xs text-gray-500">
                  <span>10자 이상 입력해주세요.</span>
                  <span>{formData.description.length}자</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link
              href="/team"
              className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
  );
}
