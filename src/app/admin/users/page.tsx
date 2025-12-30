'use client';

import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  joinDate: string;
  status: '활성' | '정지' | '대기';
  role: '일반' | '관리자';
  lastLogin: string;
}

const initialUsers: User[] = [
  { id: 1, name: '홍길동', email: 'hong@koreatech.ac.kr', username: 'honggildong', joinDate: '2024-12-01', status: '활성', role: '일반', lastLogin: '2024-12-30 14:30' },
  { id: 2, name: '김철수', email: 'kim@koreatech.ac.kr', username: 'kimcs', joinDate: '2024-12-05', status: '활성', role: '일반', lastLogin: '2024-12-30 10:15' },
  { id: 3, name: '이영희', email: 'lee@koreatech.ac.kr', username: 'leeyh', joinDate: '2024-12-10', status: '정지', role: '일반', lastLogin: '2024-12-25 09:00' },
  { id: 4, name: '박민수', email: 'park@koreatech.ac.kr', username: 'parkms', joinDate: '2024-12-15', status: '활성', role: '관리자', lastLogin: '2024-12-30 16:45' },
  { id: 5, name: '정수진', email: 'jung@koreatech.ac.kr', username: 'jungsj', joinDate: '2024-12-20', status: '대기', role: '일반', lastLogin: '-' },
  { id: 6, name: '최동현', email: 'choi@koreatech.ac.kr', username: 'choidh', joinDate: '2024-12-22', status: '활성', role: '일반', lastLogin: '2024-12-29 11:20' },
  { id: 7, name: '강미경', email: 'kang@koreatech.ac.kr', username: 'kangmk', joinDate: '2024-12-25', status: '활성', role: '일반', lastLogin: '2024-12-30 08:30' },
  { id: 8, name: '윤성호', email: 'yoon@koreatech.ac.kr', username: 'yoonsh', joinDate: '2024-12-28', status: '대기', role: '일반', lastLogin: '-' },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    status: '활성' as User['status'],
    role: '일반' as User['role'],
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      username: '',
      status: '활성',
      role: '일반',
    });
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      status: user.status,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setShowDetailModal(true);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email || !formData.username) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        )
      );
      alert('사용자 정보가 수정되었습니다.');
    } else {
      const newUser: User = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: '-',
      };
      setUsers((prev) => [newUser, ...prev]);
      alert('새 사용자가 추가되었습니다.');
    }
    setShowModal(false);
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUsers((prev) => prev.filter((uid) => uid !== id));
      alert('사용자가 삭제되었습니다.');
    }
  };

  const handleBulkAction = (action: 'activate' | 'suspend') => {
    if (selectedUsers.length === 0) return;

    const newStatus = action === 'activate' ? '활성' : '정지';
    setUsers((prev) =>
      prev.map((u) =>
        selectedUsers.includes(u.id) ? { ...u, status: newStatus } : u
      )
    );
    setSelectedUsers([]);
    alert(`${selectedUsers.length}명의 사용자가 ${newStatus} 상태로 변경되었습니다.`);
  };

  const getStatusBadgeClass = (status: User['status']) => {
    switch (status) {
      case '활성':
        return 'bg-success';
      case '정지':
        return 'bg-danger';
      case '대기':
        return 'bg-warning text-dark';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">사용자 관리</h4>
          <p className="text-muted mb-0">총 {users.length}명의 사용자</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddUser}>
          <i className="bi bi-person-plus me-2"></i>
          사용자 추가
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="이름, 이메일, 사용자명으로 검색..."
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
                <option value="정지">정지</option>
                <option value="대기">대기</option>
              </select>
            </div>
            <div className="col-md-4">
              {selectedUsers.length > 0 && (
                <div className="btn-group w-100">
                  <button
                    className="btn btn-outline-success"
                    onClick={() => handleBulkAction('activate')}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    활성화 ({selectedUsers.length})
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleBulkAction('suspend')}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    정지 ({selectedUsers.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      onChange={handleSelectAll}
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                    />
                  </th>
                  <th>사용자</th>
                  <th>사용자명</th>
                  <th>가입일</th>
                  <th>마지막 로그인</th>
                  <th>상태</th>
                  <th>역할</th>
                  <th style={{ width: '120px' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <span className="text-primary fw-bold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="fw-semibold">{user.name}</div>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>@{user.username}</td>
                    <td>{user.joinDate}</td>
                    <td className="text-muted">{user.lastLogin}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === '관리자' ? 'bg-primary' : 'bg-secondary'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          title="상세보기"
                          onClick={() => handleViewUser(user)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          title="수정"
                          onClick={() => handleEditUser(user)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="삭제"
                          onClick={() => handleDeleteUser(user.id)}
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
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">
              {filteredUsers.length}명 표시 중
            </span>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? '사용자 수정' : '사용자 추가'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">이름 *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">이메일 *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">사용자명 *</label>
                  <div className="input-group">
                    <span className="input-group-text">@</span>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="사용자명을 입력하세요"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">상태</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                    >
                      <option value="활성">활성</option>
                      <option value="정지">정지</option>
                      <option value="대기">대기</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">역할</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    >
                      <option value="일반">일반</option>
                      <option value="관리자">관리자</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  취소
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveUser}>
                  {editingUser ? '저장' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && viewingUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">사용자 상세 정보</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <span className="text-primary fw-bold fs-2">
                      {viewingUser.name.charAt(0)}
                    </span>
                  </div>
                  <h5 className="mb-1">{viewingUser.name}</h5>
                  <p className="text-muted mb-0">@{viewingUser.username}</p>
                </div>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: '120px' }}>이메일</td>
                      <td>{viewingUser.email}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">가입일</td>
                      <td>{viewingUser.joinDate}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">마지막 로그인</td>
                      <td>{viewingUser.lastLogin}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">상태</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(viewingUser.status)}`}>
                          {viewingUser.status}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">역할</td>
                      <td>
                        <span className={`badge ${viewingUser.role === '관리자' ? 'bg-primary' : 'bg-secondary'}`}>
                          {viewingUser.role}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  닫기
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditUser(viewingUser);
                  }}
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
