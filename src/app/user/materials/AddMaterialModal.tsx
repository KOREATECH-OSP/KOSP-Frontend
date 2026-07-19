'use client';

import { useState, useRef } from 'react';
import { X, Upload, Plus, Loader2, Paperclip } from 'lucide-react';
import type { MaterialItemResponse, MaterialSource, MaterialVisibility } from '@/lib/api/types';
import { createMaterialItem } from '@/lib/api/material';
import { uploadFile } from '@/lib/api/upload';

interface Props {
  folderId: number;
  onClose: () => void;
  onCreated: (item: MaterialItemResponse) => void;
  auth: { accessToken: string };
}

const SOURCE_OPTIONS: { value: MaterialSource; label: string }[] = [
  { value: 'AUNURI_ASSIGNMENT', label: '과제' },
  { value: 'AUNURI_EL', label: 'EL 자료' },
  { value: 'MANUAL', label: '기타 업로드' },
];

const SEMESTER_OPTIONS = ['1학기', '여름학기', '2학기', '겨울학기'];

/**
 * 학습자료 등록 모달.
 * 연도/학기/과목/출처(과제·EL)를 지정하고, 파일 업로드 또는 아우누리 원본 링크로 등록한다.
 */
export default function AddMaterialModal({ folderId, onClose, onCreated, auth }: Props) {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<MaterialSource>('AUNURI_ASSIGNMENT');
  const [subjectName, setSubjectName] = useState('');
  const [materialYear, setMaterialYear] = useState('');
  const [semester, setSemester] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [visibility, setVisibility] = useState<'INHERIT' | MaterialVisibility>('INHERIT');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    (title.trim() || file) && !saving && (file || sourceUrl.trim());

  const submit = async () => {
    setError(null);
    if (!file && !sourceUrl.trim()) {
      setError('파일을 첨부하거나 원본 링크를 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      let fileUrl: string | undefined;
      let originalFileName: string | undefined;
      let fileSize: number | undefined;
      let contentType: string | undefined;

      if (file) {
        const uploaded = await uploadFile(file, auth);
        fileUrl = uploaded.url;
        originalFileName = file.name;
        fileSize = file.size;
        contentType = file.type || 'application/octet-stream';
      }

      const created = await createMaterialItem(
        {
          folderId,
          title: title.trim() || file?.name || '제목 없음',
          subjectName: subjectName.trim() || null,
          materialYear: materialYear ? Number(materialYear) : null,
          semester: semester || null,
          source,
          sourceUrl: sourceUrl.trim() || null,
          fileUrl: fileUrl ?? null,
          originalFileName: originalFileName ?? null,
          fileSize: fileSize ?? null,
          contentType: contentType ?? null,
          visibility: visibility === 'INHERIT' ? null : visibility,
        },
        auth,
      );
      onCreated(created);
    } catch {
      setError('자료 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">자료 추가</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {/* 출처 */}
          <div>
            <label className="mb-1 block text-sm text-gray-600">구분</label>
            <div className="flex gap-1.5">
              {SOURCE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setSource(o.value)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-sm transition
                    ${source === o.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* 자료명 */}
          <div>
            <label className="mb-1 block text-sm text-gray-600">자료명</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 운영체제 3주차 과제"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              autoFocus
            />
          </div>

          {/* 과목명 */}
          <div>
            <label className="mb-1 block text-sm text-gray-600">과목명</label>
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="예: 운영체제"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* 연도 / 학기 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm text-gray-600">연도</label>
              <input
                type="number"
                value={materialYear}
                onChange={(e) => setMaterialYear(e.target.value)}
                placeholder="예: 2026"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">학기</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
              >
                <option value="">선택 안 함</option>
                {SEMESTER_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 원본 링크 */}
          <div>
            <label className="mb-1 block text-sm text-gray-600">아우누리 원본 링크 (선택)</label>
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* 파일 첨부 */}
          <div>
            <label className="mb-1 block text-sm text-gray-600">파일 (선택)</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-gray-400"
            >
              <Paperclip className="h-4 w-4" />
              {file ? file.name : '파일 선택'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* 공개 범위 */}
          <div>
            <label className="mb-1 block text-sm text-gray-600">공개 범위</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'INHERIT' | MaterialVisibility)}
              className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
            >
              <option value="INHERIT">폴더 설정 따름</option>
              <option value="PRIVATE">비공개</option>
              <option value="PUBLIC">공개</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : file ? <Upload className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
