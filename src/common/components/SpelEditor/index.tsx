'use client';

import { useMemo, useEffect, useRef } from 'react';
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

// Python을 기본 SpEL로 변환하는 함수 (fallback 용도)
function pythonToBasicSpel(python: string): string {
  if (!python.trim()) return '';

  let spel = python;

  // Python 논리 연산자를 SpEL로 변환
  spel = spel.replace(/\band\b/g, '&&');
  spel = spel.replace(/\bor\b/g, '||');
  spel = spel.replace(/\bnot\s+/g, '!');

  // Python 불리언을 SpEL로 변환
  spel = spel.replace(/\bTrue\b/g, 'true');
  spel = spel.replace(/\bFalse\b/g, 'false');
  spel = spel.replace(/\bmin\(/g, 'T(Math).min(');
  spel = spel.replace(/\bmax\(/g, 'T(Math).max(');

  return spel;
}

// 변수 패턴: variable, variable['field'], variable.field 모두 지원
const VAR_PATTERN = "\\w+(?:\\['[^']+'\\]|\\.\\w+)*";

// 단일 조건을 #progress SpEL로 변환
function conditionToPercentage(condition: string): string | null {
  const partRegex = new RegExp(`^(${VAR_PATTERN})\\s*(>=|<=|>|<|==)\\s*(\\d+(?:\\.\\d+)?)$`);
  const match = condition.trim().match(partRegex);

  if (match) {
    const [, variable, , targetStr] = match;
    const target = parseFloat(targetStr);
    if (target > 0) {
      // #progress(변수, 목표점수) 형태로 변환
      return `#progress(${variable}, ${target})`;
    }
  }
  return null;
}

// 여러 조건을 #min/#max로 결합 (SpEL 커스텀 함수)
function combinePercentages(parts: string[], operation: 'min' | 'max'): string {
  if (parts.length === 0) return '0';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `#${operation}(${parts[0]}, ${parts[1]})`;

  // 3개 이상: 중첩 호출 - #min(#min(a, b), c)
  let result = parts[0];
  for (let i = 1; i < parts.length; i++) {
    result = `#${operation}(${result}, ${parts[i]})`;
  }
  return result;
}

function stripOuterParentheses(expr: string): string {
  let stripped = expr.trim();

  while (stripped.startsWith('(') && stripped.endsWith(')')) {
    let depth = 0;
    let isWrapped = true;

    for (let i = 0; i < stripped.length; i++) {
      if (stripped[i] === '(') depth++;
      else if (stripped[i] === ')') depth--;

      if (depth === 0 && i < stripped.length - 1) {
        isWrapped = false;
        break;
      }
    }

    if (!isWrapped) break;
    stripped = stripped.slice(1, -1).trim();
  }

  return stripped;
}

function splitFunctionArgsTopLevel(argsStr: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];

    if (char === '(') {
      depth++;
      current += char;
      continue;
    }

    if (char === ')') {
      depth--;
      current += char;
      continue;
    }

    if (char === ',' && depth === 0) {
      if (current.trim()) {
        args.push(current.trim());
      }
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
}

function getFunctionArgs(expr: string, functionNames: string[]): string[] | null {
  const trimmed = expr.trim();

  for (const functionName of functionNames) {
    const prefix = `${functionName}(`;
    if (!trimmed.startsWith(prefix) || !trimmed.endsWith(')')) {
      continue;
    }

    let depth = 0;
    let isWholeFunction = true;
    let sawOpenParen = false;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '(') {
        depth++;
        sawOpenParen = true;
      } else if (trimmed[i] === ')') {
        depth--;
      }

      if (sawOpenParen && depth === 0 && i < trimmed.length - 1) {
        isWholeFunction = false;
        break;
      }
    }

    if (!isWholeFunction) {
      continue;
    }

    const argsString = trimmed.slice(prefix.length, -1);
    return splitFunctionArgsTopLevel(argsString);
  }

  return null;
}

function parseProgressExpression(expr: string): string | null {
  const args = getFunctionArgs(expr, ['min', 'T(Math).min']);
  if (!args || args.length !== 2) return null;

  const leftArg = stripOuterParentheses(args[0]);
  const rightArg = stripOuterParentheses(args[1]);
  if (!/^100(?:\.0+)?$/.test(rightArg)) return null;

  const progressPattern = new RegExp(
    `^(${VAR_PATTERN})\\s*\\*\\s*100(?:\\.0+)?\\s*\\/\\s*(\\d+(?:\\.\\d+)?)$`
  );
  const match = leftArg.match(progressPattern);

  if (!match) return null;

  const [, variable, target] = match;
  return `#progress(${variable}, ${target})`;
}

