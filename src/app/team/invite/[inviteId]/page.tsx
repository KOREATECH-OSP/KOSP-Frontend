'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Users, CheckCircle, XCircle, LogIn, Loader2, AlertTriangle, CalendarClock, Mail, User } from 'lucide-react';
import { useSession } from '@/lib/auth/AuthContext';
import { acceptTeamInvite, getTeamInvite, rejectTeamInvite } from '@/lib/api/team';
import { ApiException } from '@/lib/api/client';
import type { TeamInviteResponse } from '@/lib/api/types';
import { toast } from '@/lib/toast';

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function InviteSummary({ invite }: { invite: TeamInviteResponse }) {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Users className="h-4 w-4 text-blue-600" />
        <span>{invite.team.name}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span>초대한 사람: {invite.inviter.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>초대 대상: {invite.invitee.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-gray-400" />
          <span>만료 시각: {formatDateTime(invite.expiresAt)}</span>
        </div>
        <p className="pt-1 text-xs text-gray-500">
          현재 팀원 {invite.team.memberCount}명
        </p>
      </div>
    </div>
  );
}

export default function TeamInvitePage() {
  const params = useParams();
  const inviteId = params.inviteId as string;
  const { data: session, status } = useSession();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [result, setResult] = useState<'accepted' | 'rejected' | 'invalid' | null>(null);
  const [invite, setInvite] = useState<TeamInviteResponse | null>(null);
  const [inviteStatus, setInviteStatus] = useState<'loading' | 'ready' | 'invalid' | 'error'>('loading');

  // 초대 ID가 없으면 404
  if (!inviteId) {
    notFound();
  }

  const currentUrl = typeof window !== 'undefined'
    ? window.location.pathname
    : `/team/invite/${inviteId}`;

  useEffect(() => {
    let cancelled = false;

    const fetchInvite = async () => {
      setInviteStatus('loading');

      try {
        const inviteData = await getTeamInvite(inviteId);

        if (cancelled) return;

        if (new Date(inviteData.expiresAt).getTime() < Date.now()) {
          setInviteStatus('invalid');
          return;
        }

        setInvite(inviteData);
        setInviteStatus('ready');
      } catch (error) {
        if (cancelled) return;

        console.error('초대 조회 실패:', error);

        if (error instanceof ApiException && error.status === 404) {
          setInviteStatus('invalid');
          return;
        }

        setInviteStatus('error');
      }
    };

    void fetchInvite();

    return () => {
      cancelled = true;
    };
  }, [inviteId]);

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
      if (error instanceof ApiException && error.status === 404) {
        setResult('invalid');
        return;
      }
      toast.error(error instanceof Error ? error.message : '초대 수락에 실패했습니다.');
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
      if (error instanceof ApiException && error.status === 404) {
        setResult('invalid');
        return;
      }
      toast.error(error instanceof Error ? error.message : '초대 거절에 실패했습니다.');
    } finally {
      setIsRejecting(false);
    }
  };

  // 로딩 중
  if (status === 'loading' || inviteStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (inviteStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            초대 정보를 불러오지 못했습니다
          </h1>
          <p className="mt-2 text-gray-600">
            잠시 후 다시 시도해주세요.
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

  if (!invite) {
    return null;
  }

  // 유효하지 않은 초대
  if (result === 'invalid' || inviteStatus === 'invalid') {
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
            {invite.team.name} 팀에서 팀원들과 함께 활동해보세요.
          </p>
          <InviteSummary invite={invite} />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/team/${invite.team.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Users className="h-4 w-4" />
              팀 상세로 이동
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
            {invite.team.name} 팀 초대를 거절했습니다.
          </p>
          <InviteSummary invite={invite} />
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
            <InviteSummary invite={invite} />
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
            {invite.team.name} 팀 초대를 수락하시겠습니까?
          </p>
          <InviteSummary invite={invite} />

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
