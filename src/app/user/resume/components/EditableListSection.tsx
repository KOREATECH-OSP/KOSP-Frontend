'use client';

import { Plus, Trash2 } from 'lucide-react';

export interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  span?: 'full' | 'half';
  select?: { value: string; label: string }[];
  tags?: boolean;
}

interface EditableListSectionProps<T extends { id: string }> {
  title: string;
  icon: React.ReactNode;
  items: T[];
  fields: FieldDef[];
  addLabel?: string;
  emptyMessage?: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, key: string, value: string) => void;
  draftBadge?: boolean;
}

/**
 * 링크/학력/경력/경험 등 여러 항목을 추가·수정·삭제할 수 있는 공통 섹션 컴포넌트.
 * `fields` 배열로 각 항목의 입력 필드를 정의한다.
 */
export default function EditableListSection<T extends { id: string }>({
  title,
  icon,
  items,
  fields,
  addLabel = '항목 추가',
  emptyMessage = '아직 항목이 없습니다.',
  onAdd,
  onRemove,
  onUpdate,
  draftBadge = true,
}: EditableListSectionProps<T>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          {icon}
          {title}
          {draftBadge && (
            <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200">
              임시저장
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>

      {/* 항목 목록 */}
      <div className="divide-y divide-gray-200">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group relative px-6 py-4">
              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="항목 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {/* 필드 그리드 */}
              <div className="grid grid-cols-2 gap-3 pr-8">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.span === 'full' || field.multiline ? 'col-span-2' : 'col-span-1'}
                  >
                    <label className="mb-1 block text-[11px] font-medium text-gray-400">
                      {field.label}
                    </label>
                    {field.select ? (
                      <select
                        value={(item as Record<string, string>)[field.key] ?? ''}
                        onChange={(e) => onUpdate(item.id, field.key, e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                      >
                        {field.placeholder && (
                          <option value="" disabled>{field.placeholder}</option>
                        )}
                        {field.select.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.tags ? (
                      <input
                        type="text"
                        value={(() => {
                          const raw = (item as Record<string, unknown>)[field.key];
                          return Array.isArray(raw) ? (raw as string[]).join(', ') : (raw as string) ?? '';
                        })()}
                        placeholder={field.placeholder}
                        onChange={(e) => onUpdate(item.id, field.key, e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                      />
                    ) : field.multiline ? (
                      <textarea
                        rows={3}
                        value={(item as Record<string, string>)[field.key] ?? ''}
                        placeholder={field.placeholder}
                        onChange={(e) => onUpdate(item.id, field.key, e.target.value)}
                        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                      />
                    ) : (
                      <input
                        type="text"
                        value={(item as Record<string, string>)[field.key] ?? ''}
                        placeholder={field.placeholder}
                        onChange={(e) => onUpdate(item.id, field.key, e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
