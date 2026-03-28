# SafeTerrainIQ — Product Design Spec

## Problem

In September 2024, Hurricane Helene triggered thousands of landslides across Asheville and Western North Carolina, killing 31 people. As recovery began, the critical question — "where is it safe to rebuild?" — has no accessible answer. Expert geohazard assessments take weeks to months, cost tens of thousands of dollars, and require specialists that most homeowners cannot access. Insurance companies and developers use this data to protect shareholders, not the people living on the hillside.

No platform currently delivers geohazard intelligence directly to homeowners.

## Solution

SafeTerrainIQ lets any homeowner search their property address and receive a landslide risk assessment in minutes — powered by real terrain data and an AI trained by landslide experts. The assessment covers slope stability, debris flow risk, landslide susceptibility, and surface water runoff, presented through intuitive map visualizations and a plain-language report.

## Target User (MVP)

**Primary:** Homeowner or home buyer in the Asheville/WNC area who wants to understand the landslide risk for a specific property. They may be anxious, non-technical, and searching from a phone.

**Secondary (future):** Home inspectors who run assessments on behalf of buyers and generate professional reports.

The MVP is optimized entirely for the homeowner experience. The inspector workflow is the same flow with different framing — easy to add post-MVP.

---

## User Flow

### Step 1: Landing Page
- Hero with "SafeTerrainIQ" branding (large, prominent)
- Tagline: "Know Your Ground. Protect Your Home."
- Subtext: "Expert-level geohazard intelligence for homeowners. Get your property's landslide risk assessment in minutes — not months."
- Address search bar with Mapbox autocomplete (scoped to Asheville/WNC area)
- Topographic contour line SVG background (detailed, realistic)
- Sage-to-slate gradient background
- Trust bar: "Real terrain data" | "Expert-trained models" | "Results in minutes"
- Quick-start demo buttons for pre-set addresses (e.g., "Try: Garren Creek Rd, Fairview")
- Currently serving: Asheville & Western North Carolina

### Step 2: Property Confirmation
- 2D MapLibre map centered on the geocoded address
- Satellite basemap with property marker
- "This is my property" confirmation button
- Option to adjust pin if geocoding is slightly off
- Behind the scenes: fetch real slope % and elevation from Buncombe County ArcGIS

### Step 3: Questionnaire (Wizard)
- One question per screen, Typeform-style with slide transitions
- Large interactive elements, touch-friendly (min 48px tap targets)
- Progress indicator showing current step

**Questions:**
1. **Soil cracks** — "Have you observed any visible cracks in the soil around your property?"
   - Options: None / Hairline cracks / Moderate cracks / Severe cracks
   - Input: Multiple choice cards

2. **Tilting structures** — "Are there any tilting trees, fences, or retaining walls on or near your property?"
   - Options: Yes / No
   - If yes: Severity slider (Slight / Moderate / Significant)

3. **Drainage** — "How would you describe the drainage situation around your property?"
   - Options: Well-drained / Some pooling after rain / Significant standing water / Active erosion channels
   - Input: Multiple choice cards

4. **Slope** — "What is the estimated slope of your property?"
   - Options: Flat (<5 deg) / Gentle (5-15 deg) / Moderate (15-30 deg) / Steep (>30 deg)
   - Pre-filled from real Buncombe County slope data
   - Includes inline SVG slope angle visualization showing the actual grade
   - Input: Visual selector with pre-filled recommendation

5. **Recent changes** — "Have there been any recent construction or land changes on or near your property?"
   - Options: None / Minor landscaping / Major construction / Land clearing
   - Input: Multiple choice cards

