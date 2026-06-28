'use client';

import Link from 'next/link';
import { Building2, Plus } from 'lucide-react';
import type { OrganizationResponse } from '@/lib/api/organization';
import OrganizationCard from '@/common/components/organization/OrganizationCard';

interface OrganizationPageClientProps {
  initialOrganizations: OrganizationResponse[];
}

export default function OrganizationPageClient({
  initialOrganizations,
}: OrganizationPageClientProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 조직</h1>
          <p className="mt-1 text-sm text-gray-500">등록한 GitHub Organization을 관리하세요.</p>
        </div>
        <Link
          href="/organization/register"
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          조직 등록하기
        </Link>
      </div>

      {/* 조직 목록 */}
      {initialOrganizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <Building2 className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-base font-medium text-gray-500">등록된 조직이 없습니다.</p>
          <p className="mt-1 text-sm text-gray-400">GitHub Organization을 K-OSP에 등록해보세요.</p>
          <Link
            href="/organization/register"
            className="mt-6 flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            조직 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialOrganizations.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>
      )}
    </div>
  );
}
