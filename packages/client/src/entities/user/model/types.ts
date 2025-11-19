/**
 * 사용자 제공자 (OAuth Provider)
 */
export type Provider = 'KAKAO' | 'GOOGLE' | 'NAVER';

/**
 * 사용자 엔티티
 */
export interface User {
  userId: string;
  provider: Provider;
  nickname?: string | null;
  isAdmin?: boolean;
}

/**
 * 인증 응답 데이터
 */
export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

