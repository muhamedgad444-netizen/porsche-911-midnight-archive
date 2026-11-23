import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { useLenis } from '../context/LenisContext';
import { resolveAssetUrl } from '../data/catalog';

export const BagDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { bagOpen, setBagOpen, bag, bagSubtotal, updateBagQty, removeFromBag } = useArchive();
  const { stop, start } = useLenis();

  useEffect(() => {
    if (bagOpen) stop();
    else start();
  }, [bagOpen, stop, start]);

  const handleCheckout = () => {
    setBagOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {bagOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBagOpen(false)}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 z-[75] w-full max-w-md bg-[#05080f] border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-cyanHud">
                  CARGO MANIFEST
                </div>
                <h2 className="font-display text-sm font-bold tracking-[0.2em] text-white mt-0.5">
                  ALLOCATED UNITS
                </h2>
              </div>
              <button
                onClick={() => setBagOpen(false)}
                aria-label="Close bag"
                className="w-9 h-9 border border-white/15 flex items-center justify-center text-slate-300 hover:border-cyanHud hover:text-cyanHud"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {bag.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <ShoppingBag className="w-10 h-10 text-slate-600 mb-4" />
                  <p className="font-mono text-xs tracking-[0.24em] text-slate-400">
                    MANIFEST EMPTY
                  </p>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs">
                    Select hardware or apparel pieces from the archive vault to initialize dispatch.
                  </p>
                </div>
              ) : (
                bag.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-4 border border-white/10 bg-white/[0.02] p-3 chamfer-sm"
                  >
                    <img
                      src={resolveAssetUrl(item.img)}
                      alt={item.name}
                      className="w-20 h-24 object-cover bg-black/50 border border-white/10"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
                          <button
                            onClick={() => removeFromBag(item.key)}
                            aria-label="Remove item"
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="font-mono text-[10px] tracking-[0.2em] text-cyanHud mt-1">
                          {item.type} · SIZE {item.selectedSize}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-white/15">
                          <button
                            onClick={() => updateBagQty(item.key, -1)}
                            className="px-2 py-1 text-slate-300 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 font-mono text-xs text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateBagQty(item.key, 1)}
                            className="px-2 py-1 text-slate-300 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono text-sm font-bold text-white">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/10 p-6 bg-[#070b14] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.25em] text-slate-400">
                  MANIFEST SUBTOTAL
                </span>
                <span className="font-display text-lg font-bold text-white">
                  ${bagSubtotal.toLocaleString()}
                </span>
              </div>

              <button
                disabled={bag.length === 0}
                onClick={handleCheckout}
                data-cursor="DISPATCH"
                className="w-full inline-flex items-center justify-center gap-3 py-4 chamfer bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-xs font-bold tracking-[0.22em] uppercase disabled:opacity-40 hover:brightness-110 transition-all shadow-shark"
              >
                <span>PROCEED TO LOGISTICS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
