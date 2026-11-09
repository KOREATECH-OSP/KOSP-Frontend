'use client';

import { useEffect, useState } from 'react';
import { FolderGit2, Star, X, Loader2, Check } from 'lucide-react';

import { getMyGithubRepositories } from '@/lib/api/user';
import type { GithubResumeProjectResponse } from '@/lib/api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  accessToken: string | null;
  /** 이미 이력서에 추가된 저장소 키(owner/repo 소문자) 집합 — 중복 표시용 */
  existingRepoKeys: Set<string>;
  /** 선택한 저장소를 이력서 프로젝트로 추가 */
  onConfirm: (repos: GithubResumeProjectResponse[]) => void;
}

/**
 * GitHub 저장소를 이력서 프로젝트로 가져오는 모달.
 * 소유/스타/최근 커밋 순으로 정렬된 저장소 목록을 체크박스로 선택해 일괄 추가한다.
 */
export default function ImportGithubProjectsModal({
  open,
  onClose,
  accessToken,
  existingRepoKeys,
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GithubResumeProjectResponse[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !accessToken) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setSelected(new Set());
      try {
        const data = await getMyGithubRepositories({ accessToken });
        if (!cancelled) setRepos(data);
      } catch {
        if (!cancelled) setError('GitHub 저장소를 불러오지 못했습니다. GitHub 연동 여부를 확인해주세요.');
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

  const toggle = (repoKey: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(repoKey)) next.delete(repoKey);
      else next.add(repoKey);
      return next;
    });
  };

  const handleConfirm = () => {
    const chosen = repos.filter((r) => selected.has(r.repoKey));
    onConfirm(chosen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">GitHub에서 프로젝트 가져오기</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>불러오는 중...</span>
            </div>
          )}

          {!loading && error && (
            <p className="py-16 text-center text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && repos.length === 0 && (
            <p className="py-16 text-center text-sm text-gray-500">
              가져올 수 있는 GitHub 저장소가 없습니다.
            </p>
          )}

          {!loading && !error && repos.length > 0 && (
            <ul className="space-y-2">
              {repos.map((repo) => {
                const already = existingRepoKeys.has(repo.repoKey);
                const checked = selected.has(repo.repoKey);
                return (
                  <li key={repo.repoKey}>
                    <button
                      type="button"
                      disabled={already}
                      onClick={() => toggle(repo.repoKey)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition
                        ${already ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                          : checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border
                        ${checked ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium text-gray-900">{repo.name}</span>
                          {repo.isOwned && (
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">owner</span>
                          )}
                          {already && (
                            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[11px] text-gray-600">이미 추가됨</span>
                          )}
                        </span>
                        {repo.summary && (
                          <span className="mt-0.5 block truncate text-sm text-gray-500">{repo.summary}</span>
                        )}
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                          {repo.primaryLanguage && <span>{repo.primaryLanguage}</span>}
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3" /> {repo.stargazersCount ?? 0}
                          </span>
                          <span>커밋 {repo.userCommitsCount ?? 0}</span>
                          {repo.period && <span>{repo.period}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <span className="text-sm text-gray-500">{selected.size}개 선택됨</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
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
