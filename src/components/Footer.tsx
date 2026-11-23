import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Shield, Sparkles } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { FLEET_ORDER, FLEET_SPECS } from '../data/fleet';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { openGarage, resetPortal } = useArchive();

  return (
    <footer className="relative border-t border-white/10 bg-[#03050a] pt-16 pb-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-cyanHud shadow-[0_0_12px_#00E5FF]" />
              <span className="font-display text-sm font-bold tracking-[0.28em] text-white">
                PORSCHE // 911 MIDNIGHT ARCHIVE
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Interactive WebGL motorsport showroom and technical apparel vault engineered around
              Zuffenhausen aerodynamics, real-time KTX2 3D geometry, and Midnight Cyber-Kinetic
              telemetry.
            </p>
            <div className="font-mono text-[10px] tracking-[0.24em] text-slate-500">
              STUTTGART-ZUFFENHAUSEN · 48.8342° N, 9.1520° E
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="font-mono text-[10px] tracking-[0.28em] text-cyanHud">
              3D FLEET BAY
            </div>
            <ul className="space-y-2">
              {FLEET_ORDER.map((id) => (
                <li key={id}>
                  <button
                    onClick={() => openGarage(id)}
                    className="group inline-flex items-center gap-2 font-mono text-xs text-slate-300 hover:text-cyanHud transition-colors"
                  >
                    <span>{FLEET_SPECS[id].name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <div className="font-mono text-[10px] tracking-[0.28em] text-cyanHud">
              SYSTEM TERMINALS
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/collections"
                className="border border-white/10 hover:border-cyanHud/50 px-3.5 py-2 font-mono text-[10px] tracking-[0.22em] text-slate-300 hover:text-white transition-colors"
              >
                FULL COLLECTIONS
              </Link>
              <Link
                to="/checkout"
                className="border border-white/10 hover:border-cyanHud/50 px-3.5 py-2 font-mono text-[10px] tracking-[0.22em] text-slate-300 hover:text-white transition-colors"
              >
                LOGISTICS CHECKOUT
              </Link>
              <button
                onClick={() => {
                  resetPortal();
                  navigate('/welcome');
                }}
                className="inline-flex items-center gap-1.5 border border-shark/40 hover:border-cyanHud px-3.5 py-2 font-mono text-[10px] tracking-[0.22em] text-cyanHud transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>ZERO-G PORTAL</span>
              </button>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 border border-white/10 hover:border-shark px-3.5 py-2 font-mono text-[10px] tracking-[0.22em] text-slate-300 hover:text-cyanHud transition-colors"
              >
                <Shield className="w-3 h-3" />
                <span>ADMIN TERMINAL</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] tracking-[0.22em] text-slate-500">
          <span>© {new Date().getFullYear()} PORSCHE 911 MIDNIGHT ARCHIVE · INDEPENDENT CONCEPT VAULT</span>
          <span className="text-cyanHud/70">WEBGL_2.0 · REACT · THREE.JS · LENIS</span>
        </div>
      </div>
    </footer>
  );
};
