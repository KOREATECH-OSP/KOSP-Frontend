'use client';

import { useState } from 'react';

interface Applicant {
  id: number;
  name: string;
  email: string;
  appliedAt: string;
  status: '대기' | '승인' | '거절';
}

interface Recruit {
  id: number;
  title: string;
  author: string;
  authorEmail: string;
  team: string;
  startDate: string;
  endDate: string;
  applicants: Applicant[];
  status: '모집중' | '마감임박' | '마감';
  description: string;
  requirements: string;
}

export default function RecruitsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecruit, setSelectedRecruit] = useState<Recruit | null>(null);

  // Mock data
  const [recruits, setRecruits] = useState<Recruit[]>([
    {
      id: 1,
      title: 'React 프로젝트 프론트엔드 개발자 모집',
      author: '홍길동',
      authorEmail: 'hong@koreatech.ac.kr',
      team: 'React 스터디팀',
      startDate: '2024-12-20',
      endDate: '2025-01-15',
      applicants: [
        { id: 1, name: '김지민', email: 'jimin@koreatech.ac.kr', appliedAt: '2024-12-21', status: '대기' },
        { id: 2, name: '이서준', email: 'seojun@koreatech.ac.kr', appliedAt: '2024-12-22', status: '승인' },
        { id: 3, name: '박하윤', email: 'hayun@koreatech.ac.kr', appliedAt: '2024-12-23', status: '거절' },
      ],
      status: '모집중',
      description: 'React와 Next.js를 활용한 웹 프로젝트에 함께할 프론트엔드 개발자를 모집합니다.',
      requirements: 'JavaScript/TypeScript 기본 지식, React 경험자 우대',
    },
    {
      id: 2,
      title: 'Spring Boot 백엔드 개발자 모집',
      author: '김철수',
      authorEmail: 'kim@koreatech.ac.kr',
      team: 'Spring Boot 프로젝트',
      startDate: '2024-12-15',
      endDate: '2024-12-31',
      applicants: [
        { id: 4, name: '최민서', email: 'minseo@koreatech.ac.kr', appliedAt: '2024-12-16', status: '승인' },
        { id: 5, name: '정예린', email: 'yerin@koreatech.ac.kr', appliedAt: '2024-12-17', status: '대기' },
      ],
      status: '마감임박',
      description: 'Spring Boot 기반 RESTful API 개발에 참여할 백엔드 개발자를 찾습니다.',
      requirements: 'Java 기본 지식, Spring Framework 이해, DB 설계 경험 우대',
    },
    {
      id: 3,
      title: '알고리즘 스터디 멤버 모집',
      author: '이영희',
      authorEmail: 'lee@koreatech.ac.kr',
      team: '알고리즘 스터디',
      startDate: '2024-12-01',
      endDate: '2024-12-25',
      applicants: [
        { id: 6, name: '송도윤', email: 'doyun@koreatech.ac.kr', appliedAt: '2024-12-02', status: '승인' },
        { id: 7, name: '한지우', email: 'jiwoo@koreatech.ac.kr', appliedAt: '2024-12-03', status: '승인' },
        { id: 8, name: '윤서아', email: 'seoa@koreatech.ac.kr', appliedAt: '2024-12-05', status: '거절' },
      ],
      status: '마감',
      description: '매주 알고리즘 문제를 함께 풀고 토론하는 스터디입니다.',
      requirements: '기초 프로그래밍 지식, 열정과 꾸준함',
    },
    {
      id: 4,
      title: '해커톤 팀원 긴급 모집',
      author: '박민수',
      authorEmail: 'park@koreatech.ac.kr',
      team: '해커톤 준비팀',
      startDate: '2024-12-28',
      endDate: '2025-01-05',
      applicants: [
        { id: 9, name: '임준영', email: 'junyoung@koreatech.ac.kr', appliedAt: '2024-12-29', status: '대기' },
      ],
      status: '마감임박',
      description: '2025년 1월 해커톤 참가를 위한 팀원을 급하게 모집합니다.',
      requirements: '풀스택 개발 가능자, 빠른 커뮤니케이션 가능자',
    },
    {
      id: 5,
      title: 'UI/UX 디자이너 모집',
      author: '정수진',
      authorEmail: 'jung@koreatech.ac.kr',
      team: 'React 스터디팀',
      startDate: '2024-12-25',
      endDate: '2025-01-20',
      applicants: [
        { id: 10, name: '강다은', email: 'daeun@koreatech.ac.kr', appliedAt: '2024-12-26', status: '대기' },
        { id: 11, name: '조현우', email: 'hyunwoo@koreatech.ac.kr', appliedAt: '2024-12-27', status: '대기' },
      ],
      status: '모집중',
      description: '프로젝트의 UI/UX 디자인을 담당할 디자이너를 모집합니다.',
      requirements: 'Figma 사용 가능, 포트폴리오 보유자 우대',
    },
  ]);

  const filteredRecruits = recruits.filter((recruit) => {
    const matchesSearch =
      recruit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recruit.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recruit.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || recruit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: Recruit['status']) => {
    switch (status) {
      case '모집중':
        return 'bg-success';
      case '마감임박':
        return 'bg-warning text-dark';
      case '마감':
        return 'bg-secondary';
    }
  };

  const getApplicantStatusBadgeClass = (status: Applicant['status']) => {
    switch (status) {
      case '대기':
        return 'bg-warning text-dark';
      case '승인':
        return 'bg-success';
      case '거절':
        return 'bg-danger';
    }
  };

  const handleViewDetail = (recruit: Recruit) => {
    setSelectedRecruit(recruit);
    setShowDetailModal(true);
  };

  const handleViewApplicants = (recruit: Recruit) => {
    setSelectedRecruit(recruit);
    setShowApplicantsModal(true);
  };

  const handleDeleteClick = (recruit: Recruit) => {
    setSelectedRecruit(recruit);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedRecruit) {
      setRecruits(recruits.filter((r) => r.id !== selectedRecruit.id));
      setShowDeleteModal(false);
      setSelectedRecruit(null);
    }
  };

  const handleStatusChange = (recruitId: number, newStatus: Recruit['status']) => {
    setRecruits(recruits.map((r) =>
      r.id === recruitId ? { ...r, status: newStatus } : r
    ));
  };

  const handleApplicantStatusChange = (applicantId: number, newStatus: Applicant['status']) => {
    if (selectedRecruit) {
      const updatedApplicants = selectedRecruit.applicants.map((a) =>
        a.id === applicantId ? { ...a, status: newStatus } : a
      );
      const updatedRecruit = { ...selectedRecruit, applicants: updatedApplicants };
      setSelectedRecruit(updatedRecruit);
      setRecruits(recruits.map((r) =>
        r.id === selectedRecruit.id ? updatedRecruit : r
      ));
    }
  };

  const totalApplicants = recruits.reduce((sum, r) => sum + r.applicants.length, 0);
  const pendingApplicants = recruits.reduce(
    (sum, r) => sum + r.applicants.filter((a) => a.status === '대기').length,
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">모집공고 관리</h4>
          <p className="text-muted mb-0">총 {recruits.length}개의 모집공고</p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm bg-success bg-opacity-10"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '모집중' ? 'all' : '모집중')}
          >
            <div className="card-body text-center">
              <h3 className="text-success mb-1">{recruits.filter((r) => r.status === '모집중').length}</h3>
              <small className="text-muted">모집중</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm bg-warning bg-opacity-10"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '마감임박' ? 'all' : '마감임박')}
          >
            <div className="card-body text-center">
              <h3 className="text-warning mb-1">{recruits.filter((r) => r.status === '마감임박').length}</h3>
              <small className="text-muted">마감임박</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm bg-secondary bg-opacity-10"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '마감' ? 'all' : '마감')}
          >
            <div className="card-body text-center">
              <h3 className="text-secondary mb-1">{recruits.filter((r) => r.status === '마감').length}</h3>
              <small className="text-muted">마감</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-info bg-opacity-10">
            <div className="card-body text-center">
              <h3 className="text-info mb-1">{totalApplicants}</h3>
              <small className="text-muted">총 지원자 (대기: {pendingApplicants})</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="제목, 작성자, 팀명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">전체 상태</option>
                <option value="모집중">모집중</option>
                <option value="마감임박">마감임박</option>
                <option value="마감">마감</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Recruits Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>제목</th>
                  <th>팀</th>
                  <th>작성자</th>
                  <th>모집기간</th>
                  <th>지원자</th>
                  <th>상태</th>
                  <th style={{ width: '150px' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecruits.map((recruit) => (
                  <tr key={recruit.id}>
                    <td>
                      <div
                        className="fw-semibold text-truncate"
                        style={{ maxWidth: '250px', cursor: 'pointer' }}
                        onClick={() => handleViewDetail(recruit)}
                      >
                        {recruit.title}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {recruit.team}
                      </span>
                    </td>
                    <td>{recruit.author}</td>
                    <td className="text-muted">
                      <small>
                        {recruit.startDate} ~ {recruit.endDate}
                      </small>
                    </td>
                    <td>
                      <button
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => handleViewApplicants(recruit)}
                      >
                        <i className="bi bi-person-check text-muted me-1"></i>
                        {recruit.applicants.length}명
                        {recruit.applicants.filter((a) => a.status === '대기').length > 0 && (
                          <span className="badge bg-warning text-dark ms-1">
                            {recruit.applicants.filter((a) => a.status === '대기').length}
                          </span>
                        )}
                      </button>
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm ${getStatusBadgeClass(recruit.status)}`}
                        value={recruit.status}
                        onChange={(e) => handleStatusChange(recruit.id, e.target.value as Recruit['status'])}
                        style={{ width: '110px' }}
                      >
                        <option value="모집중">모집중</option>
                        <option value="마감임박">마감임박</option>
                        <option value="마감">마감</option>
                      </select>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          title="상세보기"
                          onClick={() => handleViewDetail(recruit)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          title="지원자 보기"
                          onClick={() => handleViewApplicants(recruit)}
                        >
                          <i className="bi bi-people"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="삭제"
                          onClick={() => handleDeleteClick(recruit)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecruit && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">모집공고 상세</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h5>{selectedRecruit.title}</h5>
                  <span className={`badge ${getStatusBadgeClass(selectedRecruit.status)}`}>
                    {selectedRecruit.status}
                  </span>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-muted small">팀</label>
                      <div>
                        <span className="badge bg-primary">{selectedRecruit.team}</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">작성자</label>
                      <div>{selectedRecruit.author}</div>
                      <small className="text-muted">{selectedRecruit.authorEmail}</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-muted small">모집기간</label>
                      <div>{selectedRecruit.startDate} ~ {selectedRecruit.endDate}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">지원자 현황</label>
                      <div>
                        총 {selectedRecruit.applicants.length}명
                        (대기: {selectedRecruit.applicants.filter((a) => a.status === '대기').length} /
                        승인: {selectedRecruit.applicants.filter((a) => a.status === '승인').length} /
                        거절: {selectedRecruit.applicants.filter((a) => a.status === '거절').length})
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">모집 내용</label>
                  <div className="p-3 bg-light rounded">{selectedRecruit.description}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">지원 자격</label>
                  <div className="p-3 bg-light rounded">{selectedRecruit.requirements}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  닫기
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleViewApplicants(selectedRecruit);
                  }}
                >
                  지원자 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicantsModal && selectedRecruit && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">지원자 관리</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApplicantsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6 className="text-muted">{selectedRecruit.title}</h6>
                  <div className="d-flex gap-2">
                    <span className="badge bg-warning text-dark">
                      대기: {selectedRecruit.applicants.filter((a) => a.status === '대기').length}
                    </span>
                    <span className="badge bg-success">
                      승인: {selectedRecruit.applicants.filter((a) => a.status === '승인').length}
                    </span>
                    <span className="badge bg-danger">
                      거절: {selectedRecruit.applicants.filter((a) => a.status === '거절').length}
                    </span>
                  </div>
                </div>
                {selectedRecruit.applicants.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-2">지원자가 없습니다.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>이름</th>
                          <th>이메일</th>
                          <th>지원일</th>
                          <th>상태</th>
                          <th>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecruit.applicants.map((applicant) => (
                          <tr key={applicant.id}>
                            <td className="fw-semibold">{applicant.name}</td>
                            <td className="text-muted">{applicant.email}</td>
                            <td className="text-muted">{applicant.appliedAt}</td>
                            <td>
                              <span className={`badge ${getApplicantStatusBadgeClass(applicant.status)}`}>
                                {applicant.status}
                              </span>
                            </td>
                            <td>
                              {applicant.status === '대기' ? (
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleApplicantStatusChange(applicant.id, '승인')}
                                  >
                                    승인
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleApplicantStatusChange(applicant.id, '거절')}
                                  >
                                    거절
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => handleApplicantStatusChange(applicant.id, '대기')}
                                >
                                  되돌리기
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApplicantsModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRecruit && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">모집공고 삭제</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center">
                  <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3">정말 삭제하시겠습니까?</h5>
                  <p className="text-muted">
                    &quot;{selectedRecruit.title}&quot; 모집공고를 삭제합니다.<br />
                    이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
