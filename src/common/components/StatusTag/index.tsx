type RecruitStatus = '마감임박' | '모집중' | string;

interface StatusTagProps {
  recruit: {
    status: RecruitStatus;
  };
}

const STATUS_STYLES: Record<string, string> = {
  마감임박: 'text-red-700 border-red-200/70',
  모집중: 'text-green-700 border-green-200/70',
  default: 'text-gray-500 border-gray-200/70',
};

function StatusTag({ recruit }: StatusTagProps) {
  const { status } = recruit;
  const statusClass = STATUS_STYLES[status] ?? STATUS_STYLES.default;

  return (
    <div
      className={[
        'px-2.5 py-1 rounded-lg text-[10px] font-semibold border backdrop-blur-sm',
        statusClass,
      ].join(' ')}
    >
      {status}
    </div>
  );
}

export default StatusTag;
