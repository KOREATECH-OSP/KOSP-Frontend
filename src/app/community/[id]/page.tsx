import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticle, getComments } from '@/lib/api';
import { ApiException } from '@/lib/api/client';
import ArticleDetailClient from './ArticleDetailClient';
import { auth } from '@/auth';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchArticleData(articleId: number, accessToken?: string) {
  try {
    const [article, commentsResponse] = await Promise.all([
      getArticle(articleId, accessToken),
      getComments(articleId),
    ]);
    return { article, comments: commentsResponse.comments, error: null };
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.status === 404) {
        return { article: null, comments: [], error: 'notfound' };
      }
      if (error.status === 401) {
        return { article: null, comments: [], error: 'unauthorized' };
      }
    }
    throw error;
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const articleId = parseInt(id, 10);

  if (isNaN(articleId)) {
    notFound();
  }

  const session = await auth();
  const currentUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const accessToken = session?.accessToken;

  const data = await fetchArticleData(articleId, accessToken);

  if (data.error === 'notfound') {
    notFound();
  }

  if (data.error === 'unauthorized') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">로그인이 필요합니다</h1>
          <p className="mb-6 text-gray-500">게시글을 보려면 로그인해주세요.</p>
          <Link
            href="/login"
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ArticleDetailClient
      article={data.article!}
      initialComments={data.comments}
      currentUserId={currentUserId}
    />
  );
}
