import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { QROptions } from '@/lib/types';
import { createQREngine } from '@/lib/qr-engine';
import { validateScannability } from '@/lib/scannability-validator';
import { 
  Download, Copy, Share2, ShieldCheck, AlertTriangle, FileCode, Check, RefreshCw, Eye, QrCode, Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';

// Native download helper (zero external dependencies)
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Lazy load Orbit Playground so Three.js orbit module is only loaded on demand
const OrbitPlayground = lazy(() => import('./orbit-playground'));

interface LivePreviewProps {
  options: QROptions;
  themeMode: 'dark' | 'light';
}

export const LivePreview: React.FC<LivePreviewProps> = ({ options, themeMode }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'2d' | 'orbit'>('2d');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportRes, setExportRes] = useState<number>(1024);

  const isDark = themeMode === 'dark';
  const scannability = validateScannability(options);

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = '';
    const qrEngine = createQREngine(options, 240, 240);
    qrEngine.append(qrRef.current);
  }, [options]);

  // Export as PNG at target resolution
  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const exportEngine = createQREngine(options, exportRes, exportRes);
      const blob = await exportEngine.getRawData('png');
      if (blob) {
        downloadBlob(blob as Blob, `quarana-qr-${Date.now()}-${exportRes}px.png`);
      }
    } catch (err) {
      console.error('PNG export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export as SVG Vector
  const handleExportSVG = async () => {
    setIsExporting(true);
    try {
      const exportEngine = createQREngine(options, 1024, 1024);
      const blob = await exportEngine.getRawData('svg');
      if (blob) {
        downloadBlob(blob as Blob, `quarana-qr-${Date.now()}.svg`);
      }
    } catch (err) {
      console.error('SVG export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export as PDF Printable Flyer
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const exportEngine = createQREngine(options, 1024, 1024);
      const blob = await exportEngine.getRawData('png');
      if (blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgData = e.target?.result as string;
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(22);
          pdf.text('QUARANA Liquid QR Code', 105, 30, { align: 'center' });
          pdf.addImage(imgData, 'PNG', 45, 50, 120, 120);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Scan this QR code with any smartphone camera.', 105, 185, { align: 'center' });
          pdf.save(`quarana-qr-print-${Date.now()}.pdf`);
        };
        reader.readAsDataURL(blob as Blob);
      }
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyClipboard = async () => {
    try {
      const exportEngine = createQREngine(options, 1024, 1024);
      const blob = await exportEngine.getRawData('png');
      if (blob && navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': blob as Blob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy to clipboard failed', err);
    }
  };

  // Native Web Share API for Mobile devices
  const handleNativeShare = async () => {
    try {
      const exportEngine = createQREngine(options, 1024, 1024);
      const blob = await exportEngine.getRawData('png');
      if (blob && navigator.share) {
        const file = new File([blob as Blob], 'quarana-qr.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Custom Liquid QR Code',
          text: 'Generated with QUARANA Liquid QR Customizer',
          files: [file],
        });
      }
    } catch (err) {
      console.error('Web share failed', err);
    }
  };

  // Construct dynamic background aura glow matching current preset colors
  const auraBgStyle = options.gradientType !== 'single'
    ? `linear-gradient(${options.gradientRotation || 45}deg, ${options.color1}, ${options.color2})`
    : options.color1;

  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-300 shadow-2xl flex flex-col items-center justify-center text-center font-sans backdrop-blur-xl ${
        isDark
          ? 'bg-black/40 border-cyan-500/25 text-zinc-100 shadow-[0_0_30px_rgba(6,182,212,0.1),0_20px_50px_rgba(0,0,0,0.8)]'
          : 'bg-white/60 border-cyan-500/30 text-slate-900 shadow-[0_0_30px_rgba(6,182,212,0.08),0_20px_50px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* 1. Terminal Window Titlebar */}
      <div className={`w-full flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b select-none backdrop-blur-md ${
        isDark ? 'border-cyan-500/20 bg-black/20' : 'border-slate-200/80 bg-white/40'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 mr-1 sm:mr-2 shrink-0">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 border border-rose-600/50 block shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 border border-amber-600/50 block shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50 block shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>

          <Eye className={`h-4 w-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span className={`font-mono text-[11px] sm:text-xs font-semibold tracking-wide truncate ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
            Live Studio Preview & Export
          </span>
        </div>

        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono shrink-0 ${
          isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-300 text-cyan-700 font-bold'
        }`}>
          <span>READY</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 w-full flex flex-col items-center justify-center">
        {/* Segmented Mode Selector: 2D Live Preview vs 3D Orbit Playground */}
        <div className={`w-full grid grid-cols-2 p-1 rounded-xl border mb-5 font-mono text-xs font-bold backdrop-blur-md ${
          isDark ? 'bg-black/40 border-cyan-500/20' : 'bg-white/60 border-cyan-500/30'
        }`}>
          <button
            onClick={() => setViewMode('2d')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              viewMode === '2d'
                ? 'bg-emerald-500 text-emerald-950 shadow-md font-extrabold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>2D Live Preview</span>
          </button>
          <button
            onClick={() => setViewMode('orbit')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'orbit'
                ? 'bg-cyan-500 text-cyan-950 shadow-md font-extrabold'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>🪐 Orbit Playground</span>
          </button>
        </div>

        {viewMode === 'orbit' ? (
          <Suspense
            fallback={
              <div className={`w-full h-80 rounded-2xl border flex flex-col items-center justify-center space-y-3 font-mono text-xs ${
                isDark ? 'text-cyan-400 bg-black/40 border-cyan-500/20' : 'text-cyan-700 bg-white/60 border-slate-200'
              }`}>
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Memuat 3D Orbit Playground...</span>
              </div>
            }
          >
            <OrbitPlayground options={options} themeMode={themeMode} />
          </Suspense>
        ) : (
          <>
            {/* Item #4: Dynamic Preset Radial Aura Glow behind Live QR Box */}
            <div className="relative group w-full flex justify-center">
              {/* Dynamic Aura Glow Layer */}
              <div
                className="absolute -inset-3 sm:-inset-4 rounded-3xl opacity-75 blur-2xl transition-all duration-700 pointer-events-none group-hover:opacity-100"
                style={{
                  background: auraBgStyle,
                  filter: 'blur(32px)',
                }}
              />

              {/* Live QR Canvas Box */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                className={`relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl border mb-4 sm:mb-5 shadow-2xl backdrop-blur-md transition-all duration-500 ${
                  isDark ? 'bg-black/60 border-white/15' : 'bg-white/80 border-white/90 shadow-sm'
                }`}
              >
                <div ref={qrRef} className="flex items-center justify-center rounded-2xl overflow-hidden shadow-lg bg-white p-2" />
                
                {options.frame.enabled && (
                  <div
                    className="mt-2.5 sm:mt-3 px-3 sm:px-4 py-1.5 rounded-full font-mono font-bold text-[11px] sm:text-xs shadow-md tracking-wider uppercase text-center"
                    style={{
                      backgroundColor: options.frame.backgroundColor || '#10b981',
                      color: options.frame.textColor || '#ffffff',
                    }}
                  >
                    {options.frame.text || 'SCAN ME'}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Scannability Safety Shield */}
            <div
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border text-[11px] sm:text-xs font-mono font-semibold mb-4 sm:mb-6 transition-all max-w-full text-center ${
                scannability.status === 'safe'
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                  : scannability.status === 'caution'
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-500 border-rose-500/40'
              }`}
            >
              {scannability.status === 'safe' ? (
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span className="truncate">{scannability.message}</span>
            </div>

            {/* Integrated Export Console Card */}
            <div className={`w-full p-3.5 sm:p-4 rounded-2xl border space-y-3.5 sm:space-y-4 text-left backdrop-blur-md ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-white/70 border-white/80 shadow-sm'
            }`}>
              {/* Resolution Selector Segmented Pills */}
              <div className="space-y-1.5">
                <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider block ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}>
                  Resolusi Ekspor PNG
                </span>
                <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl border backdrop-blur-md ${
                  isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-slate-300'
                }`}>
                  {[
                    { res: 512, label: '512px' },
                    { res: 1024, label: '1024px' },
                    { res: 2048, label: '2K' },
                    { res: 4096, label: '4K' },
                  ].map((r) => (
                    <button
                      key={r.res}
                      onClick={() => setExportRes(r.res)}
                      className={`py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all text-center ${
                        exportRes === r.res
                          ? 'bg-emerald-500 text-emerald-950 shadow-sm'
                          : isDark
                          ? 'text-zinc-400 hover:text-zinc-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Download Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportPNG}
                disabled={isExporting}
                className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  {isExporting ? <RefreshCw className="h-4.5 w-4.5 animate-spin text-emerald-950" /> : <Download className="h-4.5 w-4.5 text-emerald-950" />}
                  <span className="text-xs sm:text-sm">Unduh PNG</span>
                </div>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-emerald-950/20 text-emerald-950 text-[10px] sm:text-xs font-mono font-extrabold">
                  {exportRes}px
                </span>
              </motion.button>

              {/* Secondary Actions Grid */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleExportSVG}
                  className={`flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1.5 rounded-xl border font-medium transition-all backdrop-blur-md ${
                    isDark ? 'border-white/10 bg-white/5 hover:border-emerald-500 text-zinc-300' : 'border-white/70 bg-white/60 hover:border-emerald-600 text-slate-800 shadow-sm'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>SVG</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCopyClipboard}
                  className={`flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1.5 rounded-xl border font-medium transition-all backdrop-blur-md ${
                    isDark ? 'border-white/10 bg-white/5 hover:border-emerald-500 text-zinc-300' : 'border-white/70 bg-white/60 hover:border-emerald-600 text-slate-800 shadow-sm'
                  }`}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <Copy className="h-3.5 w-3.5 text-cyan-500 shrink-0" />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </motion.button>

                {typeof navigator !== 'undefined' && 'share' in navigator ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleNativeShare}
                    className={`flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1.5 rounded-xl border font-medium transition-all backdrop-blur-md ${
                      isDark ? 'border-white/10 bg-white/5 hover:border-emerald-500 text-zinc-300' : 'border-white/70 bg-white/60 hover:border-emerald-600 text-slate-800 shadow-sm'
                    }`}
                  >
                    <Share2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                    <span>Bagikan</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleExportPDF}
                    className={`flex items-center justify-center gap-1 py-2 sm:py-2.5 px-1.5 rounded-xl border font-medium transition-all backdrop-blur-md ${
                      isDark ? 'border-white/10 bg-white/5 hover:border-emerald-500 text-zinc-300' : 'border-white/70 bg-white/60 hover:border-emerald-600 text-slate-800 shadow-sm'
                    }`}
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>PDF</span>
                  </motion.button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
