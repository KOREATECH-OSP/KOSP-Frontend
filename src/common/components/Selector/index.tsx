'use client';

import { useState, useRef, useEffect } from 'react';

export interface SelectorOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface CustomSelectorProps {
  id?: string;
  name?: string;
  value: string | number;
  onChange: (value: string | number, name?: string) => void;
  options: SelectorOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

function CustomSelector({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  label,
  required = false,
  error,
  disabled = false,
  className = ''
}: CustomSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 선택된 옵션 찾기
  const selectedOption = options.find(option => option.value === value);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: SelectorOption) => {
    if (!option.disabled) {
      onChange(option.value, name);
      setIsOpen(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-900 mb-3"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div ref={dropdownRef} className="relative">
        {/* 선택 버튼 */}
        <button
          type="button"
          id={id}
          onClick={handleToggle}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg transition-all flex items-center justify-between ${
            error
              ? 'border-red-300 bg-red-50'
              : isOpen
              ? 'border-blue-500 ring-2 ring-blue-500'
              : 'border-gray-300'
          } ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed text-gray-500'
              : 'bg-white cursor-pointer hover:border-gray-400'
          }`}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <svg
            className={`w-5 h-5 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            } ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                선택 가능한 옵션이 없습니다
              </div>
            ) : (
              <ul className="py-1">
                {options.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option)}
                      disabled={option.disabled}
                      className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                        option.disabled
                          ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                          : option.value === value
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span>{option.label}</span>
                      {option.value === value && (
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default CustomSelector;