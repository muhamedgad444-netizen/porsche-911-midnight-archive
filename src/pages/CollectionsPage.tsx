import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { VelocitySkew } from '../components/VelocitySkew';
import { ProductCard } from '../components/ProductCard';
import { FILM_FEEDS } from '../data/fleet';

const CATEGORIES = ['ALL', 'Hardware', 'Armor', 'Shell', 'Utility', 'Base'];

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

export const CollectionsPage: React.FC = () => {
  const { products } = useArchive();
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('featured');

  const visible = useMemo(() => {
    let list = [...products];
    if (category !== 'ALL') {
      list = list.filter((p) => p.type.toLowerCase() === category.toLowerCase());
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          (p.spec && p.spec.toLowerCase().includes(q))
      );
    }
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, query, sort]);

  return (
    <div className="min-h-screen bg-[#030406] pt-24 pb-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Chamfered Video Cinema Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[280px] sm:h-[360px] w-full overflow-hidden border border-shark/40 chamfer-lg mb-12"
        >
          <video
            src={FILM_FEEDS[0].src}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030406] via-[#030406]/70 to-transparent" />
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.28em]">
              <span className="inline-flex items-center gap-2 text-cyanHud">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span>REC_ACTIVE // STUTTGART VAULT</span>
              </span>
              <span className="hidden sm:inline text-slate-400">
                TOTAL_INVENTORY: {String(products.length).padStart(2, '0')} UNITS
              </span>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.34em] text-shark uppercase">
                SEASON 2026 // TECHNICAL ASSORTMENT
              </div>
              <h1 className="font-display text-2xl sm:text-5xl font-bold italic tracking-[0.12em] text-white mt-2">
                ARCHIVE COLLECTIONS
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-xl">
                Filter across ballistic track armor, carbon hardware, paddock shells, and
                Zuffenhausen base layers. Click any unit for its full technical dossier.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Sticky Cyber Filter & Search Bar */}
        <div className="cyber-glass border border-white/10 p-4 mb-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 chamfer-sm">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.22em] text-slate-500 mr-2">
              <Filter className="w-3.5 h-3.5 text-cyanHud" />
              <span>CLASS:</span>
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                  category === cat
                    ? 'border-cyanHud bg-shark/25 text-white font-bold'
                    : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH UNIT OR SPEC..."
                className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud pl-9 pr-3 py-2 font-mono text-[11px] tracking-wider text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            <div className="inline-flex items-center gap-2 bg-[#030406] border border-white/15 px-3 py-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyanHud shrink-0" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort products"
                className="bg-transparent font-mono text-[10px] tracking-[0.18em] text-slate-200 focus:outline-none"
              >
                <option value="featured" className="bg-[#05080f]">SORT: FEATURED</option>
                <option value="price-asc" className="bg-[#05080f]">PRICE: LOW → HIGH</option>
                <option value="price-desc" className="bg-[#05080f]">PRICE: HIGH → LOW</option>
                <option value="name" className="bg-[#05080f]">ALPHA: A → Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Result Count Telemetry */}
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.26em] text-slate-400 mb-6">
          <span>DISPLAYING {visible.length} OF {products.length} UNITS</span>
          {(category !== 'ALL' || query) && (
            <button
              onClick={() => {
                setCategory('ALL');
                setQuery('');
              }}
              className="text-cyanHud hover:underline"
            >
              RESET FILTERS
            </button>
          )}
        </div>

        {/* Velocity-Skewed Product Grid */}
        {visible.length === 0 ? (
          <div className="border border-white/10 bg-white/[0.02] py-20 text-center chamfer">
            <p className="font-mono text-xs tracking-[0.28em] text-slate-400">
              NO ARCHIVE UNITS MATCHED YOUR TELEMETRY QUERY
            </p>
          </div>
        ) : (
          <VelocitySkew maxSkew={2.6}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {visible.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </VelocitySkew>
        )}
      </div>
    </div>
  );
};
