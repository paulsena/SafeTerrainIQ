import { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mountain,
  Waves,
  Droplets,
  AlertTriangle,
  ChevronRight,
  MapPin,
} from 'lucide-react';

import PageTransition from '../components/layout/PageTransition';
import ProgressBar from '../components/layout/ProgressBar';
import RiskBadge from '../components/report/RiskBadge';
import RiskCategoryCard from '../components/report/RiskCategoryCard';
import AISummary from '../components/report/AISummary';

import { useAppStore } from '../stores/appStore';

// Lazy-load map components to keep initial bundle small
const TerrainMap3D = lazy(() => import('../components/maps/TerrainMap3D'));
const ReportMap2D = lazy(() => import('../components/maps/ReportMap2D'));
import {
  computeRiskScores,
  computeNearestLandslideDistance,
  generateAISummary,
} from '../lib/riskEngine';

// ── Skeleton loader ────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-3xl mx-auto px-4 py-12">
      {/* Pulsing badge skeleton */}
      <motion.div
        className="w-40 h-40 rounded-full bg-warm-gray/10"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      <motion.div
        className="w-36 h-8 rounded-full bg-warm-gray/10"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />

      {/* Card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-36 rounded-xl bg-warm-gray/10"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      {/* Summary skeleton */}
      <motion.div
        className="w-full h-32 rounded-xl bg-warm-gray/10"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
      />

      {/* Scanning text */}
      <motion.p
        className="text-warm-gray text-sm tracking-wider uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Analyzing terrain data...
      </motion.p>
    </div>
  );
}

// ── Category descriptions ──────────────────────────────────────────────────────

