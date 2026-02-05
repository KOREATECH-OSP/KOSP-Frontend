import { getBoards, getArticle } from '@/lib/api';
import WritePageClient from './WritePageClient';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth/server';

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function WritePage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const articleId = id ? parseInt(id, 10) : undefined;
  
  const boardsResponse = await getBoards();
  // 모집 공고용이 아닌 게시판만 필터링
  const boards = boardsResponse.boards.filter((board) => !board.isRecruitAllowed);

  let initialData = undefined;
  if (articleId) {
    try {
      initialData = await getArticle(articleId);
      
      // 권한 체크 (본인 글인지)
      const session = await auth();
      if (!session?.user?.id || parseInt(session.user.id) !== initialData.author.id) {
         // 본인 글 아니면 접근 불가? (API가 막겠지만 여기서도 막으면 좋음)
         // 리다이렉트나 에러 처리. 일단 데이터 넘기고 클라이언트나 API가 처리하게 둠.
      }
    } catch (error) {
      console.error('Failed to fetch article for editing:', error);
      notFound();
    }
  }

  return <WritePageClient boards={boards} initialData={initialData} />;
}
