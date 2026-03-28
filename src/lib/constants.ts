// Buncombe County approximate bounding box
export const BUNCOMBE_BBOX = {
  west: -82.85,
  south: 35.40,
  east: -82.25,
  north: 35.80,
} as const;

// Default map center (Asheville area)
export const ASHEVILLE_CENTER = {
  lng: -82.5515,
  lat: 35.5951,
} as const;

// Demo addresses for quick-start buttons
export const DEMO_ADDRESSES = [
  {
    label: 'Garren Creek Rd, Fairview',
    address: '1234 Garren Creek Rd, Fairview, NC 28730',
    coords: { lat: 35.4823, lng: -82.3955 },
  },
  {
    label: 'Town Mountain Rd, Asheville',
    address: '100 Town Mountain Rd, Asheville, NC 28804',
    coords: { lat: 35.6012, lng: -82.5365 },
  },
  {
    label: 'Sweeten Creek Rd, Asheville',
    address: '800 Sweeten Creek Rd, Asheville, NC 28803',
    coords: { lat: 35.5543, lng: -82.5372 },
  },
] as const;

// Map styles (free, no API key)
export const MAP_STYLES = {
  light: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

// Tile sources
export const TILE_SOURCES = {
  elevation: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
} as const;

// ArcGIS endpoints (proxied through Vite dev server)
export const ARCGIS_ENDPOINTS = {
  slope: '/arcgis/rest/services/PERCENTSLOPE/ImageServer/identify',
  elevation: '/arcgis/rest/services/DEM/ImageServer/identify',
  stabilityIndex: '/arcgis/rest/services/StabilityIndexMap/ImageServer/identify',
} as const;

// Risk level thresholds
export const RISK_THRESHOLDS = {
  low: 25,
  moderate: 50,
  high: 75,
} as const;

// Risk level colors
export const RISK_COLORS = {
  low: '#4a7c59',
  moderate: '#e8a838',
  high: '#d4453b',
  critical: '#8b1a1a',
} as const;

// Design colors
export const COLORS = {
  sage: '#4a7c59',
  sageLght: '#5a9469',
  moss: '#8faa7e',
  mossLight: '#8fca7e',
  terracotta: '#c4a572',
  warmWhite: '#f5f0e8',
  warmGray: '#6b6b6b',
  deepSlate: '#1a2d3d',
  midSlate: '#243d50',
  lightSlate: '#2d4a5e',
  alertRed: '#d4453b',
  warningAmber: '#e8a838',
} as const;
