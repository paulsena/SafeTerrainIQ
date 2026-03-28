# SafeTerrainIQ MVP — Implementation Plan

## Context

After Hurricane Helene (Sept 2024), thousands of landslides devastated Asheville & WNC, killing 31 people. Homeowners need to know if it's safe to rebuild, but expert geohazard assessments take months and cost tens of thousands. SafeTerrainIQ delivers expert-level geohazard intelligence directly to homeowners — search any property, get a risk assessment in minutes.

This is a **weekend hackathon MVP**. The goal is a demo-ready prototype with real map data for Asheville, NC, mocked risk model outputs anchored on real terrain data, and a polished 5-step user flow.

---

## Design Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Primary user | Homeowner/buyer |
| Map stack | MapLibre GL JS (2D) + Deck.gl (3D report) |
| Geocoding | Mapbox Geocoding API (free tier) |
| Theme | Calm earth tones (steps 1-3), dark slate data authority (steps 4-5) |
| Questionnaire | Wizard-style, one question per screen |
| Report palette | Dark slate (#1a2d3d) |
| Framework | React 19 + TypeScript + Vite + Tailwind CSS 4 |

### Color Palette
- **Earth tones (steps 1-3):** Sage #4a7c59, Moss #8faa7e, Terracotta #c4a572, Warm White #f5f0e8, Warm Gray #6b6b6b
- **Data authority (steps 4-5):** Deep Slate #1a2d3d, Mid Slate #243d50, Light Slate #2d4a5e
- **Risk indicators:** Red #d4453b (high), Amber #e8a838 (moderate), Green #4a7c59 (low)

---

## Tech Stack

| Category | Library | Purpose |
|---|---|---|
| Framework | React 19 + TypeScript | UI |
| Build | Vite 6 | Fast dev server, HMR |
| Styling | Tailwind CSS 4 | Rapid prototyping |
| 2D Map | maplibre-gl + react-map-gl/maplibre | Property confirmation |
| 3D Viz | @deck.gl/core, /layers, /geo-layers, /aggregation-layers, /mapbox | Terrain + risk overlays |
| Geocoding | @mapbox/search-js-react | Address autocomplete |
| Routing | react-router-dom 7 | Multi-step flow |
| State | zustand 5 | Wizard + report state |
| Animation | framer-motion 12 | Wizard transitions |
| Icons | lucide-react | UI icons |
| PDF | html2pdf.js | Report export |
| AI Chat | Anthropic Claude API | Follow-up Q&A |

### Installation Note
Many mapping libraries haven't updated peer dependency ranges to `^19.0.0` yet. Use `--legacy-peer-deps` when installing:
```bash
npm install --legacy-peer-deps
```

### API Keys Needed (.env.local)
- `VITE_MAPBOX_ACCESS_TOKEN` — Mapbox geocoding
- `VITE_CLAUDE_API_KEY` — AI chat (proxied through Vite dev server)

### Free Tile Sources (no key needed)
- Basemap light: `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`
- Basemap dark: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`
- Elevation: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`
- Satellite: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`

---

## Project Structure

```
SafeTerrainIQ/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── .env.local
├── public/
│   └── data/
│       ├── helene-landslides.geojson    # USGS Hurricane Helene inventory
│       ├── asheville-risk-grid.json     # Pre-generated mock risk grid
│       └── professionals.json           # Local geotechnical professionals
├── src/
│   ├── main.tsx
│   ├── App.tsx                          # Router setup
│   ├── index.css                        # Tailwind + custom vars
│   ├── stores/
│   │   └── appStore.ts                  # Zustand: address, wizard, risk results
│   ├── lib/
│   │   ├── riskEngine.ts               # Mock risk scoring (anchored on real data)
│   │   ├── terrainData.ts              # Fetch slope/elevation from Buncombe ArcGIS
│   │   ├── geocoding.ts                # Mapbox helpers
│   │   └── constants.ts                # Colors, coords, map config
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PageTransition.tsx       # Framer Motion wrapper
│   │   │   └── ProgressBar.tsx          # Step indicator
│   │   ├── maps/
│   │   │   ├── PropertyMap.tsx          # 2D MapLibre (Step 2)
│   │   │   ├── TerrainMap3D.tsx         # Deck.gl terrain + overlays (Step 4)
│   │   │   ├── RiskHeatmap.tsx          # ScreenGridLayer overlay
│   │   │   ├── LandslideFlow.tsx        # PathLayer for debris flow
│   │   │   ├── HistoricalMarkers.tsx    # Landslide inventory points
│   │   │   └── DeckGLOverlay.tsx        # MapboxOverlay hook wrapper
│   │   ├── wizard/
│   │   │   ├── WizardContainer.tsx      # Question flow + transitions
│   │   │   ├── QuestionCard.tsx         # Question layout wrapper
│   │   │   ├── MultipleChoice.tsx       # Reusable MC input
│   │   │   ├── SeveritySlider.tsx       # Yes/No + severity
│   │   │   └── SlopeVisualizer.tsx      # SVG slope visualization
│   │   ├── shared/
│   │   │   ├── LoadingSkeleton.tsx       # Loading state for report reveal
│   │   │   └── LocationErrorModal.tsx   # "Outside Service Area" / geocoding errors
│   │   ├── report/
│   │   │   ├── RiskBadge.tsx            # Overall risk badge
│   │   │   ├── RiskCategoryCard.tsx     # Individual risk card
│   │   │   ├── AISummary.tsx            # Template-based AI summary
│   │   │   └── ReportExport.tsx         # PDF/email export
│   │   └── chat/
│   │       ├── ChatInterface.tsx        # AI chat UI
│   │       └── ChatMessage.tsx          # Message bubble
│   └── pages/
│       ├── LandingPage.tsx              # Step 1: Hero + address search
│       ├── PropertyConfirm.tsx          # Step 2: Map confirmation
│       ├── Questionnaire.tsx            # Step 3: Wizard
│       ├── RiskReport.tsx               # Step 4: Full report
│       └── NextSteps.tsx                # Step 5: Chat + professionals
```

---

## Multi-Agent Strategy (Claude Code + Gemini)

Implementation uses **3 waves** of parallel agents across **two AI tools**. Each agent works in a git worktree for isolation, then merges back.

### Tool Setup

**Claude Code** — primary orchestrator, handles integration-heavy work + merges
**Gemini CLI / Gemini MCP** — handles self-contained features, data research, doc review

To install Gemini MCP for Claude Code (allows Claude to call Gemini directly):
```bash
claude mcp add gemini -- npx -y @rlabs-inc/gemini-mcp
# Requires GEMINI_API_KEY environment variable
```

Alternatively, run Gemini CLI in a separate terminal for fully parallel work.

### Pre-Wave: Doc Review (Gemini)
> **ACTION: Run in Gemini CLI before starting Wave 1.**
> Paste the review prompt from the brainstorming session into Gemini CLI with both docs.
> Gemini validates data source URLs, checks cross-doc consistency, flags tech stack issues.
> Apply any fixes to docs before proceeding. If no issues, continue to Wave 1.

### Wave 1 — Scaffold (Claude Code, sequential, ~30 min)
One Claude Code agent creates the project, installs all deps, sets up config, routing, Zustand store skeleton, and shared constants. Everything else depends on this.

### Wave 2 — Core Features (4 agents in parallel)

| Agent | Tool | Scope | Files |
|---|---|---|---|
| **A: Landing Page** | **Gemini CLI** | Landing page, SVG topo background, Mapbox geocoder, geocoding helpers. Self-contained visual work — plays to Gemini's strength with large SVG generation. | `LandingPage.tsx`, `geocoding.ts`, `constants.ts`, `index.css` |
| **B: Wizard + Property Map** | **Claude Code** | Property confirmation map, all wizard components, questionnaire page. Needs tight Zustand store integration. | `PropertyConfirm.tsx`, `Questionnaire.tsx`, `WizardContainer.tsx`, `QuestionCard.tsx`, `MultipleChoice.tsx`, `SeveritySlider.tsx`, `SlopeVisualizer.tsx`, `PageTransition.tsx`, `ProgressBar.tsx` |
| **C: Report + Risk Engine** | **Claude Code** | Report page, risk scoring, terrain data fetching, all report components. Core business logic, needs store integration. | `RiskReport.tsx`, `RiskBadge.tsx`, `RiskCategoryCard.tsx`, `AISummary.tsx`, `riskEngine.ts`, `terrainData.ts` |
| **D: Data + Map Viz** | **Gemini CLI** | Download/generate data files, all Deck.gl and MapLibre map components. Research-heavy (USGS data, ArcGIS validation, generating mock grids). Gemini's large context + web grounding helps. | `TerrainMap3D.tsx`, `RiskHeatmap.tsx`, `LandslideFlow.tsx`, `HistoricalMarkers.tsx`, `DeckGLOverlay.tsx`, `PropertyMap.tsx`, `helene-landslides.geojson`, `asheville-risk-grid.json`, `professionals.json` |

> **ACTION: Start Wave 2 agents.**
> - Open Claude Code → run Agents B and C (worktrees)
> - Open Gemini CLI (separate terminal) → run Agents A and D
> - Both tools work from the same git repo, branching from main post-scaffold
> - If Gemini CLI is not available or stalls, Claude Code can pick up Agents A and D

### Wave 2.5 — Merge + Integration (Claude Code)
> **ACTION: Claude Code merges all Wave 2 branches sequentially (A→B→C→D).**
> Run the app, verify the flow works end-to-end. Fix any integration issues before Wave 3.

### Wave 3 — Polish Features (3 agents in parallel)

| Agent | Tool | Scope | Files |
|---|---|---|---|
| **E: AI Chat** | **Gemini CLI** | Chat interface, Claude API proxy, streaming responses. Gemini knows API patterns well. | `ChatInterface.tsx`, `ChatMessage.tsx`, API proxy config |
| **F: Next Steps + Export** | **Claude Code** | Next steps page, professional directory, PDF export. Needs tight integration with report. | `NextSteps.tsx`, `ReportExport.tsx` |
| **G: Responsive + Deploy** | **Claude Code** | Mobile breakpoints, conditional map rendering, Vercel serverless proxy, deploy. Touches all files. | All pages (responsive pass), `/api/arcgis` serverless function, `vercel.json` |

> **ACTION: Start Wave 3 agents.**
> - Claude Code → Agents F and G
> - Gemini CLI → Agent E
> - If Gemini CLI is not available, Claude Code handles all three

### Wave 3.5 — Final Merge + Review (Claude Code + Gemini)
> **ACTION: Claude Code merges Wave 3 branches. Then run Gemini for final review.**
> Gemini reviews the complete codebase for consistency, missed edge cases, and mobile UX.
> Claude Code runs verification checklist (see Verification section).

### Merge Strategy
- Wave 1 commits to `main`
- Wave 2 agents branch from `main` post-scaffold, work in worktrees, merge back sequentially (A→B→C→D) resolving any conflicts
- Wave 3 agents branch from merged Wave 2 result, same pattern
- At each merge point, run `npm run dev` and verify no regressions

### Fallback: Claude-Only Mode
If Gemini CLI setup is too slow or problematic, **all agents can run in Claude Code**. The agent assignments above are optimized for dual-tool parallelism but the plan works with a single tool. Just run all agents as Claude Code worktree agents instead.

---

## Implementation Phases

### Phase 1 — Scaffold + Landing Page (~2-3 hours)
**Goal: Navigable app with visually impressive landing page.**

1. `npm create vite@latest . -- --template react-ts`
2. Install all dependencies (see tech stack above)
3. Configure Tailwind with custom color tokens
4. Set up React Router with 5 routes: `/` → `/confirm` → `/assess` → `/report` → `/next-steps`
5. Create Zustand store with full state shape:
   ```typescript
   interface AppState {
     currentStep: number;
     setStep: (step: number) => void;
     location: {
       address: string;
       coords: { lat: number; lng: number };
       isInsideBuncombe: boolean;
     } | null;
     setLocation: (loc: AppState['location']) => void;
     terrain: {
       slope: number;
       elevation: number;
       stabilityIndex: number;
     } | null;
     setTerrain: (data: AppState['terrain']) => void;
     answers: {
       cracks: 'none' | 'hairline' | 'moderate' | 'severe';
       tilting: { observed: boolean; severity: number };
       drainage: 'well' | 'pooling' | 'standing' | 'erosion';
       slopeSelection: number;
       construction: 'none' | 'minor' | 'major' | 'clearing';
     };
     setAnswer: (key: keyof AppState['answers'], value: any) => void;
     riskResults: {
       scores: { stability: number; debris: number; runoff: number; susceptibility: number };
       overall: 'low' | 'moderate' | 'high' | 'critical';
       aiSummary: string;
     } | null;
     setResults: (results: AppState['riskResults']) => void;
   }
   ```
6. Build `LandingPage.tsx`:
   - SVG topographic contour background (detailed, realistic)
   - "SafeTerrainIQ" branding (large, IQ in accent green)
   - Mapbox Search autocomplete in **standalone mode** (do NOT pass `map` or `mapboxgl` props — it's incompatible with MapLibre). Use `onRetrieve` callback to extract coords and update store manually.
   - Geographic bounds check: verify address is within Buncombe County (~`[-82.85, 35.40, -82.25, 35.80]`) before proceeding. Show "Outside Service Area" for out-of-bounds addresses.
   - Sage-to-slate gradient
   - Trust bar ("Real terrain data", "Expert-trained models", "Results in minutes")
7. Set up `.env.local` with Mapbox token
8. Set up `vite.config.ts` with ArcGIS proxy: `/arcgis` → `https://gis.buncombecounty.org`

**Demo checkpoint: Beautiful landing page with working autocomplete.**

### Phase 2 — Property Map + Wizard (~2-3 hours)
**Goal: Complete address → questionnaire flow.**

1. Build `PropertyConfirm.tsx` — MapLibre 2D map centered on geocoded coords, satellite basemap, marker, "This is my property" button
2. Build `terrainData.ts` — fetch real slope/elevation/stability from Buncombe County ArcGIS:
   - Slope: `GET /arcgis/rest/services/PERCENTSLOPE/ImageServer/identify?geometry={x},{y}&geometryType=esriGeometryPoint&sr=4326&f=json`
   - Elevation: `GET /arcgis/rest/services/DEM/ImageServer/identify?geometry={x},{y}&geometryType=esriGeometryPoint&sr=4326&f=json`
   - Stability Index: `GET /arcgis/rest/services/StabilityIndexMap/ImageServer/identify?geometry={x},{y}&geometryType=esriGeometryPoint&sr=4326&f=json`
   - Handle null pixel values gracefully (water bodies, county boundary edge cases)
3. Build wizard components with Framer Motion `AnimatePresence` slide transitions:
   - Q1: Visible cracks (None / Hairline / Moderate / Severe)
   - Q2: Tilting structures (Yes/No, if yes → severity slider)
   - Q3: Drainage (Well-drained / Some pooling / Standing water / Active erosion)
   - Q4: Slope estimate (SlopeVisualizer with real data pre-filled)
   - Q5: Recent changes (None / Minor landscaping / Major construction / Land clearing)
4. Wire all answers into Zustand store

**Demo checkpoint: Full flow from landing → confirm → questionnaire.**

### Phase 3 — Risk Report Core (~3-4 hours)
**Goal: The "wow" demo screen.**

1. Build `riskEngine.ts` — mock scoring anchored on real slope + elevation + wizard answers + proximity to USGS landslide points:
   - `slopeStability` = weighted(slopeScore, crackFactor, tiltFactor)
   - `debrisFlow` = weighted(slopeScore, drainageFactor, proximityFactor)
   - `surfaceRunoff` = weighted(drainageFactor, slopeScore, constructionFactor)
   - `landslideSusceptibility` = weighted(proximityFactor * 0.3, slopeScore * 0.3, stabilityIndexFromArcGIS * 0.4)
   - `overall` = weighted average of all four → Low/Moderate/High/Critical
2. Build `RiskReport.tsx` page — dark slate theme (#1a2d3d)
3. Build `RiskBadge.tsx` — prominent color-coded badge
4. Build 4x `RiskCategoryCard.tsx` with score bars
5. Build `AISummary.tsx` — template-based text assembled from risk scores (no API call, instant)
6. Download USGS Hurricane Helene landslide GeoJSON, filter to Buncombe County, save to `public/data/`
7. Build `HistoricalMarkers.tsx` — ScatterplotLayer for landslide points on a 2D dark map

**Demo checkpoint: Complete flow with rich data-authority report.**

### Phase 4 — 3D Terrain + Overlays (~3-4 hours)
**Goal: Maximum visual impact.**

1. Build `TerrainMap3D.tsx`:
   - MapLibre dark basemap
   - Deck.gl `TerrainLayer` with AWS Terrarium elevation tiles + Esri satellite texture
   - Camera: zoom 14, pitch 60, bearing -20, centered on property
   - `elevationDecoder`: Terrarium format (R*256 + G + B/256 - 32768)
2. Build `RiskHeatmap.tsx` — `ScreenGridLayer` with mock risk grid, green-to-red color range, cellSizePixels: 15
3. Build `LandslideFlow.tsx` — `PathLayer` showing simulated debris flow paths downslope
4. Pre-generate `asheville-risk-grid.json` — grid of {lat, lng, risk} covering demo area (~5km x 5km around Garren Creek/Fairview)
5. Add map layer toggle controls in report UI
6. **Fallback**: If TerrainLayer is too finicky, use MapLibre's built-in `setTerrain()` with hillshade

**Demo checkpoint: Stunning 3D terrain with risk overlays.**

### Phase 5 — AI Chat + Next Steps (~2 hours)
**Goal: Complete the experience.**

1. Build `ChatInterface.tsx` — message list + input, streaming responses
2. Set up Claude API proxy in Vite config (or small Express endpoint)
3. System prompt: geohazard expert with property context (address, scores, wizard answers)
4. Build `NextSteps.tsx` — professional directory (static JSON of real Asheville geotechnical firms) + email/PDF export
5. PDF export via `html2pdf.js` targeting report container

**Demo checkpoint: Fully functional end-to-end MVP.**

### Phase 6 — Responsive + Deploy (~2 hours)
**Goal: Works on attendees' phones.**

1. Mobile-first responsive pass on all pages (Tailwind breakpoints)
2. Conditional map rendering: 2D pitched hillshade on mobile, 3D Deck.gl on desktop
3. Touch-friendly wizard (large tap targets, swipe-friendly)
4. Add `/api/arcgis` serverless proxy function for production deployment
5. Deploy to Vercel with environment variables
6. Test on real phones with various Asheville addresses
7. Add demo preset addresses (Garren Creek Rd, Fairview NC) as quick-start buttons on landing page

### Phase 7 — Polish (remaining time)
- Loading skeletons during data fetch
- Error handling for API failures (graceful fallbacks)
- Final animation tweaks
- Performance optimization for mobile

---

## Real Data Sources

| Data | Source | Endpoint | Usage |
|---|---|---|---|
| Elevation tiles | AWS Open Data (Terrarium) | `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Deck.gl 3D terrain mesh |
| Helene landslides | USGS ScienceBase | Download GeoJSON from catalog item 674634a1d34e6d1dac3abddc | Historical markers on map |
| Slope % | Buncombe County ArcGIS | `/arcgis/rest/services/PERCENTSLOPE/ImageServer/identify` | Pre-fill slope Q, risk scoring |
| DEM elevation | Buncombe County ArcGIS | `/arcgis/rest/services/DEM/ImageServer/identify` | Elevation context |
| Stability Index | Buncombe County ArcGIS | `/arcgis/rest/services/StabilityIndexMap/ImageServer/identify` | Direct susceptibility scoring (pixel value) |
| Basemap (light) | Carto | `basemaps.cartocdn.com/gl/voyager-gl-style/style.json` | Property confirmation |
| Basemap (dark) | Carto | `basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` | Report map |
| Satellite | Esri | `server.arcgisonline.com/.../World_Imagery/MapServer/tile/{z}/{y}/{x}` | 3D terrain texture |

## Mock Data Strategy

**Real:** Map tiles, geocoding, 3D terrain mesh, satellite imagery, historical landslide points, slope/elevation at property
**Mocked:**
- **Risk scores** — computed from real slope + elevation + wizard answers + proximity to USGS landslides. Produces believable, varied results.
- **Risk heatmap grid** — pre-generated JSON grid (~5km x 5km) with risk values derived from slope + landslide proximity + noise
- **Debris flow paths** — pre-computed GeoJSON LineStrings flowing downslope from known landslide areas
- **AI summary** — template-based text assembled from scores (instant, no API call)
- **Professionals** — hand-curated JSON of real Asheville geotechnical firms

---

## Mobile-First Responsive Strategy

**Attendees will use this on their phones with their own addresses.** The app must work live — not just cached demo data.

### Layout Approach
- **Mobile-first Tailwind breakpoints** — design for 375px+ first, scale up to desktop
- All pages must be fully functional and touch-friendly on mobile
- Wizard questions: full-screen cards with large tap targets (min 48px touch areas)
- Report page: single-column stack on mobile, side-by-side cards on desktop

### Map Handling by Device
- **Mobile (< 768px):** 2D MapLibre map with pitched hillshade for report (lightweight, fast). Risk heatmap as a flat overlay. No Deck.gl TerrainLayer.
- **Desktop (>= 768px):** Full 3D Deck.gl terrain with all overlays.
- Detection: CSS breakpoints for layout, `window.innerWidth` check for which map component to render.

### Live Data for Any Address
- Geocoding works for any address (Mapbox handles this)
- ArcGIS slope/elevation queries work for any lat/lng in Buncombe County — no pre-caching required for functionality
- Risk engine runs client-side with real slope data — works for any address
- USGS landslide GeoJSON is pre-loaded (static file) — proximity calculation runs client-side
- **Pre-cache 2-3 demo addresses** only as a fallback if ArcGIS is slow/down during the live demo
- Risk heatmap grid is pre-generated for the broader Asheville area — any address within it gets real overlay data

### Production Hosting for Hackathon
- Deploy to Vercel/Netlify for a public URL attendees can hit on their phones
- ArcGIS proxy needs a serverless function (Vercel API route or Netlify function) since Vite dev proxy won't be running in production
- Add `/api/arcgis` serverless proxy function that forwards requests to `gis.buncombecounty.org`

---

## Technical Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Deck.gl TerrainLayer complexity | Build 2D report first (Phase 3), add 3D as enhancement (Phase 4). Fallback: MapLibre built-in `setTerrain()` |
| Buncombe County ArcGIS CORS | Vite dev proxy for dev. Serverless proxy function for production. Pre-cache demo addresses as backup. |
| AWS Terrarium tiles 404 at high zoom | Clamp maxZoom: 15 on TerrainLayer |
| Mobile perf with Deck.gl | 2D-only map on mobile (< 768px), full 3D on desktop only |
| Mapbox Search JS + MapLibre | `@mapbox/search-js-react` is hardcoded for `mapbox-gl`. Use standalone mode only — no `map`/`mapboxgl` props. Use `onRetrieve` callback to bridge to MapLibre. |
| Claude API for chat | Pre-cache responses for demo fallback; use streaming for natural feel. Serverless proxy for API key security. |
| ArcGIS down during live demo | Pre-cache slope/elevation for 2-3 demo addresses in static JSON. App checks cache first, falls back to live API. |
| Many concurrent users at hackathon | Static site on Vercel/Netlify handles this well. ArcGIS queries are lightweight (single pixel lookups). |

---

## Verification

1. `npm run dev` — app loads at localhost, no console errors
2. Type an Asheville address in geocoder — autocomplete works, map centers correctly
3. Click through all 5 wizard questions — answers persist in store
4. Report page renders with risk scores, historical landslide markers, AI summary
5. 3D terrain loads with satellite texture and risk heatmap overlay
6. AI chat accepts a question and returns a streaming response
7. PDF export generates a downloadable file
8. Test on mobile viewport — responsive layout, 3D toggle works
9. Test with Garren Creek Rd, Fairview NC 28730 as primary demo address

---

## Demo Strategy

**Primary demo address:** Garren Creek Road area, Fairview NC 28730 (known major Helene landslide zone)

**Demo flow (~2 min):** Landing (10s) → Type address, autocomplete (10s) → Confirm map (5s) → Wizard 5 questions (30s) → Report reveal with 3D terrain (30s exploration) → AI chat question (15s)

**Live audience participation:** Share the Vercel URL — attendees search their own Asheville-area addresses on their phones and get real results. Pre-cache 2-3 demo addresses as fallback only.

**Quick-start buttons** on landing page for demo addresses (e.g., "Try: Garren Creek Rd, Fairview") so the stage demo flows instantly.
