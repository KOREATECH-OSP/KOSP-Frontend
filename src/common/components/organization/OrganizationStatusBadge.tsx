import type { OrganizationResponse } from '@/lib/api/organization';

const STATUS_STYLES: Record<OrganizationResponse['status'], string> = {
  ACTIVE: 'text-green-700 border-green-200/70',
  PENDING: 'text-amber-700 border-amber-200/70',
  DISCONNECTED: 'text-gray-500 border-gray-200/70',
};

const STATUS_LABELS: Record<OrganizationResponse['status'], string> = {
  ACTIVE: '활성',
  PENDING: '대기중',
  DISCONNECTED: '연결 해제',
};

interface OrganizationStatusBadgeProps {
  status: OrganizationResponse['status'];
}

export default function OrganizationStatusBadge({ status }: OrganizationStatusBadgeProps) {
  return (
    <div
      className={[
        'px-2.5 py-1 rounded-lg text-[10px] font-semibold border backdrop-blur-sm',
        STATUS_STYLES[status],
      ].join(' ')}
    >
      {STATUS_LABELS[status]}
    </div>
  );
}
