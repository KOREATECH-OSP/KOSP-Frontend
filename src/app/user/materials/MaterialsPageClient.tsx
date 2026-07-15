'use client';

import { useState, useEffect, useCallback } from 'react';
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
  changeMaterialFolderVisibility,
  setStartMaterialFolder,
  deleteMaterialFolder,
  getMaterialFolderItems,
  changeMaterialItemVisibility,
  deleteMaterialItem,
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

  const selectedFolder = folders.find((f) => f.id === selectedFolderId) ?? null;

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

              {itemsLoading ? (
                <div className="flex justify-center py-12 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">등록된 자료가 없습니다.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      <FileText className="h-5 w-5 shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-gray-900">{item.title}</span>
                          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">
                            {SOURCE_LABEL[item.source]}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
                          {item.subjectName && <span>{item.subjectName}</span>}
                          {item.materialYear && <span>{item.materialYear}년</span>}
                          {item.semester && <span>{item.semester}</span>}
                          {item.materialDate && <span>{item.materialDate.slice(0, 10)}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title="열기"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
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
                  ))}
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
