'use client';

import type { SyntheticEvent } from 'react';
import { TITLE_CATEGORY_EMOJI } from '@/lib/constants/title';
import type { UserTitleResponse } from '@/lib/api/types';

/** 한 줄에 노출하는 최대 칭호 수 (대표 1개 + 보조 3개). */
const MAX_VISIBLE_TITLES = 4;
/** 대표를 제외하고 노출하는 보조 칭호 수. */
const MAX_SUB_TITLES = 3;

interface Props {
  /** 보유 칭호 전체 목록 (GET /users/{id}/titles 의 titles) */
  titles: UserTitleResponse[];
  /**
   * 서버가 계산해 준 보조 칭호 목록 (lastDisplayedAt DESC → grantedAt DESC, 최대 3개).
   * 전달되면 이 순서를 그대로 사용하고, 없으면 titles 에서 직접 추린다.
   */
  subTitles?: UserTitleResponse[];
  className?: string;
}

/**
 * 프로필 칭호 뱃지 줄.
 *
 * <p>내 프로필과 타인 프로필이 동일한 노출 정책(대표 1개 + 보조 최대 3개, 최대 4개)을
 * 쓰도록 공용화한 컴포넌트다. 과거에는 두 화면이 각자 렌더링해
 * 타인 프로필에서 대표 칭호 1개만 보이는 불일치가 있었다.</p>
 */
export default function TitleBadgeRow({ titles, subTitles, className }: Props) {
  if (!titles || titles.length === 0) return null;

  const representative = titles.filter((t) => t.isDisplay);
  const supporting = (subTitles ?? titles.filter((t) => !t.isDisplay)).slice(0, MAX_SUB_TITLES);
  const visible = [...representative, ...supporting].slice(0, MAX_VISIBLE_TITLES);
  const hiddenCount = titles.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <div className={className ?? 'mb-3 flex flex-wrap items-center gap-1.5'}>
      {visible.map((t) => (
        <div
          key={t.userTitleId}
          title={`${t.titleName}${t.isDisplay ? ' (대표)' : ''}`}
          className={`flex items-center justify-center overflow-hidden rounded-full border text-sm transition-all ${
            t.isDisplay
              ? 'h-10 w-10 border-amber-300 bg-amber-50 shadow-[0_0_0_2px_#fbbf24]'
              : 'h-7 w-7 border-gray-100 bg-gray-50'
          }`}
        >
          {t.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.iconUrl}
              alt={t.titleName}
              className="h-full w-full object-cover"
              onError={(e: SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : t.category && TITLE_CATEGORY_EMOJI[t.category] ? (
            TITLE_CATEGORY_EMOJI[t.category]
          ) : (
            '🏅'
          )}
        </div>
      ))}
      {hiddenCount > 0 && (
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-[10px] font-medium text-gray-400"
          title={`외 ${hiddenCount}개 더 보유`}
        >
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}
