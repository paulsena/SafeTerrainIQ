import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { RISK_COLORS } from '../../lib/constants';

interface RiskTimelineChartProps {
  susceptibility: number;
  overall: 'low' | 'moderate' | 'high' | 'critical';
}

/** Growth multipliers per risk level — how steeply risk climbs over 20 years */
const GROWTH_RATES: Record<string, number> = {
  low: 0.005,
  moderate: 0.025,
  high: 0.06,
  critical: 0.1,
};

function generateProjection(score: number, overall: string) {
  const rate = GROWTH_RATES[overall] ?? 0.025;
  const years = [0, 5, 10, 15, 20];

  return years.map((year) => {
    // Exponential-ish growth, capped at 100
    const projected = Math.min(100, Math.round(score * (1 + rate * year) ** 1.5));
    return { year: `Year ${year}`, risk: projected };
  });
}

export default function RiskTimelineChart({ susceptibility, overall }: RiskTimelineChartProps) {
  const data = useMemo(() => generateProjection(susceptibility, overall), [susceptibility, overall]);
  const color = RISK_COLORS[overall] ?? RISK_COLORS.moderate;

  return (
    <div className="bg-white rounded-xl shadow-card border border-warm-gray/20 p-5">
      <h3 className="text-deep-slate font-semibold text-sm mb-1">
        Projected Landslide Risk Over Time
      </h3>
      <p className="text-warm-gray text-xs mb-4">
        Estimated risk trajectory based on current terrain and conditions
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#6b6b6b' }}
            axisLine={{ stroke: '#e5e5e5' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#6b6b6b' }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: 8,
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            formatter={(value: number) => [`${value}/100`, 'Risk Score']}
          />
          <Area
            type="monotone"
            dataKey="risk"
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#riskGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
