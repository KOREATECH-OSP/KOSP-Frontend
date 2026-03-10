'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthContext';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Minus,
  Coins,
  TrendingUp,
  TrendingDown,
  CircleAlert,
  RefreshCcw,
} from 'lucide-react';
import { getUserPointHistory, updateUserPoints } from '@/lib/api/admin';
import type { PointHistoryResponse, PointTransaction } from '@/types/admin';
import { toast } from '@/lib/toast';
import Pagination from '@/common/components/Pagination';

const PAGE_SIZE = 10;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

function TransactionTypeBadge({ amount }: { amount: number }) {
  if (amount > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
        <TrendingUp className="h-3.5 w-3.5" />
        적립
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <TrendingDown className="h-3.5 w-3.5" />
      회수
    </span>
  );
}

export default function AdminPointDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.userId);
  const isValidUserId = Number.isInteger(userId) && userId > 0;
  const { data: session, status } = useSession();

  const [pointHistory, setPointHistory] = useState<PointHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [transactionType, setTransactionType] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPointHistory = useCallback(async () => {
    if (!session?.accessToken) return;
    if (!isValidUserId) {
      setLoadError('잘못된 사용자 경로입니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getUserPointHistory(
        userId,
        { page: currentPage, size: PAGE_SIZE },
        { accessToken: session.accessToken }
      );
      setPointHistory(data);
    } catch (err) {
      console.error('Failed to fetch point history:', err);
      setLoadError('포인트 내역을 불러오는데 실패했습니다.');
      toast.error('포인트 내역을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isValidUserId, session?.accessToken, userId]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      void fetchPointHistory();
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchPointHistory, router]);

  const previewAmount = Number.parseInt(amount, 10);
  const isAmountValid = Number.isFinite(previewAmount) && previewAmount > 0;
  const signedPreview = transactionType === 'add' ? previewAmount : -previewAmount;

  const currentPageDelta = useMemo(() => {
    if (!pointHistory?.transactions?.length) return 0;
    return pointHistory.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [pointHistory?.transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken || !isValidUserId) return;

    if (!isAmountValid) {
      toast.error('올바른 포인트를 입력해주세요.');
      return;
    }

    if (!reason.trim()) {
      toast.error('변경 사유를 입력해주세요.');
      return;
    }

    if (transactionType === 'subtract' && previewAmount > currentBalance) {
      toast.error('현재 보유 포인트보다 많은 포인트는 회수할 수 없습니다.');
      return;
    }

    const finalPoint = transactionType === 'add' ? previewAmount : -previewAmount;

    setIsSubmitting(true);
    try {
      await updateUserPoints(
        userId,
        { point: finalPoint, reason: reason.trim() },
        { accessToken: session.accessToken }
      );
      toast.success(
        transactionType === 'add'
          ? `${formatNumber(previewAmount)} 포인트가 적립되었습니다.`
          : `${formatNumber(previewAmount)} 포인트가 회수되었습니다.`
      );
      setAmount('');
      setReason('');
      await fetchPointHistory();
    } catch (err) {
      console.error('Failed to update points:', err);
      toast.error('포인트 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = pointHistory?.totalPages || 1;
  const currentBalance = pointHistory?.currentBalance || 0;
  const previewBalance = isAmountValid ? currentBalance + signedPreview : currentBalance;
  const exceedsCurrentBalance =
    transactionType === 'subtract' && isAmountValid && previewAmount > currentBalance;

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/points')}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            포인트 목록으로
          </button>
          <h1 className="text-xl font-bold text-gray-900">포인트 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pointHistory ? `${pointHistory.userName}님의 포인트를 관리합니다.` : '사용자 포인트 원장을 관리합니다.'}
          </p>
        </div>

        {isLoading && !pointHistory ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">불러오는 중...</p>
          </div>
        ) : loadError || !pointHistory ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-14 text-center">
            <CircleAlert className="mx-auto h-8 w-8 text-red-400" />
            <p className="mt-3 text-sm text-gray-700">{loadError || '포인트 정보를 불러올 수 없습니다.'}</p>
            <button
              onClick={() => void fetchPointHistory()}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="font-semibold text-gray-900">포인트 조정</h2>
                </div>

                <div className="space-y-4 px-5 py-5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransactionType('add')}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                        transactionType === 'add'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="h-4 w-4" />
                        적립
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionType('subtract')}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                        transactionType === 'subtract'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Minus className="h-4 w-4" />
                        회수
                      </span>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="amount" className="mb-2 block text-sm font-medium text-gray-700">
                        포인트 수량
                      </label>
                      <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        placeholder="포인트를 입력하세요"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                      />
                      {exceedsCurrentBalance && (
                        <p className="mt-2 text-sm text-red-600">
                          현재 잔액보다 많은 포인트는 회수할 수 없습니다.
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="reason" className="mb-2 block text-sm font-medium text-gray-700">
                        변경 사유
                      </label>
                      <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder="예: 챌린지 운영 보정, 잘못 적립된 포인트 회수"
                        className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                      />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>현재 잔액</span>
                        <span className="font-medium text-gray-900">{formatNumber(currentBalance)} P</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-gray-600">
                        <span>변경 예정</span>
                        <span className={transactionType === 'add' ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
                          {isAmountValid ? `${signedPreview > 0 ? '+' : ''}${formatNumber(signedPreview)} P` : '-'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-gray-700">
                        <span>적용 후 잔액</span>
                        <span className="font-semibold text-gray-900">{formatNumber(previewBalance)} P</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isAmountValid || !reason.trim() || exceedsCurrentBalance}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        transactionType === 'add'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        <>
                          {transactionType === 'add' ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                          {transactionType === 'add' ? '포인트 적립' : '포인트 회수'}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </section>

              <div className="space-y-4">
                <section className="rounded-xl border border-gray-200 bg-white">
                  <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="font-semibold text-gray-900">기본 정보</h2>
                  </div>

                  <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">사용자 ID</p>
                      <p className="mt-1 text-sm text-gray-900">{pointHistory.userId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">사용자명</p>
                      <p className="mt-1 text-sm text-gray-900">{pointHistory.userName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">현재 잔액</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{formatNumber(currentBalance)} P</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">총 이력 건수</p>
                      <p className="mt-1 text-sm text-gray-900">{formatNumber(pointHistory.totalElements)}건</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">현재 페이지 순증감</p>
                      <p className={`mt-1 text-sm font-semibold ${currentPageDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {currentPageDelta > 0 ? '+' : ''}
                        {formatNumber(currentPageDelta)} P
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">현재 페이지</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {currentPage + 1} / {totalPages}
                      </p>
                    </div>
                  </div>
                </section>

              </div>
            </div>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex flex-col gap-1 border-b border-gray-200 px-4 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <span>포인트 내역</span>
                <div className="flex items-center gap-3">
                  <span>총 {formatNumber(pointHistory.totalElements)}건</span>
                  <button
                    type="button"
                    onClick={() => void fetchPointHistory()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    새로고침
                  </button>
                </div>
              </div>

              {!pointHistory.transactions.length ? (
                <div className="py-16 text-center">
                  <Coins className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">포인트 내역이 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          <th className="px-4 py-3">일시</th>
                          <th className="px-4 py-3">유형</th>
                          <th className="px-4 py-3">사유</th>
                          <th className="px-4 py-3 text-right">금액</th>
                          <th className="px-4 py-3 text-right">잔액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pointHistory.transactions.map((tx: PointTransaction, index: number) => (
                          <tr key={`${tx.id}-${index}`} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                              {formatDate(tx.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <TransactionTypeBadge amount={tx.amount} />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{tx.reason}</td>
                            <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${
                              tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.amount > 0 ? '+' : ''}
                              {formatNumber(tx.amount)} P
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                              {formatNumber(tx.balanceAfter)} P
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <ul className="divide-y divide-gray-100 md:hidden">
                    {pointHistory.transactions.map((tx: PointTransaction, index: number) => (
                      <li key={`${tx.id}-${index}`} className="space-y-3 px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <TransactionTypeBadge amount={tx.amount} />
                            <p className="mt-2 text-sm text-gray-900">{tx.reason}</p>
                          </div>
                          <div className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount > 0 ? '+' : ''}
                            {formatNumber(tx.amount)} P
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                          <div>
                            <p className="mb-1 text-gray-400">일시</p>
                            <p>{formatDate(tx.createdAt)}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-gray-400">잔액</p>
                            <p className="font-medium text-gray-900">{formatNumber(tx.balanceAfter)} P</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {pointHistory.transactions.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage + 1}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page - 1)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
