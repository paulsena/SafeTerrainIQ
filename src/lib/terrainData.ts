import { ARCGIS_ENDPOINTS } from './constants';

interface TerrainResult {
  slope: number;
  elevation: number;
  stabilityIndex: number;
}

/**
 * Fetch a single value from a Buncombe County ArcGIS ImageServer identify endpoint.
 * Returns the numeric pixel value, or the provided fallback on error / NoData.
 */
async function fetchImageServerValue(
  endpoint: string,
  lat: number,
  lng: number,
  fallback: number,
): Promise<number> {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    sr: '4326',
    returnGeometry: 'false',
    returnCatalogItems: 'false',
    f: 'json',
  });

  try {
    const res = await fetch(`${endpoint}?${params.toString()}`);
    if (!res.ok) return fallback;

    const data = await res.json();

    // The identify response can return `value` as a string like "42.5" or "NoData"
    const raw = data?.value;
    if (raw == null || raw === 'NoData' || raw === 'Null') return fallback;

    const parsed = parseFloat(String(raw));
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Fetch slope (percent), elevation (feet), and stability index from
 * Buncombe County ArcGIS ImageServer endpoints.
 *
 * Defaults:
 *  - slope: 15 (%)
 *  - elevation: 2200 (ft)
 *  - stabilityIndex: 5 (mid-range, 0-10 scale)
 */
export async function fetchTerrainData(
  lat: number,
  lng: number,
): Promise<TerrainResult> {
  const [slope, elevation, stabilityIndex] = await Promise.all([
    fetchImageServerValue(ARCGIS_ENDPOINTS.slope, lat, lng, 15),
    fetchImageServerValue(ARCGIS_ENDPOINTS.elevation, lat, lng, 2200),
    fetchImageServerValue(ARCGIS_ENDPOINTS.stabilityIndex, lat, lng, 5),
  ]);

  return { slope, elevation, stabilityIndex };
}
