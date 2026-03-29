import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';

import PageTransition from '../components/layout/PageTransition';
import ProgressBar from '../components/layout/ProgressBar';
import { useAppStore, type WizardAnswers } from '../stores/appStore';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CardOption<V extends string> {
  value: V;
  label: string;
  description?: string;
  icon?: string;
  image?: string;
}

/* ------------------------------------------------------------------ */
/*  Shared slide animation variants                                    */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
  }),
};

/* ------------------------------------------------------------------ */
/*  Reusable UI pieces                                                 */
/* ------------------------------------------------------------------ */

function OptionCard<V extends string>({
  option,
  selected,
  onSelect,
}: {
  option: CardOption<V>;
  selected: boolean;
  onSelect: (v: V) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={`w-full min-h-14 rounded-xl border px-4 py-3.5 text-left transition-all cursor-pointer
        flex items-center gap-3
        ${
          selected
            ? 'border-sage bg-sage/8 shadow-md ring-1 ring-sage/20'
            : 'border-warm-gray/20 bg-white shadow-sm hover:shadow-md hover:border-sage/30'
        }`}
    >
      {option.image && (
        <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-warm-gray/20 shadow-sm bg-warm-white">
          <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
        </div>
      )}
      {!option.image && option.icon && <span className="text-xl shrink-0">{option.icon}</span>}
      <div className="flex-1 min-w-0">
        <span
          className={`block font-medium text-sm ${selected ? 'text-sage' : 'text-deep-slate'}`}
        >
          {option.label}
        </span>
        {option.description && (
          <span className="block text-xs text-warm-gray mt-0.5">
            {option.description}
          </span>
        )}
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-5 h-5 rounded-full bg-sage flex items-center justify-center shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6L5 8.5L9.5 4"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </button>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-h-14 rounded-xl border font-medium text-sm transition-all cursor-pointer
        ${
          active
            ? 'border-sage bg-sage/8 text-sage shadow-md ring-1 ring-sage/20'
            : 'border-warm-gray/20 bg-white text-deep-slate shadow-sm hover:shadow-md hover:border-sage/30'
        }`}
    >
      {label}
    </button>
  );
}

function SlopeVisual({ degrees }: { degrees: number }) {
  const clamped = Math.min(Math.max(degrees, 0), 60);
  const rad = (clamped * Math.PI) / 180;
  const length = 80;
  const endX = 10 + Math.cos(rad) * length;
  const endY = 90 - Math.sin(rad) * length;

  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      className="mx-auto"
      aria-label={`Slope angle ${Math.round(clamped)} degrees`}
    >
      {/* ground line */}
      <line x1="10" y1="90" x2="95" y2="90" stroke="#c4a572" strokeWidth="2" />
      {/* slope line */}
      <line
        x1="10"
        y1="90"
        x2={endX}
        y2={endY}
        stroke="#4a7c59"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* angle arc */}
      <path
        d={`M 40 90 A 30 30 0 0 1 ${10 + Math.cos(rad) * 30} ${90 - Math.sin(rad) * 30}`}
        fill="none"
        stroke="#4a7c59"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* label */}
      <text
        x="48"
        y="84"
        fill="#1a2d3d"
        fontSize="11"
        fontWeight="600"
        fontFamily="sans-serif"
      >
        {Math.round(clamped)}°
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual question components                                     */
/* ------------------------------------------------------------------ */

// Q1 -- Soil Cracks
function CracksQuestion({
  value,
  onChange,
}: {
  value: WizardAnswers['cracks'];
  onChange: (v: WizardAnswers['cracks']) => void;
}) {
  const options: CardOption<WizardAnswers['cracks']>[] = [
    { value: 'none', label: 'None observed', image: '/images/soil_crack_none.png', description: 'No visible cracks in the soil' },
    { value: 'hairline', label: 'Hairline cracks', image: '/images/soil_crack_hairline.png', description: 'Very thin surface cracks' },
    { value: 'moderate', label: 'Moderate cracks', image: '/images/soil_crack_moderate.png', description: 'Clearly visible, wider cracks' },
    { value: 'severe', label: 'Severe cracks', image: '/images/soil_crack_severe.png', description: 'Large, deep cracks in the ground' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <OptionCard key={opt.value} option={opt} selected={value === opt.value} onSelect={onChange} />
      ))}
    </div>
  );
}

// Q2 -- Tilting Structures
function TiltingQuestion({
  value,
  onChange,
}: {
  value: WizardAnswers['tilting'];
  onChange: (v: WizardAnswers['tilting']) => void;
}) {
  const severityLabels = ['Slight', 'Moderate', 'Significant'];
  const labelIdx =
    value.severity < 34 ? 0 : value.severity < 67 ? 1 : 2;

  return (
    <div className="flex flex-col gap-5">
      <div className="w-full h-44 rounded-xl overflow-hidden border border-warm-gray/20 shadow-sm bg-warm-white shrink-0">
        <img 
          src="/images/tilting_trees_fences.png"
          alt="Photorealistic tilting tree and fence side-by-side in a generic gentle backyard"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex gap-3">
        <ToggleButton
          label="No"
          active={!value.observed}
          onClick={() => onChange({ observed: false, severity: 0 })}
        />
        <ToggleButton
          label="Yes"
          active={value.observed}
          onClick={() => onChange({ observed: true, severity: value.severity || 30 })}
        />
      </div>

      <AnimatePresence>
        {value.observed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-warm-gray/20 p-5 shadow-sm">
              <label className="block text-sm font-medium text-deep-slate mb-4">
                How severe is the tilting?
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={value.severity}
                onChange={(e) =>
                  onChange({ observed: true, severity: Number(e.target.value) })
                }
                className="w-full accent-sage h-2 rounded-full cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                {severityLabels.map((lbl, i) => (
                  <span
                    key={lbl}
                    className={`text-xs ${i === labelIdx ? 'text-sage font-semibold' : 'text-warm-gray'}`}
                  >
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Q3 -- Drainage
function DrainageQuestion({
  value,
  onChange,
}: {
  value: WizardAnswers['drainage'];
  onChange: (v: WizardAnswers['drainage']) => void;
}) {
  const options: CardOption<WizardAnswers['drainage']>[] = [
    { value: 'well', label: 'Well-drained', icon: '🟢', description: 'Water flows away quickly' },
    { value: 'pooling', label: 'Some pooling after rain', icon: '🟡', description: 'Temporary puddles that drain within hours' },
    { value: 'standing', label: 'Significant standing water', icon: '🟠', description: 'Persistent pooling that lasts days' },
    { value: 'erosion', label: 'Active erosion channels', icon: '🔴', description: 'Visible channels carved by water runoff' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full flex justify-center shrink-0 mb-1">
        <img 
          src="/images/drainage_graphic.png"
          alt="Infographic showing water drainage paths, pooling, and surface runoff on a residential grassy slope"
          className="w-full max-h-60 object-contain rounded-xl overflow-hidden"
        />
      </div>
      {options.map((opt) => (
        <OptionCard key={opt.value} option={opt} selected={value === opt.value} onSelect={onChange} />
      ))}
    </div>
  );
}

function MiniSlopeVisual({ degrees, selected }: { degrees: number; selected: boolean }) {
  const rad = (degrees * Math.PI) / 180;
  const length = 36;
  const height = Math.sin(rad) * length;
  const width = Math.cos(rad) * length;

  const color = selected ? '#4a7c59' : '#a3b8a8';
  const strokeColor = selected ? '#2c4a35' : '#738a7a';
  const groundColor = selected ? '#4a7c59' : '#d2d1cf';

  return (
    <svg width="48" height="36" viewBox="0 0 48 36" className="mx-auto block mb-2 overflow-visible">
      {/* ground line */}
      <line x1="4" y1="32" x2="44" y2="32" stroke={groundColor} strokeWidth="2" strokeLinecap="round" />
      {/* filled slope wedge */}
      <polygon
        points={`4,32 ${4 + width},32 ${4 + width},${32 - height}`}
        fill={color}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="1"
      />
      {/* slope line on top for crispness */}
      <line 
         x1="4" y1="32" 
         x2={4 + width} y2={32 - height} 
         stroke={strokeColor} 
         strokeWidth="2" 
         strokeLinecap="round" 
      />
    </svg>
  );
}

// Q4 -- Slope
function SlopeQuestion({
  value,
  onChange,
  terrainSlopePct,
}: {
  value: WizardAnswers['slopeSelection'];
  onChange: (v: WizardAnswers['slopeSelection']) => void;
  terrainSlopePct: number | null;
}) {
  // Convert percent slope to degrees: atan(slope/100) * (180/PI)
  const terrainDeg =
    terrainSlopePct != null
      ? Math.round(Math.atan(terrainSlopePct / 100) * (180 / Math.PI))
      : null;

  const options: { value: number; label: string; range: string; degrees: number }[] = [
    { value: 2, label: 'Flat', range: '< 5°', degrees: 2 },
    { value: 10, label: 'Gentle', range: '5 - 15°', degrees: 10 },
    { value: 22, label: 'Moderate', range: '15 - 30°', degrees: 22 },
    { value: 40, label: 'Steep', range: '> 30°', degrees: 40 },
  ];

  // Pre-select based on terrain data if user hasn't manually selected yet
  const currentValue = value;

  return (
    <div className="flex flex-col gap-4">
      {terrainDeg != null && (
        <div className="bg-sage/8 rounded-xl border border-sage/15 p-4 flex items-center gap-4">
          <SlopeVisual degrees={terrainDeg} />
          <div>
            <p className="text-sm font-medium text-deep-slate">
              Measured slope: ~{terrainDeg}°
            </p>
            <p className="text-xs text-warm-gray mt-0.5">
              Based on Buncombe County elevation data. Select the option that best matches your observation.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = currentValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-xl border p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center
                ${
                  isSelected
                    ? 'border-sage bg-sage/8 shadow-md ring-1 ring-sage/20'
                    : 'border-warm-gray/20 bg-white shadow-sm hover:shadow-md hover:border-sage/30'
                }`}
            >
              <MiniSlopeVisual degrees={opt.degrees} selected={isSelected} />
              <span
                className={`block font-medium text-sm ${isSelected ? 'text-sage' : 'text-deep-slate'}`}
              >
                {opt.label}
              </span>
              <span className="block text-xs text-warm-gray mt-0.5">{opt.range}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Question config                                                    */
/* ------------------------------------------------------------------ */

interface QuestionConfig {
  key: number;
  title: string;
  subtitle: string;
}

const QUESTIONS: QuestionConfig[] = [
  {
    key: 1,
    title: 'Soil Cracks',
    subtitle: 'Have you observed any visible cracks in the soil around your property?',
  },
  {
    key: 2,
    title: 'Tilting Structures',
    subtitle:
      'Are there any tilting trees, fences, or retaining walls on or near your property?',
  },
  {
    key: 3,
    title: 'Drainage',
    subtitle: 'How would you describe the drainage situation around your property?',
  },
  {
    key: 4,
    title: 'Slope',
    subtitle: 'What is the estimated slope of your property?',
  },
];

/* ------------------------------------------------------------------ */
/*  Main Questionnaire page                                            */
/* ------------------------------------------------------------------ */

export default function Questionnaire() {
  const navigate = useNavigate();
  const location = useAppStore((s) => s.location);
  const terrain = useAppStore((s) => s.terrain);
  const answers = useAppStore((s) => s.answers);
  const setAnswer = useAppStore((s) => s.setAnswer);
  const setStep = useAppStore((s) => s.setStep);

  const [qIndex, setQIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // Redirect if no location
  useEffect(() => {
    if (!location) {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  // Pre-fill slope from terrain data on mount
  useEffect(() => {
    if (terrain?.slope != null) {
      const deg = Math.round(Math.atan(terrain.slope / 100) * (180 / Math.PI));
      // Bucket into one of the 4 options
      let bucket: number;
      if (deg < 5) bucket = 2;
      else if (deg < 15) bucket = 10;
      else if (deg < 30) bucket = 22;
      else bucket = 40;
      setAnswer('slopeSelection', bucket);
    }
  }, [terrain, setAnswer]);

  const goNext = useCallback(() => {
    if (qIndex < QUESTIONS.length - 1) {
      setDirection(1);
      setQIndex((i) => i + 1);
    } else {
      navigate('/report');
    }
  }, [qIndex, navigate]);

  const goBack = useCallback(() => {
    if (qIndex > 0) {
      setDirection(-1);
      setQIndex((i) => i - 1);
    } else {
      navigate('/confirm');
    }
  }, [qIndex, navigate]);

  // Auto-advance for simple card-selection questions
  const autoAdvance = useCallback(() => {
    // Small delay so the user sees the selection highlight
    setTimeout(() => goNext(), 350);
  }, [goNext]);

  if (!location) return null;

  const q = QUESTIONS[qIndex];

  const isAnswered = (): boolean => {
    switch (qIndex) {
      case 0:
        return answers.cracks !== undefined;
      case 1:
        return true; // toggle always has a value
      case 2:
        return answers.drainage !== undefined;
      case 3:
        return answers.slopeSelection !== undefined;
      default:
        return false;
    }
  };

  const renderQuestion = () => {
    switch (qIndex) {
      case 0:
        return (
          <CracksQuestion
            value={answers.cracks}
            onChange={(v) => {
              setAnswer('cracks', v);
              autoAdvance();
            }}
          />
        );
      case 1:
        return (
          <TiltingQuestion
            value={answers.tilting}
            onChange={(v) => setAnswer('tilting', v)}
          />
        );
      case 2:
        return (
          <DrainageQuestion
            value={answers.drainage}
            onChange={(v) => {
              setAnswer('drainage', v);
              autoAdvance();
            }}
          />
        );
      case 3:
        return (
          <SlopeQuestion
            value={answers.slopeSelection}
            onChange={(v) => {
              setAnswer('slopeSelection', v);
              autoAdvance();
            }}
            terrainSlopePct={terrain?.slope ?? null}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageTransition className="min-h-screen bg-warm-white flex flex-col">
      {/* Header */}
      <div className="pt-6 pb-4 px-4">
        <ProgressBar currentStep={3} totalSteps={5} />
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center px-4 pb-6 overflow-hidden">
        <div className="w-full max-w-lg flex-1 flex flex-col">
          {/* Question counter */}
          <div className="text-center mb-1">
            <span className="text-xs font-semibold tracking-wide text-sage uppercase">
              Question {qIndex + 1} of {QUESTIONS.length}
            </span>
            <p className="text-[11px] text-gray-400 mt-0.5">(sample of questions)</p>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={q.key}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col"
            >
              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-deep-slate mb-1.5">
                  {q.title}
                </h2>
                <p className="text-sm text-warm-gray leading-relaxed max-w-sm mx-auto">
                  {q.subtitle}
                </p>
              </div>

              {/* Question content */}
              <div>{renderQuestion()}</div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-warm-gray/10">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 h-11 px-6 rounded-xl font-medium text-sm transition-all cursor-pointer
                bg-warm-gray/15 text-deep-slate hover:bg-warm-gray/25 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!isAnswered()}
              className={`flex items-center gap-1.5 h-11 px-6 rounded-xl font-medium text-sm transition-all cursor-pointer
                ${
                  isAnswered()
                    ? 'bg-sage text-white hover:bg-sage-light shadow-sm hover:shadow-md'
                    : 'bg-warm-gray/15 text-warm-gray cursor-not-allowed'
                }`}
            >
              {qIndex < QUESTIONS.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  View Report
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
