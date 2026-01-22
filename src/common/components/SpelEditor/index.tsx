'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, ArrowDown } from 'lucide-react';
import type { Monaco } from '@monaco-editor/react';
import type { editor, Position } from 'monaco-editor';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] items-center justify-center rounded-lg bg-[#1e1e1e]">
      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
    </div>
  ),
});

// Python을 SpEL로 변환하는 함수 (0~100% 백분율 표현식)
function pythonToSpel(python: string, variables: string[]): string {
  if (!python.trim()) return '';

  let spel = python;

  // 변수 목록에서 루트 변수명 추출 (activity['stars'] -> activity)
  const rootVars = new Set<string>();
  for (const varName of variables) {
    const match = varName.match(/^(\w+)/);
    if (match) {
      rootVars.add(match[1]);
    }
  }

  // 루트 변수명에 # 추가 (dictionary 접근 패턴 지원)
  for (const rootVar of rootVars) {
    // activity['...'] 또는 activity 단독 사용 모두 처리
    const regex = new RegExp(`(?<!#)\\b(${rootVar})\\b`, 'g');
    spel = spel.replace(regex, '#$1');
  }

  // 기존 단순 변수명도 처리 (progressField 등)
  for (const varName of variables) {
    // dictionary 접근 패턴이 아닌 단순 변수만 처리
    if (!varName.includes('[')) {
      const regex = new RegExp(`(?<!#)\\b(${varName})\\b`, 'g');
      spel = spel.replace(regex, '#$1');
    }
  }

  // Python 논리 연산자를 SpEL로 변환
  spel = spel.replace(/\band\b/g, '&&');
  spel = spel.replace(/\bor\b/g, '||');
  spel = spel.replace(/\bnot\s+/g, '!');

  // Python 불리언을 SpEL로 변환
  spel = spel.replace(/\bTrue\b/g, 'true');
  spel = spel.replace(/\bFalse\b/g, 'false');

  return spel;
}

