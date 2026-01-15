'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AlertTriangle, User, FileText, MessageCircle, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import { getAdminReports, processAdminReport } from '@/lib/api/admin';
import type { AdminReportResponse } from '@/types/admin';
import { toast } from '@/lib/toast';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-auto min-w-[180px] px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-left flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors focus:border-gray-400 focus:outline-none"
      >
        <span className="text-sm text-gray-900">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                option.value === value
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportsListPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<AdminReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AdminReportResponse | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  const statusOptions = [
    { value: 'ALL', label: '전체 상태' },
    { value: 'PENDING', label: '대기중' },
    { value: 'ACCEPTED', label: '처리완료' },
  ];

  const typeOptions = [
    { value: 'ALL', label: '전체 유형' },
    { value: 'ARTICLE', label: '게시글' },
    { value: 'USER', label: '사용자' },
    { value: 'COMMENT', label: '댓글' },
  ];

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
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            대기중
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            처리완료
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus !== 'ALL' && report.status !== filterStatus) return false;
    if (filterType !== 'ALL' && report.targetType !== filterType) return false;
    return true;
  });

  const pendingCount = reports.filter(r => r.status === 'PENDING').length;
  const acceptedCount = reports.filter(r => r.status === 'ACCEPTED').length;

  if (loading) {
    return (
      <div className="px-6 pb-6 md:px-8 md:pb-8">
        <div className="max-w-7xl mx-auto">
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

  if (error) {
    return (
      <div className="px-6 pb-6 md:px-8 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">신고 관리</h1>
          <p className="mt-0.5 text-sm text-gray-500">전체 {reports.length}개</p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">대기중</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}개</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">처리완료</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{acceptedCount}개</p>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <CustomSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
              placeholder="상태 선택"
            />
            <CustomSelect
              value={filterType}
              onChange={setFilterType}
              options={typeOptions}
              placeholder="유형 선택"
            />
          </div>
        </div>

        {/* 신고 목록 */}
        {filteredReports.length > 0 ? (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(report.status)}
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium flex items-center gap-1">
                        {getTargetTypeIcon(report.targetType)}
                        {getTargetTypeName(report.targetType)}
                      </span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                        {getReasonName(report.reason)}
                      </span>
                      <span className="text-xs text-gray-500">#{report.id}</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mb-1">
                      신고 대상 ID: {report.targetId}
                    </p>
                    {report.description && (
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>신고자: {report.reporterName}</span>
                      <span>{new Date(report.createdAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                  {report.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowProcessModal(true);
                      }}
                      className="ml-4 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                      처리하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">신고 내역이 없습니다</p>
          </div>
        )}

        {/* 처리 모달 */}
        {showProcessModal && selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">신고 처리</h2>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">신고 ID:</span> {selectedReport.id}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">대상:</span> {getTargetTypeName(selectedReport.targetType)} (ID: {selectedReport.targetId})
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">사유:</span> {getReasonName(selectedReport.reason)}
                </p>
                {selectedReport.description && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">상세:</span> {selectedReport.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleProcess('DELETE_CONTENT')}
                  disabled={processing}
                  className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  콘텐츠 삭제
                </button>
                <button
                  onClick={() => handleProcess('REJECT')}
                  disabled={processing}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  신고 기각
                </button>
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedReport(null);
                  }}
                  disabled={processing}
                  className="w-full px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
