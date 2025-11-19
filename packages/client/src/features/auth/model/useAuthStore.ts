import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/entities/user';
import { setRefreshToken, clearAuthCookies } from '@/shared/lib';

/**
 * 인증 상태 관리 스토어
 */
interface AuthStore {
  // 상태
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // 액션
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  updateAccessToken: (accessToken: string) => void;
}

/**
 * 인증 정보를 관리하는 Zustand Store
 * - user, accessToken은 localStorage에 저장 (persist 미들웨어)
 * - refreshToken은 쿠키에 저장
 */
// store 객체를 window에 저장하여 외부에서 접근 가능하도록 함
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      // store 객체를 window에 저장 (axiosInstance에서 토큰 갱신 시 사용)
      if (typeof window !== 'undefined') {
        (window as any).__AUTH_STORE__ = { set, get };
      }

      return {
        // 초기 상태
        user: null,
        accessToken: null,
        isAuthenticated: false,

        // 로그인 시 인증 정보 설정
        setAuth: (user, accessToken, refreshToken) => {
          // RefreshToken은 쿠키에 저장
          setRefreshToken(refreshToken);

          // User와 AccessToken은 store에 저장
          set({
            user,
            accessToken,
            isAuthenticated: true,
          });
        },

        // 로그아웃 시 인증 정보 삭제
        clearAuth: () => {
          // 쿠키의 refreshToken 삭제
          clearAuthCookies();

          // Store 초기화
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
        },

        // 사용자 정보 업데이트
        updateUser: (updatedUser) => {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, ...updatedUser },
            });
          }
        },

        // AccessToken 업데이트 (토큰 갱신 시 사용)
        updateAccessToken: (accessToken) => {
          set({ accessToken });
        },
      };
    },
    {
      name: 'auth-storage', // localStorage 키 이름
      partialize: (state) => ({
        // localStorage에 저장할 항목만 선택
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

/**
 * 인증 여부 확인 Hook
 */
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);

/**
 * 현재 사용자 정보 Hook
 */
export const useUser = () => useAuthStore((state) => state.user);

/**
 * Access Token Hook
 */
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
