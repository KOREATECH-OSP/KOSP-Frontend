/**
 * 아우누리 페이지 내용을 스크랩하는 content script.
 *
 * 사용자의 "이미 로그인된" 아우누리 세션에서 DOM 만 읽으므로,
 * 학교 자격증명/세션은 확장 밖으로 나가지 않는다.
 * 팝업이 보낸 SCRAPE_AUNURI 메시지에 응답해 정규화된 항목 배열을 반환한다.
 */
(function () {
  const CONFIG = window.KOSP_AUNURI_CONFIG;

  /** 안정적인 외부키: 링크 href(경로) 우선, 없으면 제목 기반. */
  function externalId(href, title) {
    if (href) {
      try {
        const u = new URL(href, location.href);
        return (u.pathname + u.search) || href;
      } catch {
        return href;
      }
    }
    return 'title:' + title;
  }

  function textOf(el) {
    return el ? el.textContent.trim().replace(/\s+/g, ' ') : '';
  }

  /** 목록 행들을 순회하며 자료 후보를 추출한다. */
  function scrape() {
    const rows = Array.from(document.querySelectorAll(CONFIG.selectors.row));
    const items = [];
    for (const row of rows) {
      const linkEl = row.querySelector(CONFIG.selectors.link);
      const href = linkEl ? linkEl.getAttribute('href') : null;
      const absHref = href ? new URL(href, location.href).href : null;

      const titleEl = row.querySelector(CONFIG.selectors.title);
      const title = textOf(titleEl) || textOf(linkEl) || textOf(row);
      if (!title) continue;

      const dateEl = row.querySelector(CONFIG.selectors.date);
      const dateText = textOf(dateEl);
      const materialDate = parseDate(dateText);

      items.push({
        sourceExternalId: externalId(absHref, title),
        title: title.slice(0, 250),
        sourceUrl: absHref,
        materialDate, // ISO 문자열 또는 null
      });
    }
    return items;
  }

  /** "2026.03.10" / "2026-03-10" 같은 날짜를 ISO(LocalDateTime) 문자열로 변환. */
  function parseDate(text) {
    if (!text) return null;
    const m = text.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if (!m) return null;
    const [, y, mo, d] = m;
    const pad = (n) => String(n).padStart(2, '0');
    return `${y}-${pad(mo)}-${pad(d)}T00:00:00`;
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.type === 'SCRAPE_AUNURI') {
      try {
        sendResponse({ ok: true, items: scrape() });
      } catch (e) {
        sendResponse({ ok: false, error: String(e) });
      }
    }
    return true; // async 응답 허용
  });
})();
