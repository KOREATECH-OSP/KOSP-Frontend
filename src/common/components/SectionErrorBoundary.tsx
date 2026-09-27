'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  /** 실패 안내 문구에 표시할 섹션 이름 */
  name: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * 섹션 단위 에러 경계.
 * 한 섹션(팔로우 카드, 학습자료 등)의 렌더 오류가 페이지 전체를 무너뜨리지 않도록,
 * 오류가 난 섹션만 안내 문구로 대체하고 나머지 화면은 그대로 둔다.
 */
export default class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name}] 섹션 렌더 실패:`, error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-center text-xs text-gray-400">
        {this.props.name}을(를) 불러오지 못했습니다.
      </div>
    );
  }
}
