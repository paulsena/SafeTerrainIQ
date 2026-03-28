import { useState, useEffect, useMemo, useCallback } from 'react';
import Map from 'react-map-gl/maplibre';
import DeckGLOverlay from './DeckGLOverlay';
import ReportMap2D from './ReportMap2D';
import { TerrainLayer } from '@deck.gl/geo-layers';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { MAP_STYLES, TILE_SOURCES } from '../../lib/constants';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RiskGridPoint {
  lat: number;
  lng: number;
  risk: number;
}

interface TerrainMap3DProps {
  lat: number;
  lng: number;
  landslides: GeoJSON.FeatureCollection | null;
}

// ── Layer toggle button ───────────────────────────────────────────────────────

function LayerToggle({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: active ? 'rgba(36, 61, 80, 0.95)' : 'rgba(36, 61, 80, 0.6)',
        color: active ? '#e5e7eb' : '#6b7280',
        border: active ? `1.5px solid ${color}` : '1.5px solid rgba(45, 74, 94, 0.4)',
      }}
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TerrainMap3D({ lat, lng, landslides }: TerrainMap3DProps) {
  const [riskGrid, setRiskGrid] = useState<RiskGridPoint[] | null>(null);
  const [debrisFlows, setDebrisFlows] = useState<GeoJSON.FeatureCollection | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Layer visibility
  const [showTerrain, setShowTerrain] = useState(true);
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(true);
  const [showLandslides, setShowLandslides] = useState(true);
  const [showDebrisFlows, setShowDebrisFlows] = useState(true);

  // Load risk grid data
  useEffect(() => {
    fetch('/data/asheville-risk-grid.json')
      .then((res) => res.json())
      .then((data: RiskGridPoint[]) => setRiskGrid(data))
      .catch(() => {
        /* non-critical: heatmap just won't render */
      });
  }, []);

  // Load debris flow paths
  useEffect(() => {
    fetch('/data/debris-flow-paths.geojson')
      .then((res) => res.json())
      .then((data: GeoJSON.FeatureCollection) => setDebrisFlows(data))
      .catch(() => {
        /* non-critical */
      });
  }, []);

  // Build deck.gl layers
  const layers = useMemo(() => {
    const result: unknown[] = [];

    // 3D Terrain mesh
    if (showTerrain) {
      result.push(
        new TerrainLayer({
          id: 'terrain-layer',
          minZoom: 0,
          maxZoom: 15,
          strategy: 'no-overlap',
          elevationDecoder: {
            rScaler: 256,
            gScaler: 1,
            bScaler: 1 / 256,
            offset: -32768,
          },
          elevationData: TILE_SOURCES.elevation,
          texture: TILE_SOURCES.satellite,
          operation: 'terrain+draw',
        }),
      );
    }

    // Risk heatmap
    if (showRiskHeatmap && riskGrid) {
      result.push(
        new HeatmapLayer({
          id: 'risk-heatmap',
          data: riskGrid,
          getPosition: (d: RiskGridPoint) => [d.lng, d.lat],
          getWeight: (d: RiskGridPoint) => d.risk,
          radiusPixels: 40,
          intensity: 1.2,
          threshold: 0.05,
          colorRange: [
            [74, 124, 89, 160], // green (low risk)
            [143, 170, 126, 180], // moss
            [232, 168, 56, 200], // amber
            [212, 69, 59, 220], // red (high risk)
            [139, 26, 26, 240], // dark red (critical)
          ],
          opacity: 0.6,
        }),
      );
    }

    // Landslide markers
    if (showLandslides && landslides?.features) {
      result.push(
        new ScatterplotLayer({
          id: 'landslide-markers',
          data: landslides.features,
          getPosition: (d: GeoJSON.Feature) => {
            const coords = (d.geometry as GeoJSON.Point).coordinates;
            return [coords[0], coords[1]];
          },
          getFillColor: [212, 69, 59, 180],
          getLineColor: [255, 255, 255, 120],
          getRadius: 80,
          radiusMinPixels: 3,
          radiusMaxPixels: 15,
          lineWidthMinPixels: 1,
          stroked: true,
          filled: true,
          opacity: 0.7,
          pickable: true,
        }),
      );
    }

    // Debris flow paths
    if (showDebrisFlows && debrisFlows?.features) {
      const pathData = debrisFlows.features
        .filter((f) => f.geometry.type === 'LineString')
        .map((f) => ({
          path: (f.geometry as GeoJSON.LineString).coordinates,
          properties: f.properties,
        }));

      result.push(
        new PathLayer({
          id: 'debris-flow-paths',
          data: pathData,
          getPath: (d: { path: number[][] }) => d.path,
          getColor: [212, 69, 59, 200],
          getWidth: 4,
          widthMinPixels: 2,
          widthMaxPixels: 8,
          capRounded: true,
          jointRounded: true,
          opacity: 0.85,
          pickable: true,
        }),
      );
    }

    return result;
  }, [showTerrain, showRiskHeatmap, showLandslides, showDebrisFlows, riskGrid, landslides, debrisFlows]);

  const handleMapError = useCallback((e: { error?: Error }) => {
    const msg = e?.error?.message ?? '';
    console.warn('[TerrainMap3D] Map error (non-fatal):', msg);
    if (msg.toLowerCase().includes('webgl') || msg.toLowerCase().includes('context lost')) {
      setMapError('3D map could not be loaded. Your device may not support WebGL.');
    }
  }, []);

  if (mapError) {
    return <ReportMap2D lat={lat} lng={lng} landslides={landslides} />;
  }

  return (
    <div className="relative">
      {/* Layer toggles */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
        <LayerToggle
          label="Terrain"
          active={showTerrain}
          color="#5a9469"
          onClick={() => setShowTerrain((v) => !v)}
        />
        <LayerToggle
          label="Risk Heatmap"
          active={showRiskHeatmap}
          color="#e8a838"
          onClick={() => setShowRiskHeatmap((v) => !v)}
        />
        <LayerToggle
          label="Landslides"
          active={showLandslides}
          color="#d4453b"
          onClick={() => setShowLandslides((v) => !v)}
        />
        <LayerToggle
          label="Debris Flows"
          active={showDebrisFlows}
          color="#8b1a1a"
          onClick={() => setShowDebrisFlows((v) => !v)}
        />
      </div>

      {/* Map */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          minHeight: 400,
          height: 500,
          border: '1px solid rgba(45, 74, 94, 0.3)',
        }}
      >
        <Map
          initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: 13.5,
            pitch: 55,
            bearing: -15,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLES.dark}
          maxPitch={75}
          onError={handleMapError}
        >
          <DeckGLOverlay layers={layers} />
        </Map>
      </div>
    </div>
  );
}
