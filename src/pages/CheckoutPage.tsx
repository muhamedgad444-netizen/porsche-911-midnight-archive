import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { PorscheStage } from '../components/PorscheStage';
import { resolveAssetUrl } from '../data/catalog';
import { CameraPreset, OrderRecord } from '../types';

type PaymentId = 'VISA TITANIUM' | 'INSTAPAY DIRECT' | 'C.O.D. COURIER';

const WALLET_CARDS: {
  id: PaymentId;
  code: string;
  label: string;
  sub: string;
  gradient: string;
  accent: string;
}[] = [
  {
    id: 'VISA TITANIUM',
    code: 'CARD_01 // ENCRYPTED',
    label: 'PORSCHE PAY VISA',
    sub: '4532 •••• •••• 0911 · INSTANT AUTH',
    gradient: 'from-[#071633] via-[#0044b3] to-[#0070ff]',
    accent: 'border-cyanHud/60',
  },
  {
    id: 'INSTAPAY DIRECT',
    code: 'CARD_02 // ZERO-FEE',
    label: 'INSTAPAY STUTTGART',
    sub: 'ARCHIVE@INSTAPAY · REAL-TIME SETTLEMENT',
    gradient: 'from-[#062129] via-[#085f70] to-[#00b4d8]',
    accent: 'border-sky-300/60',
  },
  {
    id: 'C.O.D. COURIER',
    code: 'CARD_03 // HANDOVER',
    label: 'ARMORED C.O.D.',
    sub: 'PAY UPON VERIFIED PHYSICAL DELIVERY',
    gradient: 'from-[#161922] via-[#262b38] to-[#0f131b]',
    accent: 'border-slate-400/50',
  },
];

const STEP_PRESETS: Record<number, CameraPreset> = {
  1: 'hero',
  2: 'profile',
  3: 'rear',
};

