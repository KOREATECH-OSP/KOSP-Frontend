'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from '@/lib/auth/AuthContext';
import { Loader2, Check, X, Upload, ImageIcon } from 'lucide-react';
import { getAllTitles } from '@/lib/api/user';
import { adminUploadTitleImage } from '@/lib/api/admin';
import { TITLE_CATEGORY_EMOJI, RARITY_LABELS, RARITY_COLORS } from '@/lib/constants/title';
import type { TitleDetailResponse } from '@/lib/api/types';

export default function AdminTitlesPage() {
  const { data: session } = useSession();
  const [titles, setTitles] = useState<TitleDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const startEdit = (titleId: number) => {
    if (editingId !== null) cancelEdit();
    setEditingId(titleId);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (titleId: number) => {
    if (!selectedFile || !session?.accessToken || uploadingId !== null) return;
    setUploadingId(titleId);
    try {
      const { iconUrl } = await adminUploadTitleImage(titleId, selectedFile, {
        accessToken: session.accessToken,
      });
      setTitles((prev) => prev.map((t) => (t.id === titleId ? { ...t, iconUrl } : t)));
      cancelEdit();
      setSavedId(titleId);
      setTimeout(() => setSavedId(null), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '업로드에 실패했습니다.';
      setError(`${msg} (png/jpg/webp, 최대 5MB)`);
      setTimeout(() => setError(null), 4000);
    } finally {
      setUploadingId(null);
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
            이미지 변경 버튼을 눌러 파일을 선택하고 업로드하세요.
            비워두면 카테고리 이모지로 표시됩니다. (png, jpg, webp / 최대 5MB)
          </p>
        </div>

        {/* 오류 토스트 */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 숨겨진 파일 input (전역 1개) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 이미지 업로드 가이드라인 */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <p className="mb-2 font-semibold">이미지 업로드 가이드라인</p>
          <ul className="list-disc space-y-1 pl-5 text-blue-700">
            <li>권장 크기: <span className="font-medium">128 × 128 px</span> (정사각형 1:1 비율)</li>
            <li>허용 형식: <span className="font-medium">PNG · JPG · WebP</span></li>
            <li>최대 파일 크기: <span className="font-medium">5 MB</span></li>
            <li>이미지는 칭호 목록, 프로필 카드, 이력서에서 <span className="font-medium">56 × 56 px</span> 크기로 표시됩니다.</li>
            <li>이미지를 비워두면 카테고리 이모지가 대신 표시됩니다.</li>
          </ul>
        </div>

        {/* 칭호 목록 */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-sm text-gray-500">전체 {titles.length}개</p>
          </div>

          <ul className="divide-y divide-gray-100">
            {titles.map((title) => {
              const isEditing = editingId === title.id;
              const isUploading = uploadingId === title.id;
              const isSaved = savedId === title.id;
              const emoji = TITLE_CATEGORY_EMOJI[title.category] ?? '🏅';
              const rarityClass = RARITY_COLORS[title.rarity] ?? 'bg-gray-100 text-gray-600';

              return (
                <li key={title.id} className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    {/* 현재 칭호 이미지 미리보기 */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-2xl overflow-hidden">
                      {title.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={title.iconUrl} alt={title.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{emoji}</span>
                      )}
                    </div>

                    {/* 칭호 정보 + 편집 영역 */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">{title.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${rarityClass}`}>
                          {RARITY_LABELS[title.rarity] ?? title.rarity}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{title.code}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{title.description}</p>

                      {isEditing ? (
                        /* ── 업로드 편집 모드 ────────────────────── */
                        <div className="flex flex-wrap items-center gap-3">
                          {/* 선택된 이미지 미리보기 */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 transition-colors overflow-hidden"
                            title="클릭하여 파일 선택"
                          >
                            {previewUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={previewUrl} alt="미리보기" className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-orange-300" />
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 min-w-0">
                            {/* 파일 선택 버튼 */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
                            >
                              <Upload className="h-3 w-3" />
                              파일 선택
                            </button>
                            {selectedFile && (
                              <span className="text-[11px] text-gray-400 truncate max-w-[180px]">
                                {selectedFile.name}
                              </span>
                            )}
                          </div>

                          {/* 업로드 버튼 */}
                          <button
                            type="button"
                            onClick={() => handleUpload(title.id)}
                            disabled={!selectedFile || isUploading}
                            className="flex items-center gap-1.5 rounded-lg bg-orange-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500 transition-colors disabled:opacity-50"
                          >
                            {isUploading
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Check className="h-3 w-3" />}
                            업로드
                          </button>

                          {/* 취소 버튼 */}
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
                        /* ── 기본 모드 ─────────────────────────────── */
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 truncate max-w-xs">
                            {title.iconUrl ? '이미지 있음' : '이미지 없음 (이모지 표시)'}
                          </span>
                          {isSaved && (
                            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                              <Check className="h-3 w-3" />
                              업로드 완료
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => startEdit(title.id)}
                            className="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
                          >
                            <ImageIcon className="h-3 w-3" />
                            이미지 변경
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
