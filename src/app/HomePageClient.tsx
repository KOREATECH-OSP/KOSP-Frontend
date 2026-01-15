'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, MessageSquare, ChevronRight } from 'lucide-react';
import { suitFont } from '@/style/font';
import SearchBar from '@/common/components/searchBar';
import Header from '@/common/components/Header';
import Footer from '@/common/components/Footer';
import StatusTag from '@/common/components/StatusTag';
import type { ArticleResponse, RecruitResponse } from '@/lib/api/types';
import type { Session } from 'next-auth';

interface HomePageClientProps {
  articles: ArticleResponse[];
  recruits: RecruitResponse[];
  session: Session | null;
}

function calculateDday(endDate: string | null): string {
  if (!endDate) return '상시모집';
  const end = new Date(endDate);
  const now = new Date();
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return '마감';
  if (diffDays === 0) return 'D-Day';
  return `D-${diffDays}`;
}

function getRecruitStatus(recruit: RecruitResponse): string {
  if (recruit.status === 'CLOSED') return '마감';
  const dday = calculateDday(recruit.endDate);
  if (dday === '마감') return '마감';
  const days = parseInt(dday.replace('D-', ''));
  if (!isNaN(days) && days <= 3) return '마감임박';
  return '모집중';
}

const STATUS_GRADIENTS: Record<string, string> = {
  마감임박: 'bg-gradient-to-l from-red-200/70 via-transparent',
  모집중: 'bg-gradient-to-l from-green-200/70 via-transparent',
};

export default function HomePageClient({ articles, recruits, session }: HomePageClientProps) {
  const router = useRouter();

  const handleAuthorClick = (e: React.MouseEvent, authorId: number) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/user/${authorId}`);
  };

  return (
    <div id="top" className={`min-h-screen bg-gray-50 ${suitFont.className}`}>
      <Header session={session} />
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-8 sm:gap-10">
          {/* 커뮤니티 섹션 */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
                <span>커뮤니티</span>
              </h2>
              <Link
                href="/community"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                전체보기 →
              </Link>
            </div>

            <div className="space-y-3">
              {articles.length === 0 ? (
                <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-8 text-center text-gray-500 sm:px-5">
                  게시글이 없습니다.
                </div>
              ) : (
                articles.map((post) => (
                  <Link
                    key={post.id}
                    href={`/community/${post.id}`}
                    className="relative block cursor-pointer rounded-2xl border border-gray-200/70 bg-white px-4 py-4 transition-all duration-200 hover:border-gray-900/40 sm:px-5"
                  >
                    <button
                      onClick={(e) => handleAuthorClick(e, post.author.id)}
                      className="mb-1 block text-[11px] text-gray-500 hover:text-gray-900 hover:underline sm:text-xs"
                    >
                      {post.author.name}
                    </button>
                    <h3 className="line-clamp-2 text-base font-semibold text-gray-900 sm:line-clamp-1">
                      {post.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500 sm:text-xs">
                      <span className="flex items-center gap-1">
                        <Eye
                          className="h-4 w-4 text-gray-400"
                          aria-hidden="true"
                        />
                        <span>{post.views}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare
                          className="h-4 w-4 text-gray-400"
                          aria-hidden="true"
                        />
                        <span>{post.comments}</span>
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <div className="h-px bg-gray-200" aria-hidden="true" />

          {/* 팀모집 섹션 */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
                <span>팀모집</span>
              </h2>
              <Link
                href="/team"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                전체보기 →
              </Link>
            </div>

            <div className="space-y-3">
              {recruits.length === 0 ? (
                <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-8 text-center text-gray-500 sm:px-5">
                  모집 중인 팀이 없습니다.
                </div>
              ) : (
                recruits.map((recruit) => {
                  const status = getRecruitStatus(recruit);
                  const statusClass = STATUS_GRADIENTS[status] ?? '';
                  const dday = calculateDday(recruit.endDate);

                  return (
                    <Link
                      key={recruit.id}
                      href={`/recruit/${recruit.id}`}
                      className="relative block cursor-pointer overflow-hidden rounded-2xl border border-gray-200/70 bg-white py-4 pl-4 pr-12 transition-all duration-200 hover:border-gray-900/40 sm:px-5"
                    >
                      {statusClass && (
                        <div
                          className={`pointer-events-none absolute inset-y-3 right-3 w-1/3 opacity-40 blur-xl ${statusClass}`}
                        />
                      )}

                      <div className="relative z-10 mb-2 flex flex-col gap-1 text-[11px] text-gray-500 sm:text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusTag recruit={{ status }} />
                          <span className="font-semibold text-gray-700">
                            {dday}
                          </span>
                          <span aria-hidden className="h-3 w-px bg-gray-300" />
                          <button
                            onClick={(e) => handleAuthorClick(e, recruit.author.id)}
                            className="font-medium text-gray-700 hover:text-gray-900 hover:underline"
                          >
                            {recruit.author.name}
                          </button>
                        </div>
                      </div>

                      <h3 className="relative z-10 mb-2 line-clamp-2 text-base font-semibold text-gray-900 sm:line-clamp-1">
                        {recruit.title}
                      </h3>

                      <div className="relative z-10 flex flex-wrap gap-2 text-xs text-blue-700">
                        {(recruit.tags || []).slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-blue-50 px-2 py-1"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <ChevronRight
                        className="absolute right-4 top-1/2 z-10 h-7 w-7 -translate-y-1/2 text-gray-900/70"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
