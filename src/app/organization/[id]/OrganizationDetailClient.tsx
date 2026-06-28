'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Building2, ExternalLink, Users, GitFork, UserCheck } from 'lucide-react';
import type { OrganizationDetailResponse } from '@/lib/api/organization';
import OrganizationStatusBadge from '@/common/components/organization/OrganizationStatusBadge';

interface OrganizationDetailClientProps {
  detail: OrganizationDetailResponse;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function OrganizationDetailClient({ detail }: OrganizationDetailClientProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {/* 뒤로가기 */}
      <div className="mb-6">
        <Link
          href="/organization"
          className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          내 조직
        </Link>
      </div>

      {/* 조직 헤더 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-5">
          {/* 아바타 */}
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-100">
            {detail.avatarUrl ? (
              <Image
                src={detail.avatarUrl}
                alt={detail.displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <Building2 className="h-8 w-8" />
              </div>
            )}
          </div>

          {/* 이름 + 상태 + 링크 */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{detail.displayName}</h1>
              <OrganizationStatusBadge status={detail.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">@{detail.githubOrgName}</p>
            <a
              href={`https://github.com/${detail.githubOrgName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              github.com/{detail.githubOrgName}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* 등록일 */}
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-gray-400">등록일</p>
            <p className="mt-0.5 text-sm font-medium text-gray-700">{formatDate(detail.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <div className="flex justify-center text-gray-400 mb-2">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{detail.totalMemberCount}</p>
          <p className="mt-1 text-xs text-gray-500">전체 멤버</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <div className="flex justify-center text-blue-500 mb-2">
            <UserCheck className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{detail.linkedMemberCount}</p>
          <p className="mt-1 text-xs text-gray-500">K-OSP 연동</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <div className="flex justify-center text-gray-400 mb-2">
            <GitFork className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{detail.repositoryCount}</p>
          <p className="mt-1 text-xs text-gray-500">저장소</p>
        </div>
      </div>

      {/* 연동 비율 */}
      {detail.totalMemberCount > 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">K-OSP 멤버 연동률</p>
            <p className="text-sm font-bold text-blue-600">
              {Math.round((detail.linkedMemberCount / detail.totalMemberCount) * 100)}%
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{
                width: `${(detail.linkedMemberCount / detail.totalMemberCount) * 100}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            전체 {detail.totalMemberCount}명 중 {detail.linkedMemberCount}명이 K-OSP에 가입되어 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
