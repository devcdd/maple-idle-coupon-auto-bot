export function MainPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--color-gray-900)] mb-[var(--spacing-lg)]">
          메키스에 오신 것을 환영합니다
        </h1>
        <p className="text-lg text-[var(--color-gray-600)] mb-[var(--spacing-xl)]">
          회원가입을 통해 다양한 서비스를 이용해보세요
        </p>
        <div className="space-x-[var(--spacing-md)]">
          <a
            href="/submit"
            className="inline-block px-[var(--spacing-xl)] py-[var(--spacing-lg)] bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-600)] transition-colors"
          >
            시작하기
          </a>
        </div>
      </div>
    </div>
  );
}
