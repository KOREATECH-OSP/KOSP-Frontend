'use client';

import Link from 'next/link';
import SearchBar from '@/common/components/searchBar';
import Header from '@/common/components/Header';
import Footer from '@/common/components/Footer';
import CommunityPostCard from '@/common/components/community/CommunityPostCard';
import RecruitPostCard from '@/common/components/team/RecruitPostCard';
import type { ArticleResponse, RecruitResponse } from '@/lib/api/types';
import type { AuthSession } from '@/lib/auth/types';

interface HomePageClientProps {
  articles: ArticleResponse[];
  recruits: RecruitResponse[];
  session: AuthSession | null;
}

export default function HomePageClient({ articles, recruits, session }: HomePageClientProps) {
  return (
    <div id="top" className="min-h-screen bg-gray-50">
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

            <div className="flex flex-col gap-3">
              {articles.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 sm:px-5">
                  게시글이 없습니다.
                </div>
              ) : (
                articles.map((post) => (
                  <CommunityPostCard key={post.id} post={post} />
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {recruits.length === 0 ? (
                <div className="col-span-full rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 sm:px-5">
                  모집 중인 팀이 없습니다.
                </div>
              ) : (
                recruits.map((recruit) => (
                  <RecruitPostCard key={recruit.id} recruit={recruit} />
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
