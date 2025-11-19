// 랜딩페이지 텍스트 상수들
export const LANDING_PAGE_TEXTS = {
  // Hero Section
  hero: {
    title: {
      main: '메이플 키우기 쿠폰',
      highlight: '자동 배포 시스템',
    },
    description:
      '번거로운 UUID 복사와 쿠폰 코드 입력은 이제 그만! 등록만 하면 자동으로 쿠폰을 적용해드립니다.',
    buttons: {
      login: 'UUID 등록하기',
      start: '무료로 시작하기',
      learnMore: '자세히 알아보기',
    },
  },

  // Features Section
  features: {
    title: '메이플 키우기 쿠폰 자동화의 장점',
    subtitle:
      '복잡한 쿠폰 적용 과정을 자동화하여 게임 플레이에만 집중할 수 있습니다.',
    items: {
      autoApply: {
        title: '자동 쿠폰 적용',
        description:
          'UUID 등록만 하면 쿠폰 코드 입력부터 적용까지 모든 과정을 자동으로 처리해드립니다.',
      },
      multiAccount: {
        title: '다중 계정 관리',
        description:
          '여러 개의 메이플 키우기 계정을 한 곳에서 관리하고, 일괄적으로 쿠폰을 적용할 수 있습니다.',
      },
      realTime: {
        title: '추가 서비스 진행 예정',
        description:
          '메이플 키우기가 추후 API 지원을 하게 된다면 기능 업데이트가 있을 수 있습니다.',
      },
    },
  },

  // CTA Section
  cta: {
    title: '지금 바로 UUID를 등록하세요',
    description: '메이플 키우기 쿠폰 자동 배포 서비스를 무료로 이용해보세요.',
    button: '무료 가입하기',
  },

  // Footer
  footer: {
    copyright: '© 2025 Makis',
  },
} as const;
