'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Trophy, Info, Loader2 } from 'lucide-react';
import { createAdminChallenge } from '@/lib/api/admin';
import type { AdminChallengeCreateRequest } from '@/types/admin';
import { toast } from '@/lib/toast';

export default function CreateChallengePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<AdminChallengeCreateRequest>({
    name: '',
    description: '',
    condition: '',
    tier: 0,
    imageUrl: '',
    point: 0,
    maxProgress: 0,
    progressField: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!formData.name || !formData.description || !formData.condition || !formData.progressField) {
      toast.error('모든 필수 필드를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await createAdminChallenge(formData, { accessToken: session.accessToken });
      toast.success('챌린지가 생성되었습니다.');
      router.push('/admin/challenges/list');
    } catch (err) {
      console.error('Failed to create challenge:', err);
      toast.error('챌린지 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const insertSpELExample = (example: string) => {
    setFormData({ ...formData, condition: example });
  };

  if (status === 'loading') {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>뒤로 가기</span>
          </button>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">챌린지 생성</h1>
          <p className="text-gray-600">새로운 챌린지를 생성합니다</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">기본 정보</h2>

            <div className="space-y-4">
              {/* 챌린지 이름 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  챌린지 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 10일 연속 출석"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="사용자에게 보여질 챌린지 설명을 입력하세요"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  이미지 URL <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  {formData.imageUrl && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="mb-2 text-sm text-gray-600">미리보기</p>
                      <div className="relative h-48 w-full overflow-hidden rounded-lg">
                        <Image
                          src={formData.imageUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SpEL 조건식 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">달성 조건 (SpEL)</h2>
              <div className="group relative">
                <Info className="h-4 w-4 cursor-help text-gray-400" />
                <div className="invisible absolute left-0 top-6 z-10 w-64 rounded-lg bg-gray-900 p-3 text-xs text-white shadow-lg group-hover:visible">
                  SpEL(Spring Expression Language) 표현식으로 챌린지 달성 조건을 정의합니다.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* SpEL 수식 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  SpEL 표현식 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="#progressField >= 10"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  progressField 변수를 사용하여 조건을 작성하세요
                </p>
              </div>

              {/* SpEL 예시 */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="mb-2 text-sm font-medium text-blue-900">SpEL 예시:</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => insertSpELExample('#progressField >= 10')}
                    className="w-full rounded border border-blue-200 bg-white px-3 py-2 text-left font-mono text-sm text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    #progressField &gt;= 10
                    <span className="ml-2 text-xs text-gray-600">(10 이상)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSpELExample('#progressField == 100')}
                    className="w-full rounded border border-blue-200 bg-white px-3 py-2 text-left font-mono text-sm text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    #progressField == 100
                    <span className="ml-2 text-xs text-gray-600">(정확히 100)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSpELExample('#progressField >= 7 && #progressField <= 30')}
                    className="w-full rounded border border-blue-200 bg-white px-3 py-2 text-left font-mono text-sm text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    #progressField &gt;= 7 &amp;&amp; #progressField &lt;= 30
                    <span className="ml-2 text-xs text-gray-600">(7~30 사이)</span>
                  </button>
                </div>
              </div>

              {/* Progress Field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  진행도 필드명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.progressField}
                  onChange={(e) => setFormData({ ...formData, progressField: e.target.value })}
                  placeholder="attendance_days"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  사용자의 진행도를 추적할 필드명 (예: attendance_days, post_count)
                </p>
              </div>

              {/* Max Progress */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  최대 진행도 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxProgress}
                  onChange={(e) => setFormData({ ...formData, maxProgress: Number(e.target.value) })}
                  placeholder="10"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  달성해야 하는 목표 값 (UI에서 진행률 표시용)
                </p>
              </div>
            </div>
          </div>

          {/* 보상 설정 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">보상 설정</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Tier */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  난이도 (Tier) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                >
                  {[0, 1, 2, 3, 4, 5].map((tier) => (
                    <option key={tier} value={tier}>
                      Tier {tier} {tier === 0 ? '(쉬움)' : tier === 5 ? '(매우 어려움)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Point */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  보상 포인트 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.point}
                  onChange={(e) => setFormData({ ...formData, point: Number(e.target.value) })}
                  placeholder="100"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Trophy className="h-5 w-5" />
                  챌린지 생성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
