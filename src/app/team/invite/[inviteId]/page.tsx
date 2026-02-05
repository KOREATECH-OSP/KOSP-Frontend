'use client';

import { useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { Users, CheckCircle, XCircle, LogIn, Loader2, AlertTriangle } from 'lucide-react';
import { useSession } from '@/lib/auth/AuthContext';
import { acceptTeamInvite, rejectTeamInvite } from '@/lib/api/team';
import { toast } from '@/lib/toast';

export default function TeamInvitePage() {
  const params = useParams();
  const router = useRouter();
  const inviteId = params.inviteId as string;
  const { data: session, status } = useSession();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [result, setResult] = useState<'accepted' | 'rejected' | 'invalid' | null>(null);

  // 초대 ID가 없으면 404
  if (!inviteId) {
    notFound();
  }

  const currentUrl = typeof window !== 'undefined'
    ? window.location.pathname
    : `/team/invite/${inviteId}`;

  const handleAccept = async () => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsAccepting(true);
    try {
      await acceptTeamInvite(inviteId, session.accessToken);
      setResult('accepted');
      toast.success('팀 초대를 수락했습니다.');
    } catch (error) {
      console.error('초대 수락 실패:', error);
      // 에러 발생 시 유효하지 않은 초대로 처리
      setResult('invalid');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsRejecting(true);
    try {
      await rejectTeamInvite(inviteId, session.accessToken);
      setResult('rejected');
      toast.success('팀 초대를 거절했습니다.');
    } catch (error) {
      console.error('초대 거절 실패:', error);
      // 에러 발생 시 유효하지 않은 초대로 처리
      setResult('invalid');
    } finally {
      setIsRejecting(false);
    }
  };

  // 로딩 중
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 유효하지 않은 초대
  if (result === 'invalid') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            유효하지 않은 초대
          </h1>
          <p className="mt-2 text-gray-600">
            이 초대장은 만료되었거나 존재하지 않는 초대입니다.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              홈으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 수락 완료
  if (result === 'accepted') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            팀에 합류했습니다!
          </h1>
          <p className="mt-2 text-gray-600">
            팀 페이지에서 팀원들과 함께 활동해보세요.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/team"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Users className="h-4 w-4" />
              팀 페이지로 이동
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              홈으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 거절 완료
  if (result === 'rejected') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <XCircle className="h-10 w-10 text-gray-500" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            초대를 거절했습니다
          </h1>
          <p className="mt-2 text-gray-600">
            다른 팀의 초대를 기다려보세요.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              홈으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 비로그인 상태
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="mt-6 text-center text-xl font-bold text-gray-900">
              팀에 초대받으셨습니다
            </h1>
            <p className="mt-3 text-center text-sm text-gray-600">
              로그인 후 팀 초대 수락 여부를 결정할 수 있습니다.
            </p>
            <div className="mt-8">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(currentUrl)}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <LogIn className="h-4 w-4" />
                로그인하기
              </Link>
              <p className="mt-4 text-center text-xs text-gray-500">
                아직 계정이 없으신가요?{' '}
                <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 상태 - 수락/거절 선택
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mt-6 text-center text-xl font-bold text-gray-900">
            팀에 초대받으셨습니다
          </h1>
          <p className="mt-3 text-center text-sm text-gray-600">
            초대를 수락하시겠습니까?
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleAccept}
              disabled={isAccepting || isRejecting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  초대 수락하기
                </>
              )}
            </button>
            <button
              onClick={handleReject}
              disabled={isAccepting || isRejecting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  거절하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
