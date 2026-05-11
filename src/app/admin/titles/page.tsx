'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { Loader2, Check, X, Image as ImageIcon } from 'lucide-react';
import { getAllTitles } from '@/lib/api/user';
import { adminUpdateTitleImage } from '@/lib/api/admin';
import { TITLE_CATEGORY_EMOJI, RARITY_LABELS, RARITY_COLORS } from '@/lib/constants/title';
import type { TitleDetailResponse } from '@/lib/api/types';

export default function AdminTitlesPage() {
  const { data: session } = useSession();
  const [titles, setTitles] = useState<TitleDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTitles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllTitles();
      setTitles(res.titles);
    } catch {
      setError('칭호 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTitles(); }, [fetchTitles]);

  const startEdit = (title: TitleDetailResponse) => {
    setEditingId(title.id);
    setEditUrl(title.iconUrl ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUrl('');
  };

  const saveImage = async (titleId: number) => {
    if (!session?.accessToken) return;
    setSavingId(titleId);
    try {
      const iconUrl = editUrl.trim() || null;
      await adminUpdateTitleImage(titleId, iconUrl, { accessToken: session.accessToken });
      setTitles((prev) =>
        prev.map((t) => (t.id === titleId ? { ...t, iconUrl } : t))
      );
      setEditingId(null);
      setEditUrl('');
      setSavedId(titleId);
      setTimeout(() => setSavedId(null), 2000);
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">칭호 이미지 관리</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            각 칭호의 iconUrl을 설정합니다. 비워두면 카테고리 이모지로 표시됩니다.
          </p>
        </div>

        {/* 오류 토스트 */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 칭호 목록 */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm text-gray-500">전체 {titles.length}개</p>
          </div>

          <ul className="divide-y divide-gray-100">
            {titles.map((title) => {
              const isEditing = editingId === title.id;
              const isSaving = savingId === title.id;
              const isSaved = savedId === title.id;
              const emoji = TITLE_CATEGORY_EMOJI[title.category] ?? '🏅';
              const rarityClass = RARITY_COLORS[title.rarity] ?? 'bg-gray-100 text-gray-600';

              return (
                <li key={title.id} className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    {/* 이모지 / 이미지 미리보기 */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-xl overflow-hidden">
                      {title.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={title.iconUrl} alt={title.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{emoji}</span>
                      )}
                    </div>

                    {/* 칭호 정보 */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">{title.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${rarityClass}`}>
                          {RARITY_LABELS[title.rarity] ?? title.rarity}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{title.code}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{title.description}</p>

                      {/* URL 편집 영역 */}
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="https://example.com/image.png (비우면 초기화)"
                            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-300 focus:border-orange-400 focus:bg-white focus:outline-none transition-colors"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveImage(title.id)}
                            disabled={isSaving}
                            className="flex items-center gap-1 rounded-lg bg-orange-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500 transition-colors disabled:opacity-60"
                          >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            <X className="h-3 w-3" />
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-mono truncate max-w-xs">
                            {title.iconUrl ?? '(없음)'}
                          </span>
                          {isSaved && (
                            <span className="text-xs text-emerald-500 font-medium">저장됨</span>
                          )}
                          <button
                            type="button"
                            onClick={() => startEdit(title)}
                            className="ml-auto flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
                          >
                            <ImageIcon className="h-3 w-3" />
                            URL 수정
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
