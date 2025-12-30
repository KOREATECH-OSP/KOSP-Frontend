'use client';

import { useState } from 'react';

interface Post {
  id: number;
  title: string;
  author: string;
  board: string;
  createdAt: string;
  views: number;
  comments: number;
  status: '공개' | '숨김' | '삭제됨';
}

const initialPosts: Post[] = [
  { id: 1, title: 'React 프로젝트 팀원 모집합니다', author: '홍길동', board: '자유게시판', createdAt: '2024-12-30 14:30', views: 234, comments: 12, status: '공개' },
  { id: 2, title: 'Spring Boot 스터디 모집', author: '김철수', board: '질문게시판', createdAt: '2024-12-30 10:15', views: 156, comments: 8, status: '공개' },
  { id: 3, title: '부적절한 게시글입니다', author: '이영희', board: '자유게시판', createdAt: '2024-12-29 09:00', views: 89, comments: 2, status: '숨김' },
  { id: 4, title: 'Git 사용법 정리했습니다', author: '박민수', board: '정보게시판', createdAt: '2024-12-29 16:45', views: 312, comments: 15, status: '공개' },
  { id: 5, title: '코딩테스트 준비 팁 공유', author: '정수진', board: '정보게시판', createdAt: '2024-12-28 11:20', views: 445, comments: 23, status: '공개' },
  { id: 6, title: '삭제된 게시글', author: '최동현', board: '자유게시판', createdAt: '2024-12-27 08:30', views: 50, comments: 1, status: '삭제됨' },
  { id: 7, title: 'JavaScript 기초 강의 추천', author: '강미경', board: '정보게시판', createdAt: '2024-12-26 15:00', views: 178, comments: 9, status: '공개' },
  { id: 8, title: '취업 준비 후기', author: '윤성호', board: '자유게시판', createdAt: '2024-12-25 10:30', views: 567, comments: 34, status: '공개' },
];

const boards = ['자유게시판', '질문게시판', '정보게시판'];

