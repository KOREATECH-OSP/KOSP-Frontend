function WritingGuide() { 

  const WRITING_GUIDE_TEXTS = [
    '제목은 명확하고 구체적으로 작성해주세요',
    '적절한 카테고리를 선택하면 더 많은 관심을 받을 수 있습니다',
    '이미지, 문서 등 다양한 파일을 첨부할 수 있습니다',
    '다른 사용자를 존중하는 내용으로 작성해주세요',
  ];

  return (
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">글쓰기 가이드</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            {WRITING_GUIDE_TEXTS.map((text) => (
              <li key={text}>• {text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default WritingGuide;