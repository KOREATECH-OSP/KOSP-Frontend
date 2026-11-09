/**
 * 이력서 DOM 영역을 A4 PDF Blob 으로 변환한다.
 *
 * <p>미리보기와 다운로드가 반드시 같은 결과물이어야 하므로, 생성은 이 함수 한 곳에서만
 * 수행하고 호출자는 반환된 Blob 하나를 공유해서 쓴다. (미리보기에서 한 번, 다운로드에서
 * 또 한 번 생성하면 두 결과가 달라질 수 있다.)</p>
 *
 * <h2>좌표계</h2>
 * <p>html2canvas 는 {@link PDF_CAPTURE_SCALE} 배율로 캔버스를 만든다. 페이지 절단 지점은
 * `onclone` 안에서 CSS px 로 측정한 뒤 이 상수를 곱해 캔버스 px 로 변환한다.
 * 캔버스 높이로 배율을 역산하면 안 된다 — `onclone` 이 레이아웃을 바꾸기 때문에
 * (프로젝트 목록 펼침 등) 변형 전 원본 높이와 캔버스 높이의 비가 실제 배율과 다르다.</p>
 */

/**
 * html2canvas 캡처 배율.
 *
 * <p>html2canvas 옵션과 캔버스 좌표 변환이 <b>반드시</b> 같은 값을 참조해야 한다.
 * 둘이 어긋나면 페이지가 섹션 경계가 아닌 곳에서 잘린다.</p>
 */
export const PDF_CAPTURE_SCALE = 2;

/** 캡처 대상의 폭을 알 수 없을 때 사용할 A4 기본 폭(px, 96dpi 기준). */
const FALLBACK_CAPTURE_WIDTH = 794;

/** PDF 생성 실패 사유를 사용자에게 보여줄 수 있는 형태로 담는 예외. */
export class ResumePdfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResumePdfError';
  }
}

/**
 * 절단해도 안전한 지점으로 표시된 요소를 찾는 선택자.
 *
 * <p>이력서의 반복 항목(프로젝트 각 건, 경력 각 건, 자기소개서 각 건 …)에 붙어 있다.
 * 부착 위치는 `ResumeReadOnlyView` 를 보라.</p>
 *
 * <p>클래스명이나 DOM 구조(`nth-child`, 태그명)로 찾지 않는 이유는, 스타일을 손대는
 * 순간 조용히 깨지기 때문이다. 전용 data 속성은 용도가 이름에 드러나 실수로 지울 위험이 낮다.</p>
 */
const CUT_POINT_SELECTOR = '[data-pdf-cut]';

/**
 * 한 페이지를 최소한 이 비율만큼은 채워야 한다.
 *
 * <p>후보가 촘촘해지면서 생긴 부작용을 막는다. 페이지 시작점 바로 아래에 후보가 하나 있고
 * 그 다음 후보가 페이지 밖이면, 그 후보를 택할 경우 몇 px 짜리 페이지가 나온다.
 * 그럴 바에는 강제 절단이 낫다.</p>
 */
const MIN_PAGE_FILL_RATIO = 0.15;

/**
 * 페이지를 잘라도 안전한 y 좌표를 CSS px 단위로 모은다.
 *
 * <p>후보는 두 종류의 <b>합집합</b>이다.</p>
 * <ol>
 *   <li><b>섹션 경계</b> — 캡처 대상의 직계 자식({@code <section>})이 끝나는 지점</li>
 *   <li><b>항목 경계</b> — {@link CUT_POINT_SELECTOR} 가 붙은 반복 항목이 끝나는 지점</li>
 * </ol>
 *
 * <p>섹션 경계만으로는 부족하다. 프로젝트 10건은 `<Section title="프로젝트">` 단 하나라서
 * 자를 수 있는 곳이 섹션 끝 한 군데뿐인데, 그 높이가 A4 를 훨씬 넘으면 후보를 찾지 못해
 * 강제 절단(=글자가 가로로 잘림) 경로를 탄다. 항목 경계까지 후보로 넣어야 이 문제가 풀린다.</p>
 *
 * <p>반드시 `onclone` 콜백 안에서, 모든 DOM 변형을 마친 뒤 호출해야 한다.
 * html2canvas 는 `onclone` 이 끝난 <b>다음에</b> 클론의 bounds 로 캔버스 크기를 정하므로,
 * 이 시점의 측정값이 실제 캔버스 좌표와 일치한다.</p>
 *
 * @param root 클론된 캡처 대상 요소 (이미 클론 문서에 붙어 있어 rect 가 유효하다)
 */
