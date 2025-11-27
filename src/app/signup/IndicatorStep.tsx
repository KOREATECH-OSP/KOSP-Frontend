type SignupStep = 'github' | 'info' | 'verification' | 'complete';

interface StepIndicatorProps {
  currentStep: SignupStep;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { id: 'github', label: 'GitHub 연동', number: 1 },
    { id: 'info', label: '정보 입력', number: 2 },
    { id: 'verification', label: '이메일 인증', number: 3 },
  ];

  const getStepIndex = (step: SignupStep) => {
    if (step === 'complete') return 3;
    return steps.findIndex(s => s.id === step);
  };

  const currentIndex = getStepIndex(currentStep);

  const getStepStyle = (index: number) => {
    if (index < currentIndex) {
      return 'bg-blue-600 text-white';
    } else if (index === currentIndex) {
      return 'bg-blue-600 text-white';
    } else {
      return 'bg-gray-300 text-gray-600';
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1">
          <div className="flex w-20 flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${getStepStyle(index)} `}>
              {step.number}
            </div>
            <span className="text-xs mt-2 text-gray-600 font-medium">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="h-1 bg-gray-300 flex-1 my-5 w-[calc((100vw-280px)/2)] max-w-[100px]">
              <div 
                className={`h-full transition-all duration-300 ${
                  index < currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
