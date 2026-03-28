import type { WizardAnswers, TerrainData } from '../stores/appStore';
import { RISK_THRESHOLDS } from './constants';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RiskInput {
  terrain: TerrainData;
  answers: WizardAnswers;
  nearestLandslideDistance: number; // km
}

export interface RiskOutput {
  scores: {
    stability: number;
    debris: number;
    runoff: number;
    susceptibility: number;
  };
  overall: 'low' | 'moderate' | 'high' | 'critical';
  aiSummary: string;
}

// ── Mapping helpers ────────────────────────────────────────────────────────────

/** Map slope percentage to 0-100 risk score via piece-wise linear interpolation. */
function slopeToScore(slope: number): number {
  const breakpoints: [number, number][] = [
    [0, 0],
    [15, 30],
    [30, 60],
    [50, 80],
    [70, 100],
  ];

  if (slope <= 0) return 0;
  if (slope >= 70) return 100;

  for (let i = 1; i < breakpoints.length; i++) {
    const [x0, y0] = breakpoints[i - 1];
    const [x1, y1] = breakpoints[i];
    if (slope <= x1) {
      const t = (slope - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return 100;
}

function crackFactor(cracks: WizardAnswers['cracks']): number {
  const map: Record<WizardAnswers['cracks'], number> = {
    none: 0,
    hairline: 25,
    moderate: 60,
    severe: 90,
  };
  return map[cracks];
}

function tiltFactor(tilting: WizardAnswers['tilting']): number {
  if (!tilting.observed) return 0;
  return (tilting.severity / 100) * 90;
}

function drainageFactor(drainage: WizardAnswers['drainage']): number {
  const map: Record<WizardAnswers['drainage'], number> = {
    well: 0,
    pooling: 30,
    standing: 60,
    erosion: 90,
  };
  return map[drainage];
}

function proximityFactor(distanceKm: number): number {
  if (distanceKm < 0.5) return 100;
  if (distanceKm < 1) return 70;
  if (distanceKm < 2) return 40;
  if (distanceKm < 5) return 20;
  return 5;
}

function constructionFactor(construction: WizardAnswers['construction']): number {
  const map: Record<WizardAnswers['construction'], number> = {
    none: 0,
    minor: 20,
    major: 60,
    clearing: 85,
  };
  return map[construction];
}

/**
 * Map ArcGIS stability index (0-10, lower = less stable) to a 0-100 risk score.
 * A low stability index means high risk.
 */
function stabilityIndexFactor(stabilityIndex: number): number {
  // Clamp to 0-10
  const clamped = Math.max(0, Math.min(10, stabilityIndex));
  // Invert: 0 → 100 risk, 10 → 0 risk
  return ((10 - clamped) / 10) * 100;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

// ── Score level mapping ────────────────────────────────────────────────────────

function overallLevel(weightedAvg: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (weightedAvg < RISK_THRESHOLDS.low) return 'low';
  if (weightedAvg < RISK_THRESHOLDS.moderate) return 'moderate';
  if (weightedAvg < RISK_THRESHOLDS.high) return 'high';
  return 'critical';
}

export function scoreToLevel(score: number): 'low' | 'moderate' | 'high' | 'critical' {
  return overallLevel(score);
}

// ── Main compute ───────────────────────────────────────────────────────────────

export function computeRiskScores(input: RiskInput): RiskOutput {
  const { terrain, answers, nearestLandslideDistance } = input;

  const slope = slopeToScore(terrain.slope);
  const crack = crackFactor(answers.cracks);
  const tilt = tiltFactor(answers.tilting);
  const drain = drainageFactor(answers.drainage);
  const prox = proximityFactor(nearestLandslideDistance);
  const constr = constructionFactor(answers.construction);
  const stabIdx = stabilityIndexFactor(terrain.stabilityIndex);

  const stability = clamp(slope * 0.5 + crack * 0.3 + tilt * 0.2);
  const debris = clamp(slope * 0.4 + drain * 0.3 + prox * 0.3);
  const runoff = clamp(drain * 0.5 + slope * 0.3 + constr * 0.2);
  const susceptibility = clamp(prox * 0.3 + slope * 0.3 + stabIdx * 0.4);

  const scores = { stability, debris, runoff, susceptibility };

  // Weighted average (equal weight per category)
  const avg = (stability + debris + runoff + susceptibility) / 4;
  const overall = overallLevel(avg);

  const aiSummary = generateAISummary(
    '', // filled by caller
    terrain.elevation,
    terrain.slope,
    scores,
    overall,
  );

  return { scores, overall, aiSummary };
}

// ── AI-style summary generator ─────────────────────────────────────────────────

export function generateAISummary(
  address: string,
  elevation: number,
  slope: number,
  scores: { stability: number; debris: number; runoff: number; susceptibility: number },
  overall: 'low' | 'moderate' | 'high' | 'critical',
): string {
  const levelLabel: Record<string, string> = {
    low: 'LOW',
    moderate: 'MODERATE',
    high: 'HIGH',
    critical: 'CRITICAL',
  };

  const addrStr = address || 'the selected property';

  // Find highest risk category
  const categories = [
    { name: 'slope stability', score: scores.stability },
    { name: 'debris flow', score: scores.debris },
    { name: 'surface water runoff', score: scores.runoff },
    { name: 'landslide susceptibility', score: scores.susceptibility },
  ].sort((a, b) => b.score - a.score);

  const top = categories[0];
  const topLevel = scoreToLevel(top.score);

  // Detail sentence for highest-risk category
  const detailSentences: Record<string, string> = {
    'slope stability':
      `The primary concern is slope stability (score: ${top.score}/100), influenced by the local gradient and observed ground conditions.`,
    'debris flow':
      `Debris flow potential is the leading risk factor (score: ${top.score}/100), driven by slope grade, drainage conditions, and proximity to historic landslide activity.`,
    'surface water runoff':
      `Surface water runoff presents the greatest concern (score: ${top.score}/100), reflecting drainage patterns and nearby land disturbance.`,
    'landslide susceptibility':
      `Overall landslide susceptibility is the dominant risk factor (score: ${top.score}/100), based on proximity to documented landslide events and terrain stability modeling.`,
  };

  // Recommendation
  const recommendations: Record<string, string> = {
    low: 'No immediate action is required, though standard property maintenance and drainage upkeep are always recommended.',
    moderate:
      'We recommend scheduling a professional geotechnical assessment and monitoring drainage around the property during heavy rainfall events.',
    high: 'Immediate professional consultation with a licensed geotechnical engineer is strongly recommended. Prioritize drainage improvements and slope stabilization measures.',
    critical:
      'URGENT: This property shows indicators consistent with elevated geohazard risk. Contact a licensed geotechnical engineer immediately and consider consulting with Buncombe County emergency management.',
  };

  return (
    `Based on our analysis of ${addrStr}, situated at ${Math.round(elevation).toLocaleString()}ft elevation ` +
    `with an average slope of ${Math.round(slope)}%, your property shows ${levelLabel[overall]} overall geohazard risk. ` +
    `${detailSentences[top.name]} ` +
    `${recommendations[topLevel]}`
  );
}

// ── Haversine distance ─────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find the nearest landslide point from a GeoJSON FeatureCollection.
 * Returns distance in km. Falls back to Infinity if no features.
 */
export function computeNearestLandslideDistance(
  lat: number,
  lng: number,
  landslides: GeoJSON.FeatureCollection,
): number {
  let minDist = Infinity;

  for (const feature of landslides.features) {
    if (!feature.geometry) continue;

    let coords: number[][] = [];

    if (feature.geometry.type === 'Point') {
      coords = [(feature.geometry as GeoJSON.Point).coordinates];
    } else if (feature.geometry.type === 'MultiPoint') {
      coords = (feature.geometry as GeoJSON.MultiPoint).coordinates;
    } else if (feature.geometry.type === 'LineString') {
      coords = (feature.geometry as GeoJSON.LineString).coordinates;
    } else if (feature.geometry.type === 'Polygon') {
      coords = (feature.geometry as GeoJSON.Polygon).coordinates[0];
    }

    for (const c of coords) {
      const d = haversineKm(lat, lng, c[1], c[0]); // GeoJSON is [lng, lat]
      if (d < minDist) minDist = d;
    }
  }

  return minDist;
}
