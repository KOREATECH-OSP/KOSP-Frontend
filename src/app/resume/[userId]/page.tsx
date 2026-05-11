import Link from 'next/link';
import { getPublicResume, getUserProfile } from '@/lib/api/user';
import { ApiException } from '@/lib/api/client';
import ResumeReadOnlyView from '@/app/user/resume/components/ResumeReadOnlyView';
import PrintButton from './PrintButton';
import type { ResumeData } from '@/lib/api/types';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function PublicResumePage({ params }: Props) {
  const { userId: userIdStr } = await params;
  const userId = parseInt(userIdStr, 10);

  if (isNaN(userId)) {
    return <ErrorView message="잘못된 접근입니다." />;
  }

  // 공개 이력서 + 프로필 병렬 조회
  let resumeData: ResumeData | null = null;
  let profileImageUrl: string | null = null;
  let errorMessage: string | null = null;

  try {
    const [resumeRes, profileRes] = await Promise.allSettled([
      getPublicResume(userId),
      getUserProfile(userId),
    ]);

    if (resumeRes.status === 'fulfilled') {
      resumeData = resumeRes.value.resumeData;
    } else {
      const err = resumeRes.reason;
      if (err instanceof ApiException) {
        if (err.status === 404) {
          errorMessage = '공개되지 않은 이력서입니다.';
        } else {
          errorMessage = '이력서를 불러오지 못했습니다.';
        }
      } else {
        errorMessage = '이력서를 불러오지 못했습니다.';
      }
    }

    if (profileRes.status === 'fulfilled') {
      profileImageUrl = profileRes.value.profileImage ?? null;
    }
  } catch {
    errorMessage = '이력서를 불러오지 못했습니다.';
  }

  if (errorMessage || !resumeData) {
    return <ErrorView message={errorMessage ?? '이력서를 찾을 수 없습니다.'} />;
  }

  const resumeTitle = resumeData.resumeTitle || '이력서';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 (인쇄 시 숨김) */}
      <div className="print:hidden sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="text-sm font-semibold text-gray-900 truncate">
            {resumeTitle}
          </h1>
          <PrintButton />
        </div>
      </div>

      {/* 이력서 본문 */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ResumeReadOnlyView
          data={resumeData}
          profileImageUrl={profileImageUrl}
          resumeTitle={resumeTitle}
          visibleSections={resumeData.visibleSections}
        />
      </main>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-200 mb-4">404</p>
        <p className="text-base text-gray-500">{message}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-orange-400 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 transition-colors"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
