'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Trophy, Loader2, Image as ImageIcon } from 'lucide-react';
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

  const getTierBadgeColor = (tier: number) => {
    const colors = [
      'bg-gray-100 text-gray-700',
      'bg-green-100 text-green-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-red-100 text-red-700',
    ];
    return colors[tier] || colors[0];
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-3xl">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </button>
          <h1 className="text-2xl font-bold text-gray-900">챌린지 생성</h1>
          <p className="mt-1 text-sm text-gray-500">새로운 챌린지를 생성합니다</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">기본 정보</h2>

            <div className="space-y-5">
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
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
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">이미지 URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                {formData.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                    <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                      <span className="text-xs font-medium text-gray-500">미리보기</span>
                    </div>
                    <div className="relative h-40 w-full bg-gray-100">
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 달성 조건 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">달성 조건 (SpEL)</h2>

            <div className="space-y-5">
              {/* SpEL 표현식 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  SpEL 표현식 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="#progressField >= 10"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  progressField 변수를 사용하여 조건을 작성하세요
                </p>
              </div>

              {/* SpEL 예시 */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-3 text-xs font-medium text-gray-500">예시 (클릭하여 입력)</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => insertSpELExample('#progressField >= 10')}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    #progressField &gt;= 10
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSpELExample('#progressField == 100')}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    #progressField == 100
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSpELExample('#progressField >= 7 && #progressField <= 30')}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    #progressField &gt;= 7 &amp;&amp; #progressField &lt;= 30
                  </button>
                </div>
              </div>

              {/* Progress Field & Max Progress */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    진행도 필드명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.progressField}
                    onChange={(e) => setFormData({ ...formData, progressField: e.target.value })}
                    placeholder="attendance_days"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm transition-colors focus:border-gray-400 focus:outline-none"
                    disabled={submitting}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">예: attendance_days, post_count</p>
                </div>
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                    disabled={submitting}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">목표 값 (진행률 표시용)</p>
                </div>
              </div>
            </div>
          </div>

          {/* 보상 설정 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">보상 설정</h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Tier */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  난이도 (Tier) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                    disabled={submitting}
                  >
                    {[0, 1, 2, 3, 4, 5].map((tier) => (
                      <option key={tier} value={tier}>
                        Tier {tier} {tier === 0 ? '(쉬움)' : tier === 5 ? '(매우 어려움)' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">선택됨:</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTierBadgeColor(formData.tier)}`}>
                      Tier {formData.tier}
                    </span>
                  </div>
                </div>
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                <p className="mt-1.5 text-xs text-gray-500">달성 시 지급될 포인트</p>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4" />
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
