import React, { useMemo, useState } from "react";
import { Form, useSaveContext } from "ra-core";
import { useFormContext } from "react-hook-form";
import { cn } from "@radish-ui/core";

interface WizardFormProps {
  children: React.ReactNode;
  submitLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
}

interface WizardFormStepProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

interface ParsedStep extends WizardFormStepProps {
  key: React.Key;
}

function WizardFormStep(_props: WizardFormStepProps) {
  return null;
}

WizardFormStep.displayName = "WizardForm.Step";

function isWizardStepElement(
  child: React.ReactNode,
): child is React.ReactElement<WizardFormStepProps> {
  return React.isValidElement(child) && child.type === WizardFormStep;
}

function collectSources(node: React.ReactNode): string[] {
  if (!node) return [];
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectSources(child));
  }
  if (!React.isValidElement(node)) {
    return [];
  }

  const element = node as React.ReactElement<{ source?: unknown; children?: React.ReactNode }>;
  const ownSource = typeof element.props.source === "string" ? [element.props.source] : [];
  const childSources = collectSources(element.props.children);

  return [...ownSource, ...childSources];
}

function WizardFormContent({
  steps,
  submitLabel,
  nextLabel,
  backLabel,
  className,
}: {
  steps: ParsedStep[];
  submitLabel: string;
  nextLabel: string;
  backLabel: string;
  className?: string;
}) {
  const { saving } = useSaveContext();
  const { trigger } = useFormContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const current = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleStepClick = (nextStep: number) => {
    if (nextStep <= furthestStep) {
      setCurrentStep(nextStep);
      setStepError(null);
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      return; // Already on last step, do nothing
    }

    const sources = Array.from(new Set(collectSources(current.children)));
    const isValid = sources.length > 0 ? await trigger(sources, { shouldFocus: true }) : true;

    if (!isValid) {
      setStepError("Please fix the highlighted fields before continuing.");
      return;
    }

    setStepError(null);
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setFurthestStep((prev) => Math.max(prev, nextStep));
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-canvas-0 shadow-sm dark:border-neutral-700 dark:bg-canvas-800",
        className,
      )}
    >
      <ol className="grid grid-cols-1 gap-2 border-b border-neutral-100 px-6 py-5 dark:border-neutral-700 md:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          const isUnlocked = index <= furthestStep;

          return (
            <li key={step.key}>
              <button
                type="button"
                disabled={!isUnlocked}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-left transition-colors",
                  isActive &&
                    "border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/40",
                  !isActive &&
                    isDone &&
                    "border-success-200 bg-success-50 dark:border-success-700 dark:bg-success-900/30",
                  !isActive && !isDone && "border-neutral-200 dark:border-neutral-700",
                  isUnlocked
                    ? "hover:border-primary-200 dark:hover:border-primary-700"
                    : "cursor-not-allowed opacity-60",
                )}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Step {index + 1}
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {step.label}
                </p>
                {step.description ? (
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {step.description}
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="space-y-5 px-6 py-6">
        {stepError ? (
          <div className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200">
            {stepError}
          </div>
        ) : null}
        {current.children}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-6 py-4 dark:border-neutral-700">
        <button
          type="button"
          disabled={saving || currentStep === 0}
          onClick={() => {
            setCurrentStep((prev) => Math.max(0, prev - 1));
            setStepError(null);
          }}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          {backLabel}
        </button>

        {isLastStep ? (
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : submitLabel}
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}

type WizardFormComponent = ((props: WizardFormProps) => React.ReactElement) & {
  Step: (props: WizardFormStepProps) => React.ReactElement | null;
};

const WizardFormImpl = ({
  children,
  submitLabel = "Save",
  nextLabel = "Next",
  backLabel = "Back",
  className,
}: WizardFormProps) => {
  const steps = useMemo<ParsedStep[]>(() => {
    return React.Children.toArray(children)
      .filter(isWizardStepElement)
      .map((step, index) => ({
        key: step.key ?? index,
        label: step.props.label,
        description: step.props.description,
        children: step.props.children,
      }));
  }, [children]);

  if (steps.length === 0) {
    throw new Error("WizardForm requires at least one <WizardForm.Step /> child.");
  }

  return (
    <Form>
      <WizardFormContent
        steps={steps}
        submitLabel={submitLabel}
        nextLabel={nextLabel}
        backLabel={backLabel}
        className={className}
      />
    </Form>
  );
};

export const WizardForm = WizardFormImpl as WizardFormComponent;
WizardForm.Step = WizardFormStep;