// 조건식을 백분율 반환 SpEL로 변환 (0~100)
function toPercentageSpel(python: string, variables: string[]): string {
  if (!python.trim()) return '';

  // 먼저 기본 SpEL 변환
  const spel = pythonToSpel(python, variables);

  // 조건식 패턴 분석
  // 패턴 1: 변수 >= 목표값 → min(변수 * 100 / 목표값, 100)
  // 패턴 2: 변수 == 목표값 → 변수 >= 목표값 ? 100 : (변수 * 100 / 목표값)
  // 패턴 3: 복합 조건 (and/or) → 각각 변환 후 평균 또는 최소값

  // 단일 비교 조건 패턴: #variable['field'] >= 숫자 또는 #variable >= 숫자
  const singleCompareMatch = spel.match(/^(#\w+(?:\['[^']+'\])?)\s*(>=|<=|>|<|==)\s*(\d+(?:\.\d+)?)$/);

  if (singleCompareMatch) {
    const [, variable, , targetStr] = singleCompareMatch;
    const target = parseFloat(targetStr);

    if (target > 0) {
      // 백분율 계산 SpEL 표현식 생성
      // T(Math).min(변수 * 100 / 목표값, 100)
      return `T(Math).min(${variable} * 100 / ${target}, 100)`;
    }
  }

  // AND 조건: 여러 조건의 최소값
  if (spel.includes('&&')) {
    const parts = spel.split(/\s*&&\s*/);
    const percentageParts = parts.map(part => {
      const match = part.trim().match(/^(#\w+(?:\['[^']+'\])?)\s*(>=|<=|>|<|==)\s*(\d+(?:\.\d+)?)$/);
      if (match) {
        const [, variable, , targetStr] = match;
        const target = parseFloat(targetStr);
        if (target > 0) {
          return `T(Math).min(${variable} * 100 / ${target}, 100)`;
        }
      }
      return null;
    }).filter(Boolean);

    if (percentageParts.length > 0) {
      if (percentageParts.length === 1) {
        return percentageParts[0]!;
      }
      // 여러 조건의 최소값 반환
      return `T(Math).min(${percentageParts.join(', ')})`;
    }
  }

  // OR 조건: 여러 조건의 최대값
  if (spel.includes('||')) {
    const parts = spel.split(/\s*\|\|\s*/);
    const percentageParts = parts.map(part => {
      const match = part.trim().match(/^(#\w+(?:\['[^']+'\])?)\s*(>=|<=|>|<|==)\s*(\d+(?:\.\d+)?)$/);
      if (match) {
        const [, variable, , targetStr] = match;
        const target = parseFloat(targetStr);
        if (target > 0) {
          return `T(Math).min(${variable} * 100 / ${target}, 100)`;
        }
      }
      return null;
    }).filter(Boolean);

    if (percentageParts.length > 0) {
      if (percentageParts.length === 1) {
        return percentageParts[0]!;
      }
      // 여러 조건의 최대값 반환
      return `T(Math).max(${percentageParts.join(', ')})`;
    }
  }

  // 패턴 매칭 실패 시 기본 SpEL 반환
  return spel;
}

// 조건의 의미를 백분율로 해석
function interpretCondition(python: string): string {
  if (!python.trim()) return '';

  const conditions: string[] = [];

  // 변수 조건 해석 (dictionary 접근 패턴 지원: activity['commits'])
  const matches = python.matchAll(/(\w+(?:\['[^']+'\])?)\s*(>=|<=|>|<|==|!=)\s*(\d+(?:\.\d+)?)/g);
  for (const match of matches) {
    const variable = match[1];
    const operator = match[2];
    const value = match[3];

    const opText: Record<string, string> = {
      '>=': '이상',
      '<=': '이하',
      '>': '초과',
      '<': '미만',
      '==': '달성',
      '!=': '제외',
    };

    // dictionary 접근 패턴에서 필드명만 추출 (activity['commits'] -> commits)
    const fieldMatch = variable.match(/\['([^']+)'\]/);
    const displayName = fieldMatch ? fieldMatch[1] : variable;

    conditions.push(`${displayName} ${value} ${opText[operator] || operator}`);
  }

  return conditions.join(', ');
}

interface SpelEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSpelChange?: (spel: string) => void;
  disabled?: boolean;
  height?: number;
  variables?: string[];
}

export default function SpelEditor({
  value,
  onChange,
  onSpelChange,
  disabled = false,
  height = 220,
  variables = ['progressField']
}: SpelEditorProps) {
  const [spelOutput, setSpelOutput] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const onSpelChangeRef = useRef(onSpelChange);
  const variablesRef = useRef(variables);

  // ref 업데이트
  useEffect(() => {
    onSpelChangeRef.current = onSpelChange;
  }, [onSpelChange]);

  useEffect(() => {
    variablesRef.current = variables;
  }, [variables]);

  // value 변경 시 SpEL 변환 (백분율 표현식)
  useEffect(() => {
    const spel = toPercentageSpel(value, variablesRef.current);
    const interp = interpretCondition(value);
    setSpelOutput(spel);
    setInterpretation(interp);
    onSpelChangeRef.current?.(spel);
  }, [value]);

  // Monaco Editor 자동완성 설정
  const handleEditorMount = (editor: unknown, monaco: Monaco) => {
    // 현재 줄 하이라이팅 색상 커스텀
    monaco.editor.defineTheme('spel-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.lineHighlightBackground': '#2d2d2d',
        'editor.lineHighlightBorder': '#3e3e3e',
      },
    });
    monaco.editor.setTheme('spel-dark');

    // 자동완성 provider 등록
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: editor.ITextModel, position: Position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          // 변수 자동완성
          ...variablesRef.current.map((varName) => ({
            label: varName,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: varName,
            detail: 'SpEL 변수 (0~100% 백분율)',
            range,
          })),
          // 연산자 자동완성
          { label: 'and', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'and', detail: '논리 AND (&&)', range },
          { label: 'or', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'or', detail: '논리 OR (||)', range },
          { label: 'not', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'not ', detail: '논리 NOT (!)', range },
          { label: 'True', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'True', detail: '참', range },
          { label: 'False', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'False', detail: '거짓', range },
        ];

        return { suggestions };
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Python Editor */}
      <div className="overflow-hidden rounded-lg border border-[#3c3c3c] bg-[#1e1e1e]">
        <Editor
          height={height}
          defaultLanguage="python"
          value={value}
          onChange={(val) => onChange(val || '')}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: false,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'line',
            renderLineHighlightOnlyWhenFocus: true,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            readOnly: disabled,
            domReadOnly: disabled,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            fixedOverflowWidgets: true,
          }}
        />
      </div>

      {/* 변환 화살표 */}
      <div className="flex items-center gap-2">
        <ArrowDown className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500">Spring SpEL 변환 결과</span>
        {interpretation && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {interpretation}
          </span>
        )}
      </div>

      {/* SpEL Output */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <code className="block whitespace-pre-wrap break-all font-mono text-sm text-gray-800">
          {spelOutput || <span className="text-gray-400">Python 조건식을 입력하면 SpEL로 자동 변환됩니다 (0~100% 백분율)</span>}
        </code>
      </div>
    </div>
  );
}
