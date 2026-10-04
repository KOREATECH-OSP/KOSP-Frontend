'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import { toast } from '@/lib/toast';
import { getCollectionStatus, forceCollect } from '@/lib/api/admin';
import type { CollectionStatusItem, CollectionStatus } from '@/types/admin';
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

export default function CollectionStatusPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const seasonId = Number(params.seasonId);

  const [users, setUsers] = useState<CollectionStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [forcingUserId, setForcingUserId] = useState<number | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const data = await getCollectionStatus(seasonId, { accessToken: session.accessToken });
      setUsers(data.users);
    } catch {
      toast.error('수집 현황을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, seasonId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleForceCollect = async (user: CollectionStatusItem) => {
    if (!session?.accessToken) return;
    if (!confirm(`"${user.userName}"의 GitHub 데이터를 즉시 수집하시겠습니까?`)) return;
    setForcingUserId(user.userId);
    try {
      await forceCollect(user.userId, { accessToken: session.accessToken });
      toast.success('수집 요청이 전송되었습니다. 수분 내 반영됩니다.');
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        toast.error('이미 수집이 진행 중입니다.');
      } else {
        toast.error('수집 요청에 실패했습니다.');
      }
    } finally {
      setForcingUserId(null);
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
            <h1 className="text-2xl font-bold text-gray-900">수집 현황</h1>
            <p className="mt-1 text-sm text-gray-500">시즌별 유저 GitHub 데이터 수집 현황</p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">유저별 수집 현황</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            해당 시즌에 등록된 유저가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
                  <th className="px-6 py-3">유저</th>
                  <th className="px-6 py-3">GitHub 로그인</th>
                  <th className="px-6 py-3">마지막 수집</th>
                  <th className="px-6 py-3 text-right">시즌 내 커밋</th>
                  <th className="px-6 py-3">상태</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user.userName}
                      <span className="ml-1 text-xs text-gray-400">#{user.userId}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {user.githubLogin ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDateTime(user.lastCrawling)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {user.totalCommitCount.toLocaleString()}건
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[user.collectionStatus]}`}
                      >
                        {STATUS_LABEL[user.collectionStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/ranking/${seasonId}/collection/${user.userId}`)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        >
                          상세
                        </button>
                        <button
                          onClick={() => handleForceCollect(user)}
                          disabled={forcingUserId === user.userId}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          {forcingUserId === user.userId ? '요청 중...' : '강제 수집'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
