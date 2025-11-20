import { useState, useEffect } from 'react';
import { loadKakaoSDK } from './kakaoSDK';

interface KakaoSDK {
  init: (appKey: string) => void;
  isInitialized: () => boolean;
  Auth: {
    authorize: (options: { redirectUri: string; scope?: string }) => void;
  };
}

export const useKakaoSDK = () => {
  const [kakao, setKakao] = useState<KakaoSDK | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const initializeKakao = async () => {
      try {
        const kakaoInstance = await loadKakaoSDK();
        setKakao(kakaoInstance);
        setIsLoaded(true);
      } catch (error) {
        console.error('카카오 SDK 로드 중 오류 발생:', error);
        setIsError(true);
      }
    };

    initializeKakao();
  }, []);

  return {
    kakao,
    isLoaded,
    isError,
  };
};
