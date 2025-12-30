'use client';

import { useState } from 'react';

interface Team {
  id: number;
  name: string;
  leader: string;
  leaderEmail: string;
  members: number;
  maxMembers: number;
  createdAt: string;
  status: '활성' | '비활성' | '해체';
  category: string;
  description: string;
}

export default function TeamsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Mock data
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'React 스터디팀', leader: '홍길동', leaderEmail: 'hong@koreatech.ac.kr', members: 5, maxMembers: 8, createdAt: '2024-12-01', status: '활성', category: '스터디', description: 'React와 Next.js를 함께 공부하는 스터디 그룹입니다.' },
    { id: 2, name: 'Spring Boot 프로젝트', leader: '김철수', leaderEmail: 'kim@koreatech.ac.kr', members: 4, maxMembers: 6, createdAt: '2024-12-05', status: '활성', category: '프로젝트', description: 'Spring Boot 기반의 웹 서비스를 개발하고 있습니다.' },
    { id: 3, name: '알고리즘 스터디', leader: '이영희', leaderEmail: 'lee@koreatech.ac.kr', members: 8, maxMembers: 10, createdAt: '2024-11-15', status: '활성', category: '스터디', description: '코딩 테스트 대비 알고리즘 문제 풀이 스터디입니다.' },
    { id: 4, name: '해커톤 준비팀', leader: '박민수', leaderEmail: 'park@koreatech.ac.kr', members: 3, maxMembers: 5, createdAt: '2024-12-10', status: '활성', category: '대회', description: '2025년 상반기 해커톤 참가를 준비하는 팀입니다.' },
    { id: 5, name: '웹개발 입문', leader: '정수진', leaderEmail: 'jung@koreatech.ac.kr', members: 6, maxMembers: 8, createdAt: '2024-10-20', status: '비활성', category: '스터디', description: '웹개발 기초부터 배우는 초보자 스터디입니다.' },
    { id: 6, name: '졸업프로젝트 A팀', leader: '최동현', leaderEmail: 'choi@koreatech.ac.kr', members: 4, maxMembers: 4, createdAt: '2024-09-01', status: '해체', category: '프로젝트', description: '2024년도 졸업프로젝트 팀입니다.' },
  ]);

  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    description: '',
    maxMembers: 8,
    status: '활성' as Team['status'],
  });

  const [createForm, setCreateForm] = useState({
    name: '',
    category: '스터디',
    description: '',
    maxMembers: 8,
    leader: '',
    leaderEmail: '',
  });

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: Team['status']) => {
    switch (status) {
      case '활성':
        return 'bg-success';
      case '비활성':
        return 'bg-warning text-dark';
      case '해체':
        return 'bg-secondary';
    }
  };

  const handleViewDetail = (team: Team) => {
    setSelectedTeam(team);
    setShowDetailModal(true);
  };

  const handleEditClick = (team: Team) => {
    setSelectedTeam(team);
    setEditForm({
      name: team.name,
      category: team.category,
      description: team.description,
      maxMembers: team.maxMembers,
      status: team.status,
    });
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    if (selectedTeam) {
      setTeams(teams.map((t) =>
        t.id === selectedTeam.id
          ? { ...t, ...editForm }
          : t
      ));
      setShowEditModal(false);
      setSelectedTeam(null);
    }
  };

  const handleDeleteClick = (team: Team) => {
    setSelectedTeam(team);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTeam) {
      setTeams(teams.filter((t) => t.id !== selectedTeam.id));
      setShowDeleteModal(false);
      setSelectedTeam(null);
    }
  };

  const handleStatusChange = (teamId: number, newStatus: Team['status']) => {
    setTeams(teams.map((t) =>
      t.id === teamId ? { ...t, status: newStatus } : t
    ));
  };

  const handleCreate = () => {
    const newTeam: Team = {
      id: Math.max(...teams.map((t) => t.id)) + 1,
      name: createForm.name,
      leader: createForm.leader,
      leaderEmail: createForm.leaderEmail,
      members: 1,
      maxMembers: createForm.maxMembers,
      createdAt: new Date().toISOString().split('T')[0],
      status: '활성',
      category: createForm.category,
      description: createForm.description,
    };
    setTeams([...teams, newTeam]);
    setShowCreateModal(false);
    setCreateForm({
      name: '',
      category: '스터디',
      description: '',
      maxMembers: 8,
      leader: '',
      leaderEmail: '',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">팀 관리</h4>
          <p className="text-muted mb-0">총 {teams.length}개의 팀</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>
          팀 생성
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm bg-success bg-opacity-10"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '활성' ? 'all' : '활성')}
          >
            <div className="card-body text-center">
              <h3 className="text-success mb-1">{teams.filter((t) => t.status === '활성').length}</h3>
              <small className="text-muted">활성 팀</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm bg-warning bg-opacity-10"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '비활성' ? 'all' : '비활성')}
          >
            <div className="card-body text-center">
              <h3 className="text-warning mb-1">{teams.filter((t) => t.status === '비활성').length}</h3>
              <small className="text-muted">비활성 팀</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm bg-secondary bg-opacity-10"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === '해체' ? 'all' : '해체')}
          >
            <div className="card-body text-center">
              <h3 className="text-secondary mb-1">{teams.filter((t) => t.status === '해체').length}</h3>
              <small className="text-muted">해체된 팀</small>
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
                  placeholder="팀명, 팀장으로 검색..."
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
                <option value="활성">활성</option>
                <option value="비활성">비활성</option>
                <option value="해체">해체</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>팀명</th>
                  <th>카테고리</th>
                  <th>팀장</th>
                  <th>멤버 수</th>
                  <th>생성일</th>
                  <th>상태</th>
                  <th style={{ width: '200px' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <i className="bi bi-people text-primary"></i>
                        </div>
                        <div className="fw-semibold">{team.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info bg-opacity-10 text-info">
                        {team.category}
                      </span>
                    </td>
                    <td>{team.leader}</td>
                    <td>
                      <i className="bi bi-person text-muted me-1"></i>
                      {team.members}/{team.maxMembers}명
                    </td>
                    <td className="text-muted">{team.createdAt}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm ${getStatusBadgeClass(team.status)}`}
                        value={team.status}
                        onChange={(e) => handleStatusChange(team.id, e.target.value as Team['status'])}
                        style={{ width: '100px' }}
                      >
                        <option value="활성">활성</option>
                        <option value="비활성">비활성</option>
                        <option value="해체">해체</option>
                      </select>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          title="상세보기"
                          onClick={() => handleViewDetail(team)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          title="수정"
                          onClick={() => handleEditClick(team)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="삭제"
                          onClick={() => handleDeleteClick(team)}
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
      {showDetailModal && selectedTeam && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">팀 상세 정보</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-muted small">팀명</label>
                      <div className="fw-bold">{selectedTeam.name}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">카테고리</label>
                      <div>
                        <span className="badge bg-info">{selectedTeam.category}</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">팀장</label>
                      <div>{selectedTeam.leader}</div>
                      <small className="text-muted">{selectedTeam.leaderEmail}</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label text-muted small">멤버</label>
                      <div>{selectedTeam.members} / {selectedTeam.maxMembers}명</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">생성일</label>
                      <div>{selectedTeam.createdAt}</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small">상태</label>
                      <div>
                        <span className={`badge ${getStatusBadgeClass(selectedTeam.status)}`}>
                          {selectedTeam.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">설명</label>
                  <div>{selectedTeam.description}</div>
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
                    handleEditClick(selectedTeam);
                  }}
                >
                  수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTeam && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">팀 수정</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">팀명</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">카테고리</label>
                  <select
                    className="form-select"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    <option value="스터디">스터디</option>
                    <option value="프로젝트">프로젝트</option>
                    <option value="대회">대회</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">설명</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">최대 인원</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.maxMembers}
                    onChange={(e) => setEditForm({ ...editForm, maxMembers: parseInt(e.target.value) })}
                    min={1}
                    max={20}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">상태</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Team['status'] })}
                  >
                    <option value="활성">활성</option>
                    <option value="비활성">비활성</option>
                    <option value="해체">해체</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  취소
                </button>
                <button type="button" className="btn btn-primary" onClick={handleEditSave}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTeam && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">팀 삭제</h5>
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
                    &quot;{selectedTeam.name}&quot; 팀을 삭제합니다.<br />
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">팀 생성</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">팀명 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="팀명을 입력하세요"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">팀장 이름 <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="팀장 이름"
                        value={createForm.leader}
                        onChange={(e) => setCreateForm({ ...createForm, leader: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">팀장 이메일 <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="이메일"
                        value={createForm.leaderEmail}
                        onChange={(e) => setCreateForm({ ...createForm, leaderEmail: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">카테고리</label>
                      <select
                        className="form-select"
                        value={createForm.category}
                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                      >
                        <option value="스터디">스터디</option>
                        <option value="프로젝트">프로젝트</option>
                        <option value="대회">대회</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">최대 인원</label>
                      <input
                        type="number"
                        className="form-control"
                        value={createForm.maxMembers}
                        onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })}
                        min={1}
                        max={20}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">설명</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="팀 설명을 입력하세요"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreate}
                  disabled={!createForm.name || !createForm.leader || !createForm.leaderEmail}
                >
                  생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
