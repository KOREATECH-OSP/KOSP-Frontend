# 오픈소스포털 아우누리 자료 수집기 (브라우저 확장, MV3)

아우누리(LMS)의 과제/EL 자료를 오픈소스포털 이력서로 **반자동** 수집하는 크롬 확장입니다.

## 왜 확장인가 (정책)

- 학교(아우누리) 인증은 **서버가 다루지 않습니다.** 아우누리에는 공개 API가 없어, 완전 자동(서버 크롤링)은 세션·자격증명을 서버에 저장해야 하므로 정책상 금지됩니다.
- 이 확장은 사용자의 **이미 로그인된 브라우저 세션**에서 페이지 DOM만 읽어 정규화한 뒤, 오픈소스포털 API로 전송합니다.
- 서버로 전송되는 인증 정보는 **오픈소스포털 JWT(우리 서비스 토큰)뿐**이며, 아우누리 세션/비밀번호는 확장 밖으로 나가지 않습니다.

## 동작 흐름

1. 아우누리에 로그인하고 **과제/EL 목록 페이지**를 엽니다.
2. 확장 팝업에서 API 주소·오픈소스포털 토큰·자료 종류·연도·학기를 입력합니다.
3. "이 페이지에서 수집" → content script가 DOM을 스크랩 → background가 `POST /v1/users/me/materials/import` 전송.
4. 서버가 `(source, sourceExternalId)` 기준 **멱등 upsert** → 신규/갱신/변경없음 개수를 팝업에 표시.
5. 같은 페이지에서 다시 실행하면 변경분만 갱신 = **동기화**.

수집된 자료는 오픈소스포털에서 비공개(PRIVATE)로 저장되고, 이력서에 자동 프로젝트로 연결됩니다(사용자가 삭제/수정 가능).

## 설치 (개발자 모드)

1. `chrome://extensions` → 우상단 **개발자 모드** 켜기
2. **압축해제된 확장 프로그램을 로드** → 이 `browser-extension/` 폴더 선택

## 배포 전 반드시 수정해야 할 TODO

- **`config.js` → `defaultApiBase`**: 배포된 오픈소스포털 API 주소.
- **`config.js` → `selectors`**: 실제 아우누리 과제/EL 목록의 DOM 셀렉터(행/제목/링크/날짜). 개발자도구로 확인 후 교체.
- **`manifest.json` → `host_permissions`**: 오픈소스포털 API 호스트(예: `https://api.opensourceportal.example/*`) 추가. 미설정 시 background의 import 요청이 CORS로 막힙니다.
- **`manifest.json` → `content_scripts.matches` / `host_permissions`**: 실제 아우누리 호스트로 좁히기.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `manifest.json` | MV3 매니페스트 (권한/스크립트 등록) |
| `config.js` | API 주소·import 경로·DOM 셀렉터 설정 (전역 공유) |
| `content-aunuri.js` | 아우누리 페이지 스크래이퍼 (SCRAPE_AUNURI 응답) |
| `background.js` | import 엔드포인트 전송 (IMPORT_MATERIALS 처리) |
| `popup.html` / `popup.js` | 입력 UI + 수집 트리거 |

## 한계

- 아우누리 DOM이 바뀌면 `config.js` 셀렉터를 갱신해야 합니다(유지보수 포인트).
- 연도/학기/과목명 자동 파싱은 페이지 구조에 크게 의존하므로, 현재는 팝업에서 지정한 값을 배치 전체에 적용합니다.
