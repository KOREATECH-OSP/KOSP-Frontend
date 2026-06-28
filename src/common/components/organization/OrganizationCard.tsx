import Link from 'next/link';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import type { OrganizationResponse } from '@/lib/api/organization';
import OrganizationStatusBadge from './OrganizationStatusBadge';

interface OrganizationCardProps {
  organization: OrganizationResponse;
}

export default function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <Link
      href={`/organization/${organization.id}`}
      className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-gray-300"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* 아바타 */}
        <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
          {organization.avatarUrl ? (
            <Image
              src={organization.avatarUrl}
              alt={organization.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <Building2 className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          )}
        </div>

        {/* 조직명 + 상태 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="truncate text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {organization.displayName}
            </h3>
            <OrganizationStatusBadge status={organization.status} />
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">
            github.com/{organization.githubOrgName}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-gray-50 pt-3">
        <span className="text-xs font-medium text-blue-600 group-hover:underline">
          상세보기 →
        </span>
      </div>
    </Link>
  );
}
