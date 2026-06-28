'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Building2, Loader2, RefreshCcw } from 'lucide-react';
import { useSession } from '@/lib/auth/AuthContext';
import { getAdminOrganizations, type OrganizationResponse } from '@/lib/api/organization';
import { toast } from '@/lib/toast';
import OrganizationStatusBadge from '@/common/components/organization/OrganizationStatusBadge';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [orgs, setOrgs] = useState<OrganizationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgs = async () => {
    if (!session?.accessToken) return;
    setIsLoading(true);
    try {
      const data = await getAdminOrganizations(session.accessToken);
      setOrgs(data);
    } catch {
      toast.error('조직 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [session?.accessToken]);

  return (
    <div className="px-6 py-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">조직 관리</h1>
          <p className="mt-1 text-sm text-gray-500">등록된 GitHub Organization 전체 목록입니다.</p>
        </div>
        <button
          type="button"
          onClick={fetchOrgs}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <RefreshCcw className="h-4 w-4" />
          새로고침
        </button>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : orgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Building2 className="mb-3 h-10 w-10" />
            <p className="text-sm">등록된 조직이 없습니다.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">조직</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">GitHub</th>
                <th className="px-4 py-3">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orgs.map((org) => (
                <tr
                  key={org.id}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => router.push(`/admin/organizations/${org.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {org.avatarUrl ? (
                          <Image src={org.avatarUrl} alt={org.displayName} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Building2 className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{org.displayName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <OrganizationStatusBadge status={org.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">@{org.githubOrgName}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(org.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
