import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QROptions } from '@/lib/types';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { ControlPanel } from '@/components/qr/control-panel';
import { LivePreview } from '@/components/qr/live-preview';
import { MobileDrawer } from '@/components/qr/mobile-drawer';
import { QrCode, Sun, Moon, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const isDark = themeMode === 'dark';

  // Default initial QR options state
  const [options, setOptions] = useState<QROptions>({
    inputType: 'url',
    rawText: 'https://quarana.app',
    wifi: {
      ssid: 'MyHomeWifi',
      password: 'WifiPassword123',
      encryption: 'WPA',
      hidden: false,
    },
    vcard: {
      firstName: 'Hafid',
      lastName: 'Dev',
      phone: '+6281234567890',
      email: 'hafid@quarana.app',
      company: 'Quarana Tech',
      title: 'Full Stack Engineer',
      website: 'https://quarana.app',
    },
    whatsapp: {
      phone: '6281234567890',
      message: 'Halo, saya ingin menanyakan informasi tentang QR Code estetik ini.',
    },
    social: {
      platform: 'instagram',
      username: 'quarana.official',
    },

    // Dots Styling
    dotStyle: 'extra-rounded',
    gradientType: 'linear',
    color1: '#00f2fe',
    color2: '#9b51e0',
    gradientRotation: 45,

    // Eye Styling
    eyeFrameStyle: 'rounded',
    eyeBallStyle: 'dots',
    outerEyeColor: '#00f2fe',
    innerEyeColor: '#9b51e0',

    // Background
    bgColor: '#09090b',
    bgTransparent: false,

    // Logo Overlay
    logoUrl: null,
    logoShape: 'circle',
    logoSize: 0.22,
    logoMargin: 4,
    logoHalo: true,
    logoHaloColor: '#ffffff',

    // CTA Frame
    frame: {
      enabled: false,
      text: 'SCAN ME',
      textColor: '#ffffff',
      backgroundColor: '#10b981',
      position: 'bottom',
      fontFamily: 'Outfit',
    },
  });

  return (
    <div
      className={`relative min-h-screen w-full transition-colors duration-500 font-sans ${
        isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900 light'
      }`}
    >
      {/* Three.js Dynamic WebGL Shader Background */}
      <WebGLShader mode={themeMode} />

      {/* Top Header Navigation */}
      <header className={`relative z-40 flex items-center justify-between p-4 sm:p-5 max-w-7xl mx-auto border-b ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-2xl border shadow-lg backdrop-blur-md ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-slate-200'
          }`}>
            <QrCode className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <div>
            <span className={`text-xl font-extrabold tracking-tight font-heading ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              QUARANA
            </span>
            <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${
              isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
            }`}>
              v3.0 Cosmic 3D
            </span>
          </div>
        </div>

        {/* Dual Theme Mode Switcher */}
        <button
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 backdrop-blur-xl shadow-lg ${
            isDark
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : 'bg-white/90 border-slate-300 text-slate-900 hover:bg-white'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
              <span className="text-xs font-semibold hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-semibold hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </header>

      {/* Hero Intro Section (No Kicker / Eyebrow per Impeccable Rule 27) */}
      <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-4 text-center">
        <h1 className={`text-3xl sm:text-6xl font-extrabold tracking-tight font-heading mb-3 sm:mb-4 ${
          isDark ? 'text-zinc-100' : 'text-slate-900'
        }`}>
          Transform Links into <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>Visual Art</span>
        </h1>
        <p className={`max-w-[65ch] mx-auto text-sm sm:text-lg leading-relaxed ${
          isDark ? 'text-zinc-400' : 'text-slate-600'
        }`}>
          Tambahkan logo di tengah, warna gradien, bentuk titik & sudut unik, serta frame Call-to-Action estetik tanpa merusak keterbacaan scan.
        </p>
      </section>

      {/* Main Studio Grid */}
      <main className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Mobile & Desktop: Live Preview Box */}
        <div className="lg:col-span-5 order-first lg:order-last">
          <div className="lg:sticky lg:top-8 space-y-6">
            <LivePreview options={options} themeMode={themeMode} />
          </div>
        </div>

        {/* Customization Control Panel */}
        <div className="lg:col-span-7 space-y-6 order-last lg:order-first">
          <ControlPanel options={options} setOptions={setOptions} themeMode={themeMode} />
        </div>
      </main>

      {/* Mobile Touch Drawer & FAB for Handphone screens */}
      <MobileDrawer options={options} setOptions={setOptions} themeMode={themeMode} />

      {/* Footer with Motion Animated HzA Signature */}
      <footer className={`relative z-30 max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono ${
        isDark ? 'border-white/10 text-zinc-500' : 'border-slate-200 text-slate-500'
      }`}>
        <p>© 2026 QUARANA Liquid QR Studio — 100% Client-Side Privacy Safe</p>
        
        <div className="flex items-center gap-2">
          <span>Crafted with</span>
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <span>by</span>
          <motion.div
            whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-lg transition-all cursor-pointer ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold shadow-sm'
            }`}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            />
            <span className="font-bold tracking-widest text-xs font-heading text-emerald-400 dark:text-emerald-400">
              HzA
            </span>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
