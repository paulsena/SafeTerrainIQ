import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import PropertyConfirm from './pages/PropertyConfirm';
import Questionnaire from './pages/Questionnaire';
import RiskReport from './pages/RiskReport';
import NextSteps from './pages/NextSteps';
import DemoReport from './pages/DemoReport';

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/confirm" element={<PropertyConfirm />} />
        <Route path="/assess" element={<Questionnaire />} />
        <Route path="/report" element={<RiskReport />} />
        <Route path="/next-steps" element={<NextSteps />} />
        <Route path="/demo" element={<DemoReport />} />
      </Routes>
    </AnimatePresence>
  );
}
