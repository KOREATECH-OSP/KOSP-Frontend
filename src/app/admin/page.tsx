'use client';

export default function AdminDashboard() {
  // Mock data - 실제로는 API에서 가져와야 함
  const stats = {
    totalUsers: 1234,
    newUsersToday: 45,
    totalPosts: 5678,
    totalTeams: 89,
    totalRecruits: 156,
    pendingReports: 12,
  };

  const recentUsers = [
    { id: 1, name: '홍길동', email: 'hong@example.com', joinDate: '2024-12-30', status: '활성' },
    { id: 2, name: '김철수', email: 'kim@example.com', joinDate: '2024-12-29', status: '활성' },
    { id: 3, name: '이영희', email: 'lee@example.com', joinDate: '2024-12-29', status: '대기' },
    { id: 4, name: '박민수', email: 'park@example.com', joinDate: '2024-12-28', status: '활성' },
    { id: 5, name: '정수진', email: 'jung@example.com', joinDate: '2024-12-28', status: '활성' },
  ];

  const recentPosts = [
    { id: 1, title: 'React 프로젝트 팀원 모집', author: '홍길동', date: '2024-12-30', views: 234 },
    { id: 2, title: 'Spring Boot 스터디', author: '김철수', date: '2024-12-30', views: 156 },
    { id: 3, title: '오픈소스 기여 후기', author: '이영희', date: '2024-12-29', views: 89 },
    { id: 4, title: 'Git 사용법 정리', author: '박민수', date: '2024-12-29', views: 312 },
    { id: 5, title: '코딩테스트 준비 팁', author: '정수진', date: '2024-12-28', views: 445 },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-people text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">총 사용자</h6>
                  <h3 className="mb-0">{stats.totalUsers.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-person-plus text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">오늘 가입</h6>
                  <h3 className="mb-0">{stats.newUsersToday}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-file-text text-info fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">총 게시글</h6>
                  <h3 className="mb-0">{stats.totalPosts.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-people-fill text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">총 팀</h6>
                  <h3 className="mb-0">{stats.totalTeams}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-secondary bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-megaphone text-secondary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">모집공고</h6>
                  <h3 className="mb-0">{stats.totalRecruits}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-danger bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-flag text-danger fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">미처리 신고</h6>
                  <h3 className="mb-0">{stats.pendingReports}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data Tables */}
      <div className="row g-4">
        {/* Recent Users */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                최근 가입 사용자
              </h5>
              <a href="/admin/users" className="btn btn-sm btn-outline-primary">
                전체보기
              </a>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>가입일</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td className="text-muted">{user.email}</td>
                        <td>{user.joinDate}</td>
                        <td>
                          <span
                            className={`badge ${
                              user.status === '활성'
                                ? 'bg-success'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">
                <i className="bi bi-file-text me-2"></i>
                최근 게시글
              </h5>
              <a href="/admin/community" className="btn btn-sm btn-outline-primary">
                전체보기
              </a>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>제목</th>
                      <th>작성자</th>
                      <th>작성일</th>
                      <th>조회수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="text-truncate" style={{ maxWidth: '200px' }}>
                          {post.title}
                        </td>
                        <td>{post.author}</td>
                        <td>{post.date}</td>
                        <td>
                          <i className="bi bi-eye text-muted me-1"></i>
                          {post.views}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                빠른 작업
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3 col-sm-6">
                  <a href="/admin/users" className="btn btn-outline-primary w-100 py-3">
                    <i className="bi bi-person-plus d-block fs-4 mb-2"></i>
                    사용자 추가
                  </a>
                </div>
                <div className="col-md-3 col-sm-6">
                  <a href="/admin/boards" className="btn btn-outline-success w-100 py-3">
                    <i className="bi bi-plus-square d-block fs-4 mb-2"></i>
                    게시판 추가
                  </a>
                </div>
                <div className="col-md-3 col-sm-6">
                  <a href="/admin/challenges" className="btn btn-outline-warning w-100 py-3">
                    <i className="bi bi-trophy d-block fs-4 mb-2"></i>
                    챌린지 관리
                  </a>
                </div>
                <div className="col-md-3 col-sm-6">
                  <a href="/admin/reports" className="btn btn-outline-danger w-100 py-3">
                    <i className="bi bi-flag d-block fs-4 mb-2"></i>
                    신고 처리
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
