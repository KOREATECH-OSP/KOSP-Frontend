'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
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
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">챌린지 관리</h1>
          <p className="text-gray-600">챌린지를 생성하고 관리합니다</p>
        </div>

        {/* 통계 */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">전체 챌린지</span>
              <Trophy className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{challenges.length}개</p>
          </div>
          {[0, 1, 2].map((tier) => (
            <div key={tier} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Tier {tier}</span>
                <Trophy className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {challenges.filter((c) => c.tier === tier).length}개
              </p>
            </div>
          ))}
        </div>

        {/* 검색 및 생성 버튼 */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="챌린지 이름 또는 설명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => router.push('/admin/challenges/create')}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Plus className="h-5 w-5" />
              챌린지 생성
            </button>
          </div>
        </div>

        {/* 챌린지 목록 */}
        <div className="space-y-4">
          {filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row">
                {/* 왼쪽: 이미지 */}
                <div className="relative h-48 w-full flex-shrink-0 bg-gray-100 md:h-auto md:w-48">
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
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getTierBadgeColor(challenge.tier)}`}
                    >
                      Tier {challenge.tier}
                    </span>
                  </div>
                </div>

                {/* 오른쪽: 정보 */}
                <div className="flex-1 p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex flex-1 items-center gap-2">
                      <Trophy className="h-5 w-5 flex-shrink-0 text-blue-500" />
                      <h3 className="text-lg font-bold text-gray-900">{challenge.name}</h3>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setShowDeleteModal(true);
                      }}
                      className="ml-4 flex-shrink-0 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">{challenge.description}</p>

                  <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* 달성 조건 */}
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 text-xs text-gray-500">달성 조건 (SpEL)</div>
                      <div className="break-all font-mono text-sm text-gray-900">
                        {challenge.condition}
                      </div>
                    </div>

                    {/* 통계 정보 */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-blue-50 p-2 text-center">
                        <div className="mb-1 text-xs text-blue-600">포인트</div>
                        <div className="text-sm font-bold text-blue-700">{challenge.point}</div>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-2 text-center">
                        <div className="mb-1 text-xs text-purple-600">진행도</div>
                        <div className="text-sm font-bold text-purple-700">{challenge.maxProgress}</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-2 text-center">
                        <div className="mb-1 text-xs text-green-600">필드</div>
                        <div
                          className="truncate text-xs font-medium text-green-700"
                          title={challenge.progressField}
                        >
                          {challenge.progressField}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 수정 버튼 */}
                  <button
                    onClick={() => router.push(`/admin/challenges/edit/${challenge.id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-4 text-gray-500">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 챌린지가 없습니다'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/admin/challenges/create')}
                className="rounded-lg bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800"
              >
                첫 챌린지 만들기
              </button>
            )}
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
                  className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
