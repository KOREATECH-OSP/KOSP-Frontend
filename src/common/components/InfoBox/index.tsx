import type { ReactNode } from 'react';
import clsx from 'clsx';

interface InfoBoxProps {
  title: string;
  items?: string[];
  children?: ReactNode;
  className?: string;
}

export default function InfoBox({ title, items, children, className }: InfoBoxProps) {
  return (
    <div className={clsx('mt-8 bg-[#E6F0FF] border border-[#B3C7FF] rounded-xl p-6', className)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-[#D9E4FF] rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-[#2e3358]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div>
          <h3 className="font-semibold text-[#2e3358] mb-2">{title}</h3>

          {items && (
            <ul className="text-sm text-[#2e3358] space-y-1">
              {items.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
          )}

          {!items && children && (
            <div className="text-sm text-[#2e3358] space-y-1">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
