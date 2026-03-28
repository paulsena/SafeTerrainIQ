# SafeTerrainIQ

**Know Your Ground. Protect Your Home.**

*SafeTerrainIQ is an MVP prototype built for a weekend hackathon, designed to deliver expert-level geohazard intelligence directly to homeowners in Western North Carolina.*

---

## The Problem
In September 2024, Hurricane Helene triggered thousands of landslides across Asheville and Western North Carolina (WNC), tragically killing 31 people. As recovery and rebuilding efforts began, a critical question emerged for thousands of residents: **"Where is it safe to rebuild?"**

Currently, that question has no accessible answer. Professional expert geohazard assessments take weeks to months, cost tens of thousands of dollars, and require specialized geologists that most homeowners simply cannot access or afford. 

While insurance companies and commercial developers use sophisticated GIS and terrain data to protect their investments, the people living on the hillsides are left in the dark. **No platform currently delivers geohazard intelligence directly into the hands of homeowners.**

## The Solution
SafeTerrainIQ bridges this gap. It empowers any homeowner or prospective buyer to search their property address and receive a comprehensive **landslide risk assessment in minutes**—powered by real regional terrain data and risk models. 

By answering a short guided questionnaire about ground observations, homeowners receive a plain-language hazard report evaluating four critical dimensions:
1. **Slope Stability**
2. **Debris Flow Risk**
3. **Surface Water Runoff**
4. **Landslide Susceptibility**

## Product Features (MVP)
- **Address-Based Profiling:** Search any address within Buncombe County to immediately look up its exact slope percentage and elevation from Buncombe County ArcGIS servers.
- **Guided Assessment Wizard:** An intuitive, 5-step questionnaire asking homeowners about physical ground indicators (e.g., soil cracks, tilting trees, drainage issues).
- **Comprehensive Risk Report:** An authoritative breakdown of geohazard risk, combining the user's ground observations with real terrain indicators and proximity to known USGS landslide events. 
- **3D Terrain & Data Visualization:** An interactive Deck.gl mapping interface displaying the home on a 3D topographic mesh, overlaid with a risk heatmap, documented Helene landslides (USGS ScienceBase), and simulated debris flow paths. 
- **AI Geotechnical Assistant:** A Claude-powered chat interface contextually aware of the property's specific risk profile, ready to answer follow-up questions about mitigation and next steps.
- **Next Steps & Professional Directory:** Direct connections to real local geotechnical engineers and an option to export the assessment as a PDF.

## Technical Implementation
This MVP was engineered over a weekend using a modern React stack. It combines robust front-end web technologies with complex GIS data querying capabilities:

- **Framework:** React 19 + TypeScript + Vite 6
- **Styling:** Tailwind CSS 4 (utilizing a bespoke "Calm to Data Authority" dynamic theme shift)
- **Maps & 3D Visualization:** MapLibre GL JS (2D basemaps) + Deck.gl (3D terrain layers, heatmaps, scatterplots, paths)
- **Location & Geocoding:** Mapbox Search JS React
- **Live Data Connectors:** Buncombe County ArcGIS REST APIs (for real-time live-pixel slope & elevation inference)
- **State Management:** Zustand 5
- **Animations:** Framer Motion 12
- **AI:** Anthropic API (Claude) proxy for contextual geohazard chat

## Getting Started

1. Install dependencies (utilizing legacy peer deps due to map dependency overlap with React 19):
   ```bash
   npm install --legacy-peer-deps
   ```
2. Create a `.env.local` file utilizing `VITE_MAPBOX_ACCESS_TOKEN` and `VITE_CLAUDE_API_KEY`.
3. Start the dev server:
   ```bash
   npm run dev
   ```

*Note: SafeTerrainIQ live data currently strictly enforces bounding boxes for Buncombe County, NC. Addresses outside of this region will be flagged as outside the service area.*
