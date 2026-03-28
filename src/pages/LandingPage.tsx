import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Mountain, Brain, Clock, ChevronRight } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import { useAppStore } from '../stores/appStore';
import { isInsideBuncombe } from '../lib/geocoding';
import { DEMO_ADDRESSES } from '../lib/constants';

function TopoBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.08]"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Topographic contour lines - organic, realistic */}
      <g stroke="currentColor" strokeWidth="1.2" fill="none" className="text-sage">
        {/* Outer contours */}
        <path d="M-50,400 Q150,320 300,350 T600,300 T900,350 T1250,300" />
        <path d="M-50,420 Q160,340 310,370 T610,320 T910,370 T1250,320" />
        <path d="M-50,450 Q170,380 320,400 T620,350 T920,400 T1250,350" />

        {/* Mountain cluster 1 - left */}
        <path d="M100,500 Q200,350 280,380 Q360,410 400,500" />
        <path d="M120,490 Q210,360 280,390 Q350,420 380,490" />
        <path d="M140,480 Q220,375 280,395 Q340,425 360,480" />
        <path d="M160,470 Q230,385 280,400 Q330,430 340,470" />
        <path d="M180,460 Q240,395 280,408 Q320,435 320,460" />

        {/* Mountain cluster 2 - center */}
        <path d="M500,550 Q580,380 650,350 Q720,320 780,400 Q840,480 900,550" />
        <path d="M520,540 Q590,390 650,365 Q710,340 770,410 Q830,475 880,540" />
        <path d="M540,530 Q600,400 650,380 Q700,360 760,420 Q820,470 860,530" />
        <path d="M560,520 Q610,410 650,395 Q690,380 750,430 Q810,465 840,520" />
        <path d="M580,510 Q620,420 650,405 Q680,395 740,435 Q800,460 820,510" />
        <path d="M600,500 Q630,430 650,418 Q670,410 730,442 Q790,455 800,500" />
        <path d="M620,492 Q640,438 650,428 Q660,425 720,448 Q780,452 785,492" />

        {/* Mountain cluster 3 - right */}
        <path d="M900,480 Q960,350 1020,330 Q1080,350 1120,480" />
        <path d="M920,470 Q970,360 1020,345 Q1070,360 1100,470" />
        <path d="M940,460 Q980,375 1020,360 Q1060,375 1080,460" />
        <path d="M960,450 Q990,388 1020,378 Q1050,388 1060,450" />

        {/* Ridge lines */}
        <path d="M0,600 Q200,550 400,580 Q600,540 800,570 Q1000,530 1200,560" />
        <path d="M0,620 Q200,570 400,600 Q600,560 800,590 Q1000,550 1200,580" />
        <path d="M0,640 Q200,600 400,620 Q600,585 800,610 Q1000,575 1200,600" />

        {/* Valley contours */}
        <path d="M0,250 Q300,200 500,230 Q700,180 900,220 Q1100,170 1200,200" />
        <path d="M0,270 Q300,225 500,250 Q700,205 900,240 Q1100,195 1200,220" />
        <path d="M0,290 Q300,250 500,270 Q700,230 900,260 Q1100,220 1200,240" />

        {/* Scattered elevation marks */}
        <circle cx="280" cy="400" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="650" cy="415" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="1020" cy="370" r="3" fill="currentColor" opacity="0.3" />

        {/* Stream/drainage lines - dashed */}
        <path d="M650,420 Q660,480 640,540 Q620,600 630,700" strokeDasharray="6,4" opacity="0.5" />
        <path d="M280,405 Q290,460 270,520 Q250,580 260,700" strokeDasharray="6,4" opacity="0.5" />
      </g>
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { setLocation, setStep } = useAppStore();
  const [searchValue, setSearchValue] = useState('');
  const [showOutsideArea, setShowOutsideArea] = useState(false);

  const handleDemoAddress = useCallback(
    (demo: typeof DEMO_ADDRESSES[number]) => {
      setLocation({
        address: demo.address,
        coords: demo.coords,
        isInsideBuncombe: true,
      });
      setStep(2);
      navigate('/confirm');
    },
    [setLocation, setStep, navigate],
  );

  const handleSearch = useCallback(
    (address: string, lng: number, lat: number) => {
      if (!isInsideBuncombe(lng, lat)) {
        setShowOutsideArea(true);
        return;
      }
      setShowOutsideArea(false);
      setLocation({
        address,
        coords: { lat, lng },
        isInsideBuncombe: true,
      });
      setStep(2);
      navigate('/confirm');
    },
    [setLocation, setStep, navigate],
  );

  const handleSearchSubmit = () => {
    if (!searchValue.trim()) return;
    // For the MVP, use the Mapbox geocoding API directly
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token || token === 'YOUR_MAPBOX_TOKEN_HERE') {
      // Fallback: use first demo address
      handleDemoAddress(DEMO_ADDRESSES[0]);
      return;
    }
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchValue)}.json?access_token=${token}&bbox=-82.85,35.40,-82.25,35.80&limit=1`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.features?.length > 0) {
          const [lng, lat] = data.features[0].center;
          handleSearch(data.features[0].place_name, lng, lat);
        }
      })
      .catch(console.error);
  };

  return (
    <PageTransition className="relative min-h-screen overflow-hidden bg-gradient-to-br from-warm-white via-moss/10 to-deep-slate/20">
      <TopoBackground />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo / Brand */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Mountain className="w-8 h-8 text-sage" />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-deep-slate">
            SafeTerrain<span className="text-moss-light">IQ</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-warm-gray max-w-xl mx-auto leading-relaxed">
            Know Your Ground. Protect Your Home.
          </p>
          <p className="mt-2 text-sm md:text-base text-warm-gray/70 max-w-lg mx-auto">
            Expert-level geohazard intelligence for homeowners. Get your property's
            landslide risk assessment in minutes — not months.
          </p>
        </motion.div>

        {/* Search bar — frosted glass */}
        <motion.div
          className="w-full max-w-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/40 p-2">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-sage ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter your property address..."
                className="flex-1 px-3 py-3.5 bg-transparent text-deep-slate placeholder:text-warm-gray/50 text-base outline-none"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              <button
                onClick={handleSearchSubmit}
                className="bg-sage hover:bg-sage-light text-white px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5 text-sm hover:shadow-lg active:scale-[0.98]"
              >
                Analyze
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {showOutsideArea && (
            <motion.p
              className="text-alert-red text-sm mt-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              This address is outside our current service area (Buncombe County, NC).
            </motion.p>
          )}
        </motion.div>

        {/* Demo quick-start buttons */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-xs text-warm-gray/60 self-center mr-1">Try:</span>
          {DEMO_ADDRESSES.map((demo) => (
            <button
              key={demo.label}
              onClick={() => handleDemoAddress(demo)}
              className="px-3 py-1.5 text-xs rounded-full border border-sage/30 text-sage hover:bg-sage/10 transition-colors duration-200"
            >
              {demo.label}
            </button>
          ))}
        </motion.div>

        {/* Trust bar */}
        <motion.div
          className="flex flex-wrap gap-6 md:gap-10 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: Mountain, text: 'Real terrain data' },
            { icon: Brain, text: 'Expert-trained models' },
            { icon: Clock, text: 'Results in minutes' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-warm-gray/70">
              <Icon className="w-4 h-4 text-sage/60" />
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* Service area note */}
        <motion.p
          className="mt-8 text-xs text-warm-gray/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Currently serving: Asheville & Western North Carolina
        </motion.p>
      </div>
    </PageTransition>
  );
}
