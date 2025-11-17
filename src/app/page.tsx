import { suitFont } from "../style/font";
import Link from 'next/link';
import SearchBar from '../common/components/searchBar';
import Header from "../common/components/header";
import { ChevronRight, Eye, MessageSquare, CircleGauge, Users, Layers3, CheckCircle } from "lucide-react";

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
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto w-full">
            <SearchBar />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col gap-8 sm:gap-10">
          
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
            
            <div className="space-y-3">
              {communityPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="relative block rounded-2xl border border-gray-200/70 bg-white px-4 sm:px-5 py-4 transition-all duration-200 cursor-pointer hover:border-gray-900/40"
                >
                  <span className="block text-[11px] text-gray-500 mb-1 sm:text-xs">
                    {post.author}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 sm:line-clamp-1">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500 sm:text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      <span>{post.views}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      <span>{post.comments}</span>
                    </span>
                    <span>{post.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="h-px bg-gray-200" aria-hidden="true" />

          {/* 팀모집 섹션 */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <span>팀모집</span>
              </h2>
              <Link href="/team-recruit" className="text-blue-600 hover:text-blue-700 font-medium">
                전체보기 →
              </Link>
            </div>
            
            <div className="space-y-3">
              {teamRecruits.map((recruit) => {
                const statusClass =
                  recruit.status === '마감임박'
                    ? 'bg-gradient-to-l from-red-200/70 via-transparent'
                    : recruit.status === '모집중'
                      ? 'bg-gradient-to-l from-green-200/70 via-transparent'
                      : '';

                return (
                  <div
                    key={recruit.id}
                    className="relative rounded-2xl border border-gray-200/70 bg-white pl-4 pr-12 sm:px-5 py-4 transition-all duration-200 hover:border-gray-900/40 cursor-pointer overflow-hidden"
                  >
                    {statusClass && (
                      <div className={`pointer-events-none absolute inset-y-3 right-3 w-1/3 opacity-40 blur-xl ${statusClass}`} />
                    )}

                    <div className="relative z-10 flex flex-col gap-1 text-[11px] text-gray-500 mb-2 sm:text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border backdrop-blur-sm ${
                            recruit.status === '마감임박'
                              ? 'text-red-700 border-red-200/70'
                              : recruit.status === '모집중'
                                ? 'text-green-700 border-green-200/70'
                                : 'text-gray-500 border-gray-200/70'
                          }`}
                        >
                          {recruit.status}
                        </span>
                        <span className="font-semibold text-gray-700">{recruit.deadline}</span>
                        <span aria-hidden className="h-3 w-px bg-gray-300" />
                        <span className="font-medium text-gray-700">{recruit.members}</span>
                      </div>
                    </div>

                    <h3 className="relative text-base font-semibold text-gray-900 mb-2 line-clamp-2 sm:line-clamp-1 z-10">
                      {recruit.title}
                    </h3>

                    <div className="relative flex flex-wrap gap-2 text-xs text-blue-700 z-10">
                      {recruit.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full bg-blue-50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-4 w-7 h-7 text-gray-900/70 z-10" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </section>
          <div className="h-px bg-gray-200" aria-hidden="true" />

          {/* 통계 섹션 */}
          <section>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: '활성 프로젝트', value: '1,234', icon: CircleGauge },
                { label: '팀 멤버', value: '5,678', icon: Users },
                { label: '진행중인 팀', value: '890', icon: Layers3 },
                { label: '완료된 프로젝트', value: '234', icon: CheckCircle },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-200/70 bg-white px-6 py-5 flex items-center gap-5 transition hover:border-gray-900/30"
                >
                  <div className="text-gray-600">
                    <item.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-gray-500">{item.label}</span>
                    <span className="text-3xl font-semibold text-gray-900">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white mt-12 sm:mt-16">
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