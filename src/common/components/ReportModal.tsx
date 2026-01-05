'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { reportArticle } from '@/lib/api/article';
import { ReportReason } from '@/lib/api/types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: number;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: '스팸 / 부적절한 홍보' },
  { value: 'ABUSE', label: '욕설 / 비하 발언' },
  { value: 'ADVERTISEMENT', label: '상업적 광고' },
  { value: 'OBSCENE', label: '음란물 / 불건전한 만남 및 대화' },
  { value: 'OTHER', label: '기타' },
];

export default function ReportModal({ isOpen, onClose, articleId }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await reportArticle(articleId, { reason, description });
      alert('신고가 접수되었습니다.');
      onClose();
      setDescription('');
      setReason('SPAM');
    } catch (error) {
      console.error('신고 실패:', error);
      alert('신고 접수에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">게시글 신고</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">신고 사유</p>
            {REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-700">{r.label}</span>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-gray-700">상세 내용 (선택)</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="신고 사유에 대해 자세히 적어주세요."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-300 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              신고하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
