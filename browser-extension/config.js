/**
 * 아우누리 자료 수집기 설정.
 *
 * 아우누리(LMS)의 실제 DOM 구조는 페이지/버전마다 다르므로,
 * 아래 셀렉터를 실제 과제/EL 목록 페이지에 맞게 수정해야 합니다.
 * (개발자도구 → Elements 에서 목록 한 행(row)과 제목/링크/날짜 요소의 셀렉터를 확인)
 */
const KOSP_AUNURI_CONFIG = {
  // TODO: 배포된 오픈소스포털 API 주소로 변경하세요.
  defaultApiBase: 'http://localhost:8080',

  // import 엔드포인트 (백엔드: POST /v1/users/me/materials/import)
  importPath: '/v1/users/me/materials/import',

  selectors: {
    // 자료 목록의 한 행(반복 단위). TODO: 실제 아우누리 셀렉터로 교체
    row: 'table tbody tr',
    // 행 안의 제목/링크/날짜. 비어 있으면 행 전체 텍스트/첫 링크로 폴백
    title: 'a, .subject, .title, td',
    link: 'a[href]',
    date: '.date, td.date, time',
  },
};

// content script(window)와 팝업(모듈 아님) 양쪽에서 참조 가능하도록 전역에 노출
if (typeof window !== 'undefined') {
  window.KOSP_AUNURI_CONFIG = KOSP_AUNURI_CONFIG;
}
