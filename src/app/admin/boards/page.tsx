'use client';

import { useState } from 'react';

interface Board {
  id: number;
  name: string;
  description: string;
  postCount: number;
  isRecruitAllowed: boolean;
  createdAt: string;
  status: '활성' | '비활성';
  order: number;
}

export default function BoardsManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  // Mock data
  const [boards, setBoards] = useState<Board[]>([
    { id: 1, name: '자유게시판', description: '자유롭게 이야기를 나눠보세요', postCount: 1234, isRecruitAllowed: false, createdAt: '2024-01-01', status: '활성', order: 1 },
    { id: 2, name: '질문게시판', description: '개발 관련 질문을 올려주세요', postCount: 567, isRecruitAllowed: false, createdAt: '2024-01-01', status: '활성', order: 2 },
    { id: 3, name: '정보게시판', description: '유용한 정보를 공유해주세요', postCount: 890, isRecruitAllowed: false, createdAt: '2024-01-01', status: '활성', order: 3 },
    { id: 4, name: '팀모집게시판', description: '팀원을 모집하세요', postCount: 234, isRecruitAllowed: true, createdAt: '2024-01-01', status: '활성', order: 4 },
    { id: 5, name: '공지사항', description: '관리자 공지사항', postCount: 45, isRecruitAllowed: false, createdAt: '2024-01-01', status: '활성', order: 5 },
  ]);

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isRecruitAllowed: false,
    status: '활성' as Board['status'],
  });

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    isRecruitAllowed: false,
  });

  const handleEditClick = (board: Board) => {
    setSelectedBoard(board);
    setEditForm({
      name: board.name,
      description: board.description,
      isRecruitAllowed: board.isRecruitAllowed,
      status: board.status,
    });
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    if (selectedBoard) {
      setBoards(boards.map((b) =>
        b.id === selectedBoard.id
          ? { ...b, ...editForm }
          : b
      ));
      setShowEditModal(false);
      setSelectedBoard(null);
    }
  };

  const handleDeleteClick = (board: Board) => {
    setSelectedBoard(board);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedBoard) {
      setBoards(boards.filter((b) => b.id !== selectedBoard.id));
      setShowDeleteModal(false);
      setSelectedBoard(null);
    }
  };

  const handleStatusToggle = (boardId: number) => {
    setBoards(boards.map((b) =>
      b.id === boardId
        ? { ...b, status: b.status === '활성' ? '비활성' : '활성' }
        : b
    ));
  };

  const handleCreate = () => {
    const newBoard: Board = {
      id: Math.max(...boards.map((b) => b.id)) + 1,
      name: createForm.name,
      description: createForm.description,
      postCount: 0,
      isRecruitAllowed: createForm.isRecruitAllowed,
      createdAt: new Date().toISOString().split('T')[0],
      status: '활성',
      order: boards.length + 1,
    };
    setBoards([...boards, newBoard]);
    setShowCreateModal(false);
    setCreateForm({
      name: '',
      description: '',
      isRecruitAllowed: false,
    });
  };

  const handleMoveUp = (boardId: number) => {
    const currentIndex = boards.findIndex((b) => b.id === boardId);
    if (currentIndex > 0) {
      const newBoards = [...boards];
      [newBoards[currentIndex - 1], newBoards[currentIndex]] = [newBoards[currentIndex], newBoards[currentIndex - 1]];
      newBoards.forEach((b, i) => (b.order = i + 1));
      setBoards(newBoards);
    }
  };

  const handleMoveDown = (boardId: number) => {
    const currentIndex = boards.findIndex((b) => b.id === boardId);
    if (currentIndex < boards.length - 1) {
      const newBoards = [...boards];
      [newBoards[currentIndex], newBoards[currentIndex + 1]] = [newBoards[currentIndex + 1], newBoards[currentIndex]];
      newBoards.forEach((b, i) => (b.order = i + 1));
      setBoards(newBoards);
    }
  };

  const totalPosts = boards.reduce((sum, b) => sum + b.postCount, 0);

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">게시판 관리</h4>
          <p className="text-muted mb-0">총 {boards.length}개의 게시판</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>
          게시판 추가
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <h3 className="text-primary mb-1">{boards.length}</h3>
              <small className="text-muted">전체 게시판</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10">
            <div className="card-body text-center">
              <h3 className="text-success mb-1">{boards.filter((b) => b.status === '활성').length}</h3>
              <small className="text-muted">활성 게시판</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-info bg-opacity-10">
            <div className="card-body text-center">
              <h3 className="text-info mb-1">{totalPosts.toLocaleString()}</h3>
              <small className="text-muted">총 게시글</small>
            </div>
          </div>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="row g-4">
        {boards.map((board, index) => (
          <div key={board.id} className="col-md-6 col-lg-4">
            <div className={`card border-0 shadow-sm h-100 ${board.status === '비활성' ? 'opacity-50' : ''}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-secondary">{board.order}</span>
                      <h5 className="card-title mb-0">{board.name}</h5>
                    </div>
                    <p className="text-muted small mb-0">{board.description}</p>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={board.status === '활성'}
                      onChange={() => handleStatusToggle(board.id)}
                      title={board.status === '활성' ? '비활성화' : '활성화'}
                    />
                  </div>
                </div>
                <hr />
                <div className="row text-center">
                  <div className="col-6">
                    <div className="text-muted small">게시글 수</div>
                    <div className="fw-bold">{board.postCount.toLocaleString()}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small">모집공고</div>
                    <div className="fw-bold">
                      {board.isRecruitAllowed ? (
                        <span className="text-success">허용</span>
                      ) : (
                        <span className="text-muted">비허용</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-white border-top-0">
                <div className="d-flex gap-1">
                  <div className="btn-group btn-group-sm me-auto">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handleMoveUp(board.id)}
                      disabled={index === 0}
                      title="위로 이동"
                    >
                      <i className="bi bi-arrow-up"></i>
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handleMoveDown(board.id)}
                      disabled={index === boards.length - 1}
                      title="아래로 이동"
                    >
                      <i className="bi bi-arrow-down"></i>
                    </button>
                  </div>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEditClick(board)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    수정
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteClick(board)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">게시판 추가</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">게시판 이름 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="게시판 이름을 입력하세요"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">설명</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="게시판 설명을 입력하세요"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="createRecruitAllowed"
                    checked={createForm.isRecruitAllowed}
                    onChange={(e) => setCreateForm({ ...createForm, isRecruitAllowed: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="createRecruitAllowed">
                    모집공고 작성 허용
                  </label>
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
                  disabled={!createForm.name}
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBoard && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">게시판 수정</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">게시판 이름</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
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
                  <label className="form-label">상태</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Board['status'] })}
                  >
                    <option value="활성">활성</option>
                    <option value="비활성">비활성</option>
                  </select>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="editRecruitAllowed"
                    checked={editForm.isRecruitAllowed}
                    onChange={(e) => setEditForm({ ...editForm, isRecruitAllowed: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="editRecruitAllowed">
                    모집공고 작성 허용
                  </label>
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
      {showDeleteModal && selectedBoard && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">게시판 삭제</h5>
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
                    &quot;{selectedBoard.name}&quot; 게시판을 삭제합니다.<br />
                    {selectedBoard.postCount > 0 && (
                      <span className="text-danger">
                        이 게시판에는 {selectedBoard.postCount}개의 게시글이 있습니다.
                      </span>
                    )}
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
