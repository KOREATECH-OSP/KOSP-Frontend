'use client';

import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
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

export default function TeamSettingsModal({
  isOpen,
  initialSettings,
  onClose,
  onSave,
}: TeamSettingsModalProps) {
  const [settings, setSettings] = useState<TeamSettings>(initialSettings);
  const [newPosition, setNewPosition] = useState('');
  const [previewImage, setPreviewImage] = useState<string | undefined>(initialSettings.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof TeamSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPosition = () => {
    if (!newPosition.trim()) {
      alert('포지션을 입력해주세요');
      return;
    }
    if (settings.positions.includes(newPosition.trim())) {
      alert('이미 추가된 포지션입니다');
      return;
    }
    setSettings((prev) => ({
      ...prev,
      positions: [...prev.positions, newPosition.trim()],
    }));
    setNewPosition('');
  };

  const handleRemovePosition = (position: string) => {
    setSettings((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p !== position),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다');
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다');
      return;
    }

    // FileReader로 미리보기
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
    if (!settings.description.trim()) {
      alert('팀 설명을 입력해주세요');
      return;
    }
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">팀 설정</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* 팀 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                팀 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="팀 이름을 입력하세요"
              />
            </div>

            {/* 팀 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                팀 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="팀에 대한 설명을 입력하세요"
              />
            </div>

            {/* 팀 이미지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                팀 이미지
              </label>
              
              {previewImage ? (
                <div className="relative">
                  <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                    <Image
                      src={previewImage}
                      alt="팀 이미지 미리보기"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    클릭하여 이미지 업로드
                  </p>
                  <p className="text-xs text-gray-500">
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