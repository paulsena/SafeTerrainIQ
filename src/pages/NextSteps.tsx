import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Download,
  Phone,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

import PageTransition from '../components/layout/PageTransition';
import ProgressBar from '../components/layout/ProgressBar';
import ChatInterface from '../components/chat/ChatInterface';
import ReportExport from '../components/report/ReportExport';

import { useAppStore } from '../stores/appStore';

interface Professional {
  name: string;
  specialty: string;
  phone: string;
  website: string;
  address: string;
  description: string;
}

const sectionHeader = 'uppercase tracking-wider text-xs text-gray-500 mb-4 font-medium';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function NextSteps() {
  const navigate = useNavigate();
  const { location, riskResults, setStep, reset } = useAppStore();
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    setStep(5);
  }, [setStep]);

  // Redirect if no data
  useEffect(() => {
    if (!location || !riskResults) {
      navigate('/', { replace: true });
    }
  }, [location, riskResults, navigate]);

  // Load professionals data
  useEffect(() => {
    fetch('/data/professionals.json')
      .then((res) => res.json())
      .then((data) => setProfessionals(data))
      .catch(() => setProfessionals([]));
  }, []);

  if (!location || !riskResults) return null;

  const handleStartNew = () => {
    reset();
    navigate('/');
  };

  return (
    <PageTransition className="min-h-screen bg-deep-slate dark-scroll overflow-y-auto">
      {/* Progress bar - dark themed */}
      <div className="pt-6 pb-4">
        <div className="[&_span]:!text-gray-500 [&_.bg-warm-white]:!bg-light-slate/40 [&_.ring-offset-2]:!ring-offset-deep-slate [&_.bg-sage]:!bg-sage [&_div[class*='border']]:!border-light-slate/40 [&_div:not(.bg-sage)]:text-gray-400">
          <ProgressBar currentStep={5} totalSteps={5} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          {...fadeUp}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            What's Next?
          </h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Explore your results with our AI assistant, export your report, or connect with local professionals.
          </p>
        </motion.div>

        {/* AI Chat Section */}
        <motion.section
          className="mb-12"
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-sage" />
            <h2 className={sectionHeader + ' mb-0'}>AI Risk Assistant</h2>
          </div>
          <ChatInterface />
        </motion.section>

        {/* Divider */}
        <div className="border-t border-light-slate/20 mb-12" />

        {/* Export Section */}
        <motion.section
          className="mb-12"
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-4 h-4 text-sage" />
            <h2 className={sectionHeader + ' mb-0'}>Export Your Report</h2>
          </div>
          <div className="bg-mid-slate rounded-xl border border-light-slate/30 p-6">
            <p className="text-gray-400 text-sm mb-4">
              Download a PDF copy of your risk assessment or send it via email for your records.
            </p>
            <ReportExport />
          </div>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-light-slate/20 mb-12" />

        {/* Professional Directory */}
        <motion.section
          className="mb-12"
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-sage" />
            <h2 className={sectionHeader + ' mb-0'}>Local Professionals</h2>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Qualified geotechnical and engineering firms serving Buncombe County.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals.map((pro, i) => (
              <motion.div
                key={pro.name}
                className="bg-mid-slate rounded-xl border border-light-slate/30 p-5 hover:border-sage/30 transition-colors group"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
              >
                <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-sage transition-colors">
                  {pro.name}
                </h3>
                <p className="text-sage text-xs font-medium mb-2">{pro.specialty}</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
                  {pro.description}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <a
                    href={`tel:${pro.phone}`}
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    {pro.phone}
                  </a>
                  <a
                    href={pro.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Website
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-light-slate/20 mb-12" />

        {/* Start New Assessment */}
        <motion.div
          className="flex justify-center"
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <button
            onClick={handleStartNew}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-mid-slate hover:bg-light-slate border border-light-slate/40 hover:border-sage/30 text-gray-300 hover:text-white font-medium text-sm tracking-wide transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
            Start New Assessment
          </button>
        </motion.div>
      </div>
    </PageTransition>
  );
}
