import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Plus } from 'lucide-react';
import { Product, ProductSize } from '../types';
import { resolveAssetUrl } from '../data/catalog';
import { useArchive } from '../context/ArchiveContext';

const SIZES: ProductSize[] = ['S', 'M', 'L', 'XL'];

interface ProductCardProps {
  product: Product;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToBag, setInspectProduct } = useArchive();
  const [size, setSize] = useState<ProductSize>('L');
  const [addedFlash, setAddedFlash] = useState(false);

  const handleAdd = () => {
    addToBag(product, size);
    setAddedFlash(true);
    window.setTimeout(() => setAddedFlash(false), 950);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min((index % 4) * 0.06, 0.24) }}
      className="group relative flex flex-col border border-white/[0.09] hover:border-cyanHud/55 bg-[#070b12]/90 transition-all duration-300 chamfer overflow-hidden"
    >
      {/* Top Cyber Accent Bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-shark/60 to-transparent opacity-40 group-hover:opacity-100 group-hover:via-cyanHud transition-all" />

      {/* Header Telemetry */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 font-mono text-[10px] tracking-[0.22em]">
        <span className="text-slate-500 group-hover:text-cyanHud transition-colors">
          {product.code || `LOG_${String(index + 1).padStart(2, '0')}`}
        </span>
        <span className="border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] text-slate-300 uppercase">
          {product.type}
        </span>
      </div>

      {/* Image Viewport (Monochrome-to-Full-Color Focal Hover) */}
      <div
        onClick={() => setInspectProduct(product)}
        data-cursor="INSPECT"
        className="relative mx-4 aspect-[4/4.3] overflow-hidden bg-[#04060a] border border-white/[0.06] cursor-pointer"
      >
        <img
          src={resolveAssetUrl(product.img)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover grayscale contrast-110 brightness-90 group-hover:grayscale-0 group-hover:brightness-105 group-hover:scale-105 transition-all duration-500"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030406]/85 via-transparent to-transparent" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setInspectProduct(product);
          }}
          aria-label={`Inspect ${product.name}`}
          className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 bg-[#030406]/80 backdrop-blur-md border border-white/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-slate-200 opacity-0 group-hover:opacity-100 hover:border-cyanHud hover:text-cyanHud transition-all"
        >
          <Eye className="w-3 h-3" />
          <span>SPEC</span>
        </button>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400">
            STUTTGART // VAULT
          </span>
          <span className="font-display text-sm font-bold text-white bg-[#030406]/80 border border-shark/40 px-2.5 py-1">
            ${Number(product.price).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Product Info + Controls */}
      <div className="flex flex-1 flex-col justify-between p-4 gap-3.5">
        <div>
          <h3 className="font-sans text-sm sm:text-base font-semibold tracking-wide text-white group-hover:text-cyanHud transition-colors">
            {product.name}
          </h3>
          {product.spec && (
            <p className="font-mono text-[10px] text-slate-500 mt-1 line-clamp-1">{product.spec}</p>
          )}
        </div>

        {/* Size Matrix */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-4 gap-1.5">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`py-1.5 font-mono text-[10px] tracking-widest border transition-all ${
                  size === s
                    ? 'border-cyanHud bg-shark/25 text-white font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            data-cursor="ADD"
            className={`w-full inline-flex items-center justify-center gap-2 py-2.5 chamfer-sm font-mono text-[10px] font-bold tracking-[0.24em] uppercase transition-all ${
              addedFlash
                ? 'bg-emerald-500 text-obsidian'
                : 'bg-white/[0.07] hover:bg-gradient-to-r hover:from-shark hover:to-cyan-500 text-white border border-white/15 hover:border-transparent'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{addedFlash ? 'ALLOCATED ✓' : 'ADD TO ARCHIVE'}</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
};
