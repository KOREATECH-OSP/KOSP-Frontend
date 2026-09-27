'use client';

import { useState } from 'react';
import { ChevronDown, Pin } from 'lucide-react';

import { FAQ_CATEGORIES, NOTICES } from '@/lib/constants/notice';

export type NoticeTab = 'notice' | 'faq';

const TABS: { key: NoticeTab; label: string }[] = [
  { key: 'notice', label: '공지사항' },
  { key: 'faq', label: 'FAQ' },
];

interface Props {
  initialTab: NoticeTab;
}

/**
 * 공지사항 / FAQ 페이지 (정적 콘텐츠).
 * 탭 전환 시 URL 쿼리(?tab=faq)도 함께 바꿔 새로고침·공유 시 같은 탭이 열리게 한다.
 */
export default function NoticePageClient({ initialTab }: Props) {
  const [tab, setTab] = useState<NoticeTab>(initialTab);

  const changeTab = (next: NoticeTab) => {
    setTab(next);
    const url = next === 'faq' ? '?tab=faq' : window.location.pathname;
    window.history.replaceState(null, '', url);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">공지사항 · FAQ</h1>
        <p className="mt-1 text-sm text-gray-500">서비스 소식과 자주 묻는 질문을 확인하세요.</p>
      </div>

      <div className="mb-6 flex gap-2" role="tablist">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => changeTab(key)}
            className={`whitespace-nowrap rounded-full min-h-[44px] px-4 py-2 text-sm font-medium transition-colors touch-feedback ${tab === key
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'notice' ? <NoticeList /> : <FaqList />}
    </div>
  );
}

/** 공지 목록. 항목을 누르면 본문이 펼쳐진다. 고정 공지가 먼저 온다. */
function NoticeList() {
  const [openId, setOpenId] = useState<string | null>(null);
  const sorted = [...NOTICES].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
      {sorted.map((notice) => {
        const open = openId === notice.id;
        return (
          <li key={notice.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : notice.id)}
              aria-expanded={open}
              className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="mt-0.5 shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {notice.category}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  {notice.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-orange-500" aria-label="고정" />}
                  <span className="break-words">{notice.title}</span>
                </span>
                <span className="mt-1 block text-xs text-gray-400">{notice.date}</span>
              </span>
              <ChevronDown
                className={`mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {open && (
              <div className="space-y-2 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-700">
                {notice.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** 카테고리별 FAQ 아코디언. 질문을 누르면 답변이 펼쳐진다. */
function FaqList() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {FAQ_CATEGORIES.map(({ category, items }) => (
        <section key={category}>
          <h2 className="mb-3 px-1 text-base font-bold text-gray-900">{category}</h2>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {items.map(({ question, answer }) => {
              const key = `${category}-${question}`;
              const open = openKey === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : key)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="shrink-0 text-sm font-bold text-orange-500">Q</span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-gray-900">{question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  {open && (
                    <div className="flex gap-3 bg-gray-50 px-5 py-4">
                      <span className="shrink-0 text-sm font-bold text-gray-400">A</span>
                      <p className="text-sm leading-relaxed text-gray-700">{answer}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
