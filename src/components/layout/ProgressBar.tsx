import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ['Search', 'Confirm', 'Assess', 'Report', 'Next Steps'];

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isComplete = step < currentStep;
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isComplete
                    ? 'bg-sage text-white'
                    : isActive
                      ? 'bg-sage text-white ring-2 ring-sage/30 ring-offset-2'
                      : 'bg-warm-white text-warm-gray border border-warm-gray/30'
                }`}
                initial={false}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isComplete ? '✓' : step}
              </motion.div>
              <span className="text-[10px] mt-1 text-warm-gray hidden sm:block">
                {stepLabels[i]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1 bg-warm-white/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-sage rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
