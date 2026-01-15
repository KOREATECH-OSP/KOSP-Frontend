import { notFound, redirect } from 'next/navigation';
import { getUserProfile, getUserPosts, getUserComments } from '@/lib/api/user';
import { ApiException } from '@/lib/api/client';
import UserProfileClient from './UserProfileClient';
import { auth } from '@/auth';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    notFound();
  }

  // 현재 로그인한 사용자 확인
  const session = await auth();
  const currentUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  // 자기 자신의 프로필 페이지로 접근한 경우 /user로 리다이렉트
  if (currentUserId === userId) {
    redirect('/user');
  }

  // 사용자 프로필 조회
  let profile;
  try {
    profile = await getUserProfile(userId);
  } catch (error) {
    if (error instanceof ApiException && error.status === 404) {
      notFound();
    }
    throw error;
  }

  // 통계 조회 (에러 시 기본값 사용)
  const [postsRes, commentsRes] = await Promise.all([
    getUserPosts(userId).catch(() => ({ posts: [], pagination: { totalItems: 0 } })),
    getUserComments(userId).catch(() => ({ comments: [], meta: { totalItems: 0 } })),
  ]);

  const counts = {
    posts: postsRes.pagination.totalItems,
    comments: commentsRes.meta.totalItems,
  };

  return (
    <UserProfileClient
      userId={userId}
      profile={profile}
      counts={counts}
    />
  );
}
