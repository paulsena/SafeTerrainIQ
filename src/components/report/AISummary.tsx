import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AISummaryProps {
  summary: string;
  delay?: number; // seconds before starting animation
}

export default function AISummary({ summary, delay = 1.8 }: AISummaryProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started || !summary) return;

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayedText(summary.slice(0, idx));
      if (idx >= summary.length) clearInterval(interval);
    }, 12); // ~80 chars/sec for smooth typewriter feel

    return () => clearInterval(interval);
  }, [started, summary]);

  return (
    <motion.div
      className="rounded-xl p-6"
      style={{ backgroundColor: '#243d50' }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: delay - 0.2, duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <Brain className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">AI Risk Assessment</h3>
          <span className="text-[10px] uppercase tracking-widest text-gray-500">
            SafeTerrain Intelligence Engine
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-light-slate/40 mb-4" />

      {/* Summary text with typewriter */}
      <div className="min-h-[80px]">
        {!started ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Generating assessment...
            </motion.span>
          </div>
        ) : (
          <p className="text-gray-300 text-sm leading-relaxed">
            {displayedText}
            {displayedText.length < summary.length && (
              <motion.span
                className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-text-bottom"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </p>
        )}
      </div>
    </motion.div>
  );
}
