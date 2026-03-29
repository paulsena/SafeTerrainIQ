import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Mail, Check } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

function getRiskLabel(score: number): string {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Critical';
}

function getRiskColor(overall: string): string {
  switch (overall) {
    case 'low':
      return '#4a7c59';
    case 'moderate':
      return '#e8a838';
    case 'high':
      return '#d4453b';
    case 'critical':
      return '#9b1b1b';
    default:
      return '#6b6b6b';
  }
}

function PrintableReport() {
  const { location, terrain, riskResults } = useAppStore();
  const scores = riskResults?.scores;
  const overall = riskResults?.overall ?? 'unknown';
  const avgScore = scores
    ? Math.round(
        (scores.stability + scores.debris + scores.runoff + scores.susceptibility) / 4,
      )
    : 0;

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#1a2d3d',
        padding: '40px',
        maxWidth: '800px',
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: '2px solid #4a7c59', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
          SafeTerrainIQ Risk Assessment Report
        </h1>
        <p style={{ color: '#6b6b6b', fontSize: '14px', marginTop: '4px' }}>
          Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Property Info */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Property Information</h2>
        <table style={{ fontSize: '14px', borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 16px 4px 0', color: '#6b6b6b', width: '140px' }}>Address:</td>
              <td style={{ padding: '4px 0' }}>{location?.address ?? 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 16px 4px 0', color: '#6b6b6b' }}>Coordinates:</td>
              <td style={{ padding: '4px 0' }}>
                {location?.coords.lat.toFixed(5)}, {location?.coords.lng.toFixed(5)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 16px 4px 0', color: '#6b6b6b' }}>Elevation:</td>
              <td style={{ padding: '4px 0' }}>{Math.round(terrain?.elevation ?? 0)} ft</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 16px 4px 0', color: '#6b6b6b' }}>Slope:</td>
              <td style={{ padding: '4px 0' }}>{terrain?.slope?.toFixed(1) ?? 0} degrees</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Overall Risk */}
      <div
        style={{
          backgroundColor: '#f5f0e8',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '8px' }}>Overall Risk Level</p>
        <p
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: getRiskColor(overall),
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {overall}
        </p>
        <p style={{ fontSize: '14px', color: '#6b6b6b', marginTop: '4px' }}>
          Composite Score: {avgScore}/100
        </p>
      </div>

      {/* Category Breakdown */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Risk Category Breakdown</h2>
        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#6b6b6b', fontWeight: 500 }}>
                Category
              </th>
              <th style={{ textAlign: 'center', padding: '8px 0', color: '#6b6b6b', fontWeight: 500 }}>
                Score
              </th>
              <th style={{ textAlign: 'right', padding: '8px 0', color: '#6b6b6b', fontWeight: 500 }}>
                Level
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Slope Stability', score: scores?.stability ?? 0 },
              { name: 'Debris Flow Risk', score: scores?.debris ?? 0 },
              { name: 'Surface Water Runoff', score: scores?.runoff ?? 0 },
              { name: 'Landslide Susceptibility', score: scores?.susceptibility ?? 0 },
            ].map((cat) => (
              <tr key={cat.name} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 0' }}>{cat.name}</td>
                <td style={{ textAlign: 'center', padding: '8px 0', fontWeight: 600 }}>
                  {cat.score}/100
                </td>
                <td style={{ textAlign: 'right', padding: '8px 0' }}>{getRiskLabel(cat.score)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Summary */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Analysis Summary</h2>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
          {riskResults?.aiSummary ?? 'No summary available.'}
        </p>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          borderTop: '1px solid #ddd',
          paddingTop: '16px',
          fontSize: '11px',
          color: '#999',
          lineHeight: '1.5',
        }}
      >
        <p>
          <strong>Disclaimer:</strong> This report is generated by SafeTerrainIQ for informational
          purposes only and does not constitute professional geotechnical advice. Risk scores are
          derived from publicly available terrain data, historical landslide records, and
          user-provided observations. For definitive site assessments, consult a licensed
          geotechnical engineer. SafeTerrainIQ assumes no liability for decisions made based on this
          report.
        </p>
      </div>
    </div>
  );
}

export default function ReportExport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || isGenerating) return;
    setIsGenerating(true);

    try {
      // Dynamic import of html2pdf.js
      const html2pdf = (await import('html2pdf.js')).default;

      await html2pdf()
        .set({
          margin: 0,
          filename: 'SafeTerrainIQ-Risk-Report.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        })
        .from(reportRef.current)
        .save();
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Mock email send
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
    setEmail('');
  };

  return (
    <div className="space-y-4">
      {/* PDF Download */}
      <button
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sage hover:bg-sage-light disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isGenerating ? 'Generating PDF...' : 'Download PDF Report'}
      </button>

      {/* Email Send */}
      <form onSubmit={handleSendEmail} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email report to..."
          className="flex-1 bg-white border border-warm-gray/30 rounded-lg px-4 py-2.5 text-sm text-deep-slate placeholder-warm-gray focus:outline-none focus:border-sage/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!email.trim()}
          className="px-4 py-2.5 bg-white hover:bg-warm-gray/10 border border-warm-gray/30 disabled:opacity-40 text-deep-slate rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          <AnimatePresence mode="wait">
            {emailSent ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="w-4 h-4 text-sage" />
              </motion.div>
            ) : (
              <motion.div
                key="mail"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Mail className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </form>

      {/* Success toast */}
      <AnimatePresence>
        {emailSent && (
          <motion.p
            className="text-sage text-xs text-center"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Report sent successfully!
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hidden printable report */}
      <div
        ref={reportRef}
        style={{ position: 'absolute', left: '-9999px', top: 0 }}
        aria-hidden="true"
      >
        <PrintableReport />
      </div>
    </div>
  );
}
