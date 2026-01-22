'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { PlateEditor } from '@/common/components/Editor';
import { updateAdminNotice } from '@/lib/api/admin';
import type { AdminNoticeUpdateRequest } from '@/types/admin';
import { toast } from '@/lib/toast';
import { clientApiClient } from '@/lib/api/client';

export default function EditNoticePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AdminNoticeUpdateRequest>({
    title: '',
    content: '',
    isPinned: false,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const fetchNotice = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      // 공지사항 상세 조회 - community API 사용
      const data = await clientApiClient<{
        id: number;
        title: string;
        content: string;
        tags: string[];
      }>(`/v1/community/articles/${id}`, {
        accessToken: session.accessToken,
        cache: 'no-store',
      });

      setFormData({
        title: data.title,
        content: data.content,
        isPinned: false,
        tags: data.tags || [],
      });
    } catch (error) {
      console.error('Failed to fetch notice:', error);
      toast.error('공지사항 정보를 불러오는데 실패했습니다.');
      router.push('/admin/contents/notices');
    } finally {
      setLoading(false);
    }
  }, [id, session?.accessToken, router]);

  useEffect(() => {
    if (id && session?.accessToken) {
      fetchNotice();
    }
  }, [id, session?.accessToken, fetchNotice]);

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
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) return;

    if (!formData.title || !formData.content) {
      toast.error('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await updateAdminNotice(Number(id), formData, { accessToken: session.accessToken });
      toast.success('공지사항이 수정되었습니다.');
      router.push('/admin/contents/notices');
    } catch (error: unknown) {
      console.error('Failed to update notice:', error);
      const errorMessage = error instanceof Error ? error.message : '공지사항 수정에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로 가기</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">공지사항 수정</h1>
          <p className="mt-0.5 text-sm text-gray-500">공지사항 내용을 수정합니다</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                disabled={submitting}
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <PlateEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="공지사항 내용을 입력하세요"
                minHeight={350}
                editable={!submitting}
                showCharacterCount={false}
                enableImage={false}
                enableTable={false}
                enableCodeBlock={false}
              />
            </div>

            {/* 상단 고정 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-400"
                disabled={submitting}
              />
              <label htmlFor="isPinned" className="text-sm text-gray-700">
                상단 고정
              </label>
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                태그
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="태그를 입력하고 엔터 또는 추가 버튼을 클릭하세요"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                  disabled={submitting}
                >
                  <Plus className="w-5 h-5" />
                  추가
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-gray-200 rounded-full p-0.5"
                        disabled={submitting}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  수정 중...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  수정 완료
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
