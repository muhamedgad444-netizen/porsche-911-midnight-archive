# PORSCHE // 911 MIDNIGHT ARCHIVE

Interactive **React 18 + TypeScript + Vite + Three.js + Framer Motion + Lenis** motorsport showroom, multi-chassis 3D Garage Configurator, and technical apparel vault built in a **Midnight Cyber-Kinetic** aesthetic.

---

## Architecture & Flagship Features

### 1. Zero-G Cyber-Kinetic Boot Portal (`/welcome` & Initial Entry)
- GPU-instanced **2,800-particle Three.js WebGL field** with custom GLSL 3D Simplex Noise and pointer gravity bending.
- Interactive **Hyperspace Warp (`uWarp`)** camera & particle acceleration transitioning straight into the live 3D 992 GT3 showroom.

### 2. Upgraded Three.js Studio Engine (`PorscheStage.tsx`)
- `antialias: true`, `ACESFilmicToneMapping`, `PMREMGenerator` + `RoomEnvironment` PBR metallic reflections, and a grounded cyber turntable pad + soft contact shadow.
- Local KTX2 (`/basis/`) and Draco (`/draco/`) decoders bundled in `public/` for fast, zero-CDN-failure 3D loading.
- Scroll-scrubbed camera choreography + damped drag-to-orbit + 3 live Studio Lighting Rigs (**Cyber Night**, **Stuttgart Lab**, **Acid Track**).

### 3. Multi-Chassis 3D Garage Configurator
Switch live across all three repo Porsche GLBs inside one interactive showroom bay:
- **01 // Porsche 992 GT3** (`public/hero_model/porsche_911_gt3_final.ktx2.glb`)
- **02 // Porsche 911 S/T** (`public/gtr_model/porsche_911_st_final.ktx2.glb`)
- **03 // Porsche 918 Spyder** (`public/steeringwheel_model/porsche_918_spyder_final.ktx2.glb`)

Includes 4 damped camera presets (**3/4 Hero**, **Side Profile**, **Rear Aero**, **Overhead**), live **CAD Wireframe** toggle, **Auto-Orbit** toggle, and an expandable **Full Telemetry Specs** dossier.

### 4. Motion Choreography & Media
- **Lenis** inertial smooth scrolling wired into velocity-skewed chamfered archive grids (`VelocitySkew`).
- Tactical desktop HUD reticle cursor (`CyberCursor`) with live contextual labels (`ORBIT`, `CONFIGURE`, `INSPECT`, `ADD`, `WARP`, `PLAY`) — automatically disabled on touch screens.
- Dual-Channel Telemetry Film Showcase featuring both repo videos (`CAM_01 // Stuttgart Midnight Run` and `CAM_02 // Weissach Night Telemetry`) with interactive playback & mute controls.

### 5. Storefront, 3D Logistics Checkout & Admin Terminal
- **Collections (`/collections`):** Live category filters (`Hardware`, `Armor`, `Shell`, `Utility`, `Base`), search, sort, and Quick-Inspect Technical Dossier modal.
- **Checkout (`/checkout`):** Floating 3-step Logistics Protocol, live **3D Porsche 911 S/T** escort viewport whose camera preset tracks each step, interactive **3D Porsche Pay Wallet** (`VISA TITANIUM`, `INSTAPAY DIRECT`, `C.O.D. COURIER`), and clean confirmation receipt.
- **Admin Terminal (`/admin`):** Passkey-protected owner dashboard (`911GT3` demo key), KPI telemetry strip, inventory injection with texture preset previews, two-click safe purge, and live order logs.
- **Backend Compatibility:** Preserves Vercel Serverless Supabase endpoints in `api/products.js`, `api/orders.js`, and `api/seed.js` with resilient local vault fallback when Supabase env vars are not set locally.

---

## Local Development

```bash
npm install
npm run dev
```

Vite launches locally at `http://localhost:5175/`.

### Production Build

```bash
npm run build
npm run preview
```

### Vercel + Supabase Environment Variables

Configure these environment variables in your Vercel project settings to connect the live Postgres database:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

SPA route rewrites are preconfigured in `vercel.json` while keeping `/api/*` routed to Vercel Serverless Functions.
