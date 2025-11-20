# Maple Idle Coupon Auto Bot - Monorepo

메이플 아이들 쿠폰 자동 배포 시스템의 모노레포입니다.

## 프로젝트 구조

```
monorepo/
├── packages/
│   ├── server/          # NestJS 백엔드 API
│   └── client/          # React 프론트엔드
├── package.json         # 모노레포 루트 설정
└── pnpm-workspace.yaml  # 워크스페이스 설정
```

## API 문서

백엔드 실행 후 [http://localhost:3000/api](http://localhost:3000/api)에서 Swagger 문서를 확인할 수 있습니다.

## 프로젝트 목적

메이플 키우기(메이플스토리 키우기) 게임에서 쿠폰 적용 과정을 자동화하여 사용자 편의성을 향상시키는 서비스입니다.

### 주요 문제 해결

- **번거로운 쿠폰 적용 과정**: 인게임에서 UUID 복사 → 웹사이트 접속 → 쿠폰 코드 입력의 반복적인 작업
- **일괄 처리 필요성**: 다수의 계정에 대한 쿠폰 적용을 효율적으로 처리

### 해결 방안

- **쿠폰 코드 중앙 관리**: 서버에서 쿠폰 코드를 관리하고 자동으로 배포
- **UUID 일괄 등록**: 사용자가 UUID를 등록하면 자동으로 쿠폰 적용
- **API 자동화**: 메이플 서버 API를 활용한 자동 쿠폰 적용 시스템

### 미래 확장성

넥슨의 메이플 키우기 오픈 API 제공 시점에 대비하여 다음과 같은 기능을 추가할 수 있습니다:

- 커뮤니티 기능 (친구 목록, 길드 관리 등)
- 게임 데이터 분석 및 통계
- 자동화된 게임 관리 기능

## 주요 기능

### 백엔드 (packages/server)

- **NestJS** 기반 REST API
- **Supabase** 데이터베이스 연동
- 유저 및 쿠폰 관리
- 메이플 서버 API 연동
- Swagger API 문서 자동 생성

### 프론트엔드 (packages/client)

- **React + TypeScript + Vite**
- UUID 등록 및 관리 인터페이스
- 쿠폰 배포 현황 모니터링
- 모던 웹 애플리케이션

```

이미지를 추가하지 않으면 자동으로 플레이스홀더가 표시됩니다.

## 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 라이선스

이 프로젝트는 UNLICENSED입니다.
```
