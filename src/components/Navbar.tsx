import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Menu, Shield, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bagCount, openGarage, setBagOpen, resetPortal } = useArchive();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'ARCHIVE' },
    { to: '/collections', label: 'COLLECTIONS' },
    { to: '/checkout', label: 'LOGISTICS' },
    { to: '/admin', label: 'TERMINAL' },
  ];

  const handleRebootPortal = () => {
    setMobileOpen(false);
    resetPortal();
    navigate('/welcome');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#030406]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 px-3 sm:px-8">
          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <Link
              to="/"
              data-cursor="HOME"
              className="group flex items-center gap-2 focus:outline-none whitespace-nowrap"
            >
              <span className="h-2 w-2 rounded-full bg-cyanHud shadow-[0_0_12px_#00E5FF] group-hover:scale-125 transition-transform shrink-0" />
              <span className="font-display text-[11px] sm:text-sm font-bold tracking-[0.16em] sm:tracking-[0.26em] text-white">
                PORSCHE
              </span>
              <span className="hidden md:inline font-mono text-[10px] tracking-[0.26em] text-cyanHud/80 border-l border-white/15 pl-2.5">
                911 ARCHIVE
              </span>
            </Link>
          </div>

          {/* Desktop Center Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-2 font-mono text-[11px] tracking-[0.22em] transition-colors ${
                    active ? 'text-cyanHud' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active-bar"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-shark to-cyanHud shadow-cyan"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Chrome */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={handleRebootPortal}
              title="Launch Zero-G Particle Portal"
              data-cursor="PORTAL"
              className="hidden md:inline-flex items-center gap-1.5 border border-white/10 hover:border-cyanHud/50 bg-white/[0.03] hover:bg-cyanHud/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-slate-300 hover:text-cyanHud transition-colors chamfer-sm whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ZERO-G</span>
            </button>

            <button
              onClick={() => openGarage()}
              data-cursor="GARAGE"
              className="inline-flex items-center gap-1.5 border border-shark/60 bg-shark/15 hover:bg-shark/30 px-2.5 sm:px-4 py-1.5 font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] sm:tracking-[0.2em] text-cyanHud transition-all chamfer-sm shadow-[0_0_20px_rgba(0,112,255,0.22)] whitespace-nowrap"
            >
              <Box className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">3D GARAGE</span>
              <span className="sm:hidden">3D</span>
            </button>

            <button
              onClick={() => setBagOpen(true)}
              data-cursor="MANIFEST"
              className="inline-flex items-center gap-1.5 bg-white text-obsidian hover:bg-cyanHud px-2.5 sm:px-4 py-1.5 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.12em] sm:tracking-[0.18em] transition-colors chamfer-sm whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>BAG ({bagCount})</span>
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="lg:hidden inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 border border-white/15 bg-white/5 text-white hover:border-cyanHud/60 shrink-0"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-shark/30 bg-[#05080f]/95 backdrop-blur-2xl p-5 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {links.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 font-mono text-xs tracking-[0.24em] border ${
                      active
                        ? 'border-cyanHud/50 bg-shark/15 text-cyanHud'
                        : 'border-white/10 bg-white/[0.02] text-slate-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.to === '/admin' && <Shield className="w-3.5 h-3.5 text-shark" />}
                  </Link>
                );
              })}
              <button
                onClick={handleRebootPortal}
                className="flex items-center justify-between px-4 py-3 font-mono text-xs tracking-[0.24em] border border-cyanHud/30 bg-cyanHud/5 text-cyanHud"
              >
                <span>LAUNCH ZERO-G PORTAL</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
