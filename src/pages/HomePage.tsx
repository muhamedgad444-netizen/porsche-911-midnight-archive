import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Box,
  ChevronDown,
  Gauge,
  Pause,
  Play,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PorscheStage } from '../components/PorscheStage';
import { TopographicBackdrop } from '../components/TopographicBackdrop';
import { VelocitySkew } from '../components/VelocitySkew';
import { ProductCard } from '../components/ProductCard';
import { useArchive } from '../context/ArchiveContext';
import { useLenis } from '../context/LenisContext';
import { FILM_FEEDS, FLEET_ORDER, FLEET_SPECS } from '../data/fleet';
import { LightingMood } from '../types';

const MOODS: { id: LightingMood; label: string }[] = [
  { id: 'cyber', label: 'CYBER NIGHT' },
  { id: 'stuttgart', label: 'STUTTGART' },
  { id: 'acid', label: 'ACID TRACK' },
];

const CATEGORIES = ['ALL', 'Hardware', 'Armor', 'Shell', 'Utility', 'Base'];

const FilmMonitor: React.FC<{ feed: (typeof FILM_FEEDS)[number] }> = ({ feed }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div className="group relative border border-white/10 hover:border-cyanHud/50 bg-[#050810] chamfer overflow-hidden transition-colors">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#070c16] font-mono text-[10px] tracking-[0.24em]">
        <div className="flex items-center gap-2 text-cyanHud">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span>{feed.tag}</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">REC_ACTIVE</span>
      </div>

      <div className="relative aspect-video bg-black overflow-hidden" data-cursor="PLAY">
        <video
          ref={videoRef}
          src={feed.src}
          autoPlay
          loop
          muted={muted}
          playsInline
          onClick={togglePlay}
          className="h-full w-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700 cursor-pointer"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030406] via-transparent to-transparent" />

        {/* Video Controls */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold tracking-wider text-white">
              {feed.title}
            </h3>
            <p className="font-mono text-[10px] tracking-[0.2em] text-cyanHud/85 mt-0.5">
              {feed.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause video' : 'Play video'}
              className="w-8 h-8 border border-white/20 bg-[#030406]/80 flex items-center justify-center text-white hover:border-cyanHud hover:text-cyanHud"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute video' : 'Mute video'}
              className="w-8 h-8 border border-white/20 bg-[#030406]/80 flex items-center justify-center text-white hover:border-cyanHud hover:text-cyanHud"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 bg-[#04070e] font-mono text-[10px] tracking-[0.22em] text-slate-400">
        {feed.telemetry}
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const {
    products,
    openGarage,
    lightingMood,
    setLightingMood,
    garageOpen,
    bagOpen,
    inspectProduct,
  } = useArchive();
  const { scrollTo } = useLenis();
  const [activeCat, setActiveCat] = useState('ALL');
  const heroPaused = garageOpen || bagOpen || Boolean(inspectProduct);

  const filtered = useMemo(() => {
    const base =
      activeCat === 'ALL'
        ? products
        : products.filter((p) => p.type.toLowerCase() === activeCat.toLowerCase());
    return base.slice(0, 8);
  }, [products, activeCat]);

  return (
    <div className="relative bg-[#030406]">
      {/* ================================================================
          SECTION 1: FULL-VIEWPORT 100SVH 3D 992 GT3 CYBER-KINETIC HERO
          Zero-occlusion layering: Ghost display sits behind car, crisp HUD frames edges
         ================================================================ */}
      <section className="relative h-[100svh] min-h-[680px] w-full overflow-hidden cyber-grid-bg pt-16 flex flex-col justify-between">
        <TopographicBackdrop />

        {/* Ambient Shark-Blue & Cyan Radial Glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 68% 54% at 50% 54%, rgba(0, 112, 255, 0.22) 0%, rgba(0, 229, 255, 0.06) 42%, rgba(3, 4, 6, 0.94) 80%)',
          }}
        />

        {/* Background Giant Layered Ghost Title (Behind the 3D Porsche — ZERO occlusion!) */}
        <div className="pointer-events-none absolute inset-x-0 top-[14%] sm:top-[13%] z-0 flex flex-col items-center select-none overflow-hidden px-4">
          <span className="font-display font-bold italic uppercase leading-[0.84] tracking-[0.12em] text-[clamp(3.2rem,13.5vw,12rem)] text-outline-cyber">
            MIDNIGHT
          </span>
          <span className="font-display font-bold italic uppercase leading-[0.84] tracking-[0.18em] text-[clamp(2.4rem,10.5vw,9.2rem)] text-outline-white -mt-2 sm:-mt-5">
            ARCHIVE
          </span>
        </div>

        {/* Full-Stage Interactive 3D Porsche 992 GT3 (Scroll-scrubbed + Drag-to-orbit) */}
        <div className="absolute inset-0 z-10 pt-14 pb-20 sm:pb-16">
          <PorscheStage
            chassis="gt3"
            mood={lightingMood}
            preset="hero"
            autoRotate
            interactive
            scrollLinked
            paused={heroPaused}
            targetScale={3.75}
          />
        </div>

        {/* Top HUD Strip (Sits cleanly above car silhouette) */}
        <div className="relative z-20 mx-auto w-full max-w-[1440px] px-4 sm:px-8 pt-5 sm:pt-7 flex items-start justify-between pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-1.5"
          >
            <div className="inline-flex items-center gap-2 border border-shark/50 bg-[#030406]/75 backdrop-blur-md px-3 py-1 chamfer-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-cyanHud animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.28em] text-cyanHud">
                992 GT3 // TRACK_READY
              </span>
            </div>
            <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-bold italic tracking-[0.14em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
              911 MIDNIGHT ARCHIVE
            </h1>
            <p className="hidden sm:block font-mono text-[10px] tracking-[0.26em] text-slate-400">
              502 HP · 9,000 RPM · DRAG TO ORBIT · SCROLL TO SCRUB CAMERA
            </p>
          </motion.div>

          {/* Right Lighting Rig Quick Switcher */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-auto hidden md:flex flex-col items-end gap-2"
          >
            <div className="font-mono text-[9px] tracking-[0.28em] text-slate-400">
              STUDIO LIGHTING RIG
            </div>
            <div className="flex items-center gap-1 bg-[#05080f]/80 backdrop-blur-md border border-white/10 p-1">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setLightingMood(m.id)}
                  className={`px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] transition-colors ${
                    lightingMood === m.id
                      ? 'bg-shark text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom HUD Command Bar (Sits cleanly below tires — zero overlap!) */}
        <div className="relative z-20 mx-auto w-full max-w-[1440px] px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <button
              onClick={() => openGarage('gt3')}
              data-cursor="CONFIGURE"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 chamfer bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-[11px] font-bold tracking-[0.22em] uppercase shadow-shark hover:brightness-110 transition-all"
            >
              <Box className="w-4 h-4" />
              <span>CONFIGURE 3D FLEET</span>
            </button>

            <button
              onClick={() => scrollTo('#archive-vault', -72)}
              data-cursor="VAULT"
              className="inline-flex items-center gap-2 px-5 py-3.5 chamfer border border-white/20 bg-[#05080f]/80 backdrop-blur-md text-white hover:border-cyanHud hover:text-cyanHud font-mono text-[11px] tracking-[0.22em] uppercase transition-colors"
            >
              <span>EXPLORE ARCHIVE</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-6 bg-[#05080f]/75 backdrop-blur-md border border-white/10 px-5 py-2.5 font-mono text-[10px] tracking-[0.22em]">
            <div>
              <span className="text-slate-500 block text-[9px]">CHASSIS</span>
              <span className="text-white font-bold">992 GT3 · SHARK BLUE</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div>
              <span className="text-slate-500 block text-[9px]">NÜRBURGRING</span>
              <span className="text-cyanHud font-bold">6:55.2 MIN</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div>
              <span className="text-slate-500 block text-[9px]">FLEET BAY</span>
              <span className="text-white font-bold">03 MODELS READY</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2: OPPOSING KINETIC TELEMETRY MARQUEE
         ================================================================ */}
      <div className="border-y border-shark/30 bg-[#050810] py-3.5 overflow-hidden select-none">
        <div className="animate-marquee-left gap-10 font-mono text-[11px] tracking-[0.34em] text-cyanHud/85 uppercase">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-10 whitespace-nowrap">
              <span>992 GT3 // 9,000 RPM</span>
              <span className="text-shark">✦</span>
              <span>911 S/T // 1,380 KG FEATHERWEIGHT</span>
              <span className="text-shark">✦</span>
              <span>918 SPYDER // 887 HP WEISSACH HYBRID</span>
              <span className="text-shark">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ================================================================
          SECTION 3: 3-CHASSIS FLEET BAY (UNLOCKS GT3 + 911 S/T + 918 SPYDER)
         ================================================================ */}
      <section className="relative mx-auto max-w-[1440px] px-4 sm:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] text-cyanHud uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MULTI-CHASSIS WEBGL GARAGE</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold italic tracking-[0.12em] text-white mt-2">
              STUTTGART 3D FLEET BAY
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            All three KTX2-compressed Porsche 3D chassis are live in the Garage Configurator with
            real-time studio PBR reflections, 4 camera presets, and CAD wireframe inspection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FLEET_ORDER.map((id, idx) => {
            const car = FLEET_SPECS[id];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => openGarage(id)}
                data-cursor="3D INSPECT"
                className="group relative border border-white/10 hover:border-cyanHud/60 bg-gradient-to-b from-[#080e1a] to-[#04060b] p-6 chamfer cursor-pointer transition-all hover:shadow-shark"
              >
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.24em] text-cyanHud">
                  <span>{car.code}</span>
                  <span className="text-slate-500">{car.year}</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold italic tracking-wider text-white mt-3 group-hover:text-cyanHud transition-colors">
                  PORSCHE {car.name}
                </h3>
                <p className="font-mono text-[10px] tracking-[0.22em] text-slate-400 mt-1">
                  {car.subtitle}
                </p>

                <div className="grid grid-cols-3 gap-2 my-6 border-y border-white/10 py-4">
                  <div>
                    <div className="font-mono text-[9px] text-slate-500">POWER</div>
                    <div className="font-display text-xs font-bold text-white mt-0.5">{car.power}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-slate-500">0–100</div>
                    <div className="font-display text-xs font-bold text-cyanHud mt-0.5">
                      {car.zeroToHundred}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-slate-500">V-MAX</div>
                    <div className="font-display text-xs font-bold text-white mt-0.5">
                      {car.topSpeed}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">{car.notes}</p>

                <div className="flex items-center justify-between font-mono text-[10px] font-bold tracking-[0.24em] text-cyanHud">
                  <span className="inline-flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>OPEN IN 3D GARAGE</span>
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          SECTION 4: DUAL-FILM CYBER TELEMETRY SHOWCASE (BOTH MP4 VIDEOS!)
         ================================================================ */}
      <section className="relative border-y border-white/[0.08] bg-[#04070e] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] text-cyanHud">
                <Gauge className="w-3.5 h-3.5" />
                <span>DUAL-CHANNEL CAPTURE REEL</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold italic tracking-[0.14em] text-white mt-2">
                MIDNIGHT TELEMETRY FEEDS
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.26em] text-slate-500">
              CLICK FEED TO PLAY/PAUSE · AUDIO TOGGLE ENABLED
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {FILM_FEEDS.map((feed) => (
              <FilmMonitor key={feed.id} feed={feed} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 5: VELOCITY-SKEWED ARCHIVE VAULT GRID
         ================================================================ */}
      <section id="archive-vault" className="relative mx-auto max-w-[1440px] px-4 sm:px-8 py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="font-mono text-[10px] tracking-[0.32em] text-cyanHud uppercase">
              TECHNICAL HARDWARE & APPAREL VAULT
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold italic tracking-[0.12em] text-white mt-2">
              ARCHIVE MANIFEST
            </h2>
          </div>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3.5 py-2 font-mono text-[10px] tracking-[0.22em] uppercase border transition-all chamfer-sm ${
                  activeCat === cat
                    ? 'border-cyanHud bg-shark/25 text-white shadow-[0_0_16px_rgba(0,112,255,0.28)]'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <VelocitySkew maxSkew={2.6}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        </VelocitySkew>

        <div className="mt-12 flex justify-center">
          <Link
            to="/collections"
            data-cursor="COLLECTIONS"
            className="inline-flex items-center gap-3 px-8 py-4 chamfer border border-cyanHud/50 bg-shark/15 hover:bg-shark text-white font-display text-xs font-bold tracking-[0.24em] uppercase transition-all shadow-shark"
          >
            <span>VIEW ALL {products.length} ARCHIVE UNITS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
