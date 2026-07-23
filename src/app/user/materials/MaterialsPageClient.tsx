'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import {
  Folder,
  FolderPlus,
  Lock,
  Globe,
  Star,
  Upload,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
  Plus,
  X,
  ArrowLeft,
  AlertTriangle,
  Download,
  Pencil,
  FolderInput,
} from 'lucide-react';
import type { AuthSession } from '@/lib/auth/types';
import type {
  MaterialFolderResponse,
  MaterialItemResponse,
  MaterialFolderType,
  MaterialSource,
} from '@/lib/api/types';
import {
  getMyMaterialFolders,
  getStartMaterialFolder,
  createMaterialFolder,
  updateMaterialFolder,
  changeMaterialFolderVisibility,
  setStartMaterialFolder,
  deleteMaterialFolder,
  moveMaterialFolder,
  getMaterialFolderItems,
  changeMaterialItemVisibility,
  updateMaterialItem,
  moveMaterialItem,
  deleteMaterialItem,
  getMaterialDownloadUrl,
} from '@/lib/api/material';
import AddMaterialModal from './AddMaterialModal';

interface Props {
  session: AuthSession | null;
  initialFolderId: number | null;
}

const SOURCE_LABEL: Record<MaterialSource, string> = {
  AUNURI_ASSIGNMENT: '과제',
  AUNURI_EL: 'EL',
  GITHUB: 'GitHub',
  MANUAL: '업로드',
};

/** 최근 학기 우선 정렬키 (semesterOrder 우선, 없으면 연도 기반). */
function semesterSortKey(item: MaterialItemResponse): number {
  if (item.semesterOrder != null) return item.semesterOrder;
  if (item.materialYear != null) return item.materialYear * 10;
  return -1;
}

/** 학기 그룹 식별자 (헤더 전환 감지용). */
function semesterGroupKey(item: MaterialItemResponse): string {
  return `${item.materialYear ?? ''}|${item.semester ?? ''}`;
}

/** 학기 그룹 헤더 라벨. */
function semesterGroupLabel(item: MaterialItemResponse): string {
  if (item.materialYear == null && !item.semester) return '기타';
  return [item.materialYear ? `${item.materialYear}년` : null, item.semester].filter(Boolean).join(' ');
}

const FOLDER_TYPE_OPTIONS: { value: MaterialFolderType; label: string }[] = [
  { value: 'YEAR', label: '연도' },
  { value: 'SEMESTER', label: '학기' },
  { value: 'SUBJECT', label: '과목' },
  { value: 'CUSTOM', label: '기타' },
];

