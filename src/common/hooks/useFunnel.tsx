import { ReactElement, ReactNode, useMemo, useState, Children } from 'react';

export type NonEmptyArray<T> = readonly [T, ...T[]];
export interface FunnelProps<Steps extends NonEmptyArray<string>> {
  steps: Steps;
  step: Steps[number];
  children: Array<ReactElement<StepProps<Steps>>> | ReactElement<StepProps<Steps>>;
}
export interface StepProps<Steps extends NonEmptyArray<string>> {
  name: Steps[number];
  onEnter?: () => void;
  children: ReactNode;
}

export const useFunnel = <Steps extends NonEmptyArray<string>>(
  steps: Steps,
  options?: { initialStep?: Steps[number]; onStepChange?: (step: Steps[number]) => void }
) => {
  const [step, setStep] = useState<Steps[number]>(options?.initialStep ?? steps[0]);

  const FunnelComponent = useMemo(() => {
    function Funnel(props: Omit<FunnelProps<Steps>, 'steps' | 'step'>) {
      const all = Children.toArray(props.children) as ReactElement<StepProps<Steps>>[];

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

    // eslint-disable-next-line react-hooks/immutability
    Funnel.Step = function Step(props: StepProps<Steps>) {
      return <>{props.children}</>;
    };

    return Funnel as typeof Funnel & { Step: typeof Funnel.Step };
  }, [step]);

  const setStepWithCallback = (newStep: Steps[number]) => {
    setStep(newStep);
    options?.onStepChange?.(newStep);
  };

  return [FunnelComponent, setStepWithCallback] as const;
};
