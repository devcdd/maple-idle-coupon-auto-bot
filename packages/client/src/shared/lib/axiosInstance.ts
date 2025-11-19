import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { getRefreshToken, setRefreshToken, clearAuthCookies } from './cookies';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// 토큰을 가져오는 함수 (순환 의존성 방지를 위해 직접 store import 대신 함수로 분리)
const getAccessToken = (): string | null => {
  try {
    // localStorage에서 직접 가져옴 (useAuthStore의 persist 설정과 동일)
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      const token = parsed.state?.accessToken;
      console.log(`🔑 getAccessToken 호출, 토큰: ${token ? '있음' : '없음'}`);
      return token || null;
    }
    console.log('🔑 getAccessToken 호출, authData 없음');
    return null;
  } catch (error) {
    console.log('🔑 getAccessToken 호출, 파싱 에러:', error);
    return null;
  }
};

// 토큰 재발급 중인지 확인하는 플래그
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// 큐에 쌓인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  console.log(`🔄 큐에 쌓인 요청 ${failedQueue.length}개 처리 시작`);

  failedQueue.forEach(({ resolve, reject }, index) => {
    if (error) {
      console.log(`❌ 큐 요청 ${index + 1} 실패 처리`);
      reject(error);
    } else {
      console.log(
        `✅ 큐 요청 ${index + 1} 성공 처리, 토큰: ${token ? '있음' : '없음'}`,
      );
      resolve(token!);
    }
  });

  failedQueue = [];
};

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 확장된 Config 타입 정의
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _skipAuthRefresh?: boolean;
}

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // _skipAuthRefresh 플래그가 있으면 토큰 덮어쓰기를 건너뜀 (재시도 요청용)
    if ((config as ExtendedAxiosRequestConfig)._skipAuthRefresh) {
      console.log('🔄 재시도 요청 - 토큰 덮어쓰기 스킵');
      return config;
    }

    // AccessToken 추가
    const accessToken = getAccessToken();
    console.log(
      `📤 요청 인터셉터 - ${config.method?.toUpperCase()} ${
        config.url
      }, 토큰: ${accessToken ? '있음' : '없음'}`,
    );
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log(
        `🔑 Authorization 헤더 설정됨: Bearer ${accessToken.substring(
          0,
          20,
        )}...`,
      );

      // 토큰 디코딩해서 만료 시간 확인
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTime = payload.exp - currentTime;

        console.log(`⏰ 토큰 만료 정보:`, {
          issuedAt: new Date(payload.iat * 1000).toISOString(),
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          currentTime: new Date(currentTime * 1000).toISOString(),
          remainingSeconds: remainingTime,
          isExpired: remainingTime <= 0,
        });
      } catch (e) {
        console.log(`⚠️ 토큰 디코딩 실패:`, e);
      }
    } else {
      console.log(`❌ Authorization 헤더 미설정`);
    }

    // RefreshToken이 쿠키에 있는 경우 함께 전송 (선택사항)
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      config.headers['X-Refresh-Token'] = refreshToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 응답 헤더에서 새로운 토큰이 있는지 확인하고 저장
    const newAccessToken = response.headers['x-access-token'];
    const newRefreshToken = response.headers['x-refresh-token'];

    // 로그인 시점에 refreshToken이 헤더로 오는 경우 (쿠키에 저장)
    if (newRefreshToken && !newAccessToken) {
      setRefreshToken(newRefreshToken);
    }

    if (newAccessToken) {
      // 새로운 accessToken을 localStorage에 저장 (useAuthStore와 동일한 방식)
      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          parsed.state.accessToken = newAccessToken;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }
      } catch (error) {
        console.error('Failed to save new access token:', error);
      }
    }

    if (newRefreshToken) {
      // 새로운 refreshToken을 쿠키에 저장
      setRefreshToken(newRefreshToken);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 재발급 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log(
              `🔄 큐 요청 재시도 - 토큰 적용: ${token ? '있음' : '없음'}`,
            );
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._skipAuthRefresh = true; // 재시도 시 인터셉터에서 토큰 덮어쓰기 방지
            console.log(`📨 재시도 요청 헤더:`, originalRequest.headers);
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            console.log(`❌ 큐 요청 재시도 실패:`, err);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          console.log('🔄 토큰 만료됨, 자동 갱신 시도...');
          console.log(
            '📋 Refresh Token:',
            refreshToken.substring(0, 20) + '...',
          );

          // refresh token으로 새로운 토큰 요청
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              withCredentials: true, // 쿠키 전송을 위해 필수
            },
          );

          console.log('📡 Refresh API 응답:', response.data);
          console.log(
            '📋 Response Headers:',
            JSON.stringify(response.headers, null, 2),
          );
          console.log('🔍 All Headers Keys:', Object.keys(response.headers));

          if (response.data.success) {
            console.log('✅ 토큰 갱신 성공');

            // 새로운 토큰 저장 (헤더 또는 body에서 추출)
            const newAccessToken =
              response.headers['x-access-token'] ||
              response.headers['X-Access-Token'] ||
              response.data.accessToken; // fallback으로 body에서 추출
            const newRefreshToken =
              response.headers['x-refresh-token'] ||
              response.headers['X-Refresh-Token'] ||
              response.data.refreshToken; // fallback으로 body에서 추출

            console.log(
              '🆕 New Access Token:',
              newAccessToken ? '있음' : '없음',
            );
            console.log(
              '🆕 New Refresh Token:',
              newRefreshToken ? '있음' : '없음',
            );

            if (newAccessToken) {
              // localStorage에 저장
              try {
                const authData = localStorage.getItem('auth-storage');
                if (authData) {
                  const parsed = JSON.parse(authData);
                  parsed.state.accessToken = newAccessToken;
                  localStorage.setItem('auth-storage', JSON.stringify(parsed));
                  console.log('💾 localStorage에 새 토큰 저장 완료');

                  // zustand store 직접 업데이트
                  if ((window as any).__AUTH_STORE__) {
                    try {
                      const { set, get } = (window as any).__AUTH_STORE__;
                      const currentState = get();

                      set({
                        ...currentState,
                        accessToken: newAccessToken,
                        isAuthenticated: true,
                      });
                      console.log('🔄 Zustand store 직접 업데이트 완료');
                    } catch (e) {
                      console.log('⚠️ Zustand store 업데이트 실패:', e);
                    }
                  } else {
                    console.log('⚠️ Zustand store 객체를 찾을 수 없음');
                  }

                  // 저장 후 즉시 확인
                  const savedToken = getAccessToken();
                  console.log(
                    '🔍 저장 후 토큰 확인:',
                    savedToken ? '있음' : '없음',
                  );
                }
              } catch (error) {
                console.error('Failed to save new access token:', error);
              }
            }

            if (newRefreshToken) {
              // 쿠키에 저장
              setRefreshToken(newRefreshToken);
            }

            // 큐에 쌓인 요청들 처리
            console.log('🎯 큐 처리 및 원래 요청 재시도 시작');
            processQueue(null, newAccessToken);

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            originalRequest._skipAuthRefresh = true; // 재시도 시 인터셉터에서 토큰 덮어쓰기 방지
            console.log(
              `🚀 원래 요청 재시도 준비됨, 토큰: ${
                newAccessToken ? '있음' : '없음'
              }`,
            );
            return axiosInstance(originalRequest);
          } else {
            throw new Error('토큰 갱신 실패');
          }
        } catch (refreshError) {
          console.log('❌ 토큰 갱신 실패:', refreshError);

          // 토큰 갱신 실패 시 토큰 정리
          try {
            localStorage.removeItem('auth-storage');
            clearAuthCookies();
          } catch (error) {
            console.error('Failed to clear auth data:', error);
          }

          // 큐에 쌓인 요청들 실패 처리
          processQueue(refreshError, null);

          // 로그인 페이지로 리다이렉트 (필요시)
          // window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // refresh token이 없으면 바로 실패
        console.log('❌ Refresh token이 없음');

        // 토큰 정리
        try {
          localStorage.removeItem('auth-storage');
          clearAuthCookies();
        } catch (error) {
          console.error('Failed to clear auth data:', error);
        }

        return Promise.reject(error);
      }
    }

    // 401이 아닌 다른 에러들은 그대로 처리
    if (error.response) {
      const message =
        error.response.data?.message || `HTTP ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      throw new Error('네트워크 오류가 발생했습니다.');
    } else {
      // 기타 오류
      throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
    }
  },
);
