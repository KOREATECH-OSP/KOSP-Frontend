'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Paperclip, X } from 'lucide-react';
import { createOrganizationPost, type OrganizationPostCategory, type OrganizationPostVisibility } from '@/lib/api/organizationPost';
import { uploadFile } from '@/lib/api/upload';

interface Props {
  orgId: number;
  orgName: string;
  accessToken: string;
}

interface AttachedFile {
  file: File;
  uploading: boolean;
  url?: string;
  error?: boolean;
}

export default function OrganizationPostCreateClient({ orgId, orgName, accessToken }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<OrganizationPostCategory>('GENERAL');
  const [visibility, setVisibility] = useState<OrganizationPostVisibility>('PUBLIC');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newEntries: AttachedFile[] = files.map((f) => ({ file: f, uploading: true }));
    setAttachedFiles((prev) => [...prev, ...newEntries]);

    for (const entry of newEntries) {
      try {
        const result = await uploadFile(entry.file, { accessToken });
        setAttachedFiles((prev) =>
          prev.map((f) =>
            f.file === entry.file ? { ...f, uploading: false, url: result.url } : f
          )
        );
      } catch {
        setAttachedFiles((prev) =>
          prev.map((f) =>
            f.file === entry.file ? { ...f, uploading: false, error: true } : f
          )
        );
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removeFile(file: File) {
    setAttachedFiles((prev) => prev.filter((f) => f.file !== file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const uploadedFiles = attachedFiles
      .filter((f) => f.url)
      .map((f) => ({ fileName: f.file.name, fileUrl: f.url! }));

    setSubmitting(true);
    try {
      await createOrganizationPost(
        orgId,
        {
          category,
          visibility,
          title: title.trim(),
          description: description.trim() || undefined,
          content: content.trim(),
          files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        },
        accessToken
      );
      router.push(`/organization/${orgId}?tab=board`);
      router.refresh();
    } catch {
      alert('게시글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={`/organization/${orgId}`}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {orgName}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700">글 작성하기</span>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        {/* 카테고리 + 공개 범위 */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">카테고리</label>
            <div className="flex gap-2">
              {(['GENERAL', 'NOTICE'] as OrganizationPostCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={[
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                    category === cat
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {cat === 'GENERAL' ? '일반' : '공지'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">공개 범위</label>
            <div className="flex gap-2">
              {(['PUBLIC', 'MEMBERS_ONLY'] as OrganizationPostVisibility[]).map((vis) => (
                <button
                  key={vis}
                  type="button"
                  onClick={() => setVisibility(vis)}
                  className={[
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                    visibility === vis
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {vis === 'PUBLIC' ? '전체 공개' : '멤버 공개'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요"
            maxLength={200}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">설명 (선택)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="한 줄 설명을 입력해주세요"
            maxLength={500}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* 본문 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            본문 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력해주세요"
            rows={10}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 resize-none"
          />
        </div>

        {/* 파일 첨부 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">파일 첨부 (선택)</label>
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-6 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dt = e.dataTransfer;
              if (dt.files.length > 0) {
                const syntheticEvent = { target: { files: dt.files } } as React.ChangeEvent<HTMLInputElement>;
                handleFileSelect(syntheticEvent);
              }
            }}
          >
            <Paperclip className="h-5 w-5 text-gray-400 mb-1" />
            <p className="text-sm text-gray-400">파일을 여기에 끌어 놓거나,</p>
            <button
              type="button"
              className="mt-2 rounded-lg bg-gray-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-600 transition-colors"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              파일 선택
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {attachedFiles.length > 0 && (
            <ul className="mt-2 space-y-1">
              {attachedFiles.map((f) => (
                <li key={f.file.name + f.file.size} className="flex items-center gap-2 text-sm">
                  <span className={[
                    'flex-1 truncate',
                    f.error ? 'text-red-500' : f.uploading ? 'text-gray-400' : 'text-gray-700',
                  ].join(' ')}>
                    {f.file.name}
                    {f.uploading && ' (업로드 중...)'}
                    {f.error && ' (실패)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.file)}
                    className="shrink-0 text-gray-400 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-2">
          <Link
            href={`/organization/${orgId}`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim() || attachedFiles.some((f) => f.uploading)}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
