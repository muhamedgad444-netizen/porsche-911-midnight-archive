import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  Cpu,
  Gauge,
  Grid,
  RotateCw,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { useLenis } from '../context/LenisContext';
import { FLEET_ORDER, FLEET_SPECS } from '../data/fleet';
import { CameraPreset, LightingMood } from '../types';
import { PorscheStage } from './PorscheStage';

const CAMERA_PRESETS: { id: CameraPreset; label: string }[] = [
  { id: 'hero', label: '3/4 HERO' },
  { id: 'profile', label: 'SIDE PROFILE' },
  { id: 'rear', label: 'REAR AERO' },
  { id: 'top', label: 'OVERHEAD' },
];

const MOOD_OPTIONS: { id: LightingMood; label: string; dot: string }[] = [
  { id: 'cyber', label: 'CYBER NIGHT', dot: 'bg-cyanHud' },
  { id: 'stuttgart', label: 'STUTTGART LAB', dot: 'bg-white' },
  { id: 'acid', label: 'ACID TRACK', dot: 'bg-violet-400' },
];

export const GarageDrawer: React.FC = () => {
  const {
    garageOpen,
    closeGarage,
    garageChassis,
    setGarageChassis,
    lightingMood,
    setLightingMood,
  } = useArchive();
  const { stop, start } = useLenis();

  const [preset, setPreset] = useState<CameraPreset>('hero');
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  const spec = FLEET_SPECS[garageChassis];

  useEffect(() => {
    if (garageOpen) {
      stop();
    } else {
      start();
    }
  }, [garageOpen, stop, start]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && garageOpen) closeGarage();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [garageOpen, closeGarage]);

  return (
    <AnimatePresence>
      {garageOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGarage}
            className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-md"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[75] w-full max-w-[820px] bg-[#04070d] border-l border-shark/35 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-7 py-4 bg-[#070b14]">
              <div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-cyanHud uppercase">
                  STUTTGART_BAY // 3D CONFIGURATOR
                </div>
                <h2 className="font-display text-sm sm:text-base font-bold tracking-[0.2em] text-white mt-0.5">
                  MIDNIGHT GARAGE // {spec.name}
                </h2>
              </div>

              <button
                onClick={closeGarage}
                aria-label="Close 3D Garage"
                className="inline-flex items-center justify-center w-9 h-9 border border-white/15 hover:border-cyanHud text-slate-300 hover:text-cyanHud transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chassis Switcher Tabs (Unlocks ALL 3 Porsche GLBs!) */}
            <div className="grid grid-cols-3 border-b border-white/10 bg-[#050911]">
              {FLEET_ORDER.map((id) => {
                const item = FLEET_SPECS[id];
                const active = id === garageChassis;
                return (
                  <button
                    key={id}
                    onClick={() => setGarageChassis(id)}
                    data-cursor="SWITCH"
                    className={`px-3 sm:px-5 py-3 text-left transition-all border-b-2 ${
                      active
                        ? 'border-cyanHud bg-shark/15 text-white'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="font-mono text-[9px] tracking-[0.24em] text-cyanHud/80">
                      {item.code}
                    </div>
                    <div className="font-display text-xs sm:text-sm font-bold tracking-wider mt-0.5">
                      {item.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Interactive 3D Viewport */}
            <div className="relative flex-1 min-h-[290px] sm:min-h-[360px] cyber-grid-dense bg-gradient-to-b from-[#050a14] via-[#04070d] to-[#020408] overflow-hidden">
              <PorscheStage
                chassis={garageChassis}
                mood={lightingMood}
                preset={preset}
                autoRotate={autoRotate}
                wireframe={wireframe}
                interactive
                targetScale={3.65}
              />

              {/* Viewport HUD Overlay */}
              <div className="pointer-events-none absolute top-4 left-4 right-4 flex items-start justify-between">
                <div className="bg-[#030406]/75 backdrop-blur-md border border-white/10 px-3 py-2">
                  <div className="font-mono text-[9px] tracking-[0.26em] text-cyanHud">
                    SERIAL // {spec.serial}
                  </div>
                  <div className="font-mono text-[10px] text-slate-300 mt-0.5">
                    {spec.power} · {spec.redline} · {spec.zeroToHundred}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-[#030406]/75 backdrop-blur-md border border-white/10 px-3 py-1.5 font-mono text-[9px] tracking-[0.22em] text-slate-400">
                  <span>DRAG TO ORBIT 360°</span>
                </div>
              </div>

              {/* Expandable Telemetry Specs Overlay */}
              <AnimatePresence>
                {showSpecs && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute inset-x-4 bottom-4 z-20 cyber-glass border border-cyanHud/40 p-4 sm:p-5 chamfer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.26em] text-cyanHud">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>FULL TELEMETRY DOSSIER // {spec.name}</span>
                      </div>
                      <button
                        onClick={() => setShowSpecs(false)}
                        className="font-mono text-[10px] text-slate-400 hover:text-white"
                      >
                        CLOSE [X]
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div className="bg-white/[0.03] border border-white/10 p-2.5">
                        <div className="font-mono text-[9px] text-slate-400 tracking-widest">OUTPUT</div>
                        <div className="font-display text-xs font-bold text-white mt-0.5">{spec.power}</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/10 p-2.5">
                        <div className="font-mono text-[9px] text-slate-400 tracking-widest">0–100 KM/H</div>
                        <div className="font-display text-xs font-bold text-cyanHud mt-0.5">{spec.zeroToHundred}</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/10 p-2.5">
                        <div className="font-mono text-[9px] text-slate-400 tracking-widest">TOP SPEED</div>
                        <div className="font-display text-xs font-bold text-white mt-0.5">{spec.topSpeed}</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/10 p-2.5">
                        <div className="font-mono text-[9px] text-slate-400 tracking-widest">WEIGHT / LAP</div>
                        <div className="font-display text-xs font-bold text-white mt-0.5">{spec.weight}</div>
                      </div>
                    </div>

                    <p className="font-mono text-[11px] text-slate-300 leading-relaxed">
                      <span className="text-cyanHud">POWERTRAIN:</span> {spec.engine} ·{' '}
                      <span className="text-cyanHud">BENCHMARK:</span> {spec.nurburgring}. {spec.notes}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Control Deck */}
            <div className="border-t border-white/10 bg-[#060a12] p-4 sm:p-5 space-y-4">
              {/* Row 1: Camera Presets + Lighting Moods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.26em] text-slate-400 mb-2">
                    <Camera className="w-3 h-3 text-cyanHud" />
                    <span>CAMERA ANGLES</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {CAMERA_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPreset(p.id)}
                        className={`py-2 px-1 font-mono text-[9px] tracking-wider border transition-colors ${
                          preset === p.id
                            ? 'border-cyanHud bg-shark/25 text-white'
                            : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.26em] text-slate-400 mb-2">
                    <Sparkles className="w-3 h-3 text-cyanHud" />
                    <span>STUDIO LIGHTING RIG</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {MOOD_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setLightingMood(m.id)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 font-mono text-[9px] tracking-wider border transition-colors ${
                          lightingMood === m.id
                            ? 'border-cyanHud bg-shark/25 text-white'
                            : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Live Toggles + Working VIEW SPECS Action */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoRotate((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] tracking-[0.2em] border transition-colors ${
                      autoRotate
                        ? 'border-cyanHud/60 bg-cyanHud/10 text-cyanHud'
                        : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>ORBIT: {autoRotate ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => setWireframe((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] tracking-[0.2em] border transition-colors ${
                      wireframe
                        ? 'border-cyanHud/60 bg-cyanHud/10 text-cyanHud'
                        : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>CAD WIRE: {wireframe ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowSpecs((v) => !v)}
                  data-cursor="SPECS"
                  className="inline-flex items-center gap-2 px-5 py-2.5 chamfer-sm bg-gradient-to-r from-shark to-cyan-500 text-white font-mono text-[10px] font-bold tracking-[0.24em] uppercase hover:brightness-110 transition-all shadow-shark"
                >
                  {showSpecs ? <Sliders className="w-3.5 h-3.5" /> : <Gauge className="w-3.5 h-3.5" />}
                  <span>{showSpecs ? 'HIDE TELEMETRY SPECS' : 'VIEW TELEMETRY SPECS'}</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
