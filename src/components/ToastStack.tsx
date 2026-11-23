import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Cpu, X } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';

export const ToastStack: React.FC = () => {
  const { toasts, dismissToast } = useArchive();

  return (
    <div className="fixed bottom-5 right-5 z-[95] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const toneStyle =
            toast.tone === 'success'
              ? 'border-emerald-400/50 bg-[#05140e]/95 text-emerald-300'
              : toast.tone === 'danger'
                ? 'border-red-400/50 bg-[#18070a]/95 text-red-300'
                : 'border-cyanHud/50 bg-[#050b16]/95 text-cyanHud';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              className={`pointer-events-auto flex items-start gap-3 border px-4 py-3 backdrop-blur-xl chamfer-sm shadow-xl ${toneStyle}`}
            >
              {toast.tone === 'success' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : toast.tone === 'danger' ? (
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <Cpu className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] font-bold tracking-[0.24em] uppercase">
                  {toast.title}
                </div>
                {toast.detail && (
                  <div className="text-xs text-slate-300 mt-0.5 truncate">{toast.detail}</div>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
