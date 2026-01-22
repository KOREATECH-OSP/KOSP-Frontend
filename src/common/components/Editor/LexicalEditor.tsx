'use client';

import { useState, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

import { $generateHtmlFromNodes } from '@lexical/html';
import { $getRoot, EditorState, LexicalEditor as LexicalEditorType } from 'lexical';

import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import { InitialContentPlugin } from './plugins/InitialContentPlugin';
import { ImageNode } from './nodes/ImageNode';
import { cn } from '@/lib/utils';
import './styles/lexical-editor.css';

export interface LexicalEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: number;
  maxHeight?: number;
  maxCharacters?: number;
  showCharacterCount?: boolean;
  enableImage?: boolean;
  enableTable?: boolean;
  enableCodeBlock?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
  toolbarClassName?: string;
  error?: boolean;
  errorMessage?: string;
}

const theme = {
  paragraph: 'lexical-paragraph',
  heading: {
    h1: 'lexical-h1',
    h2: 'lexical-h2',
    h3: 'lexical-h3',
  },
  text: {
    bold: 'lexical-bold',
    italic: 'lexical-italic',
    underline: 'lexical-underline',
    strikethrough: 'lexical-strikethrough',
    code: 'lexical-code',
  },
  list: {
    ul: 'lexical-ul',
    ol: 'lexical-ol',
    listitem: 'lexical-li',
    nested: {
      listitem: 'lexical-nested-li',
    },
  },
  link: 'lexical-link',
  quote: 'lexical-quote',
  code: 'lexical-code-block',
  codeHighlight: {
    atrule: 'lexical-tokenAttr',
    attr: 'lexical-tokenAttr',
    boolean: 'lexical-tokenProperty',
    builtin: 'lexical-tokenSelector',
    cdata: 'lexical-tokenComment',
    char: 'lexical-tokenSelector',
    class: 'lexical-tokenFunction',
    'class-name': 'lexical-tokenFunction',
    comment: 'lexical-tokenComment',
    constant: 'lexical-tokenProperty',
    deleted: 'lexical-tokenProperty',
    doctype: 'lexical-tokenComment',
    entity: 'lexical-tokenOperator',
    function: 'lexical-tokenFunction',
    important: 'lexical-tokenVariable',
    inserted: 'lexical-tokenSelector',
    keyword: 'lexical-tokenAttr',
    namespace: 'lexical-tokenVariable',
    number: 'lexical-tokenProperty',
    operator: 'lexical-tokenOperator',
    prolog: 'lexical-tokenComment',
    property: 'lexical-tokenProperty',
    punctuation: 'lexical-tokenPunctuation',
    regex: 'lexical-tokenVariable',
    selector: 'lexical-tokenSelector',
    string: 'lexical-tokenSelector',
    symbol: 'lexical-tokenProperty',
    tag: 'lexical-tokenProperty',
    url: 'lexical-tokenOperator',
    variable: 'lexical-tokenVariable',
  },
  image: 'lexical-image',
  table: 'lexical-table',
  tableCell: 'lexical-table-cell',
  tableCellHeader: 'lexical-table-cell-header',
  tableRow: 'lexical-table-row',
};

function onError(error: Error) {
  console.error('Lexical error:', error);
}

export default function LexicalEditor({
  content,
  onChange,
  placeholder = "내용을 입력하세요...",
  editable = true,
  minHeight = 300,
  maxHeight,
  showCharacterCount = true,
  maxCharacters,
  enableImage = true,
  enableTable = true,
  enableCodeBlock = true,
  onImageUpload,
  className = '',
  toolbarClassName = '',
  error = false,
  errorMessage,
}: LexicalEditorProps) {
  const [characterCount, setCharacterCount] = useState(0);

  const initialConfig = {
    namespace: 'LexicalEditor',
    theme,
    onError,
    editable,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HorizontalRuleNode,
      ImageNode,
    ],
  };

  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditorType) => {
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        setCharacterCount(textContent.length);

        // Generate HTML
        const html = $generateHtmlFromNodes(editor);
        onChange(html);
      });
    },
    [onChange]
  );

  return (
    <div className={cn('lexical-editor-wrapper', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin
          className={toolbarClassName}
          enableImage={enableImage}
          enableTable={enableTable}
          enableCodeBlock={enableCodeBlock}
          onImageUpload={onImageUpload}
        />

        <div
          className={cn(
            'lexical-editor-container rounded-b-lg border bg-white transition-colors',
            error ? 'border-red-300' : 'border-gray-200 focus-within:border-gray-400'
          )}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="lexical-content-editable outline-none px-4 py-3"
                style={{
                  minHeight: `${minHeight}px`,
                  maxHeight: maxHeight ? `${maxHeight}px` : undefined,
                  overflowY: maxHeight ? 'auto' : undefined,
                }}
              />
            }
            placeholder={
              <div className="lexical-placeholder absolute top-3 left-4 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <TabIndentationPlugin />
        <TablePlugin />
        <ImagePlugin />
        <InitialContentPlugin content={content} />
        <OnChangePlugin onChange={handleChange} />
      </LexicalComposer>

      <div className="mt-1.5 flex items-center justify-between">
        {error && errorMessage ? (
          <p className="text-sm text-red-500">{errorMessage}</p>
        ) : (
          <span />
        )}
        {showCharacterCount && (
          <span className="text-xs text-gray-400">
            {characterCount.toLocaleString()}자
            {maxCharacters && ` / ${maxCharacters.toLocaleString()}`}
          </span>
        )}
      </div>
    </div>
  );
}
