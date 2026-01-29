'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, FileText, MessageCircle, Loader2 } from 'lucide-react';
import { getAdminReports, processAdminReport } from '@/lib/api/admin';
import type { AdminReportResponse } from '@/types/admin';
import { toast } from '@/lib/toast';
import Pagination from '@/common/components/Pagination';

const PAGE_SIZE = 10;

export default function ReportsListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<AdminReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AdminReportResponse | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReports = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getAdminReports({ accessToken: session.accessToken });
      setReports(response.reports || []);
    } catch (error: unknown) {
      console.error('Failed to fetch reports:', error);
      const errorMessage = error instanceof Error ? error.message : '신고 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchReports();
    }
  }, [session?.accessToken, fetchReports]);

  const handleProcess = async (action: 'DELETE_CONTENT' | 'REJECT') => {
    if (!selectedReport || !session?.accessToken) return;

    try {
      setProcessing(true);
      await processAdminReport(selectedReport.id, action, { accessToken: session.accessToken });
      toast.success('신고가 처리되었습니다.');
      setShowProcessModal(false);
      setSelectedReport(null);
      await fetchReports();
    } catch (error: unknown) {
      console.error('Failed to process report:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error(`신고 처리에 실패했습니다. ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'ARTICLE':
        return <FileText className="w-4 h-4" />;
      case 'USER':
        return <User className="w-4 h-4" />;
      case 'COMMENT':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTargetTypeName = (type: string) => {
    switch (type) {
      case 'ARTICLE':
        return '게시글';
      case 'USER':
        return '사용자';
      case 'COMMENT':
        return '댓글';
      default:
        return '기타';
    }
  };

  const getReasonName = (reason: string) => {
    switch (reason) {
      case 'SPAM':
        return '스팸';
      case 'ABUSE':
        return '욕설/비방';
      case 'INAPPROPRIATE':
        return '부적절한 콘텐츠';
      case 'OTHER':
        return '기타';
      default:
        return reason;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PENDING') {
      return (
        <span className="shrink-0 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
          대기중
        </span>
      );
    }
    return (
      <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        처리완료
      </span>
    );
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus !== 'ALL' && report.status !== filterStatus) return false;
    if (filterType !== 'ALL' && report.targetType !== filterType) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, currentPage]);

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterType]);

  const pendingCount = reports.filter(r => r.status === 'PENDING').length;

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">신고 관리</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              전체 {reports.length}개 · 대기 {pendingCount}건
            </p>
          </div>

          {/* 필터 */}
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            >
              <option value="ALL">전체 상태</option>
              <option value="PENDING">대기중</option>
              <option value="ACCEPTED">처리완료</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus:border-gray-400 focus:outline-none"
            >
              <option value="ALL">전체 유형</option>
              <option value="ARTICLE">게시글</option>
              <option value="USER">사용자</option>
              <option value="COMMENT">댓글</option>
            </select>
          </div>
        </div>

        {/* 신고 목록 */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
                <p className="mt-2 text-sm text-red-500">{error}</p>
                <button
                  onClick={fetchReports}
                  className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  다시 시도
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-16 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">신고 내역이 없습니다</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {paginatedReports.map((report) => (
                  <li
                    key={report.id}
                    onClick={() => router.push(`/admin/reports/${report.id}`)}
                    className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                  >
                    {/* 아이콘 */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      {getTargetTypeIcon(report.targetType)}
                    </div>

                    {/* 내용 */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-gray-900">
                          {getTargetTypeName(report.targetType)} #{report.targetId}
                        </span>
                        {getStatusBadge(report.status)}
                        <span className="shrink-0 rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
                          {getReasonName(report.reason)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>신고자: {report.reporterName}</span>
                        <span>·</span>
                        <span>{new Date(report.createdAt).toLocaleDateString('ko-KR')}</span>
                        {report.description && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[200px]">{report.description}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 버튼 */}
                    {report.status === 'PENDING' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                          setShowProcessModal(true);
                        }}
                        className="shrink-0 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                      >
                        처리
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs text-gray-400">처리됨</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!loading && !error && filteredReports.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* 처리 모달 */}
        {showProcessModal && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-gray-900">신고 처리</h2>
              <div className="mb-6 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">대상:</span> {getTargetTypeName(selectedReport.targetType)} #{selectedReport.targetId}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">사유:</span> {getReasonName(selectedReport.reason)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">신고자:</span> {selectedReport.reporterName}
                </p>
                {selectedReport.description && (
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">상세:</span> {selectedReport.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedReport(null);
                  }}
                  disabled={processing}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={() => handleProcess('REJECT')}
                  disabled={processing}
                  className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    '기각'
                  )}
                </button>
                <button
                  onClick={() => handleProcess('DELETE_CONTENT')}
                  disabled={processing}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
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
