/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { PlateEditor } from '@/common/components/Editor';

interface RecruitmentData {
  title: string;
  content: string;
  positionTags: string[];
  generalTags: string[];
  recruitmentPeriod: {
    start: string;
    end: string;
  };
}

interface RecruitmentEditModalProps {
  isOpen: boolean;
  initialData: RecruitmentData;
  onClose: () => void;
  onSave: (data: RecruitmentData) => void;
}

export default function RecruitmentEditModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: RecruitmentEditModalProps) {
  const [data, setData] = useState<RecruitmentData>(initialData);
  const [newPositionTag, setNewPositionTag] = useState('');
  const [newGeneralTag, setNewGeneralTag] = useState('');

  if (!isOpen) return null;

  const handleChange = (field: keyof RecruitmentData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPositionTag = () => {
    if (!newPositionTag.trim()) {
      alert('포지션을 입력해주세요');
      return;
    }
    if (data.positionTags.includes(newPositionTag.trim())) {
      alert('이미 추가된 포지션입니다');
      return;
    }
    setData((prev) => ({
      ...prev,
      positionTags: [...prev.positionTags, newPositionTag.trim()],
    }));
    setNewPositionTag('');
  };

  const handleRemovePositionTag = (tag: string) => {
    setData((prev) => ({
      ...prev,
      positionTags: prev.positionTags.filter((t) => t !== tag),
    }));
  };

  const handleAddGeneralTag = () => {
    if (!newGeneralTag.trim()) {
      alert('태그를 입력해주세요');
      return;
    }
    if (data.generalTags.includes(newGeneralTag.trim())) {
      alert('이미 추가된 태그입니다');
      return;
    }
    setData((prev) => ({
      ...prev,
      generalTags: [...prev.generalTags, newGeneralTag.trim()],
    }));
    setNewGeneralTag('');
  };

  const handleRemoveGeneralTag = (tag: string) => {
    setData((prev) => ({
      ...prev,
      generalTags: prev.generalTags.filter((t) => t !== tag),
    }));
  };

  const handleSave = () => {
    if (!data.title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }
    if (!data.content.trim()) {
      alert('내용을 입력해주세요');
      return;
    }
    if (!data.recruitmentPeriod.start || !data.recruitmentPeriod.end) {
      alert('모집 기간을 입력해주세요');
      return;
    }
    if (new Date(data.recruitmentPeriod.start) > new Date(data.recruitmentPeriod.end)) {
      alert('시작일은 종료일보다 이전이어야 합니다');
      return;
    }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">모집 공고 수정</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="공고 제목을 입력하세요"
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <PlateEditor
                content={data.content}
                onChange={(content) => handleChange('content', content)}
                placeholder="모집 내용을 입력하세요"
                minHeight={250}
                showCharacterCount={false}
                enableImage={false}
                enableTable={false}
                enableCodeBlock={false}
              />
            </div>

            {/* 모집 포지션 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모집 포지션
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newPositionTag}
                  onChange={(e) => setNewPositionTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPositionTag()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="포지션 입력 (예: 프론트엔드)"
                />
                <button
                  onClick={handleAddPositionTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.positionTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md border border-blue-200"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemovePositionTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              {data.positionTags.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  추가된 포지션이 없습니다
                </p>
              )}
            </div>

            {/* 일반 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                태그
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newGeneralTag}
                  onChange={(e) => setNewGeneralTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGeneralTag()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="태그 입력 (예: React)"
                />
                <button
                  onClick={handleAddGeneralTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.generalTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveGeneralTag(tag)}
                      className="hover:text-gray-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              {data.generalTags.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  추가된 태그가 없습니다
                </p>
              )}
            </div>

            {/* 모집 기간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모집 기간 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">시작일</label>
                  <input
                    type="date"
                    value={data.recruitmentPeriod.start}
                    onChange={(e) =>
                      handleChange('recruitmentPeriod', {
                        ...data.recruitmentPeriod,
                        start: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">종료일</label>
                  <input
                    type="date"
                    value={data.recruitmentPeriod.end}
                    onChange={(e) =>
                      handleChange('recruitmentPeriod', {
                        ...data.recruitmentPeriod,
                        end: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}