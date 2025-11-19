import Cookies from 'js-cookie';

/**
 * 쿠키 키 상수
 */
export const COOKIE_KEYS = {
  REFRESH_TOKEN: 'refreshToken',
} as const;

/**
 * Refresh Token을 쿠키에 저장
 * @param refreshToken - 저장할 refresh token
 * @param options - 쿠키 옵션 (기본값: 30일)
 */
export function setRefreshToken(
  refreshToken: string,
  options?: Cookies.CookieAttributes,
): void {
  Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
    expires: 30, // 30일
    secure: import.meta.env.PROD, // production에서만 secure
    sameSite: import.meta.env.PROD ? 'strict' : 'lax', // 개발환경에서는 lax로 설정
    ...options,
  });
}

/**
 * 쿠키에서 Refresh Token 가져오기
 * @returns refresh token 또는 undefined
 */
export function getRefreshToken(): string | undefined {
  return Cookies.get(COOKIE_KEYS.REFRESH_TOKEN);
}

/**
 * Refresh Token 쿠키 삭제
 */
export function removeRefreshToken(): void {
  Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN);
}

/**
 * 모든 인증 관련 쿠키 삭제
 */
export function clearAuthCookies(): void {
  removeRefreshToken();
}

