interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => {
  const _progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-4 lg:mb-6 flex justify-center gap-2">
      {stepTitles.map((_title, index) => {
        const stepNumber = index + 1;
        const isCurrent = stepNumber === currentStep;

        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: Steps are static array
            key={index}
            className={`w-8 h-2 rounded-full transition-all ${
              isCurrent ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        );
      })}
    </div>
  );
};
