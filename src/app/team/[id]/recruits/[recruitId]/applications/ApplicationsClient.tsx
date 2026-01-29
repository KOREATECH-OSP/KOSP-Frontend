'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  ExternalLink,
  Clock,
  Loader2,
  Users,
  Mail,
  Check,
  X,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { getRecruitApplications, decideApplication } from '@/lib/api/recruit';
import type { TeamDetailResponse, RecruitResponse, RecruitApplyResponse, RecruitApplicationStatus } from '@/lib/api/types';

interface ApplicationsClientProps {
  team: TeamDetailResponse;
  recruit: RecruitResponse;
}

export default function ApplicationsClient({ team, recruit }: ApplicationsClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<RecruitApplyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const isLeader = team.members?.some((m) => m.role === 'LEADER' && m.id === currentUserId);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !isLeader) {
      toast.error('팀장만 접근할 수 있습니다.');
      router.replace(`/team/${team.id}`);
      return;
    }

    const fetchApplications = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await getRecruitApplications(recruit.id, { accessToken: session.accessToken });
        setApplications(response.applications);
      } catch (error) {
        console.error('지원 내역 조회 실패:', error);
        toast.error('지원 내역을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [session, status, isLeader, recruit.id, router, team.id]);

  const getApplicationStatusBadge = (appStatus: RecruitApplyResponse['status']) => {
    switch (appStatus) {
      case 'PENDING':
        return <span className="rounded-sm bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 border border-amber-100">대기중</span>;
      case 'ACCEPTED':
        return <span className="rounded-sm bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 border border-emerald-100">수락됨</span>;
      case 'REJECTED':
        return <span className="rounded-sm bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 border border-red-100">거절됨</span>;
      default:
        return null;
    }
  };

  const handleDecision = async (applicationId: number, newStatus: RecruitApplicationStatus) => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setProcessingId(applicationId);

    try {
      await decideApplication(applicationId, { status: newStatus }, { accessToken: session.accessToken });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast.success(newStatus === 'ACCEPTED' ? '지원을 수락했습니다.' : '지원을 거절했습니다.');
    } catch (error) {
      console.error('지원 처리 실패:', error);
      toast.error('지원 처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  if (status === 'loading' || (!session && status !== 'unauthenticated')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>돌아가기</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-sm border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link href={`/team/${team.id}`} className="hover:underline">
                  {team.name}
                </Link>
                <span>/</span>
                <span>지원 내역</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{recruit.title}</h1>
              <p className="mt-2 text-sm text-gray-500">
                이 모집공고에 지원한 지원자 목록입니다.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>총 <span className="font-bold text-gray-900">{applications.length}</span>명 지원</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-sm border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <ClipboardList className="h-4 w-4" />
              지원자 목록
            </h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="mt-3 text-sm text-gray-500">지원 내역을 불러오는 중...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ClipboardList className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm font-medium text-gray-900">지원자가 없습니다</p>
              <p className="mt-1 text-xs text-gray-500">아직 이 공고에 지원한 사람이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((application) => (
                <div key={application.userId} className="p-6 hover:bg-gray-50/50 transition-colors">
                  {/* 헤더: 지원자 정보 + 일시 + 버튼 */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Link href={`/user/${application.userId}`}>
                        {application.userProfileImage ? (
                          <Image
                            src={application.userProfileImage}
                            alt={application.userName}
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0 rounded-full object-cover border border-gray-200 hover:ring-2 hover:ring-gray-300 transition-all"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500 hover:ring-2 hover:ring-gray-300 transition-all">
                            {application.userName.charAt(0)}
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/user/${application.userId}`} className="font-semibold text-gray-900 hover:underline">
                            {application.userName}
                          </Link>
                          {getApplicationStatusBadge(application.status)}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          {application.userEmail}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(application.appliedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-400">
                          {new Date(application.appliedAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {application.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecision(application.id, 'ACCEPTED')}
                            disabled={processingId === application.id}
                            className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === application.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            수락
                          </button>
                          <button
                            onClick={() => handleDecision(application.id, 'REJECTED')}
                            disabled={processingId === application.id}
                            className="inline-flex items-center gap-1.5 rounded-sm bg-white border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === application.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            거절
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 지원 동기 */}
                  <div className="rounded-sm bg-gray-50 p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 mb-2">지원 동기</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {application.reason}
                    </p>
                  </div>

                  {/* 포트폴리오 */}
                  {application.portfolioUrl && (
                    <a
                      href={application.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      포트폴리오 보기
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
