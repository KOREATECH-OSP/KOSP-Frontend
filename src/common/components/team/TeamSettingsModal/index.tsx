'use client';

import { useState, useRef } from 'react';
import { X, Upload, Plus, Users } from 'lucide-react';
import Image from 'next/image';

interface TeamSettings {
  name: string;
  description: string;
  imageUrl?: string;
  positions: string[];
}

interface TeamSettingsModalProps {
  isOpen: boolean;
  initialSettings: TeamSettings;
  onClose: () => void;
  onSave: (settings: TeamSettings) => void;
}

const POSITION_OPTIONS = [
  '프론트엔드',
  '백엔드',
  'DevOps',
  'AI/ML',
  '디자인',
  'PM',
  'QA',
];

function TeamSettingsModalContent({
  initialSettings,
  onClose,
  onSave,
}: Omit<TeamSettingsModalProps, 'isOpen'>) {
  const [settings, setSettings] = useState<TeamSettings>(initialSettings);
  const [customPosition, setCustomPosition] = useState('');
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    initialSettings.imageUrl
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof TeamSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPosition = (position: string) => {
    if (!settings.positions.includes(position)) {
      setSettings((prev) => ({
        ...prev,
        positions: [...prev.positions, position],
      }));
    }
  };

  const handleRemovePosition = (position: string) => {
    setSettings((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p !== position),
    }));
  };

  const handleAddCustomPosition = () => {
    if (customPosition.trim() && !settings.positions.includes(customPosition.trim())) {
      setSettings((prev) => ({
        ...prev,
        positions: [...prev.positions, customPosition.trim()],
      }));
      setCustomPosition('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      setSettings((prev) => ({ ...prev, imageUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(undefined);
    setSettings((prev) => ({ ...prev, imageUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!settings.name.trim()) {
      alert('팀 이름을 입력해주세요');
      return;
    }
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">팀 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* 팀 이름 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                팀 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="팀 이름을 입력하세요"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>

            {/* 팀 소개 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                팀 소개
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="팀에 대해 소개해주세요"
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none"
              />
            </div>

            {/* 모집 포지션 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                모집 포지션
              </label>

              {/* 선택된 포지션 */}
              {settings.positions.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {settings.positions.map((position) => (
                    <span
                      key={position}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-600"
                    >
                      {position}
                      <button
                        type="button"
                        onClick={() => handleRemovePosition(position)}
                        className="ml-0.5 rounded-full p-0.5 transition hover:bg-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 포지션 선택 버튼들 */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {POSITION_OPTIONS.filter(
                  (p) => !settings.positions.includes(p)
                ).map((position) => (
                  <button
                    key={position}
                    type="button"
                    onClick={() => handleAddPosition(position)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    {position}
                  </button>
                ))}
              </div>

              {/* 커스텀 포지션 추가 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomPosition();
                    }
                  }}
                  placeholder="직접 입력"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPosition}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-gray-500 transition hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 팀 이미지 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                팀 이미지
              </label>

              {previewImage ? (
                <div className="relative">
                  <div className="relative h-40 w-full overflow-hidden rounded-xl border border-gray-200">
                    <Image
                      src={previewImage}
                      alt="팀 이미지 미리보기"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={handleRemoveImage}
                    className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white transition hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-8 transition hover:border-gray-300 hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">클릭하여 이미지 업로드</p>
                  <p className="mt-1 text-xs text-gray-400">
                    JPG, PNG, GIF (최대 5MB)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamSettingsModal({
  isOpen,
  initialSettings,
  onClose,
  onSave,
}: TeamSettingsModalProps) {
  if (!isOpen) return null;

  // initialSettings를 key로 사용하여 props 변경 시 컴포넌트 리마운트
  const settingsKey = JSON.stringify(initialSettings);

  return (
    <TeamSettingsModalContent
      key={settingsKey}
      initialSettings={initialSettings}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