export const CheckoutPage: React.FC = () => {
  const { bag, bagSubtotal, updateBagQty, removeFromBag, submitOrder, lightingMood } = useArchive();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [shipping, setShipping] = useState<'STANDARD AIR' | 'WEISSACH EXPRESS'>('STANDARD AIR');
  const [payment, setPayment] = useState<PaymentId>('VISA TITANIUM');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<OrderRecord | null>(null);

  const shippingCost = shipping === 'WEISSACH EXPRESS' ? 45 : 0;
  const total = useMemo(() => bagSubtotal + shippingCost, [bagSubtotal, shippingCost]);

  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      setFormError('Complete all destination telemetry fields before advancing.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handlePlaceOrder = async () => {
    if (bag.length === 0) {
      setFormError('Your manifest is empty. Allocate units from Collections first.');
      return;
    }
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const record = await submitOrder({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address: address.trim(),
        city: city.trim(),
        postal_code: postalCode.trim(),
        shipping_method: shipping,
        payment_method: payment,
        total_price: total,
        items: bag,
      });
      setConfirmed(record);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#030406] pt-28 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-2xl border border-emerald-400/40 bg-[#050c12] p-8 sm:p-10 chamfer-lg shadow-shark text-center"
        >
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/50 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="font-mono text-[10px] tracking-[0.34em] text-cyanHud">
            DISPATCH PROTOCOL AUTHORIZED // {confirmed.source?.toUpperCase()}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold italic tracking-wider text-white mt-2">
            ORDER #{confirmed.id} CONFIRMED
          </h1>
          <p className="text-sm text-slate-400 mt-3">
            Assigned to <span className="text-white">{confirmed.first_name} {confirmed.last_name}</span> ·{' '}
            {confirmed.address}, {confirmed.city} ({confirmed.postal_code})
          </p>

          <div className="my-7 border-y border-white/10 py-5 text-left space-y-2.5 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>LOGISTICS TIER</span>
              <span className="text-white">{confirmed.shipping_method}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SETTLEMENT CHANNEL</span>
              <span className="text-cyanHud">{confirmed.payment_method}</span>
            </div>
            <div className="flex justify-between text-slate-300 text-sm font-bold pt-2 border-t border-white/10">
              <span>TOTAL AUTHORIZED</span>
              <span className="text-white">${Number(confirmed.total_price).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="px-6 py-3 chamfer-sm bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-xs font-bold tracking-[0.2em] uppercase"
            >
              RETURN TO SHOWROOM
            </Link>
            <Link
              to="/admin"
              className="px-6 py-3 chamfer-sm border border-white/15 text-slate-300 hover:border-cyanHud hover:text-cyanHud font-mono text-xs tracking-[0.2em] uppercase"
            >
              VIEW IN ADMIN TERMINAL
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030406] cyber-grid-bg pt-24 pb-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Top Floating Cyber Step Dock */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="font-mono text-[10px] tracking-[0.32em] text-cyanHud">
              911 S/T LOGISTICS PROTOCOL
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold italic tracking-[0.14em] text-white mt-1">
              DISPATCH CHECKOUT
            </h1>
          </div>

          <div className="inline-flex items-center gap-1 cyber-glass p-1.5 chamfer-sm">
            {[
              { id: 1 as const, label: '01 DEST' },
              { id: 2 as const, label: '02 LOGISTICS' },
              { id: 3 as const, label: '03 PORSCHE PAY' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id > 1 && !validateStep1()) return;
                  setStep(s.id);
                }}
                className={`px-3.5 py-2 font-mono text-[10px] tracking-[0.2em] transition-all ${
                  step === s.id
                    ? 'bg-shark text-white font-bold shadow-shark'
                    : step > s.id
                      ? 'text-cyanHud'
                      : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 3-Step Cyber Protocol + 3D Porsche Pay Wallet */}
          <div className="lg:col-span-7 cyber-glass border border-white/10 p-6 sm:p-8 chamfer">
            {formError && (
              <div className="mb-6 border border-red-500/40 bg-red-950/40 px-4 py-3 font-mono text-xs text-red-300">
                {formError}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  className="space-y-5"
                >
                  <div className="font-mono text-xs tracking-[0.26em] text-cyanHud">
                    STEP 01 // RECIPIENT COORDINATES
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-2">
                        FIRST NAME
                      </label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ferdinand"
                        className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-4 py-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-2">
                        LAST NAME
                      </label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Weissach"
                        className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-4 py-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-2">
                      STREET ADDRESS
                    </label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Porscheplatz 1, Zuffenhausen"
                      className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-2">
                        CITY
                      </label>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Stuttgart"
                        className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-4 py-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] tracking-[0.22em] text-slate-400 mb-2">
                        POSTAL CODE
                      </label>
                      <input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="70435"
                        className="w-full bg-[#030406] border border-white/15 focus:border-cyanHud px-4 py-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep1()) setStep(2);
                      }}
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 chamfer-sm bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-xs font-bold tracking-[0.2em] uppercase shadow-shark"
                    >
                      <span>CONTINUE TO LOGISTICS</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  className="space-y-5"
                >
                  <div className="font-mono text-xs tracking-[0.26em] text-cyanHud">
                    STEP 02 // SELECT AIR FREIGHT PROTOCOL
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        id: 'STANDARD AIR' as const,
                        title: 'STANDARD AIR FREIGHT',
                        eta: '3–5 BUSINESS DAYS · INSURED',
                        fee: 'COMPLIMENTARY',
                      },
                      {
                        id: 'WEISSACH EXPRESS' as const,
                        title: 'WEISSACH PRIORITY',
                        eta: '24–48H TRACK COURIER · GPS LOCK',
                        fee: '+$45',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setShipping(opt.id)}
                        className={`text-left p-5 border chamfer-sm transition-all ${
                          shipping === opt.id
                            ? 'border-cyanHud bg-shark/20 shadow-shark'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Truck className="w-5 h-5 text-cyanHud" />
                          <span className="font-mono text-xs font-bold text-white">{opt.fee}</span>
                        </div>
                        <div className="font-display text-sm font-bold text-white mt-4">
                          {opt.title}
                        </div>
                        <div className="font-mono text-[10px] tracking-[0.18em] text-slate-400 mt-1">
                          {opt.eta}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 font-mono text-xs text-slate-400 hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>BACK</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 chamfer-sm bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-xs font-bold tracking-[0.2em] uppercase shadow-shark"
                    >
                      <span>CONTINUE TO PORSCHE PAY</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs tracking-[0.26em] text-cyanHud">
                      STEP 03 // PORSCHE PAY 3D WALLET
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      SELECT ACTIVE CARD
                    </span>
                  </div>

                  {/* Interactive 3D Card Fan Wallet */}
                  <div className="wallet-perspective grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                    {WALLET_CARDS.map((card, i) => {
                      const active = payment === card.id;
                      return (
                        <motion.button
                          key={card.id}
                          type="button"
                          onClick={() => setPayment(card.id)}
                          whileHover={{ y: -8, rotateX: 6, rotateY: i === 0 ? -5 : i === 2 ? 5 : 0 }}
                          animate={{
                            y: active ? -6 : 0,
                            scale: active ? 1.03 : 0.98,
                          }}
                          data-cursor="SELECT"
                          className={`relative text-left p-5 min-h-[168px] rounded-xl bg-gradient-to-br ${card.gradient} border ${
                            active
                              ? `${card.accent} ring-2 ring-cyanHud/70 shadow-shark`
                              : 'border-white/15 opacity-75 hover:opacity-100'
                          } flex flex-col justify-between transition-opacity`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] tracking-[0.22em] text-white/75">
                              {card.code}
                            </span>
                            <CreditCard className="w-4 h-4 text-white/80" />
                          </div>

                          <div>
                            <div className="font-display text-xs font-bold tracking-wider text-white">
                              {card.label}
                            </div>
                            <div className="font-mono text-[9px] tracking-wider text-white/75 mt-1.5">
                              {card.sub}
                            </div>
                          </div>

                          {active && (
                            <span className="absolute -top-2.5 right-3 bg-cyanHud text-obsidian font-mono text-[9px] font-bold tracking-[0.2em] px-2 py-0.5">
                              ACTIVE
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2.5 border border-white/10 bg-white/[0.02] px-4 py-3 font-mono text-[11px] text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      ACTIVE CHANNEL: <strong className="text-cyanHud">{payment}</strong> · TLS 1.3
                      STUTTGART ARCHIVE ESCROW
                    </span>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 font-mono text-xs text-slate-400 hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>BACK</span>
                    </button>
                    <button
                      type="button"
                      disabled={submitting || bag.length === 0}
                      onClick={handlePlaceOrder}
                      data-cursor="AUTHORIZE"
                      className="inline-flex items-center gap-3 px-8 py-4 chamfer bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-xs font-bold tracking-[0.22em] uppercase disabled:opacity-40 shadow-shark hover:brightness-110"
                    >
                      <span>{submitting ? 'TRANSMITTING...' : `AUTHORIZE $${total.toLocaleString()}`}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Live 3D Porsche 911 S/T Viewer + Editable Manifest Bag */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live 3D Porsche 911 S/T Logistics Showcase (Angle changes per checkout step!) */}
            <div className="border border-shark/35 bg-[#050912] chamfer overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 font-mono text-[10px] tracking-[0.24em]">
                <span className="text-cyanHud">ESCORT CHASSIS // 911 S/T</span>
                <span className="text-slate-500">CAM: {STEP_PRESETS[step].toUpperCase()}</span>
              </div>
              <div className="h-[240px] sm:h-[265px] w-full cyber-grid-dense">
                <PorscheStage
                  chassis="st"
                  mood={lightingMood}
                  preset={STEP_PRESETS[step]}
                  autoRotate
                  interactive
                  targetScale={3.55}
                />
              </div>
            </div>

            {/* Manifest Summary */}
            <div className="cyber-glass border border-white/10 p-6 chamfer space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs tracking-[0.24em] text-cyanHud">
                  MANIFEST SUMMARY
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {bag.reduce((s, i) => s + i.quantity, 0)} UNITS
                </span>
              </div>

              {bag.length === 0 ? (
                <div className="py-6 text-center space-y-3">
                  <p className="font-mono text-xs text-slate-500">NO UNITS IN MANIFEST</p>
                  <Link
                    to="/collections"
                    className="inline-block border border-cyanHud/50 px-4 py-2 font-mono text-[10px] tracking-[0.22em] text-cyanHud hover:bg-shark/20"
                  >
                    BROWSE COLLECTIONS →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {bag.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-3 border border-white/[0.07] bg-white/[0.02] p-2.5"
                    >
                      <img
                        src={resolveAssetUrl(item.img)}
                        alt={item.name}
                        className="w-12 h-14 object-cover bg-black"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          SIZE {item.selectedSize} · ${item.price}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 border border-white/10">
                        <button
                          onClick={() => updateBagQty(item.key, -1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 font-mono text-[11px]">{item.quantity}</span>
                        <button
                          onClick={() => updateBagQty(item.key, 1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromBag(item.key)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-white/10 pt-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>SUBTOTAL</span>
                  <span>${bagSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>LOGISTICS ({shipping})</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-white text-base font-display font-bold pt-2 border-t border-white/10">
                  <span>TOTAL</span>
                  <span className="text-cyanHud">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
