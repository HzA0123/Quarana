# DESIGN.md - Liquid Glass Design System & Theme Specs

**Project:** Aesthetic QR Code Customizer & Generator  
**Theme:** Liquid Glassmorphism (Dual Theme: Dark & Light Mode)  
**Version:** 1.0  
**Created At:** 2 September 2026  

---

## 1. Design Vision & Concept

Aplikasi **Aesthetic QR Code Customizer** mengadopsi estetika **Liquid Glassmorphism**, memadukan efek pembiasan cairan (*liquid distortion*), lapisan kaca frosted (backdrop blur), serta kilauan neon/metalik yang futuristik dan premium.

Pengguna dapat secara intuitif beralih antara **2 Mode Latar Belakang (Gelap & Terang)**:
- **Dark Mode (Default):** Menggunakan WebGL Shader canvas berbasis Three.js dengan gelombang cairan bercahaya di atas canvas gelap murni (`#000000`), memberikan kesan cybernetic & high-tech.
- **Light Mode:** Menggunakan WebGL Shader canvas dengan warna latar Opal / Soft Frost (`#f8fafc` / `#e2e8f0`) dan refleksi cairan terang yang elegan dan jernih.

---

## 2. Color Palette & Dual Mode Design System

### 2.1 Dark Mode (Deep Liquid Space)
- **Background Base:** `#000000` / `#09090b` (Obsidian Dark)
- **Glass Panel Surface:** `rgba(255, 255, 255, 0.05)` hingga `rgba(255, 255, 255, 0.12)`
- **Glass Edge Highlight:** `inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)`
- **Glow Accent:** `rgba(255, 255, 255, 0.15)` & Neon Emerald `#22c55e`
- **Text Color:** Primary `#ffffff`, Secondary `rgba(255, 255, 255, 0.7)`

### 2.2 Light Mode (Soft Frosted Crystal)
- **Background Base:** `#f8fafc` / `#f1f5f9` (Frosted Snow)
- **Glass Panel Surface:** `rgba(255, 255, 255, 0.65)` dengan `backdrop-blur-xl`
- **Glass Edge Highlight:** `inset 1px 1px 1px 0 rgba(0, 0, 0, 0.08), inset -1px -1px 1px 0 rgba(255, 255, 255, 0.8)`
- **Glow Accent:** Soft Ambient Drop Shadow `0 10px 30px rgba(0, 0, 0, 0.06)`
- **Text Color:** Primary `#0f172a`, Secondary `#475569`

---

## 3. Project & Component Architecture

Proyek ini mengikuti konvensi **shadcn/ui** dengan struktur direktori sebagai berikut:

```
d:/PROJECTAR/QUARANA/
├── components/
│   └── ui/
│       ├── liquid-glass-card.tsx      # Card pembiasan kaca cair dengan SVG displacement filter
│       ├── web-gl-shader.tsx          # Background canvas animasi WebGL Three.js
│       ├── liquid-glass-button.tsx    # Tombol cair & metalik dengan efek filter
│       ├── theme-toggle.tsx           # Switcher Dark / Light background mode
│       └── qr-studio/                 # Komponen-komponen spesifik QR Generator
│           ├── control-panel.tsx
│           ├── preview-card.tsx
│           └── scannability-badge.tsx
├── lib/
│   └── utils.ts                       # Helper class merger (clsx + tailwind-merge)
├── PRD-QR-Generator.md
└── DESIGN.md
```

---

## 4. Required Dependencies

Install dependensi yang diperlukan via npm/bun:

```bash
npm install three @types/three motion @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
```

---

## 5. UI Component Specifications

### 5.1 `LiquidGlassCard` (`/components/ui/liquid-glass-card.tsx`)
Komponen utama untuk membungkus form input control panel dan live preview dengan lapisan pembiasan cairan SVG `feDisplacementMap`.

