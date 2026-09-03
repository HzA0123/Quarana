"use client";

import { GradientWave } from "./gradient-wave";

interface WebGLShaderProps {
  mode?: "dark" | "light";
}

export function WebGLShader({ mode = "dark" }: WebGLShaderProps) {
  const isDark = mode === "dark";

  // Signature QUARANA Liquid Color Palettes
  const darkColors = ["#000000", "#00f2fe", "#9b51e0", "#10b981", "#3b82f6"];
  const lightColors = ["#f8fafc", "#38bdf8", "#10b981", "#818cf8", "#cbd5e1"];

  return (
    <GradientWave
      key={mode}
      colors={isDark ? darkColors : lightColors}
      shadowPower={isDark ? 8 : 4}
      darkenTop={false}
      noiseSpeed={0.000008}
      noiseFrequency={[0.00012, 0.00025]}
      deform={{
        incline: 0.45,
        noiseAmp: 280,
        noiseFlow: 4.5,
        noiseSpeed: 8,
      }}
    />
  );
}