function measureCutPoints(root: HTMLElement): number[] {
  const rootTop = root.getBoundingClientRect().top;

  const collect = (elements: Element[]): number[] =>
    elements
      .map((el) => el.getBoundingClientRect())
      // 화면에서 숨겨진 요소(예: PDF 에서 제외되는 캐러셀)는 rect 가 전부 0 이다.
      // 이런 값을 후보로 넣으면 0 높이 페이지가 생기므로 걸러낸다.
      .filter((rect) => rect.height > 0)
      .map((rect) => Math.round(rect.bottom - rootTop));

  const sectionEdges = collect(Array.from(root.children));
  const itemEdges = collect(Array.from(root.querySelectorAll(CUT_POINT_SELECTOR)));

  const points = [...sectionEdges, ...itemEdges].filter((y) => y > 0);

  return Array.from(new Set(points)).sort((a, b) => a - b);
}

/**
 * 지정한 DOM 영역을 캡처해 A4 PDF Blob 을 만든다.
 *
 * @param targetId 캡처 대상 요소의 id (보통 `resume-print-area`)
 * @throws {ResumePdfError} 대상을 찾지 못했거나 캡처 결과가 비어 있는 경우
 */
export async function generateResumePdf(targetId: string): Promise<Blob> {
  const target = document.getElementById(targetId);
  if (!target) {
    throw new ResumePdfError('이력서 영역을 찾을 수 없습니다.');
  }

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  // 웹폰트(Pretendard)는 외부 CDN 에서 로드된다. 로딩 전에 캡처하면 시스템 폰트로
  // 렌더되어 자폭·줄바꿈이 달라지고, 그만큼 절단 지점도 어긋난다.
  try {
    await document.fonts?.ready;
  } catch {
    // 폰트 API 미지원 브라우저에서는 대기 없이 진행한다.
  }

  const captureWidth = target.offsetWidth || FALLBACK_CAPTURE_WIDTH;

  // onclone 안에서 측정한 절단 후보(CSS px)를 밖으로 넘기기 위한 클로저 변수.
  // 캔버스와 동일한 레이아웃에서 측정되므로 PDF_CAPTURE_SCALE 만 곱하면 캔버스 px 가 된다.
  let cutPointsCss: number[] = [];

  const canvas = await html2canvas(target, {
    scale: PDF_CAPTURE_SCALE,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: captureWidth,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
      const body = clonedDoc.body;
      // clonedElement를 body 최상위로 이동 (position:fixed 컨테이너에서 분리)
      body.appendChild(clonedElement);
      // 모달, 오버레이, Toaster 포털 등 나머지 body 직접 자식 완전 차단
      Array.from(body.children).forEach((child) => {
        if (child !== clonedElement) {
          const el = child as HTMLElement;
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
        }
      });

      // PDF 전용 블록을 노출하고, 화면 전용 블록(캐러셀 등)을 숨긴다.
      clonedElement.querySelectorAll<HTMLElement>('[data-pdf-only]').forEach((el) => {
        el.style.setProperty('display', 'block', 'important');
      });
      clonedElement.querySelectorAll<HTMLElement>('[data-pdf-hidden]').forEach((el) => {
        el.style.setProperty('display', 'none', 'important');
      });

      // 스크롤 컨테이너의 clip 해제 — 화면 밖 카드가 잘려나가는 것을 막는다.
      clonedElement.querySelectorAll<HTMLElement>('*').forEach((el) => {
        const style = clonedDoc.defaultView?.getComputedStyle(el);
        if (!style) return;
        if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
          el.style.setProperty('overflow', 'visible', 'important');
        }
        if (style.maxHeight !== 'none') {
          el.style.setProperty('max-height', 'none', 'important');
        }
      });

      // 이력서 영역 좌표 초기화 + 상위 clip 해제
      clonedElement.style.cssText =
        `position:static!important;left:0!important;top:0!important;` +
        `width:${captureWidth}px!important;margin:0!important;padding:0!important;` +
        `overflow:visible!important;height:auto!important;max-height:none!important;`;

      // ── 반드시 마지막 ────────────────────────────────────────────────
      // 위 변형이 모두 반영된 레이아웃에서 측정해야 캔버스 좌표와 일치한다.
      // getBoundingClientRect() 가 동기 레이아웃을 강제하므로 별도 flush 는 필요 없다.
      cutPointsCss = measureCutPoints(clonedElement);
    },
  });

  // 캔버스 최대 치수를 넘기면 브라우저가 빈 캔버스를 돌려주거나 생성에 실패한다.
  // 이력서가 길수록(= 캔버스가 높을수록) 걸리기 쉬우므로 원인을 함께 알려준다.
  if (!canvas.width || !canvas.height) {
    throw new ResumePdfError(
      '이력서 내용이 너무 길어 PDF를 생성하지 못했습니다. ' +
      '섹션 일부를 숨기거나 내용을 줄인 뒤 다시 시도해주세요.'
    );
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidthMm = pdf.internal.pageSize.getWidth();   // 210mm
  const pageHeightMm = pdf.internal.pageSize.getHeight(); // 297mm

  // 캔버스 픽셀 ↔ mm 환산. 가로를 페이지 폭에 맞추므로 세로도 같은 비율.
  const pxPerMm = canvas.width / pageWidthMm;
  const pageHeightPx = Math.floor(pageHeightMm * pxPerMm);

  // CSS px → 캔버스 px. 배율을 역산하지 않고 캡처에 쓴 상수를 그대로 곱한다.
  const cutPoints = cutPointsCss
    .map((y) => Math.round(y * PDF_CAPTURE_SCALE))
    .filter((y) => y > 0 && y < canvas.height);

  let offset = 0;
  let isFirstPage = true;
  // 안전한 후보를 찾지 못해 글자 한가운데를 자른 횟수. 끝나고 한 번에 보고한다.
  let forcedCutCount = 0;

  while (offset < canvas.height) {
    const remaining = canvas.height - offset;
    let sliceHeight = Math.min(pageHeightPx, remaining);

    if (remaining > pageHeightPx) {
      // 이 페이지 안에 들어오는 가장 마지막 안전 지점(섹션 또는 항목 경계)에서 자른다.
      const limit = offset + pageHeightPx;
      const safeCut = cutPoints.filter((y) => y > offset && y <= limit).pop();

      // 후보가 페이지 맨 위에 붙어 있으면 몇 px 짜리 페이지가 나온다.
      // 그럴 바에는 강제 절단이 낫다.
      const isUsable =
        safeCut !== undefined && safeCut - offset >= pageHeightPx * MIN_PAGE_FILL_RATIO;

      if (isUsable) {
        sliceHeight = safeCut - offset;
      } else {
        // 항목 하나가 한 페이지보다 큰 경우다. 글자가 가로로 잘리는 것을 피할 수 없다.
        forcedCutCount += 1;
      }
    }

    const slice = document.createElement('canvas');
    try {
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const ctx = slice.getContext('2d');
      if (!ctx) break;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      if (!isFirstPage) pdf.addPage();
      pdf.addImage(
        slice.toDataURL('image/png'),
        'PNG',
        0,
        0,
        pageWidthMm,
        sliceHeight / pxPerMm,
      );
    } finally {
      // 긴 이력서에서는 페이지 수만큼 슬라이스 캔버스가 쌓인다.
      // 크기를 0으로 줄여 백킹 스토어를 즉시 놓아준다.
      slice.width = 0;
      slice.height = 0;
    }

    offset += sliceHeight;
    isFirstPage = false;
  }

  // 안전한 절단 지점을 찾지 못한 횟수를 알린다.
  // 0 이 아니면 항목 하나가 A4 한 장보다 크다는 뜻이고, 그 페이지 경계에서는
  // 글자가 가로로 잘린다. 어느 항목인지는 PDF 를 열어 해당 페이지를 보면 된다.
  if (forcedCutCount > 0) {
    console.warn(
      `[generateResumePdf] 안전한 절단 지점을 찾지 못해 ${forcedCutCount}곳에서 강제로 잘랐습니다. ` +
      '항목 하나가 A4 한 장보다 큽니다 (해당 페이지 경계에서 글자가 잘릴 수 있습니다).'
    );
  }

  // 원본 캔버스도 사용이 끝났으므로 해제한다.
  canvas.width = 0;
  canvas.height = 0;

  return pdf.output('blob');
}

/**
 * Blob 을 파일로 저장한다.
 *
 * @param blob     저장할 Blob
 * @param fileName 확장자를 포함한 파일명
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // 즉시 revoke 하면 일부 브라우저에서 다운로드가 취소되므로 한 틱 뒤에 해제한다.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
