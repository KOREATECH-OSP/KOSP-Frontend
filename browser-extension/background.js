/**
 * 백그라운드 서비스 워커.
 *
 * 팝업에서 받은 정규화 자료를 오픈소스포털 API 의 import 엔드포인트로 전송한다.
 * 전송 인증은 오픈소스포털 JWT(사용자가 팝업에 입력) 뿐이며,
 * 아우누리 세션/자격증명은 어디에도 포함되지 않는다.
 */

async function importMaterials({ apiBase, importPath, accessToken, items }) {
  const res = await fetch(apiBase.replace(/\/$/, '') + importPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken,
    },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`import 실패 (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'IMPORT_MATERIALS') {
    importMaterials(msg.payload)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((err) => sendResponse({ ok: false, error: String(err.message || err) }));
    return true; // async 응답
  }
});
