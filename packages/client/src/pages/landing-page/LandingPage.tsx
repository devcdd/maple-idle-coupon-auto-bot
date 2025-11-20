import { Button } from '@/shared/ui/Button';
import { LANDING_PAGE_TEXTS } from '@/constants';
import { useAuthStore } from '@/features/auth';

export function LandingPage() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] py-[var(--spacing-5xl)]">
        <div className="container mx-auto px-[var(--container-padding)] text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-[var(--color-gray-900)] mb-[var(--spacing-xl)] leading-tight">
              {LANDING_PAGE_TEXTS.hero.title.main}
              <br />
              <span className="text-[var(--color-primary)]">
                {LANDING_PAGE_TEXTS.hero.title.highlight}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-gray-600)] mb-[var(--spacing-3xl)] max-w-2xl mx-auto leading-relaxed">
              {LANDING_PAGE_TEXTS.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-[var(--spacing-lg)] justify-center">
              {user ? (
                // 로그인된 상태 - UUID 등록하기 버튼
                <Button
                  size="lg"
                  className="text-lg px-[var(--spacing-3xl)] py-[var(--spacing-xl)]"
                >
                  <a href="/submit">UUID 등록하기</a>
                </Button>
              ) : (
                // 로그인되지 않은 상태 - UUID 등록하기 버튼
                <Button
                  size="lg"
                  className="text-lg px-[var(--spacing-3xl)] py-[var(--spacing-xl)]"
                >
                  <a href="/submit">{LANDING_PAGE_TEXTS.hero.buttons.login}</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        {/* <div className="absolute top-10 left-10 w-20 h-20 bg-[var(--color-primary-200)] rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[var(--color-secondary-200)] rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[var(--color-accent-200)] rounded-full opacity-20"></div> */}
      </section>

      {/* Features Section */}
      <section className="py-[var(--spacing-5xl)] bg-white">
        <div className="container mx-auto px-[var(--container-padding)]">
          <div className="text-center mb-[var(--spacing-4xl)]">
            <h2 className="text-4xl font-bold text-[var(--color-gray-900)] mb-[var(--spacing-lg)]">
              {LANDING_PAGE_TEXTS.features.title}
            </h2>
            <p className="text-xl text-[var(--color-gray-600)] max-w-2xl mx-auto">
              {LANDING_PAGE_TEXTS.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-[var(--spacing-3xl)]">
            {/* Feature 1 */}
            <div className="text-center p-[var(--spacing-3xl)] rounded-2xl bg-[var(--color-surface)] hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-[var(--spacing-xl)]">
                <span className="text-2xl text-white">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-gray-900)] mb-[var(--spacing-lg)]">
                {LANDING_PAGE_TEXTS.features.items.autoApply.title}
              </h3>
              <p className="text-[var(--color-gray-600)] leading-relaxed">
                {LANDING_PAGE_TEXTS.features.items.autoApply.description}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-[var(--spacing-3xl)] rounded-2xl bg-[var(--color-surface)] hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[var(--color-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-[var(--spacing-xl)]">
                <span className="text-2xl text-white">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-gray-900)] mb-[var(--spacing-lg)]">
                {LANDING_PAGE_TEXTS.features.items.multiAccount.title}
              </h3>
              <p className="text-[var(--color-gray-600)] leading-relaxed">
                {LANDING_PAGE_TEXTS.features.items.multiAccount.description}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-[var(--spacing-3xl)] rounded-2xl bg-[var(--color-surface)] hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[var(--color-accent)] rounded-2xl flex items-center justify-center mx-auto mb-[var(--spacing-xl)]">
                <span className="text-2xl text-white">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-gray-900)] mb-[var(--spacing-lg)]">
                {LANDING_PAGE_TEXTS.features.items.realTime.title}
              </h3>
              <p className="text-[var(--color-gray-600)] leading-relaxed">
                {LANDING_PAGE_TEXTS.features.items.realTime.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[var(--spacing-5xl)] bg-[var(--color-primary)]">
        <div className="container mx-auto px-[var(--container-padding)] text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-[var(--spacing-xl)]">
              {LANDING_PAGE_TEXTS.cta.title}
            </h2>
            <p className="text-xl text-[var(--color-primary-100)] mb-[var(--spacing-3xl)]">
              {LANDING_PAGE_TEXTS.cta.description}
            </p>
            <Button
              size="lg"
              className="bg-white text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] px-[var(--spacing-3xl)] py-[var(--spacing-xl)] text-lg font-semibold"
            >
              <a href="/submit">
                {user ? 'UUID 등록하기' : LANDING_PAGE_TEXTS.cta.button}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-gray-900)] text-white py-[var(--spacing-3xl)]">
        <div className="container mx-auto px-[var(--container-padding)] text-center">
          <p className="text-[var(--color-gray-400)]">
            {LANDING_PAGE_TEXTS.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
