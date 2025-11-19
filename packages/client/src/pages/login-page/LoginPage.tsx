import { Button } from '@/shared/ui/Button';
import { useKakaoSDK } from '@/features/auth';

export function LoginPage() {
  const { kakao, isLoaded, isError } = useKakaoSDK();

  const handleKakaoLogin = () => {
    if (!isLoaded || !kakao) {
      console.error('카카오 SDK가 로드되지 않았습니다.');
      return;
    }

    try {
      kakao.Auth.authorize({
        redirectUri: `${window.location.origin}/auth/callback/kakao`,
      });
    } catch (error) {
      console.error('카카오 로그인 중 오류 발생:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] py-[var(--spacing-5xl)]">
        <div className="container mx-auto px-[var(--container-padding)] text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-[var(--color-gray-900)] mb-[var(--spacing-lg)] leading-tight">
              로그인
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-gray-600)] mb-[var(--spacing-3xl)] max-w-2xl mx-auto leading-relaxed">
              계정에 로그인하여 더 많은 기능을 이용해보세요
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-[var(--color-primary-200)] rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[var(--color-secondary-200)] rounded-full opacity-20"></div>
      </section>

      {/* Login Form Section */}
      <section className="py-[var(--spacing-5xl)] bg-white">
        <div className="container mx-auto px-[var(--container-padding)]">
          <div className="max-w-md mx-auto">
            {/* Login Card */}
            <div className="bg-[var(--color-card)] rounded-2xl shadow-xl p-[var(--spacing-3xl)]">
              <div className="space-y-[var(--spacing-xl)]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[var(--color-gray-900)] mb-[var(--spacing-lg)]">
                    소셜 로그인
                  </h2>
                  <p className="text-[var(--color-gray-600)]">
                    간편하게 로그인하고 서비스를 이용하세요
                  </p>
                </div>

                <div className="space-y-[var(--spacing-lg)]">
                  <Button
                    onClick={handleKakaoLogin}
                    size="lg"
                    fullWidth
                    disabled={!isLoaded || isError}
                    className="bg-[#FEE500] hover:bg-[#FDD835] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#3C1E1E] font-semibold text-lg py-[var(--spacing-xl)] border-0 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center gap-3">
                      {!isLoaded && !isError && (
                        <svg
                          className="animate-spin w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      {isLoaded && (
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 5.84 2 10.34c0 3.12 1.68 5.88 4.32 7.66-.08.32-.24.92-.48 1.56-.04.12-.08.24-.08.32 0 .12.04.24.12.32.4.48 3.28 2.24 5.92 2.72.04 0 .08 0 .12.04.12.04.24.04.32.04.12 0 .24-.04.32-.12.12-.04.24-.12.32-.2.32-.2 1.16-1.04 1.52-1.68.08-.12.16-.24.16-.36 0-.08-.04-.16-.12-.24-.24-.48-.4-.92-.52-1.32C18.32 16.22 20 13.46 20 10.34 20 5.84 15.52 2 12 2z" />
                        </svg>
                      )}
                      {isError && <span>⚠️</span>}
                      {!isLoaded && !isError
                        ? '카카오 SDK 로딩 중...'
                        : isError
                        ? 'SDK 로드 실패'
                        : '카카오로 로그인'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </Button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
