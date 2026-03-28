import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { RISK_COLORS } from '../../lib/constants';
import { scoreToLevel } from '../../lib/riskEngine';

interface RiskCategoryCardProps {
  title: string;
  score: number;
  description: string;
  icon: LucideIcon;
  index: number; // for staggered animation
}

export default function RiskCategoryCard({
  title,
  score,
  description,
  icon: Icon,
  index,
}: RiskCategoryCardProps) {
  const level = scoreToLevel(score);
  const color = RISK_COLORS[level];
  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <motion.div
      className="relative rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#243d50',
        borderLeft: `4px solid ${color}`,
      }}
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6 + index * 0.15, duration: 0.5, ease: 'easeOut' }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{title}</h3>
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color }}
              >
                {levelLabel}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white tabular-nums">
              {score}
            </span>
            <span className="text-xs text-gray-500 ml-0.5">/100</span>
          </div>
        </div>

        {/* Score bar */}
        <div className="w-full h-2 rounded-full bg-deep-slate/60 mb-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ delay: 0.9 + index * 0.15, duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Description */}
        <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