export default function CommunityManagement() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [boardFilter, setBoardFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBoard = boardFilter === 'all' || post.board === boardFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesBoard && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPosts(filteredPosts.map((p) => p.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (id: number) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleViewPost = (post: Post) => {
    setViewingPost(post);
    setShowDetailModal(true);
  };

  const handleToggleStatus = (id: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === '공개' ? '숨김' : '공개';
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const handleDeletePost = (id: number) => {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: '삭제됨' } : p))
      );
      alert('게시글이 삭제되었습니다.');
    }
  };

  const handleBulkAction = (action: 'show' | 'hide' | 'delete') => {
    if (selectedPosts.length === 0) return;

    if (action === 'delete') {
      if (!confirm(`${selectedPosts.length}개의 게시글을 삭제하시겠습니까?`)) return;
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (selectedPosts.includes(p.id)) {
          if (action === 'show') return { ...p, status: '공개' };
          if (action === 'hide') return { ...p, status: '숨김' };
          if (action === 'delete') return { ...p, status: '삭제됨' };
        }
        return p;
      })
    );
    setSelectedPosts([]);
    alert(`${selectedPosts.length}개의 게시글이 처리되었습니다.`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setBoardFilter('all');
    setStatusFilter('all');
  };

  const getStatusBadgeClass = (status: Post['status']) => {
    switch (status) {
      case '공개':
        return 'bg-success';
      case '숨김':
        return 'bg-warning text-dark';
      case '삭제됨':
        return 'bg-danger';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">커뮤니티 관리</h4>
          <p className="text-muted mb-0">총 {posts.length}개의 게시글</p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10">
            <div className="card-body text-center py-3">
              <h4 className="text-success mb-0">{posts.filter((p) => p.status === '공개').length}</h4>
              <small className="text-muted">공개</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
            <div className="card-body text-center py-3">
              <h4 className="text-warning mb-0">{posts.filter((p) => p.status === '숨김').length}</h4>
              <small className="text-muted">숨김</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-danger bg-opacity-10">
            <div className="card-body text-center py-3">
              <h4 className="text-danger mb-0">{posts.filter((p) => p.status === '삭제됨').length}</h4>
              <small className="text-muted">삭제됨</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="제목, 작성자로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
              >
                <option value="all">전체 게시판</option>
                {boards.map((board) => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">전체 상태</option>
                <option value="공개">공개</option>
                <option value="숨김">숨김</option>
                <option value="삭제됨">삭제됨</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={handleResetFilters}>
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                초기화
              </button>
            </div>
            <div className="col-md-2">
              {selectedPosts.length > 0 && (
                <div className="dropdown">
                  <button
                    className="btn btn-primary w-100 dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    onClick={(e) => {
                      e.preventDefault();
                      const menu = e.currentTarget.nextElementSibling;
                      menu?.classList.toggle('show');
                    }}
                  >
                    일괄 처리 ({selectedPosts.length})
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item" onClick={() => handleBulkAction('show')}>
                        <i className="bi bi-eye me-2"></i>공개
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => handleBulkAction('hide')}>
                        <i className="bi bi-eye-slash me-2"></i>숨김
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={() => handleBulkAction('delete')}>
                        <i className="bi bi-trash me-2"></i>삭제
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Table */}
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
                      checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    />
                  </th>
                  <th>제목</th>
                  <th>게시판</th>
                  <th>작성자</th>
                  <th>작성일</th>
                  <th>조회</th>
                  <th>댓글</th>
                  <th>상태</th>
                  <th style={{ width: '150px' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className={post.status === '삭제됨' ? 'table-secondary' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => handleSelectPost(post.id)}
                      />
                    </td>
                    <td>
                      <div
                        className="fw-semibold text-truncate"
                        style={{ maxWidth: '300px', cursor: 'pointer' }}
                        onClick={() => handleViewPost(post)}
                      >
                        {post.title}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary">
                        {post.board}
                      </span>
                    </td>
                    <td>{post.author}</td>
                    <td className="text-muted">{post.createdAt}</td>
                    <td>
                      <i className="bi bi-eye text-muted me-1"></i>
                      {post.views}
                    </td>
                    <td>
                      <i className="bi bi-chat text-muted me-1"></i>
                      {post.comments}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          title="보기"
                          onClick={() => handleViewPost(post)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {post.status !== '삭제됨' && (
                          <>
                            <button
                              className={`btn ${post.status === '공개' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              title={post.status === '공개' ? '숨기기' : '공개'}
                              onClick={() => handleToggleStatus(post.id)}
                            >
                              <i className={`bi ${post.status === '공개' ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="삭제"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white">
          <span className="text-muted">{filteredPosts.length}개 표시 중</span>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && viewingPost && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">게시글 상세</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <span className="badge bg-secondary me-2">{viewingPost.board}</span>
                  <span className={`badge ${getStatusBadgeClass(viewingPost.status)}`}>
                    {viewingPost.status}
                  </span>
                </div>
                <h4 className="mb-3">{viewingPost.title}</h4>
                <div className="d-flex text-muted mb-4" style={{ fontSize: '14px' }}>
                  <span className="me-3">
                    <i className="bi bi-person me-1"></i>
                    {viewingPost.author}
                  </span>
                  <span className="me-3">
                    <i className="bi bi-clock me-1"></i>
                    {viewingPost.createdAt}
                  </span>
                  <span className="me-3">
                    <i className="bi bi-eye me-1"></i>
                    {viewingPost.views}
                  </span>
                  <span>
                    <i className="bi bi-chat me-1"></i>
                    {viewingPost.comments}
                  </span>
                </div>
                <hr />
                <div className="py-4 text-muted">
                  <p>게시글 내용이 여기에 표시됩니다.</p>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  닫기
                </button>
                {viewingPost.status !== '삭제됨' && (
                  <>
                    <button
                      type="button"
                      className={`btn ${viewingPost.status === '공개' ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => {
                        handleToggleStatus(viewingPost.id);
                        setViewingPost({ ...viewingPost, status: viewingPost.status === '공개' ? '숨김' : '공개' });
                      }}
                    >
                      {viewingPost.status === '공개' ? '숨기기' : '공개하기'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        handleDeletePost(viewingPost.id);
                        setShowDetailModal(false);
                      }}
                    >
                      삭제
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
