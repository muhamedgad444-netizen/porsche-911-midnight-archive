import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Database,
  DollarSign,
  Lock,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Shield,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { IMAGE_PRESETS, resolveAssetUrl } from '../data/catalog';

const ADMIN_SESSION_KEY = 'porsche_admin_cleared_v2';
const VALID_CODES = ['911GT3', 'STUTTGART', 'ADMIN'];

export const AdminPage: React.FC = () => {
  const {
    products,
    orders,
    apiMode,
    refreshProducts,
    refreshOrders,
    createProduct,
    deleteProduct,
  } = useArchive();

  const [authed, setAuthed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passcode, setPasscode] = useState('');
  const [authErr, setAuthErr] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Hardware');
  const [img, setImg] = useState(IMAGE_PRESETS[0].file);
  const [spec, setSpec] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);

  useEffect(() => {
    if (authed) {
      refreshProducts();
      refreshOrders();
    }
  }, [authed, refreshProducts, refreshOrders]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_CODES.includes(passcode.trim().toUpperCase())) {
      setAuthed(true);
      setAuthErr(false);
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {
        // ignore
      }
    } else {
      setAuthErr(true);
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    setPasscode('');
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setCreating(true);
    try {
      await createProduct({
        name: name.trim(),
        price: parseFloat(price),
        type,
        img,
        spec: spec.trim() || undefined,
      });
      setName('');
      setPrice('');
      setSpec('');
    } finally {
      setCreating(false);
    }
  };

  const grossRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0),
    [orders]
  );

  const avgTicket = orders.length > 0 ? Math.round(grossRevenue / orders.length) : 0;

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#030406] cyber-grid-bg flex items-center justify-center px-4 pt-16">
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md cyber-glass border border-shark/45 p-8 chamfer-lg shadow-shark space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-shark/20 border border-cyanHud/50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-cyanHud" />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.28em] text-cyanHud">
                SECURITY CLEARANCE REQUIRED
              </div>
              <h1 className="font-display text-base font-bold tracking-wider text-white">
                STUTTGART ADMIN TERMINAL
              </h1>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-[0.24em] text-slate-400 mb-2">
              ENTER OWNER PASSKEY
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setAuthErr(false);
              }}
              placeholder="••••••••"
              className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-4 py-3 font-mono text-sm tracking-[0.25em] text-white focus:outline-none"
            />
            {authErr && (
              <p className="font-mono text-[11px] text-red-400 mt-2">
                INVALID CLEARANCE KEY. ACCESS DENIED.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 chamfer-sm bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-xs font-bold tracking-[0.24em] uppercase shadow-shark hover:brightness-110"
          >
            AUTHENTICATE TERMINAL
          </button>

          <div className="border-t border-white/10 pt-4 font-mono text-[10px] tracking-[0.2em] text-slate-500 text-center">
            DEMO OWNER KEY: <span className="text-cyanHud">911GT3</span>
          </div>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030406] cyber-grid-bg pt-24 pb-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-cyanHud">
              <Shield className="w-3.5 h-3.5" />
              <span>OWNER COMMAND // LIVE OPERATIONS</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold italic tracking-[0.14em] text-white mt-1">
              ARCHIVE ADMIN TERMINAL
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[10px] tracking-[0.22em] ${
                apiMode === 'supabase'
                  ? 'border-emerald-400/40 bg-emerald-950/40 text-emerald-300'
                  : 'border-cyanHud/40 bg-shark/15 text-cyanHud'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{apiMode === 'supabase' ? 'SUPABASE CLOUD' : 'LOCAL VAULT FALLBACK'}</span>
            </span>

            <button
              onClick={() => {
                refreshProducts();
                refreshOrders();
              }}
              className="inline-flex items-center gap-1.5 border border-white/15 hover:border-cyanHud px-3.5 py-2 font-mono text-[10px] tracking-[0.2em] text-slate-300 hover:text-cyanHud"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>SYNC</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 border border-red-500/35 hover:border-red-400 px-3.5 py-2 font-mono text-[10px] tracking-[0.2em] text-red-300"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOCK</span>
            </button>
          </div>
        </div>

        {/* 4 Cyber KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'ACTIVE UNITS', value: String(products.length), icon: Package },
            { label: 'DISPATCH ORDERS', value: String(orders.length), icon: ShoppingBag },
            { label: 'GROSS VOLUME', value: `$${grossRevenue.toLocaleString()}`, icon: DollarSign },
            { label: 'AVG TICKET', value: `$${avgTicket.toLocaleString()}`, icon: Activity },
          ].map((kpi) => (
            <div key={kpi.label} className="cyber-glass border border-white/10 p-5 chamfer-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono text-[10px] tracking-[0.24em]">{kpi.label}</span>
                <kpi.icon className="w-4 h-4 text-cyanHud" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white mt-3">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Main Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inject New Hardware Form */}
          <form
            onSubmit={handleCreate}
            className="lg:col-span-4 cyber-glass border border-shark/35 p-6 chamfer space-y-4"
          >
            <div className="font-mono text-xs tracking-[0.26em] text-cyanHud">
              INJECT NEW HARDWARE
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-1.5">
                UNIT DESIGNATION
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 992 GT3 RS Aero Shell"
                className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-3.5 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-1.5">
                  PRICE (USD)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="240"
                  className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-1.5">
                  CLASS
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-3 py-2.5 text-sm text-white focus:outline-none"
                >
                  {['Hardware', 'Armor', 'Shell', 'Utility', 'Base'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-1.5">
                ASSET TEXTURE PRESET
              </label>
              <select
                value={img}
                onChange={(e) => setImg(e.target.value)}
                className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                {IMAGE_PRESETS.map((p) => (
                  <option key={p.file} value={p.file}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="mt-2.5 flex items-center gap-3 border border-white/10 bg-[#030406] p-2">
                <img
                  src={resolveAssetUrl(img)}
                  alt="Preview"
                  className="w-12 h-12 object-cover"
                />
                <span className="font-mono text-[10px] text-slate-400 truncate">{img}</span>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-1.5">
                TECHNICAL SPEC (OPTIONAL)
              </label>
              <input
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="3K Autoclave Carbon · Limited Run"
                className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-3.5 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 chamfer-sm bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-xs font-bold tracking-[0.22em] uppercase shadow-shark hover:brightness-110 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{creating ? 'DEPLOYING...' : 'DEPLOY TO ARCHIVE'}</span>
            </button>
          </form>

          {/* Right Column: Active Manifest + Orders Ledger */}
          <div className="lg:col-span-8 space-y-8">
            {/* Active Manifest Inventory Table */}
            <div className="cyber-glass border border-white/10 chamfer overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.26em] text-cyanHud">
                  ACTIVE MANIFEST ({products.length})
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  TWO-CLICK PURGE SAFETY ENABLED
                </span>
              </div>

              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#060a12] border-b border-white/10 font-mono text-[10px] tracking-[0.22em] text-slate-400">
                    <tr>
                      <th className="py-3 px-4">UNIT</th>
                      <th className="py-3 px-4">CLASS</th>
                      <th className="py-3 px-4">PRICE</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-xs">
                    {products.map((p) => {
                      const armed = confirmDeleteId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={resolveAssetUrl(p.img)}
                                alt={p.name}
                                className="w-10 h-10 object-cover bg-black border border-white/10"
                              />
                              <div>
                                <div className="font-semibold text-white">{p.name}</div>
                                <div className="font-mono text-[10px] text-slate-500">ID: {p.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] tracking-widest text-cyanHud uppercase">
                            {p.type}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            ${Number(p.price).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {armed ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    deleteProduct(p.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="bg-red-500 text-white px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider"
                                >
                                  CONFIRM
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="border border-white/15 px-2 py-1 font-mono text-[10px] text-slate-400"
                                >
                                  CANCEL
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(p.id)}
                                className="inline-flex items-center gap-1 border border-red-500/30 hover:border-red-400 px-2.5 py-1 font-mono text-[10px] tracking-wider text-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>PURGE</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dispatch Orders Ledger */}
            <div className="cyber-glass border border-white/10 chamfer overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.26em] text-cyanHud">
                  CHECKOUT DISPATCH LOGS ({orders.length})
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="p-10 text-center font-mono text-xs tracking-[0.22em] text-slate-500">
                  NO DISPATCH ORDERS LOGGED YET. COMPLETE A CHECKOUT TO TEST LIVE TELEMETRY.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.07]">
                  {orders.map((order) => (
                    <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-cyanHud">
                            #{order.id}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {order.first_name} {order.last_name}
                          </span>
                          <span className="font-mono text-[9px] border border-white/15 px-1.5 py-0.5 text-slate-400 uppercase">
                            {order.payment_method}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {order.address}, {order.city} ({order.postal_code}) · {order.shipping_method}
                        </div>
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="font-mono text-[10px] text-slate-500 pt-1">
                            {order.order_items
                              .map((it) => `${it.name} [${it.size}]${it.quantity && it.quantity > 1 ? ` ×${it.quantity}` : ''}`)
                              .join(' · ')}
                          </div>
                        )}
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <div className="font-display text-base font-bold text-white">
                          ${Number(order.total_price).toLocaleString()}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
