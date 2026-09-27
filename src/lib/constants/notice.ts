/**
 * 공지사항 / FAQ 정적 콘텐츠.
 *
 * <p>현재는 샘플 문구다. 실제 문구로 교체할 때는 이 파일만 고치면 된다.
 * 추후 백엔드 공지 API로 옮길 경우에도 화면({@code NoticePageClient})은
 * 아래 타입만 맞추면 그대로 쓸 수 있다.</p>
 */

export interface NoticeEntry {
  id: string;
  /** 목록에 표시할 분류 뱃지 */
  category: '점검' | '업데이트' | '시즌' | '안내';
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** 문단 단위 본문 */
  body: string[];
  /** 상단 고정 여부 */
  pinned?: boolean;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqCategory {
  category: string;
  items: FaqEntry[];
}

export const NOTICES: NoticeEntry[] = [
  {
    id: 'maintenance-2026-10',
    category: '점검',
    title: '[점검] 10월 정기 서버 점검 안내',
    date: '2026-09-25',
    pinned: true,
    body: [
      '보다 안정적인 서비스 제공을 위해 정기 서버 점검을 진행합니다.',
      '점검 일시: 2026년 10월 4일(토) 02:00 ~ 06:00 (4시간)',
      '점검 중에는 로그인, 이력서 저장, 학습자료 업로드 등 모든 기능을 이용할 수 없습니다. 이용에 불편을 드려 죄송합니다.',
    ],
  },
  {
    id: 'update-resume-export',
    category: '업데이트',
    title: '이력서 한글(HWPX) 내려받기 기능 추가',
    date: '2026-09-20',
    body: [
      '포트폴리오의 이력서를 PDF뿐 아니라 한글(HWPX) 파일로도 내려받을 수 있게 되었습니다.',
      '포트폴리오 > 이력서 화면 우측 상단의 내려받기 버튼에서 형식을 선택해 주세요.',
    ],
  },
  {
    id: 'update-materials-public',
    category: '업데이트',
    title: '학습자료 공개 설정 개선 안내',
    date: '2026-09-12',
    body: [
      '학습자료의 공개 여부가 폴더 단위로 더 명확하게 표시되도록 개선했습니다.',
      '상위 폴더가 비공개이면 그 안의 자료는 개별 설정과 관계없이 다른 사람에게 보이지 않습니다.',
    ],
  },
  {
    id: 'season-2026-fall',
    category: '시즌',
    title: '2026 가을 시즌 랭킹 시작 안내',
    date: '2026-09-01',
    body: [
      '2026 가을 시즌이 시작되었습니다. 시즌 기간 동안의 활동 점수로 시즌 랭킹이 집계됩니다.',
      '시즌 기간: 2026년 9월 1일 ~ 12월 31일',
      '지난 시즌의 최종 순위는 랭킹 페이지의 시즌 선택에서 확인할 수 있습니다.',
    ],
  },
];

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: '계정',
    items: [
      {
        question: 'GitHub 연동은 필수인가요?',
        answer:
          '네. K-OSP는 GitHub 활동을 기반으로 기여 내역과 랭킹을 집계하기 때문에 회원가입 시 GitHub 계정 연동이 필요합니다.',
      },
      {
        question: '탈퇴하면 작성한 자료는 어떻게 되나요?',
        answer:
          '탈퇴 시 프로필과 이력서, 학습자료는 더 이상 다른 사용자에게 노출되지 않습니다. 커뮤니티에 작성한 글은 작성자 정보가 가려진 상태로 남을 수 있습니다.',
      },
    ],
  },
  {
    category: '이력서',
    items: [
      {
        question: '이력서를 여러 개 만들 수 있나요?',
        answer:
          '네. 포트폴리오에서 이력서를 여러 개 만들고, 그중 하나를 공개 이력서로 지정할 수 있습니다.',
      },
      {
        question: 'PDF·한글로 내려받을 수 있나요?',
        answer: '네. 이력서 화면의 내려받기 버튼에서 PDF 또는 한글(HWPX) 형식을 선택할 수 있습니다.',
      },
    ],
  },
  {
    category: '학습자료',
    items: [
      {
        question: '업로드한 자료는 기본이 공개인가요?',
        answer:
          '아니요. 새로 업로드한 자료는 기본적으로 비공개입니다. 폴더 또는 자료 단위로 공개로 전환해야 다른 사람에게 보입니다.',
      },
      {
        question: '상위 폴더가 비공개면 어떻게 되나요?',
        answer:
          '상위 폴더가 비공개이면 그 안의 하위 폴더와 자료는 개별 설정이 공개여도 다른 사람에게 보이지 않습니다. 비공개 설정이 항상 우선합니다.',
      },
    ],
  },
  {
    category: '랭킹',
    items: [
      {
        question: '점수는 어떻게 계산되나요?',
        answer:
          '시즌 랭킹은 챌린지 달성, 커뮤니티 활동 등으로 얻은 활동 점수로, GitHub 랭킹은 활동량·다양성·영향력 점수를 합산해 계산합니다.',
      },
      {
        question: '시즌이 끝나면 점수는 어떻게 되나요?',
        answer:
          '시즌이 끝나면 시즌 점수는 초기화되고 새 시즌이 시작됩니다. 지난 시즌의 최종 순위는 기록으로 남아 확인할 수 있습니다.',
      },
    ],
  },
  {
    category: '팀',
    items: [
      {
        question: '팀 초대는 며칠 동안 유효한가요?',
        answer: '팀 초대는 발송 후 7일 동안 유효합니다. 기간이 지나면 팀장에게 다시 초대를 요청해 주세요.',
      },
    ],
  },
];