### Step 4: Risk Report
- **Theme shift:** Dark slate background (#1a2d3d) — signals "this is serious data"
- **Overall risk badge:** Large, prominent, color-coded (Low=green, Moderate=amber, High=red, Critical=dark red)
- **3D terrain map** (desktop): Deck.gl TerrainLayer with satellite texture, risk heatmap overlay, historical landslide markers, debris flow paths
- **2D pitched map** (mobile): MapLibre with hillshade, flat risk overlay, landslide markers
- **Layer toggles:** User can show/hide risk heatmap, historical landslides, debris flow paths
- **4 risk category cards:**
  - Slope Stability (border-color by severity)
  - Debris Flow Risk (border-color by severity)
  - Surface Water Runoff (border-color by severity)
  - Landslide Susceptibility (border-color by severity)
- **AI Assessment Summary:** Plain-language paragraph explaining the risk in context of the specific property. Template-based, assembled from scores. Reads like a geotechnical engineer's summary.
- **Historical context:** Markers showing documented Helene landslides near the property

### Step 5: Next Steps
- **AI Chat:** Conversational interface where the user can ask follow-up questions. Powered by Claude API with a system prompt acting as a geotechnical expert, contextualized with the property's risk data.
- **Email/PDF export:** Enter email to receive PDF of the report. PDF generated client-side via html2pdf.js.
- **Professional directory:** List of local geotechnical engineers, geologists, and surveyors in the Asheville area. Static data, real companies.

---

## Visual Design

### Theme: Calm & Reassuring with Data Authority Shift

The design balances accessibility (homeowners who may be anxious) with credibility (data they can act on).

**Steps 1-3 (input flow):** Warm earth tones. Approachable, calming. "We're here to help you understand."
**Steps 4-5 (report):** Dark slate, data-forward. Professional, authoritative. "Here is the science."

This contrast creates a natural "reveal" moment when the report loads.

### Color Palette

| Name | Hex | Usage |
|---|---|---|
| Sage Green | #4a7c59 | Primary brand, buttons, low-risk indicator |
| Soft Moss | #8faa7e | Secondary accents, hover states |
| Terracotta | #c4a572 | Warm accent, borders |
| Warm White | #f5f0e8 | Background (steps 1-3) |
| Warm Gray | #6b6b6b | Secondary text |
| Deep Slate | #1a2d3d | Report background |
| Mid Slate | #243d50 | Report cards, containers |
| Light Slate | #2d4a5e | Report borders, secondary surfaces |
| Alert Red | #d4453b | High/critical risk indicator |
| Warning Amber | #e8a838 | Moderate risk indicator |

### Typography
- Clean, modern sans-serif (system font stack or Inter)
- Large branding text (48px on desktop, 36px mobile)
- Readable body text (15-16px)

### Landing Page
- Detailed SVG topographic contour lines as background (subtle, ~12% opacity)
- Sage-to-slate gradient
- Frosted glass search bar (backdrop-blur, slight transparency)
- "SafeTerrainIQ" with "IQ" in accent green (#8fca7e)

### Report Page
- Dark slate background throughout
- Risk cards with colored left borders matching severity
- 3D terrain map as hero visual (desktop) / 2D pitched map (mobile)
- Muted text labels (uppercase, small, low opacity) for data density without clutter

---

## Data Architecture

### Real Data (fetched live or pre-loaded)

| Data | Source | Format | How Used |
|---|---|---|---|
| Address geocoding | Mapbox Geocoding API | JSON | Convert address to lat/lng |
| Map basemap (light) | Carto Voyager | Vector tiles | Property confirmation map |
| Map basemap (dark) | Carto Dark Matter | Vector tiles | Report map |
| 3D elevation mesh | AWS Open Data (Terrarium) | PNG tiles | Deck.gl TerrainLayer |
| Satellite imagery | Esri World Imagery | Raster tiles | 3D terrain texture |
| Slope % at property | Buncombe County ArcGIS PERCENTSLOPE ImageServer | JSON (pixel value) | Pre-fill slope question, risk scoring |
| Elevation at property | Buncombe County ArcGIS DEM ImageServer | JSON (pixel value) | Risk scoring context |
| Stability index | Buncombe County ArcGIS StabilityIndexMap ImageServer | JSON (pixel value) | Landslide susceptibility scoring |
| Hurricane Helene landslides | USGS ScienceBase (item 674634a1d34e6d1dac3abddc) | GeoJSON | Historical markers on map, proximity scoring |

### ArcGIS Query Format
```
GET /arcgis/rest/services/PERCENTSLOPE/ImageServer/identify
  ?geometry={longitude},{latitude}
  &geometryType=esriGeometryPoint
  &sr=4326
  &f=json
```
Returns pixel value (float, percent slope). Same pattern for DEM elevation and Stability Index:
```
GET /arcgis/rest/services/StabilityIndexMap/ImageServer/identify
  ?geometry={longitude},{latitude}
  &geometryType=esriGeometryPoint
  &sr=4326
  &f=json
```

**Note:** ArcGIS services only cover Buncombe County. Addresses outside the county will return null/error. The app must check geographic bounds before querying ArcGIS and show an "Outside Service Area" message for out-of-bounds addresses.

Requires CORS proxy (Vite dev proxy for dev, serverless function for production).

### Mocked Data

**Risk Scores (riskEngine.ts):** Computed client-side from real slope + elevation + wizard answers + proximity to USGS landslide points. The algorithm weights these factors to produce 4 category scores (0-100) and an overall risk level. This is the "proprietary model" stand-in — it produces believable, varied results because it anchors on real terrain data.

Scoring logic:
- `slopeStability` = weighted(realSlopeScore * 0.5, crackFactor * 0.3, tiltFactor * 0.2)
- `debrisFlow` = weighted(realSlopeScore * 0.4, drainageFactor * 0.3, proximityToLandslides * 0.3)
- `surfaceRunoff` = weighted(drainageFactor * 0.5, realSlopeScore * 0.3, constructionFactor * 0.2)
- `landslideSusceptibility` = weighted(proximityToLandslides * 0.3, realSlopeScore * 0.3, stabilityIndexFromArcGIS * 0.4)
- `overall` = weighted average of all four -> mapped to Low (<25) / Moderate (25-50) / High (50-75) / Critical (>75)

**Risk Heatmap Grid (asheville-risk-grid.json):** Pre-generated grid of {lat, lng, risk} covering ~5km x 5km around the Garren Creek/Fairview demo area. Values derived from slope + landslide proximity + noise for realistic variation. Used by Deck.gl ScreenGridLayer.

**Debris Flow Paths:** Pre-computed GeoJSON LineStrings flowing downslope from known landslide locations. 3-5 paths in the demo area.

**AI Assessment Summary:** Template-based text assembled from risk scores and property data. No API call — instant render. Reads like: "Based on our analysis of [address], situated at [elevation]ft elevation with an average slope of [slope]%, your property shows [risk_level] overall geohazard risk..."

**Professionals Directory (professionals.json):** Hand-curated list of real Asheville-area geotechnical firms with name, specialty, phone, website.

---

## Responsive Strategy

**The app must work on attendees' phones at the hackathon.** People will search their own Asheville addresses.

### Mobile (< 768px)
- Single-column layout throughout
- Full-screen wizard cards with large tap targets (48px+)
- Report: stacked cards, 2D pitched MapLibre map with hillshade (no Deck.gl — too heavy)
- Risk heatmap as flat overlay
- Chat interface: full-width, keyboard-aware

### Desktop (>= 768px)
- Wider layouts, side-by-side elements where appropriate
- Full 3D Deck.gl terrain with all overlays
- Report cards in 2x2 grid

### Detection
- CSS: Tailwind mobile-first breakpoints (`md:` for desktop)
- JS: `window.innerWidth` check to conditionally render 2D vs 3D map component

---

## Tech Stack

| Category | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript | Best Deck.gl/MapLibre ecosystem |
| Build | Vite 6 | Fast HMR, hackathon speed |
| Styling | Tailwind CSS 4 | Rapid prototyping, design tokens |
| 2D Map | maplibre-gl + react-map-gl/maplibre | Free, no API key for tiles |
| 3D Viz | @deck.gl/* (core, layers, geo-layers, aggregation-layers, mapbox) | TerrainLayer, ScreenGridLayer, PathLayer |
| Geocoding | @mapbox/search-js-react | Address autocomplete (standalone mode — does NOT bind to MapLibre, use `onRetrieve` callback) |
| Routing | react-router-dom 7 | Multi-step flow |
| State | zustand 5 | Lightweight, simple |
| Animation | framer-motion 12 | Wizard transitions |
| Icons | lucide-react | Clean, consistent |
| PDF | html2pdf.js | Client-side PDF generation |
| AI Chat | Anthropic Claude API | Geohazard expert follow-up |
| Deploy | Vercel | Free, serverless functions for API proxy |

---

## Success Criteria (Hackathon Demo)

1. Attendee can open URL on phone, search their Asheville address, and get a risk report
2. Report shows believable, varied risk scores that differ by location
3. 3D terrain visualization is visually impressive on desktop
4. The flow feels professional and trustworthy — not like a toy
5. AI chat can answer basic follow-up questions about the risk assessment
6. Total flow from address entry to report: under 30 seconds
