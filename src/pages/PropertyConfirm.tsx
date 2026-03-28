import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

import PageTransition from '../components/layout/PageTransition';
import ProgressBar from '../components/layout/ProgressBar';
import { useAppStore } from '../stores/appStore';
import { TILE_SOURCES } from '../lib/constants';
import { fetchTerrainData } from '../lib/terrainData';

/** Inline MapLibre style object with ArcGIS satellite raster tiles */
const SATELLITE_STYLE = {
  version: 8 as const,
  sources: {
    'satellite-tiles': {
      type: 'raster' as const,
      tiles: [TILE_SOURCES.satellite],
      tileSize: 256,
      attribution: '&copy; Esri',
    },
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster' as const,
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export default function PropertyConfirm() {
  const navigate = useNavigate();
  const location = useAppStore((s) => s.location);
  const setTerrain = useAppStore((s) => s.setTerrain);
  const setStep = useAppStore((s) => s.setStep);
  const [confirming, setConfirming] = useState(false);

  // Redirect if no location data
  useEffect(() => {
    if (!location) {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  if (!location) return null;

  const { lat, lng } = location.coords;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const terrain = await fetchTerrainData(lat, lng);
      setTerrain(terrain);
    } catch {
      // Use defaults on failure -- fetchTerrainData already handles graceful fallback
      setTerrain({ slope: 15, elevation: 2200, stabilityIndex: 5 });
    }
    navigate('/assess');
  };

  return (
    <PageTransition className="min-h-screen bg-warm-white flex flex-col">
      {/* Header */}
      <div className="pt-6 pb-4 px-4">
        <ProgressBar currentStep={2} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-6">
        <div className="w-full max-w-lg">
          {/* Title */}
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h1 className="text-2xl font-bold text-deep-slate mb-1">
              Confirm Your Property
            </h1>
            <p className="text-warm-gray text-sm">
              Verify this is the correct location before we assess the terrain.
            </p>
          </motion.div>

          {/* Address badge */}
          <motion.div
            className="flex items-center gap-2 bg-white rounded-xl border border-sage/20 px-4 py-3 mb-4 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <MapPin className="w-4 h-4 text-sage shrink-0" />
            <span className="text-deep-slate text-sm font-medium truncate">
              {location.address}
            </span>
          </motion.div>

          {/* Map */}
          <motion.div
            className="rounded-xl overflow-hidden border border-sage/10 shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <div className="w-full h-[340px] sm:h-[400px]">
              <Map
                initialViewState={{
                  longitude: lng,
                  latitude: lat,
                  zoom: 16,
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={SATELLITE_STYLE}
                attributionControl={false}
              >
                <NavigationControl position="top-right" showCompass={false} />
                <Marker longitude={lng} latitude={lat} anchor="bottom">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-sage rounded-full border-[3px] border-white shadow-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white -mt-[2px]" />
                  </div>
                </Marker>
              </Map>
            </div>
          </motion.div>

          {/* Coordinates */}
          <motion.p
            className="text-center text-warm-gray text-xs mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </motion.p>

          {/* Actions */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full h-14 rounded-xl bg-sage hover:bg-sage-light text-white font-semibold text-base
                         flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg
                         disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {confirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Fetching terrain data...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  This is my property
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/')}
              disabled={confirming}
              className="w-full h-12 rounded-xl bg-transparent text-warm-gray hover:text-deep-slate
                         font-medium text-sm flex items-center justify-center gap-1.5 transition-colors
                         disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to search
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
