import { useState, useEffect, useMemo, useCallback } from 'react';
import Map from 'react-map-gl/maplibre';
import DeckGLOverlay from './DeckGLOverlay';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { MAP_STYLES } from '../../lib/constants';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RiskGridPoint {
  lat: number;
  lng: number;
  risk: number;
}

interface ReportMap2DProps {
  lat: number;
  lng: number;
  landslides: GeoJSON.FeatureCollection | null;
}

// ── Layer toggle button (compact for mobile) ─────────────────────────────────

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
      className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer"
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

export default function ReportMap2D({ lat, lng, landslides }: ReportMap2DProps) {
  const [riskGrid, setRiskGrid] = useState<RiskGridPoint[] | null>(null);
  const [debrisFlows, setDebrisFlows] = useState<GeoJSON.FeatureCollection | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Layer visibility
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(true);
  const [showLandslides, setShowLandslides] = useState(true);
  const [showDebrisFlows, setShowDebrisFlows] = useState(true);

  // Load risk grid data
  useEffect(() => {
    fetch('/data/asheville-risk-grid.json')
      .then((res) => res.json())
      .then((data: RiskGridPoint[]) => setRiskGrid(data))
      .catch(() => {
        /* non-critical */
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

  // Build deck.gl layers (no TerrainLayer for mobile performance)
  const layers = useMemo(() => {
    const result: unknown[] = [];

    // Risk heatmap
    if (showRiskHeatmap && riskGrid) {
      result.push(
        new HeatmapLayer({
          id: 'risk-heatmap',
          data: riskGrid,
          getPosition: (d: RiskGridPoint) => [d.lng, d.lat],
          getWeight: (d: RiskGridPoint) => d.risk,
          radiusPixels: 30,
          intensity: 1.0,
          threshold: 0.05,
          colorRange: [
            [74, 124, 89, 160],
            [143, 170, 126, 180],
            [232, 168, 56, 200],
            [212, 69, 59, 220],
            [139, 26, 26, 240],
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
          radiusMaxPixels: 12,
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
          getWidth: 3,
          widthMinPixels: 2,
          widthMaxPixels: 6,
          capRounded: true,
          jointRounded: true,
          opacity: 0.85,
          pickable: true,
        }),
      );
    }

    return result;
  }, [showRiskHeatmap, showLandslides, showDebrisFlows, riskGrid, landslides, debrisFlows]);

  const handleMapError = useCallback(() => {
    setMapError('Map could not be loaded on this device.');
  }, []);

  if (mapError) {
    return (
      <div
        className="rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          minHeight: 400,
          backgroundColor: '#243d50',
          border: '1px solid rgba(45, 74, 94, 0.3)',
        }}
      >
        <div className="text-center px-6">
          <p className="text-gray-400 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Layer toggles */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
        <LayerToggle
          label="Heatmap"
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
          label="Debris"
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
          height: 420,
          border: '1px solid rgba(45, 74, 94, 0.3)',
        }}
      >
        <Map
          initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: 13,
            pitch: 45,
            bearing: 0,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLES.dark}
          maxPitch={60}
          onError={handleMapError}
        >
          <DeckGLOverlay layers={layers} />
        </Map>
      </div>
    </div>
  );
}
