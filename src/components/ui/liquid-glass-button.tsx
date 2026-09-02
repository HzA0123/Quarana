"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-all justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl",
        secondary: "bg-white/15 text-white hover:bg-white/25 backdrop-blur-xl border border-white/10",
        ghost: "hover:bg-white/10 text-white",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm",
        sm: "h-8 text-xs px-3.5",
        lg: "h-12 rounded-full px-7 text-base",
        xl: "h-14 rounded-full px-9 text-lg font-bold tracking-wide",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean;
}

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: LiquidButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <>
      <Comp
        data-slot="button"
        className={cn(
          "relative group overflow-hidden",
          liquidbuttonVariants({ variant, size, className })
        )}
        {...props}
      >
        {/* Glow backdrop layer */}
        <div className="absolute top-0 left-0 z-0 h-full w-full rounded-full 
            shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] 
            transition-all 
            dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]" />
        <div
          className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full transition-transform duration-500 group-hover:scale-105"
          style={{ backdropFilter: 'url("#container-glass")' }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
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

export { LiquidButton, liquidbuttonVariants };
