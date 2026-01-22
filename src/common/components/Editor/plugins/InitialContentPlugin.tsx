'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

interface InitialContentPluginProps {
  content: string;
}

export function InitialContentPlugin({ content }: InitialContentPluginProps): null {
  const [editor] = useLexicalComposerContext();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    if (!content || content === '<p></p>' || content.trim() === '') return;

    isInitializedRef.current = true;

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      const parser = new DOMParser();
      const dom = parser.parseFromString(content, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $insertNodes(nodes);
    });
  }, [editor, content]);

  return null;
}
