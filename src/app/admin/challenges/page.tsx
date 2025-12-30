'use client';

import { useState } from 'react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  condition: string;
  category: '초급' | '중급' | '고급' | '특별';
  reward: number;
  completedCount: number;
  status: '활성' | '비활성';
}

export default function ChallengesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Mock data - 실제로는 API에서 가져옴
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 1, title: '첫 걸음', description: '오픈소스의 세계에 첫 발을 내딛어보세요!', condition: '커밋 1회 이상', category: '초급', reward: 50, completedCount: 234, status: '활성' },
    { id: 2, title: '꾸준함의 시작', description: '7일 동안 매일 커밋하여 개발 습관을 만들어보세요.', condition: '7일 연속 커밋', category: '초급', reward: 200, completedCount: 89, status: '활성' },
    { id: 3, title: '백 번의 헌신', description: '100개의 커밋을 통해 프로젝트에 기여해보세요.', condition: '누적 커밋 100회 이상', category: '초급', reward: 300, completedCount: 45, status: '활성' },
    { id: 4, title: 'PR 마스터', description: '다양한 프로젝트에 코드 기여를 시작하세요.', condition: 'PR 생성 20회 이상', category: '중급', reward: 400, completedCount: 23, status: '활성' },
    { id: 5, title: '머지의 달인', description: '여러분의 코드가 실제 프로젝트에 반영되는 기쁨을 느껴보세요.', condition: '머지된 PR 10개 이상', category: '중급', reward: 500, completedCount: 15, status: '활성' },
    { id: 6, title: '코드 리뷰어', description: '다른 개발자의 코드를 리뷰하며 함께 성장하세요.', condition: 'PR 리뷰 30회 이상', category: '중급', reward: 450, completedCount: 12, status: '활성' },
    { id: 7, title: '이슈 해결사', description: '오픈소스 프로젝트의 이슈를 해결해보세요.', condition: '이슈 해결 15개 이상', category: '중급', reward: 550, completedCount: 8, status: '활성' },
    { id: 8, title: '코드의 거장', description: '오픈소스 활동의 베테랑이 되어보세요.', condition: '누적 커밋 1000회 이상', category: '고급', reward: 1500, completedCount: 3, status: '활성' },
    { id: 9, title: '100일의 헌신', description: '100일 동안 매일 코딩하는 진정한 개발자가 되어보세요.', condition: '100일 연속 커밋', category: '고급', reward: 2000, completedCount: 1, status: '활성' },
    { id: 10, title: '프로젝트 리더', description: '오픈소스 프로젝트를 이끌어가는 리더가 되어보세요.', condition: '팀 프로젝트 리더 경험 3회 이상', category: '고급', reward: 1800, completedCount: 2, status: '활성' },
    { id: 11, title: '연중무휴 개발자', description: '일 년 동안 플랫폼과 함께한 진정한 열정을 보여주세요.', condition: '사이트 출석체크 365회', category: '특별', reward: 3000, completedCount: 0, status: '활성' },
    { id: 12, title: '오픈소스 전도사', description: '오픈소스의 가치를 널리 알려주세요.', condition: '커뮤니티 글 작성 50회 이상', category: '특별', reward: 2500, completedCount: 1, status: '활성' },
  ]);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    condition: '',
    category: '초급' as Challenge['category'],
    reward: 100,
    status: '활성' as Challenge['status'],
  });

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    condition: '',
    category: '초급' as Challenge['category'],
    reward: 100,
  });

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || challenge.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (category: Challenge['category']) => {
    switch (category) {
      case '초급':
        return 'bg-success';
      case '중급':
        return 'bg-primary';
      case '고급':
        return 'bg-purple';
      case '특별':
        return 'bg-warning text-dark';
    }
  };

  const getCategoryStyle = (category: Challenge['category']) => {
    if (category === '고급') {
      return { backgroundColor: 'purple' };
    }
    return {};
  };

  const handleViewDetail = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowDetailModal(true);
  };

  const handleEditClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setEditForm({
      title: challenge.title,
      description: challenge.description,
      condition: challenge.condition,
      category: challenge.category,
      reward: challenge.reward,
      status: challenge.status,
    });
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    if (selectedChallenge) {
      setChallenges(challenges.map((c) =>
        c.id === selectedChallenge.id
          ? { ...c, ...editForm }
          : c
      ));
      setShowEditModal(false);
      setSelectedChallenge(null);
    }
  };

  const handleDeleteClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedChallenge) {
      setChallenges(challenges.filter((c) => c.id !== selectedChallenge.id));
      setShowDeleteModal(false);
      setSelectedChallenge(null);
    }
  };

  const handleStatusToggle = (challengeId: number) => {
    setChallenges(challenges.map((c) =>
      c.id === challengeId
        ? { ...c, status: c.status === '활성' ? '비활성' : '활성' }
        : c
    ));
  };

  const handleCreate = () => {
    const newChallenge: Challenge = {
      id: Math.max(...challenges.map((c) => c.id)) + 1,
      title: createForm.title,
      description: createForm.description,
      condition: createForm.condition,
      category: createForm.category,
      reward: createForm.reward,
      completedCount: 0,
      status: '활성',
    };
    setChallenges([...challenges, newChallenge]);
    setShowCreateModal(false);
    setCreateForm({
      title: '',
      description: '',
      condition: '',
      category: '초급',
      reward: 100,
    });
  };

  const totalReward = challenges.reduce((sum, c) => sum + c.reward, 0);
  const totalCompleted = challenges.reduce((sum, c) => sum + c.completedCount, 0);

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">챌린지 관리</h4>
          <p className="text-muted mb-0">총 {challenges.length}개의 챌린지</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>
          챌린지 추가
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm bg-success bg-opacity-10"
            style={{ cursor: 'pointer' }}
            onClick={() => setCategoryFilter(categoryFilter === '초급' ? 'all' : '초급')}
          >
            <div className="card-body text-center">
              <h3 className="text-success mb-1">{challenges.filter((c) => c.category === '초급').length}</h3>
              <small className="text-muted">초급</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm bg-primary bg-opacity-10"
            style={{ cursor: 'pointer' }}
            onClick={() => setCategoryFilter(categoryFilter === '중급' ? 'all' : '중급')}
          >
            <div className="card-body text-center">
              <h3 className="text-primary mb-1">{challenges.filter((c) => c.category === '중급').length}</h3>
              <small className="text-muted">중급</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm"
            style={{ backgroundColor: 'rgba(128, 0, 128, 0.1)', cursor: 'pointer' }}
            onClick={() => setCategoryFilter(categoryFilter === '고급' ? 'all' : '고급')}
          >
            <div className="card-body text-center">
              <h3 className="mb-1" style={{ color: 'purple' }}>{challenges.filter((c) => c.category === '고급').length}</h3>
              <small className="text-muted">고급</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm bg-warning bg-opacity-10"
            style={{ cursor: 'pointer' }}
            onClick={() => setCategoryFilter(categoryFilter === '특별' ? 'all' : '특별')}
          >
            <div className="card-body text-center">
              <h3 className="text-warning mb-1">{challenges.filter((c) => c.category === '특별').length}</h3>
              <small className="text-muted">특별</small>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-coin text-warning" style={{ fontSize: '1.5rem' }}></i>
              <h4 className="mt-2 mb-0">{totalReward.toLocaleString()}P</h4>
              <small className="text-muted">총 보상 포인트</small>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-trophy text-info" style={{ fontSize: '1.5rem' }}></i>
              <h4 className="mt-2 mb-0">{totalCompleted.toLocaleString()}</h4>
              <small className="text-muted">총 달성 횟수</small>
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
                  placeholder="챌린지명, 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">전체 난이도</option>
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
                <option value="특별">특별</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>챌린지</th>
                  <th>조건</th>
                  <th>난이도</th>
                  <th>보상</th>
                  <th>달성자</th>
                  <th>상태</th>
                  <th style={{ width: '150px' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredChallenges.map((challenge) => (
                  <tr key={challenge.id}>
                    <td>
                      <div>
                        <div className="fw-semibold">{challenge.title}</div>
                        <small className="text-muted">{challenge.description}</small>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">{challenge.condition}</small>
                    </td>
                    <td>
                      <span
                        className={`badge ${getCategoryBadgeClass(challenge.category)}`}
                        style={getCategoryStyle(challenge.category)}
                      >
                        {challenge.category}
                      </span>
                    </td>
                    <td>
                      <span className="text-warning fw-bold">
                        <i className="bi bi-coin me-1"></i>
                        {challenge.reward}P
                      </span>
                    </td>
                    <td>
                      <i className="bi bi-trophy text-muted me-1"></i>
                      {challenge.completedCount}명
                    </td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={challenge.status === '활성'}
                          onChange={() => handleStatusToggle(challenge.id)}
                        />
                        <label className="form-check-label small">
                          {challenge.status}
                        </label>
                      </div>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          title="상세보기"
                          onClick={() => handleViewDetail(challenge)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          title="수정"
                          onClick={() => handleEditClick(challenge)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="삭제"
                          onClick={() => handleDeleteClick(challenge)}
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
      {showDetailModal && selectedChallenge && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">챌린지 상세</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div
                    className={`d-inline-flex align-items-center justify-content-center rounded-circle mb-3 ${getCategoryBadgeClass(selectedChallenge.category)} bg-opacity-10`}
                    style={{
                      width: '80px',
                      height: '80px',
                    }}
                  >
                    <i className="bi bi-trophy" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h4>{selectedChallenge.title}</h4>
                  <span
                    className={`badge ${getCategoryBadgeClass(selectedChallenge.category)}`}
                    style={getCategoryStyle(selectedChallenge.category)}
                  >
                    {selectedChallenge.category}
                  </span>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">설명</label>
                  <div>{selectedChallenge.description}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">달성 조건</label>
                  <div className="p-2 bg-light rounded">{selectedChallenge.condition}</div>
                </div>
                <div className="row text-center">
                  <div className="col-4">
                    <div className="text-warning fw-bold">
                      <i className="bi bi-coin me-1"></i>
                      {selectedChallenge.reward}P
                    </div>
                    <small className="text-muted">보상</small>
                  </div>
                  <div className="col-4">
                    <div className="fw-bold">{selectedChallenge.completedCount}명</div>
                    <small className="text-muted">달성자</small>
                  </div>
                  <div className="col-4">
                    <span className={`badge ${selectedChallenge.status === '활성' ? 'bg-success' : 'bg-secondary'}`}>
                      {selectedChallenge.status}
                    </span>
                    <br />
                    <small className="text-muted">상태</small>
                  </div>
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
                    handleEditClick(selectedChallenge);
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
      {showEditModal && selectedChallenge && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">챌린지 수정</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">챌린지명</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">설명</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">달성 조건</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">난이도</label>
                      <select
                        className="form-select"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Challenge['category'] })}
                      >
                        <option value="초급">초급</option>
                        <option value="중급">중급</option>
                        <option value="고급">고급</option>
                        <option value="특별">특별</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">보상 (포인트)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.reward}
                        onChange={(e) => setEditForm({ ...editForm, reward: parseInt(e.target.value) })}
                        min={0}
                        step={50}
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">상태</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Challenge['status'] })}
                  >
                    <option value="활성">활성</option>
                    <option value="비활성">비활성</option>
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">챌린지 추가</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">챌린지명 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="챌린지 이름을 입력하세요"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">설명 <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="챌린지 설명을 입력하세요"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">달성 조건 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="예: 커밋 100회 이상"
                    value={createForm.condition}
                    onChange={(e) => setCreateForm({ ...createForm, condition: e.target.value })}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">난이도</label>
                      <select
                        className="form-select"
                        value={createForm.category}
                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as Challenge['category'] })}
                      >
                        <option value="초급">초급</option>
                        <option value="중급">중급</option>
                        <option value="고급">고급</option>
                        <option value="특별">특별</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">보상 (포인트)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={createForm.reward}
                        onChange={(e) => setCreateForm({ ...createForm, reward: parseInt(e.target.value) })}
                        min={0}
                        step={50}
                      />
                    </div>
                  </div>
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
                  disabled={!createForm.title || !createForm.description || !createForm.condition}
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedChallenge && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">챌린지 삭제</h5>
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
                    &quot;{selectedChallenge.title}&quot; 챌린지를 삭제합니다.<br />
                    달성자 {selectedChallenge.completedCount}명의 기록은 유지됩니다.
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