export default function MaterialsPageClient({ session, initialFolderId }: Props) {
  const accessToken = session?.accessToken ?? null;
  const auth = accessToken ? { accessToken } : null;

  const [folders, setFolders] = useState<MaterialFolderResponse[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [items, setItems] = useState<MaterialItemResponse[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  // 드라이브 편집: 자료 다중 선택 + 이동 대상
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [moveTarget, setMoveTarget] = useState<
    | { kind: 'items'; itemIds: number[] }
    | { kind: 'folder'; folderId: number }
    | null
  >(null);

  const selectedFolder = folders.find((f) => f.id === selectedFolderId) ?? null;

  // 최근 학기가 최상위로 오도록 정렬 (semesterOrder desc, 동일 학기 내 백엔드 최신순 유지)
  const sortedItems = [...items].sort((a, b) => semesterSortKey(b) - semesterSortKey(a));
  const allSelected = sortedItems.length > 0 && sortedItems.every((i) => selectedIds.has(i.id));
  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(sortedItems.map((i) => i.id)));

  // ── 폴더 로드 + 초기 진입 폴더 결정 ──────────────────────────────
  const loadFolders = useCallback(async () => {
    if (!auth) return;
    setFoldersLoading(true);
    try {
      const list = await getMyMaterialFolders(auth);
      setFolders(list);

      // 진입 폴더: ?folder= → 시작 폴더 → 첫 폴더
      let target: number | null = null;
      if (initialFolderId && list.some((f) => f.id === initialFolderId)) {
        target = initialFolderId;
      } else {
        const start = await getStartMaterialFolder(auth);
        target = start?.id ?? list[0]?.id ?? null;
      }
      setSelectedFolderId(target);
    } catch {
      setError('폴더를 불러오지 못했습니다.');
    } finally {
      setFoldersLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, initialFolderId]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // ── 선택 폴더 자료 로드 ─────────────────────────────────────────
  const loadItems = useCallback(async () => {
    if (!auth || selectedFolderId == null) {
      setItems([]);
      return;
    }
    setItemsLoading(true);
    try {
      setItems(await getMaterialFolderItems(selectedFolderId, auth));
    } catch {
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, selectedFolderId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // 폴더 전환 시 선택 초기화
  useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedFolderId]);

  // ── 폴더 액션 ───────────────────────────────────────────────────
  const handleToggleFolderVisibility = async (folder: MaterialFolderResponse) => {
    if (!auth) return;
    const next = folder.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    await changeMaterialFolderVisibility(folder.id, next, auth);
    setFolders((prev) => prev.map((f) => (f.id === folder.id ? { ...f, visibility: next } : f)));
  };

  const handleSetStartFolder = async (folder: MaterialFolderResponse) => {
    if (!auth) return;
    await setStartMaterialFolder(folder.id, auth);
    setFolders((prev) => prev.map((f) => ({ ...f, isStartFolder: f.id === folder.id })));
  };

  const handleDeleteFolder = async (folder: MaterialFolderResponse) => {
    if (!auth) return;
    if (folder.itemCount > 0) {
      alert('자료가 남아있는 폴더는 삭제할 수 없습니다. 자료를 먼저 이동/삭제해주세요.');
      return;
    }
    if (!confirm(`"${folder.name}" 폴더를 삭제할까요?`)) return;
    await deleteMaterialFolder(folder.id, auth);
    setFolders((prev) => prev.filter((f) => f.id !== folder.id));
    if (selectedFolderId === folder.id) setSelectedFolderId(null);
  };

  // ── 자료 등록 완료 콜백 / 삭제 ──────────────────────────────────
  const handleMaterialCreated = (created: MaterialItemResponse) => {
    setItems((prev) => [created, ...prev]);
    setFolders((prev) =>
      prev.map((f) => (f.id === created.folderId ? { ...f, itemCount: f.itemCount + 1 } : f)),
    );
    setShowAddMaterial(false);
  };

  const handleToggleItemVisibility = async (item: MaterialItemResponse) => {
    if (!auth) return;
    const next = item.isPublic ? 'PRIVATE' : 'PUBLIC';
    const updated = await changeMaterialItemVisibility(item.id, next, auth);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  };

  const handleDeleteItem = async (item: MaterialItemResponse) => {
    if (!auth) return;
    if (!confirm(`"${item.title}" 자료를 삭제할까요?`)) return;
    await deleteMaterialItem(item.id, auth);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setFolders((prev) =>
      prev.map((f) =>
        f.id === item.folderId ? { ...f, itemCount: Math.max(0, f.itemCount - 1) } : f,
      ),
    );
  };

  // ── 자료 이름 바꾸기 / 다운로드 ─────────────────────────────────
  const handleRenameItem = async (item: MaterialItemResponse) => {
    if (!auth) return;
    const input = window.prompt('자료 이름', item.title);
    if (input == null) return;
    const title = input.trim();
    if (!title || title === item.title) return;
    const updated = await updateMaterialItem(item.id, { title }, auth);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  };

  const triggerDownload = async (item: MaterialItemResponse) => {
    if (!auth) return;
    try {
      const url = await getMaterialDownloadUrl(item.id, auth);
      const a = document.createElement('a');
      a.href = url;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // S3 저장 파일이 아니면(아우누리 외부 링크 등) 원본 링크로 대체
      const fallback = item.fileUrl ?? item.sourceUrl;
      if (fallback) window.open(fallback, '_blank', 'noopener');
      else alert('내려받을 수 있는 파일이 없습니다.');
    }
  };

  // ── 다중 선택 / 일괄 처리 ───────────────────────────────────────
  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDownload = async () => {
    if (!auth || selectedIds.size === 0) return;
    setBulkBusy(true);
    try {
      for (const id of selectedIds) {
        const item = items.find((i) => i.id === id);
        if (item) {
          await triggerDownload(item);
          await new Promise((r) => setTimeout(r, 300)); // 브라우저 연속 다운로드 완화
        }
      }
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkVisibility = async (next: 'PUBLIC' | 'PRIVATE') => {
    if (!auth || selectedIds.size === 0) return;
    setBulkBusy(true);
    const ids = [...selectedIds];
    try {
      const updated = await Promise.all(ids.map((id) => changeMaterialItemVisibility(id, next, auth)));
      const map = new Map(updated.map((u) => [u.id, u]));
      setItems((prev) => prev.map((i) => map.get(i.id) ?? i));
      clearSelection();
    } catch {
      alert('일부 자료의 공개 설정 변경에 실패했습니다.');
      loadItems();
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!auth || selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개 자료를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setBulkBusy(true);
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map((id) => deleteMaterialItem(id, auth)));
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      if (selectedFolderId != null) {
        setFolders((prev) =>
          prev.map((f) =>
            f.id === selectedFolderId ? { ...f, itemCount: Math.max(0, f.itemCount - ids.length) } : f,
          ),
        );
      }
      clearSelection();
    } catch {
      alert('일부 자료 삭제에 실패했습니다.');
      loadItems();
    } finally {
      setBulkBusy(false);
    }
  };

  // 자료 이동 (단건/일괄 공용)
  const handleMoveItems = async (itemIds: number[], targetFolderId: number) => {
    if (!auth || itemIds.length === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(itemIds.map((id) => moveMaterialItem(id, targetFolderId, auth)));
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.id)));
      setFolders((prev) =>
        prev.map((f) => {
          if (f.id === selectedFolderId) return { ...f, itemCount: Math.max(0, f.itemCount - itemIds.length) };
          if (f.id === targetFolderId) return { ...f, itemCount: f.itemCount + itemIds.length };
          return f;
        }),
      );
      clearSelection();
    } catch {
      alert('자료 이동에 실패했습니다.');
      loadItems();
    } finally {
      setBulkBusy(false);
      setMoveTarget(null);
    }
  };

  // ── 폴더 이름 바꾸기 / 이동 ─────────────────────────────────────
  const handleRenameFolder = async (folder: MaterialFolderResponse) => {
    if (!auth) return;
    const input = window.prompt('폴더 이름', folder.name);
    if (input == null) return;
    const name = input.trim();
    if (!name || name === folder.name) return;
    const updated = await updateMaterialFolder(
      folder.id,
      { name, folderType: folder.folderType, sortOrder: folder.sortOrder },
      auth,
    );
    setFolders((prev) => prev.map((f) => (f.id === folder.id ? { ...f, name: updated.name } : f)));
  };

  const handleMoveFolder = async (folderId: number, parentId: number | null) => {
    if (!auth) return;
    try {
      const updated = await moveMaterialFolder(folderId, parentId, auth);
      setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, parentId: updated.parentId } : f)));
    } catch {
      alert('폴더 이동에 실패했습니다. (자기 자신이나 하위 폴더로는 이동할 수 없습니다)');
    } finally {
      setMoveTarget(null);
    }
  };

  if (!accessToken) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-500">
        로그인이 필요합니다.{' '}
        <Link href="/login" className="text-blue-600 underline">
          로그인
        </Link>
      </div>
    );
  }

  // 부모→자식 렌더링용 트리 구성
  const childrenOf = (parentId: number | null) =>
    folders.filter((f) => f.parentId === parentId);

  const renderFolderNode = (folder: MaterialFolderResponse, depth: number) => (
    <div key={folder.id}>
      <div
        className={`group flex items-center gap-1.5 rounded-lg py-1.5 pr-1.5 text-sm
          ${selectedFolderId === folder.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        <button
          onClick={() => setSelectedFolderId(folder.id)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          <Folder className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">{folder.name}</span>
          {folder.isStartFolder && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
          <span className="shrink-0 text-xs text-gray-400">{folder.itemCount}</span>
        </button>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
          <button
            title="이름 바꾸기"
            onClick={() => handleRenameFolder(folder)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            title="폴더 이동"
            onClick={() => setMoveTarget({ kind: 'folder', folderId: folder.id })}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
          >
            <FolderInput className="h-3.5 w-3.5" />
          </button>
          <button
            title={folder.visibility === 'PUBLIC' ? '공개 → 비공개' : '비공개 → 공개'}
            onClick={() => handleToggleFolderVisibility(folder)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
          >
            {folder.visibility === 'PUBLIC' ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          </button>
          <button
            title="시작 폴더로 지정"
            onClick={() => handleSetStartFolder(folder)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
          >
            <Star className="h-3.5 w-3.5" />
          </button>
          <button
            title="폴더 삭제"
            onClick={() => handleDeleteFolder(folder)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {childrenOf(folder.id).map((child) => renderFolderNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/user" className="mb-1 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> 마이페이지
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">학습자료</h1>
          <p className="mt-1 text-sm text-gray-500">과제 · EL 자료를 연도별 폴더로 정리하고 공개 범위를 관리하세요.</p>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        {/* 좌: 폴더 트리 */}
        <aside className="rounded-xl border border-gray-100 bg-white p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm font-semibold text-gray-700">폴더</span>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
            >
              <FolderPlus className="h-3.5 w-3.5" /> 폴더
            </button>
          </div>
          {foldersLoading ? (
            <div className="flex justify-center py-8 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : folders.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-gray-400">폴더가 없습니다. 폴더를 먼저 만들어주세요.</p>
          ) : (
            <div className="space-y-0.5">
              {childrenOf(null).map((f) => renderFolderNode(f, 0))}
            </div>
          )}
        </aside>

        {/* 우: 자료 목록 */}
        <section className="rounded-xl border border-gray-100 bg-white p-4">
          {selectedFolder ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedFolder.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs
                      ${selectedFolder.visibility === 'PUBLIC' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {selectedFolder.visibility === 'PUBLIC' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {selectedFolder.visibility === 'PUBLIC' ? '공개' : '비공개'}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddMaterial(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4" />
                  자료 추가
                </button>
              </div>

              {/* 편집 툴바: 전체선택 + 일괄 처리 */}
              {items.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded border-gray-300"
                    />
                    전체선택
                  </label>
                  {selectedIds.size > 0 ? (
                    <>
                      <span className="text-xs font-medium text-blue-600">{selectedIds.size}개 선택</span>
                      <span className="mx-1 h-4 w-px bg-gray-200" />
                      <button
                        onClick={handleBulkDownload}
                        disabled={bulkBusy}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" /> 내려받기
                      </button>
                      <button
                        onClick={() => setMoveTarget({ kind: 'items', itemIds: [...selectedIds] })}
                        disabled={bulkBusy}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      >
                        <FolderInput className="h-3.5 w-3.5" /> 이동
                      </button>
                      <button
                        onClick={() => handleBulkVisibility('PRIVATE')}
                        disabled={bulkBusy}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Lock className="h-3.5 w-3.5" /> 비공개
                      </button>
                      <button
                        onClick={() => handleBulkVisibility('PUBLIC')}
                        disabled={bulkBusy}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Globe className="h-3.5 w-3.5" /> 공개
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkBusy}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> 삭제
                      </button>
                      {bulkBusy && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">체크박스로 자료를 선택해 일괄 처리하세요.</span>
                  )}
                </div>
              )}

              {itemsLoading ? (
                <div className="flex justify-center py-12 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">등록된 자료가 없습니다.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {sortedItems.map((item, idx) => {
                    const showHeader =
                      idx === 0 || semesterGroupKey(sortedItems[idx - 1]) !== semesterGroupKey(item);
                    return (
                    <Fragment key={item.id}>
                    {showHeader && (
                      <li className="pt-3 pb-1 text-xs font-semibold text-gray-500">
                        {semesterGroupLabel(item)}
                      </li>
                    )}
                    <li className="flex items-center gap-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="h-3.5 w-3.5 shrink-0 rounded border-gray-300"
                      />
                      <FileText className="h-5 w-5 shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-gray-900">{item.title}</span>
                          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">
                            {SOURCE_LABEL[item.source]}
                          </span>
                          {item.duplicatedWithGithub && (
                            <span
                              className="inline-flex shrink-0 items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700"
                              title={
                                item.duplicateRepoKey
                                  ? `GitHub 프로젝트(${item.duplicateRepoKey})와 중복 가능성이 있습니다. 내용을 확인·수정하세요.`
                                  : 'GitHub 프로젝트와 중복 가능성이 있습니다. 내용을 확인·수정하세요.'
                              }
                            >
                              <AlertTriangle className="h-3 w-3" />
                              중복 가능성
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
                          {item.subjectName && <span>{item.subjectName}</span>}
                          {item.materialYear && <span>{item.materialYear}년</span>}
                          {item.semester && <span>{item.semester}</span>}
                          {item.materialDate && <span>{item.materialDate.slice(0, 10)}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => triggerDownload(item)}
                          title="다운로드"
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {(item.sourceUrl || item.fileUrl) && (
                          <a
                            href={item.sourceUrl ?? item.fileUrl ?? undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title="열기"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleRenameItem(item)}
                          title="이름 바꾸기"
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setMoveTarget({ kind: 'items', itemIds: [item.id] })}
                          title="이동"
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100"
                        >
                          <FolderInput className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleItemVisibility(item)}
                          title={item.isPublic ? '공개 → 비공개' : '비공개 → 공개'}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100"
                        >
                          {item.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          title="삭제"
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                    </Fragment>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            <p className="py-16 text-center text-sm text-gray-400">
              왼쪽에서 폴더를 선택하거나 새 폴더를 만들어주세요.
            </p>
          )}
        </section>
      </div>

      {showCreateFolder && auth && (
        <CreateFolderModal
          folders={folders}
          defaultParentId={selectedFolder?.id ?? null}
          onClose={() => setShowCreateFolder(false)}
          onCreated={(created) => {
            setFolders((prev) => [...prev, created]);
            setSelectedFolderId(created.id);
            setShowCreateFolder(false);
          }}
          auth={auth}
        />
      )}

      {showAddMaterial && auth && selectedFolderId != null && (
        <AddMaterialModal
          folderId={selectedFolderId}
          onClose={() => setShowAddMaterial(false)}
          onCreated={handleMaterialCreated}
          auth={auth}
        />
      )}

      {moveTarget && (
        <MoveModal
          folders={folders}
          title={moveTarget.kind === 'folder' ? '폴더 이동' : '자료 이동'}
          excludeFolderId={moveTarget.kind === 'folder' ? moveTarget.folderId : undefined}
          allowRoot={moveTarget.kind === 'folder'}
          onClose={() => setMoveTarget(null)}
          onConfirm={(targetId) => {
            if (moveTarget.kind === 'folder') {
              handleMoveFolder(moveTarget.folderId, targetId);
            } else if (targetId != null) {
              handleMoveItems(moveTarget.itemIds, targetId);
            }
          }}
        />
      )}
    </div>
  );
}

// ── 이동 모달 (자료/폴더 공용) ────────────────────────────────────
function MoveModal({
  folders,
  title,
  excludeFolderId,
  allowRoot,
  onClose,
  onConfirm,
}: {
  folders: MaterialFolderResponse[];
  title: string;
  excludeFolderId?: number;
  allowRoot: boolean;
  onClose: () => void;
  onConfirm: (targetFolderId: number | null) => void;
}) {
  const [target, setTarget] = useState<number | null>(null);

  // 폴더 이동 시 자기 자신 + 하위(자손) 폴더는 대상에서 제외 (순환 방지)
  const excluded = new Set<number>();
  if (excludeFolderId != null) {
    excluded.add(excludeFolderId);
    let grew = true;
    while (grew) {
      grew = false;
      for (const f of folders) {
        if (f.parentId != null && excluded.has(f.parentId) && !excluded.has(f.id)) {
          excluded.add(f.id);
          grew = true;
        }
      }
    }
  }
  const options = folders.filter((f) => !excluded.has(f.id));
  const canConfirm = allowRoot || target != null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">
          <label className="mb-1 block text-sm text-gray-600">이동할 위치</label>
          <select
            value={target ?? ''}
            onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
            autoFocus
          >
            {allowRoot ? (
              <option value="">최상위</option>
            ) : (
              <option value="" disabled>
                폴더를 선택하세요
              </option>
            )}
            {options.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={() => onConfirm(target)}
            disabled={!canConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <FolderInput className="h-4 w-4" />
            이동
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 폴더 생성 모달 ────────────────────────────────────────────────
function CreateFolderModal({
  folders,
  defaultParentId,
  onClose,
  onCreated,
  auth,
}: {
  folders: MaterialFolderResponse[];
  defaultParentId: number | null;
  onClose: () => void;
  onCreated: (folder: MaterialFolderResponse) => void;
  auth: { accessToken: string };
}) {
  const [name, setName] = useState('');
  const [folderType, setFolderType] = useState<MaterialFolderType>('CUSTOM');
  const [parentId, setParentId] = useState<number | null>(defaultParentId);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const created = await createMaterialFolder(
        { name: name.trim(), folderType, parentId, visibility },
        auth,
      );
      onCreated(created);
    } catch {
      alert('폴더 생성에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">폴더 만들기</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">폴더명</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 2026, 1학기, 운영체제"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm text-gray-600">유형</label>
              <select
                value={folderType}
                onChange={(e) => setFolderType(e.target.value as MaterialFolderType)}
                className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
              >
                {FOLDER_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">공개</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
                className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
              >
                <option value="PRIVATE">비공개</option>
                <option value="PUBLIC">공개</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">상위 폴더</label>
            <select
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              <option value="">최상위</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={submit}
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            만들기
          </button>
        </div>
      </div>
    </div>
  );
}
