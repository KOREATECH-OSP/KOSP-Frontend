'use client';

import { useState } from 'react';

interface Report {
  id: number;
  targetType: '게시글' | '댓글' | '사용자';
  targetTitle: string;
  targetContent: string;
  reporter: string;
  reason: string;
  detail: string;
  createdAt: string;
  status: '대기' | '처리중' | '처리완료' | '기각';
  processedAt?: string;
  processedBy?: string;
}

const initialReports: Report[] = [
  { id: 1, targetType: '게시글', targetTitle: '부적절한 게시글 제목', targetContent: '이 게시글에는 부적절한 내용이 포함되어 있습니다...', reporter: '김철수', reason: '욕설/비방', detail: '게시글에 욕설이 포함되어 있어 신고합니다.', createdAt: '2024-12-30 14:30', status: '대기' },
  { id: 2, targetType: '댓글', targetTitle: '악성 댓글 내용...', targetContent: '이 댓글은 광고성 스팸입니다.', reporter: '이영희', reason: '스팸/광고', detail: '댓글에 외부 링크 광고가 포함되어 있습니다.', createdAt: '2024-12-30 10:15', status: '대기' },
  { id: 3, targetType: '사용자', targetTitle: '악성유저123', targetContent: '해당 사용자가 허위 정보를 유포하고 있습니다.', reporter: '박민수', reason: '사기/허위정보', detail: '프로젝트 관련 거짓 정보를 퍼뜨리고 있습니다.', createdAt: '2024-12-29 16:45', status: '처리중' },
  { id: 4, targetType: '게시글', targetTitle: '광고성 게시글입니다', targetContent: '특정 상품 홍보를 위한 게시글입니다.', reporter: '정수진', reason: '스팸/광고', detail: '명백한 광고 게시글입니다.', createdAt: '2024-12-29 09:00', status: '처리완료', processedAt: '2024-12-29 15:00', processedBy: '관리자' },
  { id: 5, targetType: '댓글', targetTitle: '분쟁 유발 댓글', targetContent: '단순한 의견 차이로 보입니다.', reporter: '최동현', reason: '기타', detail: '다른 사용자와 논쟁을 유발하는 댓글입니다.', createdAt: '2024-12-28 11:20', status: '기각', processedAt: '2024-12-28 18:00', processedBy: '관리자' },
];

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [processNote, setProcessNote] = useState('');

  const filteredReports = reports.filter((report) => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.targetType === typeFilter;
    return matchesStatus && matchesType;
  });

  const pendingCount = reports.filter((r) => r.status === '대기').length;

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleStartProcess = (report: Report) => {
    setSelectedReport(report);
    setProcessNote('');
    setShowProcessModal(true);
  };

  const handleProcess = (action: '처리완료' | '기각') => {
    if (!selectedReport) return;

    const now = new Date().toLocaleString('ko-KR');
    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReport.id
          ? { ...r, status: action, processedAt: now, processedBy: '관리자' }
          : r
      )
    );
    setShowProcessModal(false);
    setShowDetailModal(false);
    alert(`신고가 ${action === '처리완료' ? '처리 완료' : '기각'} 되었습니다.`);
  };

  const handleQuickAction = (reportId: number, action: '처리완료' | '기각') => {
    const now = new Date().toLocaleString('ko-KR');
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: action, processedAt: now, processedBy: '관리자' }
          : r
      )
    );
    alert(`신고가 ${action === '처리완료' ? '처리 완료' : '기각'} 되었습니다.`);
  };

  const handleSetProcessing = (reportId: number) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: '처리중' } : r
      )
    );
  };

  const getStatusBadgeClass = (status: Report['status']) => {
    switch (status) {
      case '대기':
        return 'bg-danger';
      case '처리중':
        return 'bg-warning text-dark';
      case '처리완료':
        return 'bg-success';
      case '기각':
        return 'bg-secondary';
    }
  };

  const getTargetTypeBadgeClass = (type: Report['targetType']) => {
    switch (type) {
      case '게시글':
        return 'bg-primary bg-opacity-10 text-primary';
      case '댓글':
        return 'bg-info bg-opacity-10 text-info';
      case '사용자':
        return 'bg-danger bg-opacity-10 text-danger';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">신고 관리</h4>
          <p className="text-muted mb-0">
            총 {reports.length}건의 신고 |
            <span className="text-danger ms-1 fw-bold">미처리 {pendingCount}건</span>
          </p>
        </div>
      </div>

      {/* Alert */}
      {pendingCount > 0 && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>
            처리 대기중인 신고가 <strong>{pendingCount}건</strong> 있습니다. 빠른 처리가 필요합니다.
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div
            className={`card border-0 shadow-sm cursor-pointer ${statusFilter === '대기' ? 'border border-danger border-2' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '대기' ? 'all' : '대기')}
          >
            <div className="card-body text-center py-3 bg-danger bg-opacity-10">
              <h3 className="text-danger mb-0">{reports.filter((r) => r.status === '대기').length}</h3>
              <small className="text-muted">대기</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className={`card border-0 shadow-sm ${statusFilter === '처리중' ? 'border border-warning border-2' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '처리중' ? 'all' : '처리중')}
          >
            <div className="card-body text-center py-3 bg-warning bg-opacity-10">
              <h3 className="text-warning mb-0">{reports.filter((r) => r.status === '처리중').length}</h3>
              <small className="text-muted">처리중</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className={`card border-0 shadow-sm ${statusFilter === '처리완료' ? 'border border-success border-2' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '처리완료' ? 'all' : '처리완료')}
          >
            <div className="card-body text-center py-3 bg-success bg-opacity-10">
              <h3 className="text-success mb-0">{reports.filter((r) => r.status === '처리완료').length}</h3>
              <small className="text-muted">처리완료</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className={`card border-0 shadow-sm ${statusFilter === '기각' ? 'border border-secondary border-2' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '기각' ? 'all' : '기각')}
          >
            <div className="card-body text-center py-3 bg-secondary bg-opacity-10">
              <h3 className="text-secondary mb-0">{reports.filter((r) => r.status === '기각').length}</h3>
              <small className="text-muted">기각</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">전체 상태</option>
                <option value="대기">대기</option>
                <option value="처리중">처리중</option>
                <option value="처리완료">처리완료</option>
                <option value="기각">기각</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">전체 유형</option>
                <option value="게시글">게시글</option>
                <option value="댓글">댓글</option>
                <option value="사용자">사용자</option>
              </select>
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>유형</th>
                  <th>대상</th>
                  <th>신고 사유</th>
                  <th>신고자</th>
                  <th>신고일시</th>
                  <th>상태</th>
                  <th style={{ width: '200px' }}>처리</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className={report.status === '대기' ? 'table-danger' : ''}>
                    <td>
                      <span className={`badge ${getTargetTypeBadgeClass(report.targetType)}`}>
                        {report.targetType}
                      </span>
                    </td>
                    <td>
                      <div
                        className="text-truncate fw-semibold"
                        style={{ maxWidth: '200px', cursor: 'pointer' }}
                        onClick={() => handleViewReport(report)}
                      >
                        {report.targetTitle}
                      </div>
                    </td>
                    <td>{report.reason}</td>
                    <td>{report.reporter}</td>
                    <td className="text-muted">{report.createdAt}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      {report.status === '대기' && (
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            title="상세보기"
                            onClick={() => handleViewReport(report)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-warning"
                            title="처리중으로 변경"
                            onClick={() => handleSetProcessing(report.id)}
                          >
                            <i className="bi bi-hourglass-split"></i>
                          </button>
                          <button
                            className="btn btn-success"
                            title="처리완료"
                            onClick={() => handleQuickAction(report.id, '처리완료')}
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button
                            className="btn btn-secondary"
                            title="기각"
                            onClick={() => handleQuickAction(report.id, '기각')}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      )}
                      {report.status === '처리중' && (
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            title="상세보기"
                            onClick={() => handleViewReport(report)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-success"
                            title="처리완료"
                            onClick={() => handleQuickAction(report.id, '처리완료')}
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button
                            className="btn btn-secondary"
                            title="기각"
                            onClick={() => handleQuickAction(report.id, '기각')}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      )}
                      {(report.status === '처리완료' || report.status === '기각') && (
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleViewReport(report)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          상세
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white">
          <span className="text-muted">{filteredReports.length}건 표시 중</span>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">신고 상세</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <small className="text-muted d-block">유형</small>
                      <span className={`badge ${getTargetTypeBadgeClass(selectedReport.targetType)}`}>
                        {selectedReport.targetType}
                      </span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">신고 사유</small>
                      <strong>{selectedReport.reason}</strong>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">신고자</small>
                      <strong>{selectedReport.reporter}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <small className="text-muted d-block">상태</small>
                      <span className={`badge ${getStatusBadgeClass(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">신고일시</small>
                      <strong>{selectedReport.createdAt}</strong>
                    </div>
                    {selectedReport.processedAt && (
                      <div className="mb-3">
                        <small className="text-muted d-block">처리일시</small>
                        <strong>{selectedReport.processedAt} ({selectedReport.processedBy})</strong>
                      </div>
                    )}
                  </div>
                </div>

                <hr />

                <div className="mb-4">
                  <h6>신고 대상</h6>
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title">{selectedReport.targetTitle}</h6>
                      <p className="card-text text-muted">{selectedReport.targetContent}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h6>신고 내용</h6>
                  <p className="text-muted">{selectedReport.detail}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  닫기
                </button>
                {(selectedReport.status === '대기' || selectedReport.status === '처리중') && (
                  <>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleProcess('처리완료')}
                    >
                      <i className="bi bi-check-lg me-1"></i>
                      처리완료
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => handleProcess('기각')}
                    >
                      <i className="bi bi-x-lg me-1"></i>
                      기각
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
