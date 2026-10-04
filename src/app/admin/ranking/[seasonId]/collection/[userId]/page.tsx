'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import { toast } from '@/lib/toast';
import { getCollectionStatusDetail, forceCollect } from '@/lib/api/admin';
import type { CollectionStatusDetailResponse, CollectionStatus, RepositoryCommitStat } from '@/types/admin';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const STATUS_LABEL: Record<CollectionStatus, string> = {
  NORMAL: '정상',
  ANOMALY: '이상',
  NOT_COLLECTED: '미수집',
};

const STATUS_CLASS: Record<CollectionStatus, string> = {
  NORMAL: 'bg-green-100 text-green-700',
  ANOMALY: 'bg-yellow-100 text-yellow-700',
  NOT_COLLECTED: 'bg-gray-100 text-gray-500',
};

function formatDateTime(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CollectionStatusDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const seasonId = Number(params.seasonId);
  const userId = Number(params.userId);

  const [detail, setDetail] = useState<CollectionStatusDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [forcing, setForcing] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const data = await getCollectionStatusDetail(seasonId, userId, { accessToken: session.accessToken });
      setDetail(data);
    } catch {
      toast.error('수집 현황을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, seasonId, userId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleForceCollect = async () => {
    if (!session?.accessToken || !detail) return;
    if (!confirm(`"${detail.userName}"의 GitHub 데이터를 즉시 수집하시겠습니까?`)) return;
    setForcing(true);
    try {
      await forceCollect(userId, { accessToken: session.accessToken });
      toast.success('수집 요청이 전송되었습니다. 수분 내 반영됩니다.');
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        toast.error('이미 수집이 진행 중입니다.');
      } else {
        toast.error('수집 요청에 실패했습니다.');
      }
    } finally {
      setForcing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">수집 현황 상세</h1>
            <p className="mt-1 text-sm text-gray-500">레포지토리별 커밋 수집 현황</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDetail}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          <button
            onClick={handleForceCollect}
            disabled={forcing || loading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {forcing ? '요청 중...' : '강제 수집'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : detail == null ? null : (
        <div className="space-y-6">
          {/* 요약 카드 */}
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {detail.userName}
                  <span className="ml-2 text-sm font-normal text-gray-400">#{detail.userId}</span>
                </p>
                <p className="mt-0.5 text-sm text-gray-500">{detail.githubLogin ?? '-'}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[detail.collectionStatus]}`}>
                {STATUS_LABEL[detail.collectionStatus]}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
              <div>
                <p className="text-xs text-gray-500">마지막 수집</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{formatDateTime(detail.lastCrawling)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">시즌 내 총 커밋</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{detail.totalCommitCount.toLocaleString()}건</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">점수 반영 커밋 <span className="text-gray-400">(변경 5줄↑)</span></p>
                <p className="mt-1 text-sm font-medium text-gray-900">{detail.scoredCommitCount.toLocaleString()}건</p>
              </div>
            </div>
          </div>

          {/* 레포별 테이블 */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-900">레포지토리별 커밋 현황</h2>
            </div>
            {detail.repositories.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                수집된 커밋이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
                      <th className="px-6 py-3">레포지토리</th>
                      <th className="px-6 py-3 text-right">총 커밋</th>
                      <th className="px-6 py-3 text-right">점수 반영</th>
                      <th className="px-6 py-3 text-right">미반영</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detail.repositories.map((repo: RepositoryCommitStat) => (
                      <tr key={repo.repositoryName} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs text-gray-700">{repo.repositoryName}</td>
                        <td className="px-6 py-4 text-right text-gray-900">{repo.totalCommitCount.toLocaleString()}건</td>
                        <td className="px-6 py-4 text-right text-green-600">{repo.scoredCommitCount.toLocaleString()}건</td>
                        <td className="px-6 py-4 text-right text-gray-400">
                          {(repo.totalCommitCount - repo.scoredCommitCount).toLocaleString()}건
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
