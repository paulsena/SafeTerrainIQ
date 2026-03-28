import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import RiskReport from './RiskReport';

/**
 * /demo — Pre-loads the Garren Creek demo address with realistic
 * terrain + wizard answers so you can jump straight to the report page.
 */
export default function DemoReport() {
  const { location, setLocation, setTerrain, setAnswer, setStep } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!location) {
      // Garren Creek Rd — known Helene landslide zone
      setLocation({
        address: '1234 Garren Creek Rd, Fairview, NC 28730',
        coords: { lat: 35.4823, lng: -82.3955 },
        isInsideBuncombe: true,
      });

      setTerrain({
        slope: 34.2,
        elevation: 2640,
        stabilityIndex: 3.2,
      });

      setAnswer('cracks', 'moderate');
      setAnswer('tilting', { observed: true, severity: 55 });
      setAnswer('drainage', 'pooling');
      setAnswer('slopeSelection', 19);
      setAnswer('construction', 'none');

      setStep(4);
    }
    setReady(true);
  }, [location, setLocation, setTerrain, setAnswer, setStep]);

  if (!ready) return null;
  return <RiskReport />;
}
