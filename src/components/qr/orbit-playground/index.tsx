"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QROptions } from '@/lib/types';
import { extractQRMatrix } from '@/lib/orbit-qr-matrix';
import { SPACE_THEMES } from './space-themes';
import { SpaceThemeId } from './types';
import { OrbitPlaygroundScene, OrbitPlaygroundSceneHandle } from './orbit-playground-scene';
import { 
  Camera, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Info,
  Maximize2
} from 'lucide-react';

interface OrbitPlaygroundProps {
  options: QROptions;
  themeMode: 'dark' | 'light';
}

// Detect WebGL support
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return Boolean(window.WebGLRenderingContext && document.createElement('canvas').getContext('webgl'));
  } catch {
    return false;
  }
}

export const OrbitPlayground: React.FC<OrbitPlaygroundProps> = ({ options, themeMode }) => {
  const [selectedThemeId, setSelectedThemeId] = useState<SpaceThemeId>('nebula');
  const [isFlatMode, setIsFlatMode] = useState(false);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  const sceneHandleRef = useRef<OrbitPlaygroundSceneHandle>(null);
  const isDark = themeMode === 'dark';

  // Check WebGL and Reduced Motion on mount
  useEffect(() => {
    setHasWebGL(checkWebGLSupport());
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Keyboard shortcut: Spacebar to toggle between 3D Diorama & Flat mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
          return;
        }
        e.preventDefault();
        setIsFlatMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute QR Matrix (enforces minimum Q level for logo scannability)
  const qrData = useMemo(() => {
    return extractQRMatrix(options, true);
  }, [options]);

  const activeTheme = SPACE_THEMES[selectedThemeId];

  const handleTakeSnapshot = () => {
    setIsTakingSnapshot(true);
    if (sceneHandleRef.current) {
      sceneHandleRef.current.takeSnapshot();
    }
    setTimeout(() => setIsTakingSnapshot(false), 1200);
  };

  const handleResetCamera = () => {
    if (sceneHandleRef.current) {
      sceneHandleRef.current.resetCamera();
    }
  };

  // WebGL or Reduced Motion Fallback UI
  if (!hasWebGL || prefersReducedMotion) {
    return (
      <div className={`p-6 rounded-2xl border text-center space-y-3 ${
        isDark ? 'bg-black/60 border-white/10 text-zinc-300' : 'bg-white/80 border-slate-200 text-slate-700'
      }`}>
        <Info className="h-8 w-8 mx-auto text-amber-500" />
        <h3 className="font-mono font-bold text-sm">Mode 3D Tidak Didukung / Gerakan Dikurangi</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          {prefersReducedMotion
            ? 'Preferensi gerak diminimalkan aktif pada sistem Anda. Menampilkan QR standar.'
            : 'Perangkat Anda tidak mendukung akselerasi WebGL.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* 1. Terminal CLI Toolbar Bar */}
      <div className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border backdrop-blur-md ${
        isDark ? 'bg-black/30 border-cyan-500/20' : 'bg-white/50 border-cyan-500/30'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className={`font-mono text-[11px] font-semibold truncate ${
            isDark ? 'text-cyan-400' : 'text-cyan-700'
          }`}>
            $ quarana --orbit-diorama
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
            isFlatMode
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
          }`}>
            {isFlatMode ? 'CAMERA READY (DATAR)' : '3D ORBIT DIORAMA'}
          </span>

          {!isFlatMode && (
            <button
              onClick={handleResetCamera}
              title="Reset Sudut Kamera (Kembali ke default 3D)"
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isDark ? 'border-white/10 hover:bg-white/10 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. 3D WebGL Canvas Viewport */}
      <div className={`relative w-full rounded-2xl border overflow-hidden shadow-2xl transition-all ${
        isDark ? 'border-cyan-500/20 bg-black/60 shadow-[0_0_30px_rgba(0,0,0,0.8)]' : 'border-cyan-500/20 bg-slate-100/90 shadow-sm'
      }`}>
        {/* Floating space backdrop glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 blur-3xl transition-all duration-700"
          style={{ background: activeTheme.accentColor }}
        />

        {/* Spacebar hotkey badge indicator */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <span className={`px-2 py-1 rounded-md border text-[10px] font-mono font-semibold backdrop-blur-md ${
            isDark ? 'bg-black/60 border-white/15 text-zinc-300' : 'bg-white/80 border-slate-300 text-slate-700'
          }`}>
            Tekan <kbd className="font-bold text-emerald-400 font-mono">[Spasi]</kbd> untuk Morph
          </span>
        </div>

        {/* Core Scene */}
        <OrbitPlaygroundScene
          ref={sceneHandleRef}
          options={options}
          qrData={qrData}
          theme={activeTheme}
          themeMode={themeMode}
          isFlatMode={isFlatMode}
          onToggleFlatMode={() => setIsFlatMode(!isFlatMode)}
        />
      </div>

      {/* 3. Space Theme Switcher (Nebula, Mars, Moon, Deep Space) */}
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}>
            Pilih Tema Kosmik
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {activeTheme.description}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {(Object.keys(SPACE_THEMES) as SpaceThemeId[]).map((themeId) => {
            const t = SPACE_THEMES[themeId];
            const isSelected = selectedThemeId === themeId;
            return (
              <button
                key={themeId}
                onClick={() => setSelectedThemeId(themeId)}
                className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-cyan-50 border-cyan-500 text-slate-900 shadow-sm font-semibold'
                    : isDark
                    ? 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: t.accentColor }}
                />
                <span className="text-xs font-mono font-bold truncate">
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Morph Toggle & 3D Snapshot Action Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
        {/* Toggle Flat Scannable <-> 3D Diorama */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFlatMode(!isFlatMode)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-xs sm:text-sm transition-all shadow-md ${
            isFlatMode
              ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 border-emerald-400 shadow-emerald-500/20'
              : isDark
              ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-600'
          }`}
        >
          {isFlatMode ? (
            <>
              <Maximize2 className="h-4 w-4 shrink-0" />
              <span>Kembali ke Diorama 3D</span>
            </>
          ) : (
            <>
              <Layers className="h-4 w-4 shrink-0" />
              <span>Morph ke QR Datar (Siap Scan)</span>
            </>
          )}
        </motion.button>

        {/* Snapshot 3D PNG */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTakeSnapshot}
          disabled={isTakingSnapshot}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-xs sm:text-sm transition-all backdrop-blur-md ${
            isDark
              ? 'bg-white/10 hover:bg-white/15 border-white/15 text-zinc-200'
              : 'bg-white/80 hover:bg-white border-slate-300 text-slate-800 shadow-sm'
          }`}
        >
          <Camera className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{isTakingSnapshot ? 'Mengambil Foto...' : 'Snapshot 3D (PNG)'}</span>
        </motion.button>
      </div>

      {/* 5. Scannability & Logo ECL Guarantee Banner */}
      <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-left text-xs ${
        isDark ? 'bg-black/30 border-emerald-500/20 text-zinc-300' : 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
      }`}>
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[11px] sm:text-xs">
            {isFlatMode
              ? 'Mode QR Datar Aktif: Orientasi top-down, alas quiet-zone putih 4-modul, dan pencahayaan netral memastikan 100% scannable oleh kamera HP.'
              : 'Mode Diorama 3D: Bebas diputar dengan mouse/sentuhan jempol. Voxel otomatis morph menjadi scannable saat diubah ke mode datar.'}
          </p>
          {options.logoUrl && (
            <p className="text-[10px] text-amber-500 font-mono">
              * Koreksi Error (ECL) dinaikkan otomatis ke Level Q/H untuk keandalan scan dengan logo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrbitPlayground;
