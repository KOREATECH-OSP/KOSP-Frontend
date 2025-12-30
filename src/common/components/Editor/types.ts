import type { Editor } from '@tiptap/react';

export interface TiptapEditorProps {
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

export interface ToolbarProps {
  editor: Editor | null;
  enableImage?: boolean;
  enableTable?: boolean;
  enableCodeBlock?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
}

export interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}
