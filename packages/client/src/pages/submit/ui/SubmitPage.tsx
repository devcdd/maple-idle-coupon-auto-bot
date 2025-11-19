import { useState } from 'react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Modal } from '@/shared/ui/Modal';
import { useInput } from '@/shared/hooks/useInput';
import {
  useRegisterUserMutation,
  type RegisterUserResponse,
} from '@/features/register-user';
import {
  VALIDATION_MESSAGES,
  SUBMIT_PAGE_TEXTS,
  SERVER_ERROR_MESSAGES,
} from '@/constants';

// UUID 가이드 이미지 import
import uuidGuide1 from '@/assets/images/uuid-guide-1.png';
import uuidGuide2 from '@/assets/images/uuid-guide-2.png';
import uuidGuide3 from '@/assets/images/uuid-guide-3.png';

// UUID 가이드 이미지 매핑
const UUID_GUIDE_IMAGES = {
  step1: uuidGuide1,
  step2: uuidGuide2,
  step3: uuidGuide3,
};

export function SubmitPage() {
  const userIdInput = useInput({
    initialValue: '',
    validator: (value) => {
      if (!value.trim()) return VALIDATION_MESSAGES.USER_ID_REQUIRED;
      return true;
    },
  });
  const [message, setMessage] = useState('');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const registerUserMutation = useRegisterUserMutation();

  const handleSubmit = () => {
    if (!userIdInput.isValid) {
      setMessage(userIdInput.error || VALIDATION_MESSAGES.USER_ID_REQUIRED);
      return;
    }

    setMessage('');
    registerUserMutation.mutate(userIdInput.value, {
      onSuccess: (data: RegisterUserResponse) => {
        setMessage(`✅ ${data.message}`);
        userIdInput.reset();
      },
      onError: (error: Error) => {
        // 서버에서 보내는 구체적인 에러 메시지 사용
        // 중복 등록, 캐릭터 검증 실패 등 다양한 에러 상황을 처리
        const errorMessage = error.message || '등록에 실패했습니다.';

        // 향후 특정 에러 타입에 따른 추가 처리 가능
        // 예: 중복 에러인 경우 특정 UI 처리, 네트워크 에러인 경우 재시도 등
        if (errorMessage === SERVER_ERROR_MESSAGES.DUPLICATE_USER_ID) {
          // 중복 등록 에러 - 특별한 처리 가능
        } else if (errorMessage === SERVER_ERROR_MESSAGES.INVALID_CHARACTER) {
          // 캐릭터 검증 실패 에러 - 특별한 처리 가능
        }

        setMessage(`❌ ${errorMessage}`);
      },
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] py-[var(--spacing-5xl)]">
        <div className="container mx-auto px-[var(--container-padding)] text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-[var(--color-gray-900)] mb-[var(--spacing-lg)] leading-tight">
              {SUBMIT_PAGE_TEXTS.title}
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-gray-600)] mb-[var(--spacing-3xl)] max-w-2xl mx-auto leading-relaxed">
              {SUBMIT_PAGE_TEXTS.subtitle}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-[var(--color-primary-200)] rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[var(--color-secondary-200)] rounded-full opacity-20"></div>
      </section>

      {/* Form Section */}
      <section className="py-[var(--spacing-5xl)] bg-white">
        <div className="container mx-auto px-[var(--container-padding)]">
          <div className="max-w-2xl mx-auto">
            {/* Form Card */}
            <div className="bg-[var(--color-card)] rounded-2xl shadow-xl p-[var(--spacing-3xl)] mb-[var(--spacing-4xl)]">
              <div className="space-y-[var(--spacing-xl)]">
                <div>
                  <div className="flex items-center gap-[var(--spacing-sm)] mb-[var(--spacing-lg)]">
                    <label className="text-lg font-semibold text-[var(--color-gray-900)]">
                      {SUBMIT_PAGE_TEXTS.form.uuidLabel}
                    </label>
                    <Tooltip content={SUBMIT_PAGE_TEXTS.uuidGuide.question}>
                      <button
                        onClick={() => setIsGuideModalOpen(true)}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary-700)] text-sm font-medium underline"
                      >
                        {SUBMIT_PAGE_TEXTS.uuidGuide.question}
                      </button>
                    </Tooltip>
                  </div>

                  <Input
                    value={userIdInput.value}
                    onChange={(e) => userIdInput.onChange(e.target.value)}
                    placeholder={SUBMIT_PAGE_TEXTS.form.uuidPlaceholder}
                    disabled={registerUserMutation.isPending}
                    className="text-lg"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={registerUserMutation.isPending}
                  size="lg"
                  fullWidth
                  type="submit"
                  className="text-lg py-[var(--spacing-xl)]"
                >
                  {registerUserMutation.isPending
                    ? SUBMIT_PAGE_TEXTS.form.submittingButton
                    : SUBMIT_PAGE_TEXTS.form.submitButton}
                </Button>

                {message && (
                  <div className="text-center">
                    <p
                      className={`text-sm font-medium px-[var(--spacing-lg)] py-[var(--spacing-lg)] rounded-lg ${
                        message.startsWith('✅')
                          ? 'bg-[var(--color-success-50)] text-[var(--color-success-700)] border border-[var(--color-success-200)]'
                          : 'bg-red-50 text-[var(--color-error)] border border-red-200'
                      }`}
                    >
                      {message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UUID Guide Modal */}
      <Modal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        title={SUBMIT_PAGE_TEXTS.uuidGuide.modalTitle}
      >
        <div className="space-y-8">
          {SUBMIT_PAGE_TEXTS.uuidGuide.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">
                    {index + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-[var(--color-gray-900)] mb-2">
                  {step.title}
                </h4>
                <p className="text-[var(--color-gray-600)] mb-4">
                  {step.description}
                </p>
                {/* 가이드 이미지 */}
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={
                      UUID_GUIDE_IMAGES[
                        step.image as keyof typeof UUID_GUIDE_IMAGES
                      ]
                    }
                    alt={`${step.title} 가이드 이미지`}
                    className="w-full h-auto"
                    onError={(e) => {
                      // 이미지 로드 실패시 플레이스홀더 표시
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="p-8 text-center text-gray-500">
                            <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-sm">이미지 ${
                              index + 1
                            }: ${step.title.replace(/\d+단계:\s*/, '')}</p>
                            <p class="text-xs text-gray-400 mt-1">
                              ${step.title.replace(/\d+단계:\s*/, '')}
                              } 경로에 이미지를 넣어주세요
                            </p>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
