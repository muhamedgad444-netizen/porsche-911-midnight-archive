import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { useLenis } from '../context/LenisContext';
import { resolveAssetUrl } from '../data/catalog';
import { ProductSize } from '../types';

const SIZES: ProductSize[] = ['S', 'M', 'L', 'XL'];

export const ProductModal: React.FC = () => {
  const { inspectProduct, setInspectProduct, addToBag, setBagOpen } = useArchive();
  const { stop, start } = useLenis();
  const [size, setSize] = useState<ProductSize>('L');

  useEffect(() => {
    if (inspectProduct) {
      stop();
      setSize('L');
    } else {
      start();
    }
  }, [inspectProduct, stop, start]);

  return (
    <AnimatePresence>
      {inspectProduct && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectProduct(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-3xl border border-shark/45 bg-[#060a12] chamfer-lg overflow-hidden shadow-shark grid grid-cols-1 md:grid-cols-2"
          >
            <button
              onClick={() => setInspectProduct(null)}
              aria-label="Close inspection modal"
              className="absolute top-4 right-4 z-20 w-9 h-9 bg-[#030406]/85 border border-white/15 flex items-center justify-center text-slate-300 hover:border-cyanHud hover:text-cyanHud"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative bg-[#030406] min-h-[280px]">
              <img
                src={resolveAssetUrl(inspectProduct.img)}
                alt={inspectProduct.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-[#030406]/85 border border-cyanHud/40 px-3 py-1 font-mono text-[10px] tracking-[0.24em] text-cyanHud">
                {inspectProduct.code || 'ARCHIVE_UNIT'} // {inspectProduct.type}
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-shark uppercase">
                  TECHNICAL DOSSIER
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider text-white mt-1">
                  {inspectProduct.name}
                </h2>
                <div className="font-display text-2xl font-bold text-cyanHud mt-3">
                  ${Number(inspectProduct.price).toLocaleString()}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mt-4">
                  {inspectProduct.description ||
                    'Precision-engineered motorsport archive hardware calibrated for Stuttgart track environments and midnight transit.'}
                </p>

                <div className="mt-4 border-t border-white/10 pt-4 space-y-2 font-mono text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyanHud shrink-0" />
                    <span>{inspectProduct.spec || 'Stuttgart Archive Specification'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>IN STOCK · DISPATCH READY FROM ZUFFENHAUSEN VAULT</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-mono text-[10px] tracking-[0.25em] text-slate-400">
                  SELECT CALIBRATION SIZE
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`py-2 font-mono text-xs border transition-colors ${
                        size === s
                          ? 'border-cyanHud bg-shark/30 text-white font-bold'
                          : 'border-white/15 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    addToBag(inspectProduct, size);
                    setInspectProduct(null);
                    setBagOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 chamfer-sm bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-xs font-bold tracking-[0.22em] uppercase hover:brightness-110 shadow-shark"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ALLOCATE TO MANIFEST</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
