'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Minus,
  Coins,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { getUserPointHistory, updateUserPoints } from '@/lib/api/admin';
import type { PointHistoryResponse, PointTransaction } from '@/types/admin';
import { toast } from '@/lib/toast';
import Pagination from '@/common/components/Pagination';

const PAGE_SIZE = 10;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
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

export default function AdminPointDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.userId);
  const { data: session, status } = useSession();

  const [pointHistory, setPointHistory] = useState<PointHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // 포인트 변경 폼 상태
  const [transactionType, setTransactionType] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPointHistory = useCallback(async () => {
    if (!session?.accessToken || !userId) return;

    setIsLoading(true);
    try {
      const data = await getUserPointHistory(
        userId,
        { page: currentPage, size: PAGE_SIZE },
        { accessToken: session.accessToken }
      );
      setPointHistory(data);
    } catch (err) {
      console.error('Failed to fetch point history:', err);
      toast.error('포인트 내역을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, userId, currentPage]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchPointHistory();
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session?.accessToken, fetchPointHistory, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) return;

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('올바른 포인트를 입력해주세요.');
      return;
    }

    if (!reason.trim()) {
      toast.error('변경 사유를 입력해주세요.');
      return;
    }

    const finalPoint = transactionType === 'add' ? numAmount : -numAmount;

    setIsSubmitting(true);
    try {
      await updateUserPoints(
        userId,
        { point: finalPoint, reason: reason.trim() },
        { accessToken: session.accessToken }
      );
      toast.success(
        transactionType === 'add'
          ? `${formatNumber(numAmount)} 포인트가 적립되었습니다.`
          : `${formatNumber(numAmount)} 포인트가 회수되었습니다.`
      );
      setAmount('');
      setReason('');
      setCurrentPage(0);
      fetchPointHistory();
    } catch (err) {
      console.error('Failed to update points:', err);
      toast.error('포인트 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = pointHistory?.totalPages || 1;

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 뒤로가기 & 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </button>
          <h1 className="text-xl font-bold text-gray-900">포인트 관리</h1>
          {pointHistory && (
            <p className="mt-0.5 text-sm text-gray-500">
              {pointHistory.userName}님의 포인트를 관리합니다.
            </p>
          )}
        </div>

        {isLoading && !pointHistory ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 현재 잔액 카드 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                  <Coins className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">현재 잔액</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(pointHistory?.currentBalance || 0)} P
                  </p>
                </div>
              </div>
            </div>

            {/* 포인트 적립/회수 폼 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">포인트 변경</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 적립/회수 선택 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    유형 선택
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setTransactionType('add')}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                        transactionType === 'add'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      적립
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionType('subtract')}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                        transactionType === 'subtract'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Minus className="h-4 w-4" />
                      회수
                    </button>
                  </div>
                </div>

                {/* 금액 입력 */}
                <div>
                  <label
                    htmlFor="amount"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    포인트
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="변경할 포인트를 입력하세요"
                    min="1"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  />
                </div>

                {/* 사유 입력 */}
                <div>
                  <label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    변경 사유
                  </label>
                  <input
                    type="text"
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="변경 사유를 입력하세요"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  />
                </div>

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  disabled={isSubmitting || !amount || !reason.trim()}
                  className={`w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    transactionType === 'add'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      처리 중...
                    </span>
                  ) : transactionType === 'add' ? (
                    '포인트 적립'
                  ) : (
                    '포인트 회수'
                  )}
                </button>
              </form>
            </div>

            {/* 포인트 내역 */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">포인트 내역</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        일시
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        유형
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        사유
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        금액
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        잔액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {!pointHistory?.transactions ||
                    pointHistory.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Coins className="mx-auto h-8 w-8 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-500">
                            포인트 내역이 없습니다.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      pointHistory.transactions.map((tx: PointTransaction, index: number) => (
                        <tr key={`${tx.id}-${index}`} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-600">
                            {formatDate(tx.createdAt)}
                          </td>
                          <td className="px-6 py-3">
                            {tx.amount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                <TrendingUp className="h-3 w-3" />
                                적립
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                                <TrendingDown className="h-3 w-3" />
                                회수
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {tx.reason}
                          </td>
                          <td
                            className={`whitespace-nowrap px-6 py-3 text-right text-sm font-medium ${
                              tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {tx.amount > 0 ? '+' : ''}
                            {formatNumber(tx.amount)} P
                          </td>
                          <td className="whitespace-nowrap px-6 py-3 text-right text-sm text-gray-900">
                            {formatNumber(tx.balanceAfter)} P
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* 페이지네이션 */}
            {pointHistory?.transactions && pointHistory.transactions.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage + 1}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page - 1)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
