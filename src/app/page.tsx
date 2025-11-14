import { suitFont } from "../style/font";
import Link from 'next/link';
import SearchBar from '../common/components/searchBar';
import Header from "../common/components/header";

export default function Home() {
  const communityPosts = [
    { id: 1, title: '새로운 프로젝트 아이디어 공유합니다', author: '개발자A', views: 234, comments: 12, time: '2시간 전' },
    { id: 2, title: 'React 19 업데이트 후기', author: '프론트엔드러버', views: 456, comments: 28, time: '5시간 전' },
    { id: 3, title: '효율적인 코드 리뷰 방법', author: '시니어개발자', views: 789, comments: 45, time: '1일 전' },
    { id: 4, title: 'TypeScript 마이그레이션 경험담', author: 'TS매니아', views: 567, comments: 34, time: '1일 전' },
  ];

  const teamRecruits = [
    { id: 1, title: '사이드 프로젝트 팀원 모집 (React, Node.js)', tags: ['React', 'Node.js', 'MongoDB'], members: '3/5명', deadline: 'D-7', status: '모집중' },
    { id: 2, title: '스타트업 공동창업자 찾습니다', tags: ['창업', 'AI', 'Full-Stack'], members: '2/4명', deadline: 'D-14', status: '모집중' },
    { id: 3, title: '해커톤 참가 팀원 구합니다', tags: ['Python', 'ML', 'Data'], members: '4/5명', deadline: 'D-3', status: '마감임박' },
    { id: 4, title: '오픈소스 프로젝트 기여자 모집', tags: ['Go', 'Docker', 'K8s'], members: '5/10명', deadline: '상시모집', status: '모집중' },
  ];

  return (
    <div className={`min-h-screen bg-gray-50  ${suitFont.className}`}>
      <Header />
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            교내 오픈소스 활동을
          </h1>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            한눈에 찾고 함께 만들어요
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            프로젝트 검색부터 팀 빌딩, 협업까지 한 곳에서
          </p>
          
        
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 커뮤니티 섹션 */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                {/* <MessageSquare className="w-6 h-6 text-blue-600" /> */}
                <span>커뮤니티</span>
              </h2>
              <Link href="/community" className="text-blue-600 hover:text-blue-700 font-medium">
                전체보기 →
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {communityPosts.map((post, index) => (
                <div 
                  key={post.id}
                  className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                    index !== communityPosts.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>{post.author}</span>
                      <span className="flex items-center space-x-1">
                        👁️ <span>{post.views}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        💬 <span>{post.comments}</span>
                      </span>
                    </div>
                    <span className="text-gray-500">{post.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 팀모집 섹션 */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                {/* <Users className="w-6 h-6 text-green-600" /> */}
                <span>팀모집</span>
              </h2>
              <Link href="/team-recruit" className="text-blue-600 hover:text-blue-700 font-medium">
                전체보기 →
              </Link>
            </div>
            
            <div className="space-y-4">
              {teamRecruits.map((recruit) => (
                <div 
                  key={recruit.id}
                  className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 flex-1">
                      {recruit.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      recruit.status === '마감임박' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {recruit.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recruit.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      {/* <Users className="w-4 h-4" /> */}
                      <span>{recruit.members}</span>
                    </span>
                    <span className="font-medium text-gray-700">{recruit.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 통계 섹션 */}
        <section className="mt-16 bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,234</div>
              <div className="text-gray-600">활성 프로젝트</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">5,678</div>
              <div className="text-gray-600">팀 멤버</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">890</div>
              <div className="text-gray-600">진행중인 팀</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">234</div>
              <div className="text-gray-600">완료된 프로젝트</div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">DevTeam</h3>
              <p className="text-gray-400">개발자들의 협업 플랫폼</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/community" className="hover:text-white transition">커뮤니티</Link></li>
                <li><Link href="/team-recruit" className="hover:text-white transition">팀모집</Link></li>
                <li><Link href="/challenge" className="hover:text-white transition">챌린지</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">문의하기</Link></li>
                <li><Link href="/guide" className="hover:text-white transition">이용가이드</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">회사소개</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DevTeam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}