```tsx
// @ts-nocheck
'use client';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from "@/lib/utils";

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  draggable?: boolean;
  expandable?: boolean;
  width?: string;
  height?: string;
  expandedWidth?: string;
  expandedHeight?: string;
  blurIntensity?: 'sm' | 'md' | 'lg' | 'xl';
  shadowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: string;
  glowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const LiquidGlassCard = ({
  children,
  className = '',
  draggable = false,
  expandable = false,
  width,
  height,
  expandedWidth,
  expandedHeight,
  blurIntensity = 'xl',
  borderRadius = '24px',
  glowIntensity = 'sm',
  shadowIntensity = 'md',
  ...props
}: LiquidGlassCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpansion = (e: {
    target: { closest: (arg0: string) => any };
  }) => {
    if (!expandable) return;
    if (e.target.closest('a, button, input, select, textarea')) return;
    setIsExpanded(!isExpanded);
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const shadowStyles = {
    none: 'inset 0 0 0 0 rgba(255, 255, 255, 0)',
    xs: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3), inset -1px -1px 1px 0 rgba(255, 255, 255, 0.3)',
    sm: 'inset 2px 2px 2px 0 rgba(255, 255, 255, 0.35), inset -2px -2px 2px 0 rgba(255, 255, 255, 0.35)',
    md: 'inset 3px 3px 3px 0 rgba(255, 255, 255, 0.45), inset -3px -3px 3px 0 rgba(255, 255, 255, 0.45)',
    lg: 'inset 4px 4px 4px 0 rgba(255, 255, 255, 0.5), inset -4px -4px 4px 0 rgba(255, 255, 255, 0.5)',
    xl: 'inset 6px 6px 6px 0 rgba(255, 255, 255, 0.55), inset -6px -6px 6px 0 rgba(255, 255, 255, 0.55)',
    '2xl':
      'inset 8px 8px 8px 0 rgba(255, 255, 255, 0.6), inset -8px -8px 8px 0 rgba(255, 255, 255, 0.6)',
  };

  const glowStyles = {
    none: '0 4px 4px rgba(0, 0, 0, 0.05), 0 0 12px rgba(0, 0, 0, 0.05)',
    xs: '0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 16px rgba(255, 255, 255, 0.05)',
    sm: '0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 24px rgba(255, 255, 255, 0.1)',
    md: '0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 32px rgba(255, 255, 255, 0.15)',
    lg: '0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 40px rgba(255, 255, 255, 0.2)',
    xl: '0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 48px rgba(255, 255, 255, 0.25)',
    '2xl':
      '0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 60px rgba(255, 255, 255, 0.3)',
  };

  const containerVariants = expandable
    ? {
        collapsed: {
          width: width || 'auto',
          height: height || 'auto',
          transition: { duration: 0.4, ease: [0.5, 1.5, 0.5, 1] },
        },
        expanded: {
          width: expandedWidth || 'auto',
          height: expandedHeight || 'auto',
          transition: { duration: 0.4, ease: [0.5, 1.5, 0.5, 1] },
        },
      }
    : {};

  const MotionComponent = draggable || expandable ? motion.div : 'div';

  const motionProps =
    draggable || expandable
      ? {
          variants: expandable ? containerVariants : undefined,
          animate: expandable ? (isExpanded ? 'expanded' : 'collapsed') : undefined,
          onClick: expandable ? handleToggleExpansion : undefined,
          drag: draggable,
          dragConstraints: draggable ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined,
          dragElastic: draggable ? 0.3 : undefined,
          whileHover: { scale: 1.005 },
          whileTap: { scale: 0.995 },
        }
      : {};

  return (
    <>
      <svg className='hidden'>
        <defs>
          <filter
            id='glass-blur'
            x='0'
            y='0'
            width='100%'
            height='100%'
            filterUnits='objectBoundingBox'
          >
            <feTurbulence
              type='fractalNoise'
              baseFrequency='0.003 0.007'
              numOctaves='1'
              result='turbulence'
            />
            <feDisplacementMap
              in='SourceGraphic'
              in2='turbulence'
              scale='200'
              xChannelSelector='R'
              yChannelSelector='G'
            />
          </filter>
        </defs>
      </svg>
      <MotionComponent
        className={cn(
          `relative transition-colors duration-300 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${expandable ? 'cursor-pointer' : ''}`,
          className
        )}
        style={{
          borderRadius,
          ...(width && !expandable && { width }),
          ...(height && !expandable && { height }),
        }}
        {...motionProps}
        {...props}
      >
        {/* Bend Layer */}
        <div
          className={`absolute inset-0 ${blurClasses[blurIntensity]} z-0`}
          style={{
            borderRadius,
            filter: 'url(#glass-blur)',
          }}
        />
        {/* Face Layer */}
        <div
          className='absolute inset-0 z-10'
          style={{
            borderRadius,
            boxShadow: glowStyles[glowIntensity],
          }}
        />
        {/* Edge Layer */}
        <div
          className='absolute inset-0 z-20 pointer-events-none'
          style={{
            borderRadius,
            boxShadow: shadowStyles[shadowIntensity],
          }}
        />
        {/* Content */}
        <div className={cn('relative z-30')}>{children}</div>
      </MotionComponent>
    </>
  );
};
```

