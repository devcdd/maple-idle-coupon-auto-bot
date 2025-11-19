// 카카오 SDK 타입 정의
interface KakaoSDK {
  init: (appKey: string) => void;
  isInitialized: () => boolean;
  Auth: {
    authorize: (options: { redirectUri: string; scope?: string }) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

export const loadKakaoSDK = (): Promise<KakaoSDK> => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.Kakao && window.Kakao.isInitialized()) {
      resolve(window.Kakao);
      return;
    }

    // 이미 로딩 중인 스크립트가 있는지 확인
    const existingScript = document.querySelector(
      'script[src*="kakao.min.js"]',
    );
    if (existingScript) {
      // 로딩 완료 대기
      const checkLoaded = () => {
        if (window.Kakao && window.Kakao.isInitialized()) {
          resolve(window.Kakao);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    try {
      // 스크립트 동적 로드
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js';
      script.integrity =
        'sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm';
      script.crossOrigin = 'anonymous';
      script.async = true;

      script.onload = () => {
        if (window.Kakao) {
          window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY);

          // 초기화 완료 후 반환
          setTimeout(() => {
            if (window.Kakao && window.Kakao.isInitialized()) {
              resolve(window.Kakao);
            } else {
              reject(new Error('카카오 SDK 초기화 실패'));
            }
          }, 100);
        } else {
          reject(new Error('카카오 SDK 로드 실패'));
        }
      };

      script.onerror = () => {
        reject(new Error('카카오 SDK 스크립트 로드 실패'));
      };

      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
};
