type SignupStep = 'github' | 'info' | 'verification' | 'complete';

interface StepIndicatorProps {
  currentStep: SignupStep;
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { id: 'github', label: 'GitHub' },
    { id: 'info', label: '정보입력' },
    { id: 'verification', label: '인증' },
  ];

  const getStepIndex = (step: SignupStep) => {
    if (step === 'complete') return 3;
    return steps.findIndex(s => s.id === step);
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center
                    text-[12px] font-semibold transition-all duration-300
                    ${isCompleted
                      ? 'bg-[#3182f6] text-white'
                      : isCurrent
                        ? 'bg-[#3182f6] text-white'
                        : 'bg-[#e5e8eb] text-[#8b95a1]'
                    }
                  `}
                >
                  {isCompleted ? <CheckIcon /> : index + 1}
                </div>
                <span
                  className={`
                    text-[13px] font-medium transition-colors duration-300
                    ${isCompleted || isCurrent ? 'text-[#191f28]' : 'text-[#8b95a1]'}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-[2px] rounded-full transition-colors duration-300 ${
                    isCompleted ? 'bg-[#3182f6]' : 'bg-[#e5e8eb]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
