import { ReactElement, ReactNode, useState, Children, useCallback, useRef } from 'react';

export type NonEmptyArray<T> = readonly [T, ...T[]];
export interface StepProps<Steps extends NonEmptyArray<string>> {
  name: Steps[number];
  onEnter?: () => void;
  children: ReactNode;
}

function Step<Steps extends NonEmptyArray<string>>(props: StepProps<Steps>) {
  return <>{props.children}</>;
}

function FunnelRoot<Steps extends NonEmptyArray<string>>({
  step,
  children,
}: {
  step: Steps[number];
  children: ReactNode;
}) {
  const all = Children.toArray(children) as ReactElement<StepProps<Steps>>[];

  return (
    <>
      {all.map((child) => {
        const name = child.props.name as string;
        const visible = child.props.name === step;

        return (
          <div
            key={name}
            style={visible ? undefined : { display: 'none' }}
            aria-hidden={!visible}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}

(FunnelRoot as typeof FunnelRoot & { Step: typeof Step }).Step = Step;

export const Funnel = FunnelRoot as typeof FunnelRoot & { Step: typeof Step };

export const useFunnel = <Steps extends NonEmptyArray<string>>(
  _steps: Steps,
  options?: { initialStep?: Steps[number]; onStepChange?: (step: Steps[number]) => void }
) => {
  const [currentStep, setCurrentStep] = useState<Steps[number]>(options?.initialStep ?? _steps[0]);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const setStep = useCallback((newStep: Steps[number]) => {
    setCurrentStep(newStep);
    optionsRef.current?.onStepChange?.(newStep);
  }, []);

  return [currentStep, setStep] as const;
};
