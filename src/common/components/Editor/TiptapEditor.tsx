'use client';

import { useEditor, EditorContent, AnyExtension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import { common, createLowlight } from 'lowlight';

import Toolbar from './Toolbar';
import type { TiptapEditorProps } from './types';
import './styles/editor.css';

const lowlight = createLowlight(common);

export default function TiptapEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요',
  editable = true,
  minHeight = 300,
  maxHeight,
  maxCharacters,
  showCharacterCount = true,
  enableImage = true,
  enableTable = true,
  enableCodeBlock = true,
  onImageUpload,
  className = '',
  toolbarClassName = '',
  error = false,
  errorMessage,
}: TiptapEditorProps) {
  const extensions: AnyExtension[] = [
    StarterKit.configure({
      codeBlock: false,
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline hover:text-blue-800',
      },
    }),
    Dropcursor,
    Gapcursor,
  ];

  if (maxCharacters) {
    extensions.push(CharacterCount.configure({ limit: maxCharacters }));
  } else if (showCharacterCount) {
    extensions.push(CharacterCount);
  }

  if (enableImage) {
    extensions.push(
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      })
    );
  }

  if (enableTable) {
    extensions.push(
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader
    );
  }

  if (enableCodeBlock) {
    extensions.push(
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm',
        },
      })
    );
  }

  const editor = useEditor({
    extensions,
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none px-4 py-3',
        style: `min-height: ${minHeight}px; ${maxHeight ? `max-height: ${maxHeight}px; overflow-y: auto;` : ''}`,
      },
    },
  });

  const characterCount = editor?.storage.characterCount?.characters() ?? 0;

  return (
    <div className={`tiptap-editor-wrapper ${className}`}>
      <Toolbar
        editor={editor}
        enableImage={enableImage}
        enableTable={enableTable}
        enableCodeBlock={enableCodeBlock}
        onImageUpload={onImageUpload}
        className={toolbarClassName}
      />

      <div
        className={`rounded-b-lg border border-t-0 bg-white ${
          error ? 'border-red-300' : 'border-gray-200'
        }`}
      >
        <EditorContent editor={editor} />
      </div>

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
