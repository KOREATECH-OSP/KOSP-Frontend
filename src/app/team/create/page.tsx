'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Upload, X, ArrowLeft, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { API_BASE_URL } from '@/lib/api/config';

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
        toast.error('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
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
      const response = await fetch(`${API_BASE_URL}/v1/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl || undefined,
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
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </button>
      </div>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">팀 만들기</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 팀 이미지 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            팀 이미지
          </label>
          <div className="flex items-start gap-4">
            <div className="relative">
              <div
                onClick={handleImageClick}
                className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition hover:border-gray-400"
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="팀 이미지"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Users className="h-8 w-8 text-gray-400" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                  <Upload className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
                </div>
              </div>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white shadow hover:bg-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-xs text-gray-500">
                JPG, PNG 형식 · 최대 5MB
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

        {/* 팀 이름 */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            팀 이름
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="팀 이름을 입력하세요"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none ${
              errors.name
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-gray-400'
            }`}
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* 팀 설명 */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            팀 설명
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="팀에 대한 설명을 입력하세요"
            rows={4}
            className={`w-full resize-none rounded-lg border px-4 py-2.5 text-sm focus:outline-none ${
              errors.description
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-gray-400'
            }`}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {formData.description.length} / 500자
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-4">
          <Link
            href="/team"
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-300"
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
  );
}
