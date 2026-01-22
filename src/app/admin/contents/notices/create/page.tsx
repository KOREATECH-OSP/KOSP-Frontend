'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Plus, X, Loader2 } from 'lucide-react';
import { PlateEditor } from '@/common/components/Editor';
import { createAdminNotice } from '@/lib/api/admin';
import type { AdminNoticeCreateRequest } from '@/types/admin';
import { toast } from '@/lib/toast';

export default function CreateNoticePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<AdminNoticeCreateRequest>({
    title: '',
    content: '',
    isPinned: false,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isComposingRef = useRef(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!formData.title || !formData.content) {
      toast.error('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await createAdminNotice(formData, { accessToken: session.accessToken });
      toast.success('공지사항이 작성되었습니다.');
      router.push('/admin/contents/notices');
    } catch (err) {
      console.error('Failed to create notice:', err);
      toast.error('공지사항 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="px-6 pb-6 md:px-8 md:pb-8">
      <div className="mx-auto max-w-3xl">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </button>
          <h1 className="text-2xl font-bold text-gray-900">공지사항 작성</h1>
          <p className="mt-1 text-sm text-gray-500">새로운 공지사항을 작성합니다</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">기본 정보</h2>

            <div className="space-y-5">
              {/* 제목 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  내용 <span className="text-red-500">*</span>
                </label>
                <PlateEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="공지사항 내용을 입력하세요"
                  minHeight={300}
                  editable={!submitting}
                  showCharacterCount={false}
                  enableImage={false}
                  enableTable={false}
                  enableCodeBlock={false}
                />
              </div>

              {/* 상단 고정 */}
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900"
                  disabled={submitting}
                />
                <label htmlFor="isPinned" className="cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">상단 고정</span>
                  <p className="text-xs text-gray-500">이 공지사항을 목록 상단에 고정합니다</p>
                </label>
              </div>
            </div>
          </div>

          {/* 태그 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">태그</h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing || isComposingRef.current) return;
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  onCompositionStart={() => {
                    isComposingRef.current = true;
                  }}
                  onCompositionEnd={() => {
                    isComposingRef.current = false;
                  }}
                  placeholder="태그를 입력하고 엔터 또는 추가 버튼을 클릭하세요"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  disabled={submitting}
                >
                  <Plus className="h-4 w-4" />
                  추가
                </button>
              </div>

              {formData.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="rounded-full p-0.5 transition-colors hover:bg-gray-200"
                        disabled={submitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">추가된 태그가 없습니다</p>
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  작성 중...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  공지사항 작성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