// 최상위 레벨에서 연산자로 분리 (괄호 내부는 무시)
function splitByOperatorTopLevel(expr: string, operator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (char === '(') {
      depth++;
      current += char;
      i++;
    } else if (char === ')') {
      depth--;
      current += char;
      i++;
    } else if (depth === 0 && expr.slice(i).startsWith(operator)) {
      // 최상위 레벨에서 연산자 발견
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = '';
      i += operator.length;
      // 연산자 뒤 공백 스킵
      while (i < expr.length && expr[i] === ' ') i++;
    } else {
      current += char;
      i++;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

// 표현식을 재귀적으로 백분율 SpEL로 변환
// 우선순위: 괄호 > AND > OR
function parseExpression(expr: string): string | null {
  expr = stripOuterParentheses(expr);
  if (!expr) return null;

  const progressExpression = parseProgressExpression(expr);
  if (progressExpression) {
    return progressExpression;
  }

  // 1단계: OR로 분리 (가장 낮은 우선순위)
  const orParts = splitByOperatorTopLevel(expr, '||');
  if (orParts.length > 1) {
    const orPercentages = orParts
      .map(part => parseExpression(part))
      .filter((p): p is string => p !== null);

    if (orPercentages.length === 0) return null;
    return combinePercentages(orPercentages, 'max');
  }

  // 2단계: AND로 분리
  const andParts = splitByOperatorTopLevel(expr, '&&');
  if (andParts.length > 1) {
    const andPercentages = andParts
      .map(part => parseExpression(part))
      .filter((p): p is string => p !== null);

    if (andPercentages.length === 0) return null;
    return combinePercentages(andPercentages, 'min');
  }

  // 3단계: 단일 조건
  const directCondition = conditionToPercentage(expr);
  if (directCondition) {
    return directCondition;
  }

  const minArgs = getFunctionArgs(expr, ['min', 'T(Math).min']);
  if (minArgs && minArgs.length > 0) {
    const minPercentages = minArgs
      .map((part) => parseExpression(part))
      .filter((part): part is string => part !== null);

    if (minPercentages.length === minArgs.length) {
      return combinePercentages(minPercentages, 'min');
    }
  }

  const maxArgs = getFunctionArgs(expr, ['max', 'T(Math).max']);
  if (maxArgs && maxArgs.length > 0) {
    const maxPercentages = maxArgs
      .map((part) => parseExpression(part))
      .filter((part): part is string => part !== null);

    if (maxPercentages.length === maxArgs.length) {
      return combinePercentages(maxPercentages, 'max');
    }
  }

  return null;
}

// 조건식을 백분율 반환 SpEL로 변환 (0~100)
// 연산자 우선순위: 괄호 > AND > OR
// 예: A and (B or C) → min(A%, max(B%, C%))
function toPercentageSpel(python: string): string {
  if (!python.trim()) return '';

  const normalizedPython = python
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\s+/g, '!')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false');

  // 재귀적으로 파싱
  const result = parseExpression(normalizedPython);

  // 패턴 매칭 실패 시 기본 SpEL 반환
  return result || pythonToBasicSpel(python);
}

// 조건의 의미를 백분율로 해석
function interpretCondition(python: string): string {
  if (!python.trim()) return '';

  const conditions: string[] = [];

  // 변수 조건 해석 (dictionary 접근, 점 접근 패턴 모두 지원)
  // activity['commits'], stats.totalCommits, progressField 등
  const matches = python.matchAll(/(\w+(?:\['[^']+'\]|\.\w+)*)\s*(>=|<=|>|<|==|!=)\s*(\d+(?:\.\d+)?)/g);
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

    // 필드명 추출: activity['commits'] -> commits, stats.totalCommits -> totalCommits
    const dictMatch = variable.match(/\['([^']+)'\]/);
    const dotMatch = variable.match(/\.(\w+)$/);
    const displayName = dictMatch ? dictMatch[1] : (dotMatch ? dotMatch[1] : variable);

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
  const variablesRef = useRef(variables);
  const prevSpelRef = useRef<string>('');

  // ref 업데이트
  useEffect(() => {
    variablesRef.current = variables;
  }, [variables]);

  // value에서 SpEL 및 해석 계산 (useMemo 사용)
  const spelOutput = useMemo(() => toPercentageSpel(value), [value]);
  const interpretation = useMemo(() => interpretCondition(value), [value]);

  // SpEL 변경 시 콜백 호출 (이전 값과 비교하여 변경 시에만)
  useEffect(() => {
    if (spelOutput !== prevSpelRef.current) {
      prevSpelRef.current = spelOutput;
      onSpelChange?.(spelOutput);
    }
  }, [spelOutput, onSpelChange]);

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
          { label: 'min', kind: monaco.languages.CompletionItemKind.Function, insertText: 'min(${1:a}, ${2:b})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: '최솟값 함수', range },
          { label: 'max', kind: monaco.languages.CompletionItemKind.Function, insertText: 'max(${1:a}, ${2:b})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: '최댓값 함수', range },
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
