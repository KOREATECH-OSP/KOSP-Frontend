import { suitFont } from "../style/font";
import Link from 'next/link';
import SearchBar from '../common/components/searchBar';
import AppHeader from "../common/components/Header/AppHeader";
import { Eye, MessageSquare } from "lucide-react";
import Footer from "../common/components/Footer";
import { TeamRecruitSection } from "../common/components/TeamRecruitSection";

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
    <div id="top" className={`min-h-screen bg-gray-50  ${suitFont.className}`}>
      <AppHeader />
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto w-full">
            <SearchBar />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col gap-8 sm:gap-10">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
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
          <TeamRecruitSection teamRecruits={teamRecruits} />
        </div>
      </main>
      <Footer/>
    </div>
  );
}