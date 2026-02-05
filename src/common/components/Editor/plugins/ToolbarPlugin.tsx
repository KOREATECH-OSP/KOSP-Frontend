'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $createParagraphNode,
} from 'lexical';
import {
  $isHeadingNode,
  $createHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListNode,
} from '@lexical/list';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $setBlocksType } from '@lexical/selection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createCodeNode } from '@lexical/code';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Minus,
  Image as ImageIcon,
  Table as TableIcon,
  FileCode,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

interface ToolbarPluginProps {
  className?: string;
  enableImage?: boolean;
  enableTable?: boolean;
  enableCodeBlock?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        'rounded-md p-1.5 transition-colors',
        isActive
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-1.5 h-5 w-px bg-gray-200" />;
}

export function ToolbarPlugin({
  className,
  enableImage = true,
  enableTable = true,
  enableCodeBlock = true,
  onImageUpload,
}: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState<string>('paragraph');
  const [isUploading, setIsUploading] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tableSize, setTableSize] = useState({ rows: 0, cols: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tablePickerRef = useRef<HTMLDivElement>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Text format states
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      // Block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }

      // Link check
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType !== headingSize) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        } else {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType !== 'quote') {
          import('@lexical/rich-text').then(({ $createQuoteNode }) => {
            editor.update(() => {
              const sel = $getSelection();
              if ($isRangeSelection(sel)) {
                $setBlocksType(sel, () => $createQuoteNode());
              }
            });
          });
        } else {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      }
    });
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const insertLink = () => {
    if (!isLink) {
      const url = prompt('URL을 입력하세요:');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  };

  const insertHorizontalRule = () => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
  };

  const insertCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType !== 'code') {
          $setBlocksType(selection, () => $createCodeNode());
        } else {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      }
    });
  };

  // 테이블 피커 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tablePickerRef.current && !tablePickerRef.current.contains(event.target as Node)) {
        setShowTablePicker(false);
        setTableSize({ rows: 0, cols: 0 });
      }
    };
    if (showTablePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTablePicker]);

  const insertTable = (rows: number, cols: number) => {
    if (rows > 0 && cols > 0) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: rows.toString(),
        columns: cols.toString(),
      });
      setShowTablePicker(false);
      setTableSize({ rows: 0, cols: 0 });
    }
  };

  const toggleTablePicker = () => {
    setShowTablePicker(!showTablePicker);
    setTableSize({ rows: 0, cols: 0 });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await onImageUpload(file);
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: url,
        altText: file.name,
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 px-2 py-1.5',
        className
      )}
    >
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => formatText('bold')}
        isActive={isBold}
        tooltip="굵게 (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatText('italic')}
        isActive={isItalic}
        tooltip="기울임 (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatText('underline')}
        isActive={isUnderline}
        tooltip="밑줄 (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatText('strikethrough')}
        isActive={isStrikethrough}
        tooltip="취소선"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatText('code')}
        isActive={isCode}
        tooltip="인라인 코드"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Headings */}
      <ToolbarButton
        onClick={() => formatHeading('h1')}
        isActive={blockType === 'h1'}
        tooltip="제목 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatHeading('h2')}
        isActive={blockType === 'h2'}
        tooltip="제목 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatHeading('h3')}
        isActive={blockType === 'h3'}
        tooltip="제목 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Lists */}
      <ToolbarButton
        onClick={formatBulletList}
        isActive={blockType === 'bullet'}
        tooltip="글머리 기호 목록"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={formatNumberedList}
        isActive={blockType === 'number'}
        tooltip="번호 매기기 목록"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={formatQuote}
        isActive={blockType === 'quote'}
        tooltip="인용"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Insert */}
      <ToolbarButton onClick={insertLink} isActive={isLink} tooltip="링크 삽입">
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton onClick={insertHorizontalRule} tooltip="구분선">
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      {enableCodeBlock && (
        <ToolbarButton
          onClick={insertCodeBlock}
          isActive={blockType === 'code'}
          tooltip="코드 블록"
        >
          <FileCode className="h-4 w-4" />
        </ToolbarButton>
      )}

      {enableTable && (
        <div className="relative" ref={tablePickerRef}>
          <ToolbarButton onClick={toggleTablePicker} isActive={showTablePicker} tooltip="표 삽입">
            <TableIcon className="h-4 w-4" />
          </ToolbarButton>

          {showTablePicker && (
            <div className="absolute left-0 top-full z-50 mt-1 w-[156px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  {tableSize.rows > 0 && tableSize.cols > 0
                    ? `${tableSize.rows} × ${tableSize.cols}`
                    : '표 크기 선택'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowTablePicker(false);
                    setTableSize({ rows: 0, cols: 0 });
                  }}
                  className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 36 }).map((_, index) => {
                  const rowIndex = Math.floor(index / 6);
                  const colIndex = index % 6;
                  const isSelected = rowIndex < tableSize.rows && colIndex < tableSize.cols;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={cn(
                        'h-5 w-5 rounded border transition-colors',
                        isSelected
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                      )}
                      onMouseEnter={() => setTableSize({ rows: rowIndex + 1, cols: colIndex + 1 })}
                      onClick={() => insertTable(rowIndex + 1, colIndex + 1)}
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                최대 6×6
              </p>
            </div>
          )}
        </div>
      )}

      {enableImage && onImageUpload && (
        <>
          <ToolbarButton
            onClick={triggerImageUpload}
            disabled={isUploading}
            tooltip="이미지 업로드"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
