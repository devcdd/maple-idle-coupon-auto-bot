// SubmitPage 텍스트 상수들
export const SUBMIT_PAGE_TEXTS = {
  title: '메이플 키우기 UUID 등록',
  subtitle: '게임 내에서 확인한 UUID를 입력하세요',
  uuidGuide: {
    question: 'UUID를 어떻게 확인하나요?',
    modalTitle: 'UUID 확인 가이드',
    steps: [
      {
        title: '1단계: 게임 접속',
        description: '메이플 키우기 게임에 접속하세요',
        image: 'step1',
      },
      {
        title: '2단계: 설정 메뉴',
        description:
          '우측 상단의 햄버거 버튼을 눌러 게임 내 설정 메뉴를 열어주세요',
        image: 'step2',
      },
      {
        title: '3단계: UUID 복사',
        description:
          '우측 하단의 톱니바퀴를 눌러 계정 정보를 확인하신 후, UUID를 복사하세요',
        image: 'step3',
      },
    ],
  },
  form: {
    uuidLabel: 'UUID',
    uuidPlaceholder: '예: 12345678-1234-1234-1234-123456789012',
    submitButton: '등록하기',
    submittingButton: '등록 중...',
    successMessage: 'UUID가 성공적으로 등록되었습니다!',
    errorMessage: '등록에 실패했습니다.',
  },
} as const;
