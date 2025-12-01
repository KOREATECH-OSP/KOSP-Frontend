'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import CustomSelector, { SelectorOption } from '@/common/components/Selector';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  category: 'study' | 'project' | 'competition' | 'networking';
}

interface RecruitFormData {
  title: string;
  teamId: number | string;
  content: string;
  tags: string[];
  positions: string[];
  startDate: string;
  endDate: string;
  files: File[];
}

export default function CreateRecruitPage() {
  const [myTeams] = useState<Team[]>([
    { id: 1, name: 'React 스터디 그룹', category: 'study' },
    { id: 2, name: '오픈소스 컨트리뷰션 팀', category: 'project' },
    { id: 3, name: 'AI 해커톤 팀', category: 'competition' }
  ]);

  const [formData, setFormData] = useState<RecruitFormData>({
    title: '',
    teamId: '',
    content: '',
    tags: [],
    positions: [],
    startDate: '',
    endDate: '',
    files: []
  });

  const [tagInput, setTagInput] = useState('');
  const [positionInput, setPositionInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RecruitFormData, string>>>({});

  const teamOptions: SelectorOption[] = myTeams.map(team => ({
    value: team.id,
    label: team.name
  }));

  const handleSelectorChange = (value: string | number, name?: string) => {
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name as keyof RecruitFormData]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof RecruitFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 태그 추가 - 수정됨
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag) return;
    
    if (formData.tags.includes(trimmedTag)) {
      alert('이미 추가된 태그입니다.');
      setTagInput('');
      return;
    }
    
    if (formData.tags.length >= 5) {
      alert('태그는 최대 5개까지 추가할 수 있습니다.');
      return;
    }
    
    setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 태그 Enter 키 - 수정됨
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 포지션 추가 - 수정됨
  const handleAddPosition = () => {
    const trimmedPosition = positionInput.trim();
    
    if (!trimmedPosition) return;
    
    if (formData.positions.includes(trimmedPosition)) {
      alert('이미 추가된 포지션입니다.');
      setPositionInput('');
      return;
    }
    
    if (formData.positions.length >= 10) {
      alert('포지션은 최대 10개까지 추가할 수 있습니다.');
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      positions: [...prev.positions, trimmedPosition] 
    }));
    setPositionInput('');
  };

  const handleRemovePosition = (positionToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter(pos => pos !== positionToRemove)
    }));
  };

  // 포지션 Enter 키 - 수정됨
  const handlePositionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPosition();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (formData.files.length + files.length > 5) {
      alert('파일은 최대 5개까지 업로드 가능합니다.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('각 파일의 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RecruitFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }

    if (!formData.teamId) {
      newErrors.teamId = '팀을 선택해주세요';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    }

    if (formData.positions.length === 0) {
      newErrors.positions = '최소 1개 이상의 모집 포지션을 입력해주세요';
    }

    if (!formData.startDate) {
      newErrors.startDate = '모집 시작일을 선택해주세요';
    }

    if (!formData.endDate) {
      newErrors.endDate = '모집 마감일을 선택해주세요';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '모집 마감일은 시작일 이후여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('제출할 데이터:', {
        ...formData,
        files: formData.files.map(f => ({ name: f.name, size: f.size }))
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('팀원 모집글이 성공적으로 등록되었습니다!');
      
    } catch (error) {
      console.error('Error submitting recruit:', error);
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="flex flex-col max-w-4xl mx-auto px-4 py-8 w-full">
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">팀원 모집하기</h1>
          <p className="text-gray-600">함께 성장할 팀원을 모집해보세요</p>
        </div> */}
        <div className="mb-8">
          <Link
            href="/recruit"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">팀원 모집하기</h1>
          <p className="text-sm sm:text-base text-gray-600">
            함께 성장할 팀원을 모집해보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-3">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="모집 제목을 입력하세요 (예: React 개발자 2명 모집합니다)"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          {/* 팀 선택 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <CustomSelector
              id="teamId"
              name="teamId"
              value={formData.teamId}
              onChange={handleSelectorChange}
              options={teamOptions}
              placeholder="팀을 선택하세요"
              label="팀 선택"
              required
              error={errors.teamId}
            />
          </div>

          {/* 내용 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label htmlFor="content" className="block text-sm font-semibold text-gray-900 mb-3">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="팀 소개, 모집 배경, 활동 내용 등을 자세히 작성해주세요"
              rows={12}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.content && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.content}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-500">
              {formData.content.length} / 5000자
            </div>
          </div>

          {/* 모집 포지션 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label htmlFor="positions" className="block text-sm font-semibold text-gray-900 mb-3">
              모집 포지션 <span className="text-red-500">*</span> (최대 10개)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                id="positions"
                value={positionInput}
                onChange={(e) => setPositionInput(e.target.value)}
                onKeyDown={handlePositionKeyDown}
                placeholder="예: Frontend 개발자, Backend 개발자, UI/UX 디자이너"
                disabled={formData.positions.length >= 10}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleAddPosition}
                disabled={formData.positions.length >= 10 || !positionInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                추가
              </button>
            </div>
            
            {formData.positions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.positions.map((position, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                  >
                    {position}
                    <button
                      type="button"
                      onClick={() => handleRemovePosition(position)}
                      className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.positions && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.positions}
              </p>
            )}
          </div>

          {/* 모집 기간 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              모집 기간 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm text-gray-600 mb-2">
                  시작일
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-2 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm text-gray-600 mb-2">
                  마감일
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-2 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* 태그 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label htmlFor="tags" className="block text-sm font-semibold text-gray-900 mb-3">
              태그 (최대 5개)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="예: React, TypeScript, 스터디"
                disabled={formData.tags.length >= 5}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={formData.tags.length >= 5 || !tagInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                추가
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 파일 첨부 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              파일 첨부 (최대 5개, 각 10MB 이하)
            </label>
            
            <div className="mb-4">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                파일 선택
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
              />
            </div>

            {formData.files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  첨부된 파일 ({formData.files.length}/5)
                </p>
                {formData.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  등록 중...
                </>
              ) : (
                '등록하기'
              )}
            </button>
          </div>
        </form>

        {/* 안내 메시지 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">팀원 모집 가이드</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 모집하려는 포지션을 명확하게 작성해주세요</li>
                <li>• 팀의 목표와 활동 계획을 구체적으로 설명해주세요</li>
                <li>• 필요한 역량이나 기술 스택을 함께 안내하면 좋습니다</li>
                <li>• 모집 기간을 적절히 설정하여 충분한 지원을 받을 수 있도록 하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
}