# SafeTerrainIQ — Technical Review Report

This report provides a comprehensive technical review of the SafeTerrainIQ MVP planning documents. Based on the analysis of `docs/design-spec.md` and `docs/implementation-plan.md`, the following inconsistencies, gaps, and technical risks have been identified, along with proposed fixes.

---

## 1. Cross-Reference Consistency Check

*   **Color Palette Inconsistency:** The Design Spec uses "Sage Green" (#4a7c59) for both the primary brand and the low-risk indicator. The Implementation Plan lists "Red", "Amber", and "Green" for risk indicators, with Green matching Sage Green. **Recommendation:** Define a specific `SUCCESS_GREEN` separate from `BRAND_SAGE` in `constants.ts` to allow for independent UI adjustments.
*   **Component Naming:** The Implementation Plan lists `ReportExport.tsx`, while the Design Spec refers to it as "Email/PDF export". **Clarification:** Ensure the component handles both the email input and the PDF generation logic (via `html2pdf.js`) as implied.
*   **File Path Discrepancy:** The Implementation Plan structure shows `src/lib/terrainData.ts`, but the Phase 2 description mentions fetching slope/elevation logic. **Fix:** Centralize all ArcGIS REST queries in `terrainData.ts` to provide a single source of truth for `riskEngine.ts`.
*   **Missing Definition:** The "Stability Index Map" is mentioned as a data source in the Design Spec but is not explicitly utilized in the `riskEngine.ts` scoring logic described in the same document.

## 2. Gap Analysis

*   **Geographic Bound Edge Case:** The ArcGIS services are strictly limited to Buncombe County. A search for an address in Raleigh or neighboring Henderson County will return null/error from ArcGIS.
    *   **Fix:** Add a geographic bounding box check in `geocoding.ts` to flag "Outside Service Area" before the user proceeds to the wizard.
*   **No Data State:** Locations on large bodies of water or right on the county line may return null pixel values.
    *   **Fix:** Add a "Data Unavailable" state to the Risk Report and a `isDataValid` check in the store.
*   **Missing Components:**
    *   `LoadingSkeleton.tsx`: Essential for the "Reveal" moment between Step 3 and Step 4 while the risk model and maps load.
    *   `LocationErrorModal.tsx`: To handle "Outside Service Area" or geocoding failures gracefully.
*   **Zustand Store Shape:** The current plan implies the store is complete, but it lacks UI state management for the multi-step flow.

**Proposed Store Shape (`src/stores/appStore.ts`):**
```typescript
interface AppState {
  // Navigation
  currentStep: number;
  setStep: (step: number) => void;
  
  // Location Data
  location: {
    address: string;
    coords: { lat: number; lng: number };
    isInsideBuncombe: boolean;
  } | null;
  setLocation: (loc: AppState['location']) => void;

  // Real Terrain Data
  terrain: {
    slope: number;
    elevation: number;
    stabilityIndex: number;
  } | null;
  setTerrain: (data: AppState['terrain']) => void;

  // Wizard Answers
  answers: {
    cracks: 'none' | 'hairline' | 'moderate' | 'severe';
    tilting: { observed: boolean; severity: number };
    drainage: 'well' | 'pooling' | 'standing' | 'erosion';
    slopeSelection: number; // User confirmed/adjusted slope
    construction: 'none' | 'minor' | 'major' | 'clearing';
  };
  setAnswer: (key: keyof AppState['answers'], value: any) => void;

  // Results
  riskResults: {
    scores: { stability: number; debris: number; runoff: number; susceptibility: number };
    overall: 'low' | 'moderate' | 'high' | 'critical';
    aiSummary: string;
  } | null;
  setResults: (results: AppState['riskResults']) => void;
}
```

---

## 3. Data Source Validation

*   **USGS ScienceBase ID:** **Confirmed.** `674634a1d34e6d1dac3abddc` is the correct ID for the *Preliminary Landslide Inventory for Hurricane Helene (September 2024)*.
*   **ArcGIS Endpoints:** The URLs are valid but require specific formatting for the `identify` operation.
    *   **Slope:** `https://gis.buncombecounty.org/arcgis/rest/services/PERCENTSLOPE/ImageServer/identify`
    *   **DEM:** `https://gis.buncombecounty.org/arcgis/rest/services/DEM/ImageServer/identify`
    *   **Stability Index:** The `Stability_Index_Map/MapServer` exists, but the **ImageServer** version is more reliable for pixel-level `identify` queries: `https://gis.buncombecounty.org/arcgis/rest/services/StabilityIndexMap/ImageServer/identify`.
*   **AWS Terrarium Tiles:** The URL `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` is correct.
*   **ArcGIS Query Format:** The `ImageServer/identify` pattern is correct for retrieving pixel values at a point.

---

## 4. Technical Feasibility Flags

*   **React 19 + MapLibre:** `react-map-gl/maplibre` (v8+) is compatible, but you must use the `--legacy-peer-deps` flag during installation as many mapping libs haven't updated peer ranges to `^19.0.0`.
*   **Mapbox Search JS + MapLibre:** **CRITICAL FLAG.** `@mapbox/search-js-react` is hardcoded to work with `mapbox-gl`. It will NOT automatically bind to a MapLibre instance.
    *   **Fix:** Use it in **standalone mode**. Do not pass the `map` or `mapboxgl` props. Use the `onRetrieve` callback to manually call `map.flyTo()` on the MapLibre instance.
*   **Deck.gl 9 + MapLibre:** Fully compatible. Use `MapboxOverlay` from `@deck.gl/mapbox` and set `interleaved: true` to mix deck.gl layers with MapLibre's WebGL context.
*   **Terrarium Tiles:** The decoding formula `(R * 256 + G + B / 256) - 32768` is correct for the 24-bit PNG encoding used by Mapzen/AWS. Clamping `maxZoom: 15` is necessary.

---

## 5. Parallelization Risk Check

*   **Wave 2 Shared Dependencies:** 
    *   **Agent B and Agent C** both rely on `appStore.ts`. To avoid merge conflicts, Agent B should implement the "Input" slices (location, wizard) and Agent C should implement the "Output" slices (terrain, riskResults).
*   **Map Component Fragmentation:** Agent B (`PropertyMap.tsx`) and Agent D (`TerrainMap3D.tsx`) must share the same basemap styles and viewport state.
    *   **Fix:** Define shared map configuration (bounds, styles, initialViewState) in `src/lib/constants.ts` during Wave 1.
*   **Integration Risk:** Agent C (`RiskReport.tsx`) depends on `TerrainMap3D.tsx` (Agent D).
    *   **Fix:** Agent D must provide a stub component/interface early so Agent C can build the report layout without waiting for the complex 3D logic.

---

## 6. Proposed Fixes (Paste-Ready)

### Fix A: "Outside Service Area" Check
Add this to `src/lib/geocoding.ts`:
```typescript
const BUNCOMBE_BBOX = [-82.85, 35.40, -82.25, 35.80]; // Approx Buncombe bounds

export const isInsideBuncombe = (lng: number, lat: number) => {
  return lng >= BUNCOMBE_BBOX[0] && lng <= BUNCOMBE_BBOX[2] &&
         lat >= BUNCOMBE_BBOX[1] && lat <= BUNCOMBE_BBOX[3];
};
```

### Fix B: Corrected ArcGIS Stability Index Query
Update `docs/design-spec.md` with the ImageServer endpoint for consistency:
```bash
# Stability Index (ImageServer for easier pixel lookup)
GET /arcgis/rest/services/StabilityIndexMap/ImageServer/identify
  ?geometry={lng},{lat}&geometryType=esriGeometryPoint&sr=4326&f=json
```

### Fix C: Standalone Search Integration
Update `LandingPage.tsx` logic to bridge Mapbox Search with MapLibre:
```tsx
// Inside LandingPage.tsx
<SearchBox 
  accessToken={token} 
  onRetrieve={(res) => {
    const coords = res.features[0].geometry.coordinates;
    const address = res.features[0].properties.full_address;
    // Update store manually since Mapbox Search won't find MapLibre
    setLocation({ 
      address, 
      coords: { lng: coords[0], lat: coords[1] },
      isInsideBuncombe: isInsideBuncombe(coords[0], coords[1])
    });
    navigate('/confirm');
  }}
/>
```

### Fix D: Risk Engine Logic Extension
Incorporate the Stability Index into the susceptibility score in `riskEngine.ts`:
```typescript
// Susceptibility weighting including Buncombe's specific index
landslideSusceptibility = weighted(
  proximityToLandslides * 0.3, 
  realSlopeScore * 0.3, 
  stabilityIndexFromArcGIS * 0.4 // High-signal real data
)
```