---

### 5.2 `WebGLShader` (`/components/ui/web-gl-shader.tsx`)
Background shader canvas yang dinamis dan menyesuaikan warna berdasarkan `mode` (dark / light).

```tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface WebGLShaderProps {
  mode?: "dark" | "light";
}

export function WebGLShader({ mode = "dark" }: WebGLShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.OrthographicCamera | null;
    renderer: THREE.WebGLRenderer | null;
    mesh: THREE.Mesh | null;
    uniforms: any;
    animationId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const { current: refs } = sceneRef;

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;
      uniform float isLightMode;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
        
        if (isLightMode > 0.5) {
          // Soft frosted crystal colors for Light Mode
          vec3 bg = vec3(0.96, 0.97, 0.98);
          vec3 waveColor = vec3(r * 0.4 + 0.1, g * 0.5 + 0.2, b * 0.7 + 0.3);
          gl_FragColor = vec4(mix(bg, waveColor, 0.35), 1.0);
        } else {
          // Deep neon space colors for Dark Mode
          gl_FragColor = vec4(r, g, b, 1.0);
        }
      }
    `;

    const initScene = () => {
      refs.scene = new THREE.Scene();
      refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      refs.renderer.setPixelRatio(window.devicePixelRatio);
      refs.renderer.setClearColor(mode === "light" ? new THREE.Color(0xf8fafc) : new THREE.Color(0x000000));

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

      refs.uniforms = {
        resolution: { value: [window.innerWidth, window.innerHeight] },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.5 },
        distortion: { value: 0.05 },
        isLightMode: { value: mode === "light" ? 1.0 : 0.0 },
      };

      const position = [
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
      ];

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", positions);

      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms,
        side: THREE.DoubleSide,
      });

      refs.mesh = new THREE.Mesh(geometry, material);
      refs.scene.add(refs.mesh);

      handleResize();
    };

    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += 0.01;
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera);
      }
      refs.animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      refs.renderer.setSize(width, height, false);
      refs.uniforms.resolution.value = [width, height];
    };

    initScene();
    animate();
    window.addEventListener("resize", handleResize);

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      window.removeEventListener("resize", handleResize);
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh);
        refs.mesh.geometry.dispose();
        if (refs.mesh.material instanceof THREE.Material) {
          refs.mesh.material.dispose();
        }
      }
      refs.renderer?.dispose();
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full block -z-10 transition-opacity duration-700"
    />
  );
}
```

---

### 5.3 `LiquidButton` & `MetalButton` (`/components/ui/liquid-glass-button.tsx`)
Tombol dengan efek kilap cairan dan ring metalik untuk Aksi Utama (*Generate QR*, *Export 4K PNG*, *Download SVG*).

```tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-105 duration-300 transition text-primary",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 text-xs px-3",
        lg: "h-10 rounded-md px-6",
        xl: "h-12 rounded-full px-8 text-base font-semibold",
        xxl: "h-14 rounded-full px-10 text-lg font-bold",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xl",
    },
  }
);

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof liquidbuttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <>
      <Comp
        data-slot="button"
        className={cn(
          "relative",
          liquidbuttonVariants({ variant, size, className })
        )}
        {...props}
      >
        <div className="absolute top-0 left-0 z-0 h-full w-full rounded-full 
            shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] 
        transition-all 
        dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]" />
        <div
          className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full"
          style={{ backdropFilter: 'url("#container-glass")' }}
        />

        <div className="pointer-events-none z-10 flex items-center gap-2">
          {children}
        </div>
        <GlassFilter />
      </Comp>
    </>
  );
}

