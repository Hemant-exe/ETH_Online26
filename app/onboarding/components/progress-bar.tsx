interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full h-2 bg-gray-200 rounded-t-lg overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

