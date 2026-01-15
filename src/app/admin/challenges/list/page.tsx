'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus,
  Trophy,
  Search,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import {
  getAdminChallenges,
  deleteAdminChallenge,
} from '@/lib/api/admin';
import type { AdminChallengeResponse } from '@/types/admin';
import { toast } from '@/lib/toast';

export default function ChallengesListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [challenges, setChallenges] = useState<AdminChallengeResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<AdminChallengeResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchChallenges = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getAdminChallenges({ accessToken: session.accessToken });
      setChallenges(data);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
      setError('챌린지 목록을 불러오는데 실패했습니다.');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchChallenges();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchChallenges, router]);

  const handleDelete = async () => {
    if (!selectedChallenge || !session?.accessToken) return;

    try {
      setDeleting(true);
      await deleteAdminChallenge(selectedChallenge.id, { accessToken: session.accessToken });
      toast.success('챌린지가 삭제되었습니다.');
      await fetchChallenges();
      setShowDeleteModal(false);
      setSelectedChallenge(null);
    } catch (err) {
      console.error('Failed to delete challenge:', err);
      toast.error('챌린지 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredChallenges = challenges.filter(
    (challenge) =>
      challenge.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (status === 'loading' || loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-gray-400" />
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={fetchChallenges}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">챌린지 관리</h1>
          <p className="mt-1 text-sm text-gray-500">챌린지를 생성하고 관리합니다</p>
        </div>

        {/* 통계 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">전체 챌린지</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{challenges.length}개</p>
            </div>
            <div className="flex gap-4">
              {[0, 1, 2].map((tier) => (
                <div key={tier} className="text-center">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getTierBadgeColor(tier)}`}>
                    Tier {tier}
                  </span>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {challenges.filter((c) => c.tier === tier).length}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 검색 및 생성 버튼 */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="챌린지 이름 또는 설명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>
            <button
              onClick={() => router.push('/admin/challenges/create')}
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Plus className="h-5 w-5" />
              챌린지 생성
            </button>
          </div>
        </div>

        {/* 챌린지 목록 - 테이블 */}
        {filteredChallenges.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-4 text-gray-500">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 챌린지가 없습니다'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/admin/challenges/create')}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
              >
                첫 챌린지 만들기
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      챌린지
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      티어
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      포인트
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      진행도
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      조건
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredChallenges.map((challenge) => (
                    <tr key={challenge.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {challenge.imageUrl ? (
                              <Image
                                src={challenge.imageUrl}
                                alt={challenge.name}
                                fill
                                className="object-cover"
                                unoptimized
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900">{challenge.name}</div>
                            <div className="truncate text-xs text-gray-500" title={challenge.description}>
                              {challenge.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${getTierBadgeColor(challenge.tier)}`}>
                          Tier {challenge.tier}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-gray-900">{challenge.point}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{challenge.maxProgress}</span>
                          <span className="ml-1 text-gray-500">({challenge.progressField})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                          {challenge.condition.length > 30
                            ? `${challenge.condition.slice(0, 30)}...`
                            : challenge.condition}
                        </code>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/challenges/edit/${challenge.id}`)}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => {
                              setSelectedChallenge(challenge);
                              setShowDeleteModal(true);
                            }}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteModal && selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-gray-900">챌린지 삭제</h2>
              <p className="mb-6 text-gray-600">
                <span className="font-semibold">{selectedChallenge.name}</span> 챌린지를 정말
                삭제하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedChallenge(null);
                  }}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      삭제 중...
                    </>
                  ) : (
                    '삭제'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
