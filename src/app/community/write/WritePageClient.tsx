'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, X, Loader2, Paperclip } from 'lucide-react';
import { TiptapEditor } from '@/common/components/Editor';
import { useImageUpload } from '@/common/components/Editor/hooks/useImageUpload';
import { uploadFile } from '@/lib/api/upload';
import { createArticle, updateArticle } from '@/lib/api/article';
import { toast } from '@/lib/toast';
import type { BoardResponse, ArticleResponse } from '@/lib/api/types';

interface WritePageClientProps {
  boards: BoardResponse[];
  initialData?: ArticleResponse;
}

interface PostFormData {
  boardId: number;
  title: string;
  content: string;
  tags: string[];
  files: File[];
}

/**
 * HTML 태그를 제거하고 텍스트만 추출
 * 주의: 이 함수는 사용자 입력 검증용으로만 사용되며, DOM에 삽입되지 않음
 */
function stripHtml(html: string): string {
  if (typeof document === 'undefined') return html;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  tmp.remove();
  return text;
}

export default function WritePageClient({ boards, initialData }: WritePageClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { upload: uploadImage } = useImageUpload();
  const isEditMode = !!initialData;

  const availableBoards = boards.filter((board) => board.name !== '공지사항');

  const [formData, setFormData] = useState<PostFormData>({
    boardId: initialData?.boardId ?? availableBoards[0]?.id ?? 0,
    title: initialData?.title ?? '',
    content: initialData?.content ?? '',
    tags: initialData?.tags ?? [],
    files: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PostFormData, string>>>({});
  const isComposingRef = useRef(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof PostFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleContentChange = (html: string) => {
    setFormData((prev) => ({ ...prev, content: html }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: '' }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || isComposingRef.current) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleTagCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleTagCompositionEnd = () => {
    isComposingRef.current = false;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (formData.files.length + files.length > 5) {
      alert('파일은 최대 5개까지 업로드 가능합니다.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      alert('각 파일의 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PostFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    } else if (formData.title.length < 2) {
      newErrors.title = '제목은 최소 2자 이상이어야 합니다';
    }

    const contentText = stripHtml(formData.content).trim();
    if (!contentText) {
      newErrors.content = '내용을 입력해주세요';
    } else if (contentText.length < 10) {
      newErrors.content = '내용은 최소 10자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const auth = { accessToken: session.accessToken };
    setIsSubmitting(true);

    try {
      const attachmentIds: number[] = [];
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          const uploaded = await uploadFile(file, { accessToken: session.accessToken });
          attachmentIds.push(uploaded.id);
        }
      }

      const payload = {
        boardId: formData.boardId,
        title: formData.title,
        content: formData.content,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      };

      if (isEditMode && initialData) {
        await updateArticle(initialData.id, payload, auth);
        toast.success('게시글이 수정되었습니다.');
        router.push(`/community/${initialData.id}`);
      } else {
        await createArticle(payload, auth);
        toast.success('게시글이 등록되었습니다.');
        router.push('/community');
      }

    } catch (error) {
      console.error('게시글 저장 실패:', error);
      const message = error instanceof Error ? error.message : '게시글 저장에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          돌아가기
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? '게시글 수정' : '글쓰기'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 게시판 선택 */}
        <div>
          <label className="mb-2 block text-sm text-gray-500">게시판</label>
          <div className="flex flex-wrap gap-2">
            {availableBoards.map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, boardId: board.id }))}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  formData.boardId === board.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {board.name}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label htmlFor="title" className="mb-2 block text-sm text-gray-500">
            제목
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="제목을 입력하세요"
            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none ${
              errors.title
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* 내용 */}
        <div>
          <label className="mb-2 block text-sm text-gray-500">내용</label>
          <TiptapEditor
            content={formData.content}
            onChange={handleContentChange}
            placeholder="내용을 입력하세요"
            minHeight={300}
            showCharacterCount
            onImageUpload={uploadImage}
            error={!!errors.content}
            errorMessage={errors.content}
          />
        </div>

        {/* 태그 */}
        <div>
          <label className="mb-2 block text-sm text-gray-500">
            태그 <span className="text-gray-400">(최대 5개)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onCompositionStart={handleTagCompositionStart}
              onCompositionEnd={handleTagCompositionEnd}
              placeholder="태그 입력 후 Enter"
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:bg-white focus:border-gray-300 focus:outline-none"
              disabled={formData.tags.length >= 5}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || formData.tags.length >= 5}
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-200 disabled:opacity-50"
            >
              추가
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 파일 첨부 */}
        <div>
          <label className="mb-2 block text-sm text-gray-500">첨부파일</label>
          <label
            htmlFor="file-upload"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600"
          >
            <Paperclip className="h-4 w-4" strokeWidth={1.5} />
            파일 선택
            <span className="text-xs text-gray-400">(최대 5개, 각 10MB)</span>
          </label>

          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          />

          {formData.files.length > 0 && (
            <div className="mt-3 space-y-2">
              {formData.files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-sm text-gray-600">
                      {file.name}
                    </span>
                    <span className="flex-shrink-0 text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg py-3 text-sm text-gray-500 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                {isEditMode ? '수정 중...' : '등록 중...'}
              </>
            ) : (
              isEditMode ? '수정' : '등록'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
