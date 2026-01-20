'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ArrowLeft, Trophy, Lightbulb, Save } from 'lucide-react';
import { getAdminChallenge, updateAdminChallenge } from '@/lib/api/admin';
import type { AdminChallengeUpdateRequest } from '@/types/admin';
import { toast } from '@/lib/toast';

export default function EditChallengePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AdminChallengeUpdateRequest>({
    name: '',
    description: '',
    condition: '',
    category: '',
    tier: 0,
    imageUrl: '',
    point: 0,
    maxProgress: 0,
    progressField: '',
  });

  const fetchChallenge = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const data = await getAdminChallenge(Number(id), { accessToken: session.accessToken });
      setFormData({
        name: data.name,
        description: data.description,
        condition: data.condition,
        category: data.category || '',
        tier: data.tier,
        imageUrl: data.imageUrl,
        point: data.point,
        maxProgress: data.maxProgress,
        progressField: data.progressField,
      });
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
      toast.error('챌린지 정보를 불러오는데 실패했습니다.');
      router.push('/admin/challenges/list');
    } finally {
      setLoading(false);
    }
  }, [id, session?.accessToken, router]);

  useEffect(() => {
    if (id && session?.accessToken) {
      fetchChallenge();
    }
  }, [id, session?.accessToken, fetchChallenge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) return;

    if (!formData.name || !formData.description || !formData.condition || !formData.category || !formData.progressField) {
      toast.error('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await updateAdminChallenge(Number(id), formData, { accessToken: session.accessToken });
      toast.success('챌린지가 수정되었습니다.');
      router.push('/admin/challenges/list');
    } catch (error: unknown) {
      console.error('Failed to update challenge:', error);
      const errorMessage = error instanceof Error ? error.message : '챌린지 수정에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSpelExample = (example: string) => {
    setFormData({ ...formData, condition: example });
  };

  if (loading) {
    return (
      <div className="px-6 pb-6 md:px-8 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로 가기</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">챌린지 수정</h1>
          <p className="mt-0.5 text-sm text-gray-500">챌린지 정보를 수정합니다</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              기본 정보
            </h2>
            <div className="space-y-4">
              {/* 챌린지 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  챌린지 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 커밋수 100개"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="챌린지에 대한 설명을 입력하세요"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none resize-none"
                  disabled={submitting}
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                >
                  <option value="">카테고리 선택</option>
                  <option value="contribution">기여 (Contribution)</option>
                  <option value="learning">학습 (Learning)</option>
                  <option value="community">커뮤니티 (Community)</option>
                </select>
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                {formData.imageUrl && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">미리보기:</p>
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="w-32 h-32 object-cover rounded-lg"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SpEL 조건식 섹션 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              달성 조건 (SpEL)
            </h2>
            <div className="space-y-4">
              {/* SpEL 표현식 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SpEL 표현식 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="예: #progressField >= 100"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none font-mono"
                  disabled={submitting}
                />
                <p className="mt-2 text-xs text-gray-500">
                  #progressField 변수를 사용하여 조건을 작성하세요
                </p>
              </div>

              {/* SpEL 예시 버튼 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">빠른 입력:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpelExample('#progressField >= 10')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    disabled={submitting}
                  >
                    10 이상
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpelExample('#progressField >= 50')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    disabled={submitting}
                  >
                    50 이상
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpelExample('#progressField >= 100')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    disabled={submitting}
                  >
                    100 이상
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpelExample('#progressField == 100')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    disabled={submitting}
                  >
                    정확히 100
                  </button>
                </div>
              </div>

              {/* Progress Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Field <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.progressField}
                  onChange={(e) => setFormData({ ...formData, progressField: e.target.value })}
                  placeholder="예: totalCommits"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none font-mono"
                  disabled={submitting}
                />
                <p className="mt-2 text-xs text-gray-500">
                  진행도를 추적할 필드명을 입력하세요
                </p>
              </div>

              {/* Max Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 진행도 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxProgress}
                  onChange={(e) => setFormData({ ...formData, maxProgress: Number(e.target.value) })}
                  placeholder="100"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* 보상 설정 섹션 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">보상 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  난이도 (Tier) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                >
                  <option value={0}>Tier 0 (가장 쉬움)</option>
                  <option value={1}>Tier 1</option>
                  <option value={2}>Tier 2</option>
                  <option value={3}>Tier 3</option>
                  <option value={4}>Tier 4</option>
                  <option value={5}>Tier 5 (가장 어려움)</option>
                </select>
              </div>

              {/* Point */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보상 포인트 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.point}
                  onChange={(e) => setFormData({ ...formData, point: Number(e.target.value) })}
                  placeholder="100"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
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
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  수정 중...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  수정 완료
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
