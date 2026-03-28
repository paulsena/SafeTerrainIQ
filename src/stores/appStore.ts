import { create } from 'zustand';

export interface LocationData {
  address: string;
  coords: { lat: number; lng: number };
  isInsideBuncombe: boolean;
}

export interface TerrainData {
  slope: number;
  elevation: number;
  stabilityIndex: number;
}

export interface WizardAnswers {
  cracks: 'none' | 'hairline' | 'moderate' | 'severe';
  tilting: { observed: boolean; severity: number };
  drainage: 'well' | 'pooling' | 'standing' | 'erosion';
  slopeSelection: number;
  construction: 'none' | 'minor' | 'major' | 'clearing';
}

export interface RiskScores {
  stability: number;
  debris: number;
  runoff: number;
  susceptibility: number;
}

export interface RiskResults {
  scores: RiskScores;
  overall: 'low' | 'moderate' | 'high' | 'critical';
  aiSummary: string;
}

interface AppState {
  currentStep: number;
  setStep: (step: number) => void;

  location: LocationData | null;
  setLocation: (loc: LocationData | null) => void;

  terrain: TerrainData | null;
  setTerrain: (data: TerrainData | null) => void;

  answers: WizardAnswers;
  setAnswer: <K extends keyof WizardAnswers>(key: K, value: WizardAnswers[K]) => void;

  riskResults: RiskResults | null;
  setResults: (results: RiskResults | null) => void;

  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  reset: () => void;
}

const defaultAnswers: WizardAnswers = {
  cracks: 'none',
  tilting: { observed: false, severity: 0 },
  drainage: 'well',
  slopeSelection: 10,
  construction: 'none',
};

export const useAppStore = create<AppState>((set) => ({
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),

  location: null,
  setLocation: (location) => set({ location }),

  terrain: null,
  setTerrain: (terrain) => set({ terrain }),

  answers: { ...defaultAnswers },
  setAnswer: (key, value) =>
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    })),

  riskResults: null,
  setResults: (riskResults) => set({ riskResults }),

  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      currentStep: 1,
      location: null,
      terrain: null,
      answers: { ...defaultAnswers },
      riskResults: null,
      isLoading: false,
    }),
}));
