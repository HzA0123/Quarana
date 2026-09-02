import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QROptions } from '@/lib/types';
import { ControlPanel } from './control-panel';
import { LivePreview } from './live-preview';
import { Sliders, Eye, X, Download } from 'lucide-react';

interface MobileDrawerProps {
  options: QROptions;
  setOptions: React.Dispatch<React.SetStateAction<QROptions>>;
  themeMode: 'dark' | 'light';
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ options, setOptions, themeMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'controls' | 'preview'>('preview');
  const isDark = themeMode === 'dark';

  return (
    <div className="lg:hidden fixed bottom-5 right-5 z-50 flex items-center gap-2 font-sans">
      {/* Floating Action Buttons */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setViewMode('preview');
          setIsOpen(true);
        }}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold shadow-xl shadow-emerald-500/30 text-xs tracking-wide"
      >
        <Download className="h-4 w-4" />
        <span>Ekspor QR</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setViewMode('controls');
          setIsOpen(true);
        }}
        className={`p-3 rounded-full border shadow-xl backdrop-blur-xl ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-700 text-zinc-100'
            : 'bg-white/90 border-slate-300 text-slate-800'
        }`}
      >
        <Sliders className="h-4 w-4" />
      </motion.button>

      {/* Full-screen Mobile Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed inset-0 z-50 flex flex-col p-4 overflow-y-auto ${
              isDark ? 'bg-black/90 backdrop-blur-2xl text-zinc-100' : 'bg-slate-900/80 backdrop-blur-2xl text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-3 rounded-2xl border mb-4 ${
              isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white/95 border-slate-200 text-slate-900 shadow-md'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('controls')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                    viewMode === 'controls'
                      ? 'bg-emerald-500 text-emerald-950 shadow-sm'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Kustomisasi
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                    viewMode === 'preview'
                      ? 'bg-emerald-500 text-emerald-950 shadow-sm'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Pratinjau & Ekspor
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-full border ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 pb-8">
              {viewMode === 'controls' ? (
                <ControlPanel options={options} setOptions={setOptions} themeMode={themeMode} />
              ) : (
                <LivePreview options={options} themeMode={themeMode} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
