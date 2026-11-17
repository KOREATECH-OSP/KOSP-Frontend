'use client';

import { useEffect, useState } from 'react';
import { FileText, X, Loader2, Check } from 'lucide-react';

import { getRecentMaterials } from '@/lib/api/material';
import type { MaterialItemResponse, MaterialSource } from '@/lib/api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  accessToken: string | null;
  onConfirm: (materials: MaterialItemResponse[]) => void;
}

const SOURCE_LABEL: Record<MaterialSource, string> = {
  AUNURI_ASSIGNMENT: '과제',
  AUNURI_EL: 'EL',
  GITHUB: 'GitHub',
  MANUAL: '업로드',
};

/**
 * 첨부파일(학습자료)에서 이력서 프로젝트로 가져오는 모달.
 * 최신 자료 목록을 체크박스로 선택해 프로젝트 항목으로 추가한다.
 */
export default function ImportMaterialsModal({ open, onClose, accessToken, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<MaterialItemResponse[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open || !accessToken) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setSelected(new Set());
      try {
        const data = await getRecentMaterials({ accessToken }, 50);
        if (!cancelled) setMaterials(data);
      } catch {
        if (!cancelled) setError('학습자료를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, accessToken]);

  if (!open) return null;

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(materials.filter((m) => selected.has(m.id)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">과제/자료에서 프로젝트 가져오기</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>불러오는 중...</span>
            </div>
          )}

          {!loading && error && <p className="py-16 text-center text-sm text-red-500">{error}</p>}

          {!loading && !error && materials.length === 0 && (
            <p className="py-16 text-center text-sm text-gray-500">가져올 수 있는 학습자료가 없습니다.</p>
          )}

          {!loading && !error && materials.length > 0 && (
            <ul className="space-y-2">
              {materials.map((m) => {
                const checked = selected.has(m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition
                        ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border
                        ${checked ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium text-gray-900">{m.title}</span>
                          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">
                            {SOURCE_LABEL[m.source]}
                          </span>
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
                          {m.subjectName && <span>{m.subjectName}</span>}
                          {m.materialYear && <span>{m.materialYear}년</span>}
                          {m.semester && <span>{m.semester}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <span className="text-sm text-gray-500">{selected.size}개 선택됨</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              이력서에 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