function getCategoryDescriptions(scores: {
  stability: number;
  debris: number;
  runoff: number;
  susceptibility: number;
}) {
  return [
    {
      title: 'Slope Stability',
      score: scores.stability,
      icon: Mountain,
      description:
        scores.stability > 50
          ? 'Elevated slope gradient combined with observed ground indicators suggest reduced structural stability in the immediate area.'
          : 'Slope conditions and ground observations indicate acceptable stability levels for typical residential structures.',
    },
    {
      title: 'Debris Flow Risk',
      score: scores.debris,
      icon: Waves,
      description:
        scores.debris > 50
          ? 'Proximity to documented landslide events and drainage conditions increase the potential for debris flow impact during severe weather.'
          : 'Current drainage patterns and distance from historical events suggest manageable debris flow exposure.',
    },
    {
      title: 'Surface Water Runoff',
      score: scores.runoff,
      icon: Droplets,
      description:
        scores.runoff > 50
          ? 'Observed drainage issues and site grading contribute to elevated surface water accumulation risk during prolonged rainfall.'
          : 'Surface drainage appears functional with limited indicators of problematic water accumulation.',
    },
    {
      title: 'Landslide Susceptibility',
      score: scores.susceptibility,
      icon: AlertTriangle,
      description:
        scores.susceptibility > 50
          ? 'Geologic stability modeling and proximity data indicate this area falls within a higher susceptibility zone.'
          : 'Terrain modeling and historical data place this location in a lower susceptibility classification.',
    },
  ];
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function RiskReport() {
  const navigate = useNavigate();
  const {
    location,
    terrain,
    answers,
    riskResults,
    setResults,
    setStep,
    isLoading,
    setLoading,
  } = useAppStore();

  const [computed, setComputed] = useState(false);
  const [landslidesGeo, setLandslidesGeo] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  // Load landslides GeoJSON for the map
  useEffect(() => {
    fetch('/data/helene-landslides.geojson')
      .then((res) => res.json())
      .then((data) => setLandslidesGeo(data))
      .catch(() => {
        /* map will render without landslide markers */
      });
  }, []);

  // Redirect if no data
  useEffect(() => {
    if (!location || !terrain) {
      navigate('/', { replace: true });
    }
  }, [location, terrain, navigate]);

  // Compute risk scores
  useEffect(() => {
    if (!location || !terrain || computed) return;

    setLoading(true);

    const run = async () => {
      // Try to load landslide GeoJSON
      let nearestDistance = 2.0; // fallback km
      try {
        const res = await fetch('/data/helene-landslides.geojson');
        if (res.ok) {
          const geojson = await res.json();
          nearestDistance = computeNearestLandslideDistance(
            location.coords.lat,
            location.coords.lng,
            geojson,
          );
          if (!isFinite(nearestDistance)) nearestDistance = 2.0;
        }
      } catch {
        // fallback
      }

      const result = computeRiskScores({
        terrain,
        answers,
        nearestLandslideDistance: nearestDistance,
      });

      // Re-generate summary with address
      result.aiSummary = generateAISummary(
        location.address,
        terrain.elevation,
        terrain.slope,
        result.scores,
        result.overall,
      );

      // Dramatic reveal delay
      await new Promise((r) => setTimeout(r, 1500));

      setResults(result);
      setLoading(false);
      setComputed(true);
    };

    run();
  }, [location, terrain, answers, computed, setResults, setLoading]);

  if (!location || !terrain) return null;

  const averageScore = riskResults
    ? Math.round(
        (riskResults.scores.stability +
          riskResults.scores.debris +
          riskResults.scores.runoff +
          riskResults.scores.susceptibility) /
          4,
      )
    : 0;

  return (
    <PageTransition className="min-h-screen bg-warm-white flex flex-col pt-safe px-safe overflow-y-auto overflow-x-hidden">
      {/* Progress bar */}
      <div className="pt-6 pb-4 px-4">
        <ProgressBar currentStep={4} totalSteps={5} />
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-deep-slate mb-2">
            Risk Assessment Report
          </h1>
          <div className="flex items-center justify-center gap-2 text-warm-gray text-sm">
            <MapPin className="w-4 h-4" />
            <span>{location.address}</span>
          </div>
        </motion.div>

        {isLoading || !riskResults ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Risk Badge */}
            <div className="flex justify-center mb-12 mt-4">
              <RiskBadge overall={riskResults.overall} averageScore={averageScore} />
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {getCategoryDescriptions(riskResults.scores).map((cat, i) => (
                <RiskCategoryCard
                  key={cat.title}
                  title={cat.title}
                  score={cat.score}
                  description={cat.description}
                  icon={cat.icon}
                  index={i}
                />
              ))}
            </div>

            {/* AI Summary */}
            <div className="mb-12">
              <AISummary summary={riskResults.aiSummary} delay={1.8} />
            </div>

            {/* 3D Terrain Map — hero visual */}
            <motion.div
              id="report-map-3d"
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">3D Terrain View</p>
              <Suspense
                fallback={
                  <div className="rounded-xl overflow-hidden bg-warm-gray/10 border border-warm-gray/20 min-h-[400px]">
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-3">
                      <Mountain className="w-10 h-10 text-warm-gray/50" strokeWidth={1} />
                      <span className="text-warm-gray/70 text-sm tracking-wider uppercase">
                        Loading 3D terrain...
                      </span>
                    </div>
                  </div>
                }
              >
                <TerrainMap3D
                  lat={location.coords.lat}
                  lng={location.coords.lng}
                  landslides={landslidesGeo}
                />
              </Suspense>
            </motion.div>

            {/* 2D Risk Overlay Map */}
            <motion.div
              id="report-map-2d"
              className="mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Risk Overlay Map</p>
              <Suspense
                fallback={
                  <div className="rounded-xl overflow-hidden bg-warm-gray/10 border border-warm-gray/20 min-h-[400px]">
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-3">
                      <Mountain className="w-10 h-10 text-warm-gray/50" strokeWidth={1} />
                      <span className="text-warm-gray/70 text-sm tracking-wider uppercase">
                        Loading risk map...
                      </span>
                    </div>
                  </div>
                }
              >
                <ReportMap2D
                  lat={location.coords.lat}
                  lng={location.coords.lng}
                  landslides={landslidesGeo}
                />
              </Suspense>
            </motion.div>

            {/* Next Steps CTA */}
            <motion.div
              className="flex justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.4 }}
            >
              <button
                onClick={() => navigate('/next-steps')}
                className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sage hover:bg-sage-light text-white font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer"
              >
                View Next Steps
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
