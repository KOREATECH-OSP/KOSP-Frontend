'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, X, Loader2, Paperclip, ChevronDown } from 'lucide-react';
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
  const [isBoardSelectorOpen, setIsBoardSelectorOpen] = useState(false);

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
    <div className="flex h-screen w-full bg-white flex-col">
      {/* Main Editor Area - Centered Single Column */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="mx-auto max-w-[800px] px-6 py-12 md:py-16">
          {/* Title */}
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="제목을 입력하세요"
            className="w-full border-none bg-transparent p-0 text-3xl md:text-5xl font-bold placeholder:text-gray-200 focus:ring-0 focus:outline-none mb-6 tracking-tight leading-tight"
            autoComplete="off"
          />

          {/* Tags - Minimal & Elegant */}
          <div className="flex flex-wrap items-center gap-2 mb-8 min-h-[32px]">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100"
              >
                <span className="font-medium text-gray-500">#</span>
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-400 hover:text-gray-600 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onCompositionStart={handleTagCompositionStart}
              onCompositionEnd={handleTagCompositionEnd}
              placeholder={formData.tags.length === 0 ? "태그를 입력하세요 (Enter)" : ""}
              disabled={formData.tags.length >= 5}
              className="min-w-[150px] bg-transparent py-1 text-base text-gray-600 placeholder:text-gray-300 focus:outline-none"
            />
          </div>

          {/* Board Select (Elegant Dropdown) */}
          <div className="relative mb-8 group z-50">
            <button
              type="button"
              onClick={() => setIsBoardSelectorOpen(!isBoardSelectorOpen)}
              className="flex items-center gap-2 text-lg font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <span>게시판:</span>
              <span className={`text-gray-900 underline decoration-gray-300 underline-offset-4 decoration-2 group-hover:decoration-gray-900 transition-all`}>
                {availableBoards.find(b => b.id === formData.boardId)?.name || "선택해주세요"}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isBoardSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBoardSelectorOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsBoardSelectorOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 animate-fadeIn">
                  {availableBoards.map((board) => (
                    <button
                      key={board.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, boardId: board.id }));
                        setIsBoardSelectorOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${formData.boardId === board.id
                        ? 'bg-gray-50 text-gray-900 font-bold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      {board.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Editor */}
          <TiptapEditor
            content={formData.content}
            onChange={handleContentChange}
            placeholder=""
            minHeight={500}
            showCharacterCount={false}
            onImageUpload={uploadImage}
            error={!!errors.content}
            errorMessage={errors.content}
            className="prose-lg md:prose-xl focus:outline-none max-w-none prose-p:text-gray-700 prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
          />

          {/* File Attachments */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <label
              htmlFor="file-upload"
              className="inline-flex cursor-pointer items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors group"
            >
              <div className="p-2 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
                <Paperclip className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">파일 첨부</span>
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
              <div className="mt-4 grid gap-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm w-full sm:w-auto self-start">
                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-medium text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                    </div>
                    <button onClick={() => handleRemoveFile(index)} className="text-gray-300 hover:text-gray-500 ml-2">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer - Ghost Style (Clean) */}
      <div className="h-20 px-6 md:px-12 flex items-center justify-between bg-white/80 backdrop-blur-md border-t border-gray-100 z-50 transition-all">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 px-2 py-2 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>나가기</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-full transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                발행 중...
              </span>
            ) : (
              '발행하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
