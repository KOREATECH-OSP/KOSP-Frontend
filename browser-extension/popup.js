/**
 * 팝업 로직.
 *  1) 아우누리 탭의 content script 에 스크랩 요청
 *  2) 팝업에서 지정한 (종류/연도/학기)를 합쳐 정규화
 *  3) background 로 넘겨 오픈소스포털 import 엔드포인트로 전송
 */
const CONFIG = window.KOSP_AUNURI_CONFIG;
const $ = (id) => document.getElementById(id);

// 저장된 설정 복원
chrome.storage.local.get(['apiBase', 'token', 'source', 'year', 'semester'], (s) => {
  $('apiBase').value = s.apiBase || CONFIG.defaultApiBase;
  $('token').value = s.token || '';
  if (s.source) $('source').value = s.source;
  if (s.year) $('year').value = s.year;
  if (s.semester) $('semester').value = s.semester;
});

function persist() {
  chrome.storage.local.set({
    apiBase: $('apiBase').value.trim(),
    token: $('token').value.trim(),
    source: $('source').value,
    year: $('year').value,
    semester: $('semester').value,
  });
}

function setStatus(msg, color = '#374151') {
  const el = $('status');
  el.textContent = msg;
  el.style.color = color;
}

$('collect').addEventListener('click', async () => {
  persist();
  const apiBase = $('apiBase').value.trim();
  const token = $('token').value.trim();
  const source = $('source').value;
  const year = $('year').value ? Number($('year').value) : null;
  const semester = $('semester').value || null;

  if (!apiBase || !token) {
    setStatus('API 주소와 토큰을 입력하세요.', '#dc2626');
    return;
  }

  const btn = $('collect');
  btn.disabled = true;
  setStatus('페이지에서 자료 수집 중...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const scrapeRes = await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_AUNURI' })
      .catch(() => null);

    if (!scrapeRes || !scrapeRes.ok) {
      throw new Error('아우누리 페이지를 인식하지 못했습니다. 과제/EL 목록 페이지에서 실행하세요.');
    }
    if (scrapeRes.items.length === 0) {
      throw new Error('수집된 자료가 없습니다. config.js 의 셀렉터를 확인하세요.');
    }

    // 팝업 지정값 병합 → 백엔드 MaterialImportRequest.Item 형태
    const items = scrapeRes.items.map((it) => ({
      sourceExternalId: it.sourceExternalId,
      source,
      title: it.title,
      subjectName: null,
      materialYear: year,
      semester,
      sourceUrl: it.sourceUrl,
      fileUrl: null,
      materialDate: it.materialDate,
    }));

    setStatus(`${items.length}건 전송 중...`);
    const importRes = await chrome.runtime.sendMessage({
      type: 'IMPORT_MATERIALS',
      payload: { apiBase, importPath: CONFIG.importPath, accessToken: token, items },
    });

    if (!importRes || !importRes.ok) {
      throw new Error(importRes ? importRes.error : '전송 실패');
    }
    const r = importRes.result;
    setStatus(`완료: 신규 ${r.created} · 갱신 ${r.updated} · 변경없음 ${r.unchanged}`, '#16a34a');
  } catch (err) {
    setStatus(String(err.message || err), '#dc2626');
  } finally {
    btn.disabled = false;
  }
});
