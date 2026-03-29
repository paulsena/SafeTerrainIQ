import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { RISK_COLORS } from '../../lib/constants';

interface RiskBadgeProps {
  overall: 'low' | 'moderate' | 'high' | 'critical';
  averageScore: number;
}

export default function RiskBadge({ overall, averageScore }: RiskBadgeProps) {
  const color = RISK_COLORS[overall];
  const label = overall.toUpperCase();

  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.3 }}
    >
      {/* Glowing ring */}
      <motion.div
        className="relative"
        animate={{
          boxShadow: [
            `0 0 20px ${color}40`,
            `0 0 40px ${color}60`,
            `0 0 20px ${color}40`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ borderRadius: '50%' }}
      >
        <div
          className="w-40 h-40 rounded-full flex flex-col items-center justify-center border-4"
          style={{
            borderColor: color,
            background: `radial-gradient(circle at 30% 30%, ${color}25, ${color}08)`,
          }}
        >
          <Shield
            className="w-8 h-8 mb-1"
            style={{ color }}
            strokeWidth={1.5}
          />
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color }}
          >
            {averageScore}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-warm-gray/60 mt-0.5">
            out of 100
          </span>
        </div>
      </motion.div>

      {/* Level label */}
      <motion.div
        className="px-6 py-2 rounded-full text-sm font-bold uppercase tracking-[0.2em]"
        style={{
          backgroundColor: `${color}20`,
          color,
          border: `1px solid ${color}50`,
        }}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {label} Risk
      </motion.div>
    </motion.div>
  );
}
