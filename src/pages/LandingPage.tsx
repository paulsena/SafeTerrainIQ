import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchBox } from '@mapbox/search-js-react';
import {
  Mountain,
  Brain,
  Clock,
  Search,
  FileText,
  MessageSquare,
  Shield,
  AlertTriangle,
  Layers,
  Droplets,
  Menu,
  X,
} from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import Logo from '../components/ui/Logo';
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

  const [showOutsideArea, setShowOutsideArea] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const inspectorsRef = useRef<HTMLDivElement>(null);
  const landslidesRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setMobileMenuOpen(false);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

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



  return (
    <PageTransition className="relative min-h-screen overflow-hidden bg-gradient-to-br from-warm-white via-moss/10 to-deep-slate/20">
      <TopoBackground />

      {/* Navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/60 border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-semibold text-deep-slate tracking-wide text-sm">SafeTerrainIQ</span>
          </div>
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-warm-gray">
            <button onClick={() => scrollTo(howItWorksRef)} className="hover:text-sage transition-colors">How It Works</button>
            <button onClick={() => scrollTo(aboutRef)} className="hover:text-sage transition-colors">About</button>
            <button onClick={() => scrollTo(inspectorsRef)} className="hover:text-sage transition-colors">For Inspectors</button>
            <button onClick={() => scrollTo(landslidesRef)} className="hover:text-sage transition-colors">About Landslides</button>
          </div>
          {/* Mobile hamburger */}
          <button className="md:hidden text-warm-gray" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-white/30 px-4 py-3 flex flex-col gap-3 text-sm text-warm-gray">
            <button onClick={() => scrollTo(howItWorksRef)} className="text-left hover:text-sage transition-colors">How It Works</button>
            <button onClick={() => scrollTo(aboutRef)} className="text-left hover:text-sage transition-colors">About</button>
            <button onClick={() => scrollTo(inspectorsRef)} className="text-left hover:text-sage transition-colors">For Inspectors</button>
            <button onClick={() => scrollTo(landslidesRef)} className="text-left hover:text-sage transition-colors">About Landslides</button>
          </div>
        )}
      </nav>

      {/* Hero section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 pt-20">
        {/* Logo / Brand */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="flex items-center justify-center mb-6">
            <Logo size={80} className="shadow-xl rounded-[20px]" />
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

        {/* Search bar */}
        <motion.div
          className="w-full max-w-xl mb-6 relative z-20 group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl shadow-gray-400/40 border-2 border-sage/40 p-2.5 transition-colors duration-300 search-box-container">
            <SearchBox
              placeholder="Enter Your Address..."
              accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE'}
              options={{ bbox: [-82.85, 35.40, -82.25, 35.80], language: 'en' }}
              onRetrieve={(res) => {
                try {
                  const feature = res.features[0];
                  if (!feature) return;
                  const coords = feature.geometry.coordinates;
                  const address = feature.properties.full_address || feature.properties.name || feature.properties.place_formatted || 'Selected Address';
                  handleSearch(address, coords[0], coords[1]);
                } catch (e) {
                  console.error(e);
                }
              }}
              theme={{
                variables: {
                  fontFamily: 'inherit',
                  borderRadius: '12px',
                  boxShadow: 'none',
                  colorText: '#1a2d3d',
                  colorBackground: '#ffffff',
                }
              }}
            />
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

      {/* ── How It Works ── */}
      <section ref={howItWorksRef} className="relative z-10 bg-white/60 backdrop-blur-sm py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="text-3xl md:text-4xl font-bold text-deep-slate mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.1 }}
            className="text-warm-gray mb-14 max-w-2xl mx-auto"
          >
            Three simple steps to understand your property's terrain risk.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                step: '1',
                title: 'Enter Your Address',
                desc: 'Type any address in our service area. We locate your parcel and pull high-resolution terrain data automatically.',
              },
              {
                icon: Layers,
                step: '2',
                title: 'We Analyze the Terrain',
                desc: 'Our models evaluate slope stability, debris flow potential, drainage patterns, and historical landslide proximity.',
              },
              {
                icon: FileText,
                step: '3',
                title: 'Get Your Report',
                desc: 'Receive a detailed risk assessment with 3D maps, risk scores, and actionable next steps — all in minutes.',
              },
            ].map(({ icon: Icon, step, title, desc }, idx) => (
              <motion.div 
                key={step} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-14 h-14 rounded-2xl bg-sage/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-sage/20"
                >
                  <Icon className="w-6 h-6 text-sage" />
                </motion.div>
                <div className="text-xs font-semibold text-sage/60 uppercase tracking-wider mb-1">Step {step}</div>
                <h3 className="text-lg font-semibold text-deep-slate mb-2">{title}</h3>
                <p className="text-sm text-warm-gray leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section ref={aboutRef} className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="text-3xl md:text-4xl font-bold text-deep-slate mb-4 text-center"
          >
            About SafeTerrainIQ
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.1 }}
            className="text-warm-gray text-center mb-10 max-w-2xl mx-auto"
          >
            Built after Hurricane Helene devastated Western North Carolina, SafeTerrainIQ brings geotechnical-grade
            terrain analysis to everyday homeowners — no engineering degree required.
          </motion.p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Shield,
                title: 'Trusted Data Sources',
                desc: 'We combine USGS elevation models, NCGS geological surveys, FEMA flood data, and county soil maps for a comprehensive picture.',
              },
              {
                icon: Brain,
                title: 'Expert-Informed Models',
                desc: 'Our risk algorithms are calibrated against real-world landslide inventories and reviewed by geotechnical professionals.',
              },
              {
                icon: Mountain,
                title: 'High-Resolution Terrain',
                desc: 'We use LiDAR-derived digital elevation models at 1-meter resolution to capture slope, aspect, and curvature details.',
              },
              {
                icon: MessageSquare,
                title: 'Plain-Language Reports',
                desc: 'No jargon. Reports explain what the risk factors mean for your property and what practical steps you can take.',
              },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <motion.div 
                key={title} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="flex gap-4 p-5 rounded-xl bg-white/50 border border-white/40 hover:bg-white/70 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <Icon className="w-5 h-5 text-sage" />
                </div>
                <div>
                  <h3 className="font-semibold text-deep-slate mb-1">{title}</h3>
                  <p className="text-sm text-warm-gray leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Inspectors ── */}
      <section ref={inspectorsRef} className="relative z-10 bg-deep-slate/[0.03] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="text-3xl md:text-4xl font-bold text-deep-slate mb-4"
          >
            For Home Inspectors
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.1 }}
            className="text-warm-gray mb-10 max-w-2xl mx-auto"
          >
            Add geohazard intelligence to your inspection toolkit. Differentiate your services
            and give clients the terrain context they need.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: 'Pre-Inspection Intel',
                desc: 'Run a report before you arrive on-site to know which slopes, drainage paths, and risk zones to focus on.',
              },
              {
                title: 'Client-Ready Reports',
                desc: 'Include professional geohazard summaries in your inspection package — branded and ready to share.',
              },
              {
                title: 'Liability Awareness',
                desc: 'Document terrain conditions as part of your due diligence. Flag properties that may need a geotechnical referral.',
              },
            ].map(({ title, desc }, idx) => (
              <motion.div 
                key={title} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="p-5 rounded-xl bg-white/70 border border-white/40 hover:bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-deep-slate/5 text-deep-slate/60 flex items-center justify-center font-bold text-sm mb-3">
                  0{idx + 1}
                </div>
                <h3 className="font-semibold text-deep-slate mb-2">{title}</h3>
                <p className="text-sm text-warm-gray leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="mt-8 text-sm text-warm-gray/60"
          >
            Interested in inspector pricing?{' '}
            <a href="mailto:info@safeterrainiq.com" className="text-sage hover:underline">Get in touch</a>
          </motion.p>
        </div>
      </section>

      {/* ── About Landslides ── */}
      <section ref={landslidesRef} className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="text-3xl md:text-4xl font-bold text-deep-slate mb-4 text-center"
          >
            Understanding Landslide Risk
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.1 }}
            className="text-warm-gray text-center mb-12 max-w-2xl mx-auto"
          >
            Western North Carolina's steep terrain and heavy rainfall make it one of the highest
            landslide-risk regions east of the Rockies. Here's what drives that risk.
          </motion.p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: 'Slope Instability',
                desc: 'Slopes over 25 degrees are significantly more prone to failure, especially when saturated. Many WNC properties sit on or near steep slopes that may not be obvious from the road.',
              },
              {
                icon: Droplets,
                title: 'Water & Saturation',
                desc: 'Heavy rainfall saturates soil and increases pore water pressure — the primary trigger for most landslides in our region. Drainage patterns around your property matter.',
              },
              {
                icon: Layers,
                title: 'Soil & Geology',
                desc: "WNC's weathered bedrock and residual soils can lose strength when wet. The interface between soil and rock is often where failures initiate.",
              },
              {
                icon: Mountain,
                title: 'Historical Patterns',
                desc: 'Areas that have slid before are more likely to slide again. Our analysis overlays your property with known landslide inventories and historical event data.',
              },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <motion.div 
                key={title} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="flex gap-4 p-5 rounded-xl bg-white/50 border border-white/40 hover:bg-white/70 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110">
                  <Icon className="w-5 h-5 text-sage" />
                </div>
                <div>
                  <h3 className="font-semibold text-deep-slate mb-1">{title}</h3>
                  <p className="text-sm text-warm-gray leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/30 bg-white/40 backdrop-blur-sm py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-warm-gray/60">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-sage/50" />
            <span>SafeTerrainIQ &mdash; Asheville, NC</span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => scrollTo(howItWorksRef)} className="hover:text-sage transition-colors">How It Works</button>
            <button onClick={() => scrollTo(aboutRef)} className="hover:text-sage transition-colors">About</button>
            <button onClick={() => scrollTo(inspectorsRef)} className="hover:text-sage transition-colors">For Inspectors</button>
            <button onClick={() => scrollTo(landslidesRef)} className="hover:text-sage transition-colors">About Landslides</button>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}