function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export { LiquidButton };
```

---

## 6. Layout Studio & Theme Switcher Demo

Berikut adalah struktur layout utama studio yang mengintegrasikan `WebGLShader` background dengan mode **Gelap & Terang**, `LiquidGlassCard`, dan `LiquidButton`:

```tsx
'use client';

import React, { useState } from 'react';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Sun, Moon, QrCode, Sparkles, Download, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export default function QRStudioLayout() {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  return (
    <div className={`relative min-h-screen w-full transition-colors duration-500 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Dynamic Background Shader */}
      <WebGLShader mode={themeMode} />

      {/* Top Navigation */}
      <header className="relative z-40 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <QrCode className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            QUARANA Liquid QR
          </span>
        </div>

        {/* Theme Switcher Toggle (Dark vs Light) */}
        <button
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 backdrop-blur-xl ${
            themeMode === 'dark'
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : 'bg-black/10 border-black/20 text-slate-900 hover:bg-black/20'
          }`}
        >
          {themeMode === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-medium">Dark Mode</span>
            </>
          )}
        </button>
      </header>

      {/* Main Studio Grid */}
      <main className="relative z-30 max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Customization Control Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <LiquidGlassCard
            shadowIntensity="md"
            glowIntensity="sm"
            className={`p-6 border ${themeMode === 'dark' ? 'bg-white/5 border-white/15' : 'bg-white/60 border-black/10'}`}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              Customization Panel
            </h2>
            <p className="text-sm opacity-80 mb-6">
              Kustomisasi logo tengah, warna gradien, bentuk dot, dan frame Call-to-Action.
            </p>
            {/* Input Controls Go Here */}
          </LiquidGlassCard>
        </div>

        {/* Right Side: Sticky Live Preview Canvas */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <LiquidGlassCard
            shadowIntensity="lg"
            glowIntensity="md"
            className={`p-8 border flex flex-col items-center justify-center text-center ${
              themeMode === 'dark' ? 'bg-white/8 border-white/20' : 'bg-white/70 border-black/10'
            }`}
          >
            <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 mb-6 shadow-2xl">
              {/* QR Canvas Container */}
              <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center text-slate-800 font-bold">
                [ Live QR Canvas ]
              </div>
            </div>

            {/* Scannability Safety Shield */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-6">
              <ShieldCheck className="h-4 w-4" />
              100% Scannable (ECC Level H)
            </div>

            {/* Export Action */}
            <LiquidButton size="xl" className="w-full text-white">
              <Download className="h-5 w-5" />
              Download 4K Liquid QR
            </LiquidButton>
          </LiquidGlassCard>
        </div>
      </main>
    </div>
  );
}
```

---

## 7. Responsive & Accessibility Guidelines

- **Mobile Viewport:** Pilihan tab antara Panel Kontrol & Live Preview di layar mobile (< 768px).
- **Contrast Ratios:** Teks UI selalu dijaga agar kontras rasio minimal 4.5:1 baik di Dark Mode maupun Light Mode.
- **Hardware Acceleration:** WebGL Canvas dieksekusi dengan `requestAnimationFrame` serta pembersihan memori pada `useEffect` unmount.
