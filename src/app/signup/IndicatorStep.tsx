type SignupStep = 'github' | 'info' | 'verification' | 'complete';

interface StepIndicatorProps {
  currentStep: SignupStep;
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
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold ${
                index <= currentIndex
                  ? 'bg-[#3182f6] text-white'
                  : 'bg-[#e5e8eb] text-[#8b95a1]'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-[13px] font-medium ${
                index <= currentIndex ? 'text-[#191f28]' : 'text-[#8b95a1]'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-6 h-[2px] mx-2 rounded ${
                index < currentIndex ? 'bg-[#3182f6]' : 'bg-[#e5e8eb]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
