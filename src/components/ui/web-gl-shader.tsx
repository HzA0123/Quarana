"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface WebGLShaderProps {
  mode?: "dark" | "light";
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

// Raw sRGB vec3 from hex, so shader colors look exactly like the hex value
const rgb = (hex: number) =>
  new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);

const NOISE_GLSL = /* glsl */ `
  float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float n3(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm3(vec3 p){
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * n3(p); p = p * 2.03 + 11.7; a *= 0.5; }
    return v;
  }
  float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n2(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h2(i), h2(i + vec2(1,0)), f.x), mix(h2(i + vec2(0,1)), h2(i + vec2(1,1)), f.x), f.y);
  }
  float fbm2(vec2 p){
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * n2(p); p = p * 2.02 + 7.3; a *= 0.5; }
    return v;
  }
`;

/* ------------------------------------------------------------------ */
/*  1. Nebula backdrop (fullscreen quad with Halo Bloom)               */
/* ------------------------------------------------------------------ */
const nebulaVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }
`;
const nebulaFrag = /* glsl */ `
  precision highp float;
  uniform float uTime; uniform float uAspect; uniform vec2 uMouse;
  uniform vec3 uBg; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
  uniform float uStrength; uniform vec2 uHalo; uniform vec3 uHaloCol; uniform float uHaloK;
  varying vec2 vUv;
  ${NOISE_GLSL}
  void main(){
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 1.8 + uMouse * 0.06 + vec2(uTime * 0.004, 0.0);
    float a = fbm2(p);
    float b = fbm2(p * 1.7 + a * 1.6 + 5.0);
    float c = fbm2(p * 0.8 - b * 1.2 + 13.0);
    vec3 col = uBg;
    col = mix(col, uA, smoothstep(0.42, 0.95, a) * uStrength);
    col = mix(col, uB, smoothstep(0.48, 0.95, b) * uStrength * 0.8);
    col = mix(col, uC, smoothstep(0.55, 1.00, c) * uStrength * 0.6);
    // soft bloom around the planet ties it into the backdrop
    float hd = length((vUv - uHalo) * vec2(uAspect, 1.0));
    col = mix(col, uHaloCol, pow(smoothstep(0.75, 0.0, hd), 2.0) * uHaloK);
    // soft vignette so the edges stay calm and the UI stays readable
    float v = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(uAspect * 0.8, 1.0)));
    col = mix(uBg, col, 0.55 + 0.45 * v);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/*  2. Stars                                                           */
/* ------------------------------------------------------------------ */
const starVert = /* glsl */ `
  attribute float aSize; attribute float aPhase; attribute float aSpeed; attribute vec3 aColor;
  uniform float uTime; uniform float uPR;
  varying float vAlpha; varying vec3 vColor;
  void main(){
    vColor = aColor;
    float tw = sin(uTime * aSpeed + aPhase) * 0.5 + 0.5;
    vAlpha = 0.35 + tw * 0.65;
    gl_PointSize = aSize * uPR * (0.75 + tw * 0.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const starFrag = /* glsl */ `
  precision highp float;
  uniform float uOpacity;
  varying float vAlpha; varying vec3 vColor;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = pow(1.0 - d * 2.0, 1.6);
    gl_FragColor = vec4(vColor, core * vAlpha * uOpacity);
  }
`;

/* ------------------------------------------------------------------ */
/*  3. Planet (procedural gas giant)                                   */
/* ------------------------------------------------------------------ */
const planetVert = /* glsl */ `
  varying vec3 vObj; varying vec3 vWN; varying vec3 vWP;
  void main(){
    vObj = position;
    vWN = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWP = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const planetFrag = /* glsl */ `
  precision highp float;
  uniform float uTime; uniform float uIsDark; uniform vec3 uLightDir;
  uniform float uFloor; uniform vec3 uTint;
  uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;
  varying vec3 vObj; varying vec3 vWN; varying vec3 vWP;
  ${NOISE_GLSL}
  void main(){
    vec3 n0 = normalize(vObj);
    float t = uTime * 0.05;
    vec3 q = n0 * vec3(1.4, 2.4, 1.4);

    float warp = fbm3(q * 1.6 + vec3(t, 0.0, -t)) * 2.0 - 1.0;
    float lat = n0.y + warp * 0.12;
    float bands  = sin(lat * 15.0 + fbm3(q * 3.0 + t) * 2.5) * 0.5 + 0.5;
    float bands2 = sin(lat * 38.0 + warp * 4.0) * 0.5 + 0.5;

    vec3 col = mix(uC1, uC2, smoothstep(0.2, 0.8, bands));
    col = mix(col, uC3, smoothstep(0.55, 0.95, bands2) * 0.55);
    col = mix(col, uC4, smoothstep(0.62, 0.9, fbm3(q * 4.0 - t)) * 0.35);

    vec3 N = normalize(vWN);
    vec3 V = normalize(cameraPosition - vWP);
    float ndl = dot(N, uLightDir);
    float day = smoothstep(-0.15, 0.85, ndl);
    float lit = mix(uFloor, 1.05, day);

    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 rimCol = uC1 * rim * (0.35 + 0.9 * clamp(ndl + 0.4, 0.0, 1.0));

    col = col * lit;
    // light mode: night side fades to a soft tint instead of black
    col = mix(col, uTint, (1.0 - day) * 0.4 * (1.0 - uIsDark));
    col += rimCol * (uIsDark > 0.5 ? 1.0 : 0.55);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/*  4. Atmosphere halo                                                 */
/* ------------------------------------------------------------------ */
const atmoVert = /* glsl */ `
  varying vec3 vWN; varying vec3 vWP;
  void main(){
    vWN = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWP = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const atmoFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uGlow; uniform float uTime; uniform float uIsDark;
  varying vec3 vWN; varying vec3 vWP;
  void main(){
    vec3 V = normalize(cameraPosition - vWP);
    float d = clamp(-dot(normalize(vWN), V), 0.0, 1.0);   // BackSide: normals face away
    float pulse = 0.92 + sin(uTime * 1.1) * 0.08;
    float a = pow(d, 2.0) * 2.2 * pulse * (uIsDark > 0.5 ? 0.9 : 0.5);
    gl_FragColor = vec4(uGlow, clamp(a, 0.0, 1.0));
  }
`;

/* ------------------------------------------------------------------ */
/*  5. Rings (Anti-Aliased via fwidth to prevent moiré & graining)     */
/* ------------------------------------------------------------------ */
const ringVert = /* glsl */ `
  varying vec2 vLocal; varying vec3 vWP;
  void main(){
    vLocal = position.xy;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWP = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const ringFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uLightDir;
  uniform vec3 uPlanetCenter; uniform float uPlanetR;
  uniform float uInner; uniform float uOuter; uniform float uIsDark; uniform float uShadowFloor;
  varying vec2 vLocal; varying vec3 vWP;
  ${NOISE_GLSL}
  void main(){
    float t = (length(vLocal) - uInner) / (uOuter - uInner);

    // Item #1 Fix: Anti-Aliased ring bands using fwidth derivatives to prevent moiré
    float f1 = t * 50.0;
    float w1 = fwidth(f1);
    float b = mix(0.5 + 0.5 * sin(f1 + sin(t * 18.0) * 2.0), 0.5, smoothstep(0.4, 1.4, w1));

    float f2 = t * 60.0;
    float w2 = fwidth(f2);
    float grain = mix(h2(vec2(floor(f2), 3.0)), 0.5, smoothstep(0.4, 1.4, w2));
    
    // Scale down grain intensity in Light mode for clean smoothness
    float dens = mix(b, grain, uIsDark > 0.5 ? 0.4 : 0.15);
    float gap  = smoothstep(0.50, 0.53, t) * (1.0 - smoothstep(0.58, 0.61, t));
    float edge = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.93, 1.0, t));

    // planet shadow cast onto the ring
    vec3 p = vWP - uPlanetCenter;
    float along = dot(p, uLightDir);
    float perp = length(p - uLightDir * along);
    float shadow = along < 0.0 ? smoothstep(uPlanetR * 0.96, uPlanetR * 1.06, perp) : 1.0;

    vec3 col = mix(uC1, uC2, t) * mix(uShadowFloor, 1.0, shadow);
    float alpha = (0.22 + 0.6 * dens) * (1.0 - gap * 0.92) * edge;
    alpha *= (uIsDark > 0.5 ? 0.7 : 0.8);
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ------------------------------------------------------------------ */
/*  6. Procedural Companion Planet Shader (Item #2: Soft 3D Pastel Orb)*/
/* ------------------------------------------------------------------ */
const leftPlanetVert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const leftPlanetFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uLightDir;
  uniform float uIsDark;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    
    float diff = max(0.2, dot(N, uLightDir));
    float day = smoothstep(-0.2, 0.8, diff);
    
    // Soft top-left specular highlight
    float spec = pow(max(0.0, dot(reflect(-uLightDir, N), V)), 12.0) * 0.35;
    
    // 3D Pastel Spherical Gradient
    vec3 baseColor = mix(uColorA, uColorB, N.y * 0.5 + 0.5);
    baseColor = mix(baseColor, uColorC, (1.0 - N.x) * 0.4);
    
    vec3 finalColor = baseColor * (day * 0.8 + 0.25) + vec3(spec);
    float alpha = uIsDark > 0.5 ? 0.65 : 0.55;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function WebGLShader({ mode = "dark" }: WebGLShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const isDark = mode === "dark";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeScale = reduceMotion ? 0.15 : 1;

    /* ---------- renderer / scene / camera ---------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    container.appendChild(renderer.domElement);

    /* ---------- palette ---------- */
    const P = isDark
      ? {
          bg: 0x02030a, nebA: 0x4c1d95, nebB: 0x0e7490, nebC: 0x065f46, nebK: 0.5,
          halo: 0x22d3ee, haloK: 0.22, floor: 0.07, tint: 0x000000, ringShadow: 0.12,
          c1: 0x22d3ee, c2: 0x6d28d9, c3: 0x10b981, c4: 0xf0abfc,
          ringA: 0x67e8f9, ringB: 0xc4b5fd, glow: 0x22d3ee,
          stars: [0xffffff, 0xbfe9ff, 0xd8ccff, 0xa7f3d0, 0xffe7c2],
          leftA: 0x1e1b4b, leftB: 0x0e7490, leftC: 0x312e81,
        }
      : {
          bg: 0xf3f6ff, nebA: 0xa5b4fc, nebB: 0x7dd3fc, nebC: 0x6ee7b7, nebK: 0.6,
          halo: 0x93c5fd, haloK: 0.5, floor: 0.55, tint: 0x6366f1, ringShadow: 0.5,
          c1: 0x38bdf8, c2: 0x818cf8, c3: 0x2dd4bf, c4: 0xf9a8d4,
          ringA: 0x0ea5e9, ringB: 0x7c3aed, glow: 0x38bdf8,
          stars: [0x6366f1, 0x0ea5e9, 0x94a3b8, 0x10b981],
          leftA: 0xe0e7ff, leftB: 0xa5b4fc, leftC: 0x818cf8,
        };
    const darkFlag = isDark ? 1 : 0;

    const lightDir = new THREE.Vector3(0.75, 0.45, 0.55).normalize();

    /* ---------- nebula ---------- */
    const nebulaMat = new THREE.ShaderMaterial({
      vertexShader: nebulaVert,
      fragmentShader: nebulaFrag,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: window.innerWidth / window.innerHeight },
        uMouse: { value: new THREE.Vector2() },
        uBg: { value: rgb(P.bg) },
        uA: { value: rgb(P.nebA) },
        uB: { value: rgb(P.nebB) },
        uC: { value: rgb(P.nebC) },
        uStrength: { value: P.nebK },
        uHalo: { value: new THREE.Vector2(0.70, 0.45) },
        uHaloCol: { value: rgb(P.halo) },
        uHaloK: { value: P.haloK },
      },
      depthTest: false,
      depthWrite: false,
    });
    const nebula = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), nebulaMat);
    nebula.frustumCulled = false;
    nebula.renderOrder = -10;
    scene.add(nebula);

    /* ---------- star layers ---------- */
    const makeStars = (count: number, rMin: number, rMax: number, sMin: number, sMax: number) => {
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const size = new Float32Array(count);
      const phase = new Float32Array(count);
      const speed = new Float32Array(count);
      const tmp = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const r = rMin + Math.random() * (rMax - rMin);
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(Math.random() * 2 - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = -Math.abs(r * Math.cos(ph)) - 15;
        const hex = P.stars[Math.floor(Math.random() * P.stars.length)];
        tmp.setHex(hex);
        const v = rgb(hex);
        col[i * 3] = v.x; col[i * 3 + 1] = v.y; col[i * 3 + 2] = v.z;
        size[i] = sMin + Math.pow(Math.random(), 3) * (sMax - sMin);
        phase[i] = Math.random() * Math.PI * 2;
        speed[i] = 0.4 + Math.random() * 1.8;
      }
      geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geom.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
      geom.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      geom.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
      geom.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
      const mat = new THREE.ShaderMaterial({
        vertexShader: starVert,
        fragmentShader: starFrag,
        uniforms: { uTime: { value: 0 }, uPR: { value: 1 }, uOpacity: { value: isDark ? 1 : 0.5 } },
        transparent: true,
        depthWrite: false,
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const points = new THREE.Points(geom, mat);
      points.frustumCulled = false;
      return points;
    };
    const starsFar = makeStars(2200, 70, 130, 1.2, 3.2);
    const starsNear = makeStars(320, 40, 70, 2.0, 5.5);
    scene.add(starsFar, starsNear);

    /* ---------- planet system (tilt: 0.6, position: halfW * 0.70, scale: 0.85) ---------- */
    const PLANET_Z = -6;
    const PLANET_R = 2.6;
    const RING_IN = 3.4;
    const RING_OUT = 5.8;

    const planetGroup = new THREE.Group();
    // Tilt set to 0.6 so the planetary rings open up beautifully
    planetGroup.rotation.set(0.6, 0, -0.3);
    const planetRoot = new THREE.Group();
    planetRoot.add(planetGroup);
    scene.add(planetRoot);

    const planetMat = new THREE.ShaderMaterial({
      vertexShader: planetVert,
      fragmentShader: planetFrag,
      uniforms: {
        uTime: { value: 0 },
        uIsDark: { value: darkFlag },
        uLightDir: { value: lightDir },
        uFloor: { value: P.floor },
        uTint: { value: rgb(P.tint) },
        uC1: { value: rgb(P.c1) },
        uC2: { value: rgb(P.c2) },
        uC3: { value: rgb(P.c3) },
        uC4: { value: rgb(P.c4) },
      },
    });
    const planetGeom = new THREE.SphereGeometry(PLANET_R, 96, 96);
    const planetMesh = new THREE.Mesh(planetGeom, planetMat);
    planetGroup.add(planetMesh);

    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: atmoVert,
      fragmentShader: atmoFrag,
      uniforms: { uGlow: { value: rgb(P.glow) }, uTime: { value: 0 }, uIsDark: { value: darkFlag } },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const atmoGeom = new THREE.SphereGeometry(PLANET_R * 1.16, 64, 64);
    planetGroup.add(new THREE.Mesh(atmoGeom, atmoMat));

    const ringMat = new THREE.ShaderMaterial({
      vertexShader: ringVert,
      fragmentShader: ringFrag,
      uniforms: {
        uC1: { value: rgb(P.ringA) },
        uC2: { value: rgb(P.ringB) },
        uLightDir: { value: lightDir },
        uPlanetCenter: { value: new THREE.Vector3() },
        uPlanetR: { value: PLANET_R },
        uInner: { value: RING_IN },
        uOuter: { value: RING_OUT },
        uIsDark: { value: darkFlag },
        uShadowFloor: { value: P.ringShadow },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ringGeom = new THREE.RingGeometry(RING_IN, RING_OUT, 220, 1);
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    planetGroup.add(ringMesh);

    // Orbiting Moon
    scene.add(new THREE.AmbientLight(0xffffff, isDark ? 0.35 : 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, isDark ? 2.4 : 1.6);
    sun.position.copy(lightDir).multiplyScalar(30);
    scene.add(sun);

    const moonPivot = new THREE.Group();
    moonPivot.rotation.z = 0.15;
    planetGroup.add(moonPivot);
    const moonGeom = new THREE.IcosahedronGeometry(0.34, 2);
    const moonMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xcbd5e1 : 0xc7d2fe,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });
    const moon = new THREE.Mesh(moonGeom, moonMat);
    moon.position.set(RING_OUT + 1.3, 0, 0);
    moonPivot.add(moon);

    /* ---------- Item #2 Fix: Soft 3D Pastel/Cosmic Companion Planet ---------- */
    const leftPlanetRoot = new THREE.Group();
    scene.add(leftPlanetRoot);

    const leftPlanetGeom = new THREE.SphereGeometry(1.25, 48, 48);
    const leftPlanetMat = new THREE.ShaderMaterial({
      vertexShader: leftPlanetVert,
      fragmentShader: leftPlanetFrag,
      uniforms: {
        uColorA: { value: rgb(P.leftA) },
        uColorB: { value: rgb(P.leftB) },
        uColorC: { value: rgb(P.leftC) },
        uLightDir: { value: lightDir },
        uIsDark: { value: darkFlag },
      },
      transparent: true,
    });
    const leftPlanetMesh = new THREE.Mesh(leftPlanetGeom, leftPlanetMat);
    leftPlanetRoot.add(leftPlanetMesh);

    const leftAtmoMat = new THREE.ShaderMaterial({
      vertexShader: atmoVert,
      fragmentShader: atmoFrag,
      uniforms: { uGlow: { value: rgb(isDark ? 0x0e7490 : 0x818cf8) }, uTime: { value: 0 }, uIsDark: { value: darkFlag } },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const leftAtmoGeom = new THREE.SphereGeometry(1.32, 32, 32);
    leftPlanetRoot.add(new THREE.Mesh(leftAtmoGeom, leftAtmoMat));

    /* ---------- shooting star (dark mode only) ---------- */
    const shootGeom = new THREE.BufferGeometry();
    shootGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0, 3.2, -1.5, 0]), 3));
    shootGeom.setAttribute("color", new THREE.BufferAttribute(new Float32Array([0, 0, 0, 1, 1, 1]), 3));
    const shootMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shoot = new THREE.Line(shootGeom, shootMat);
    shoot.visible = isDark;
    scene.add(shoot);
    let shootStart = -1;
    let nextShoot = 3 + Math.random() * 3;
    const shootOrigin = new THREE.Vector3();

    /* ---------- layout (Item #3 Fix: Responsive planet placement & scale) ---------- */
    const layout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;
      const pr = Math.min(window.devicePixelRatio, 2);

      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h);

      nebulaMat.uniforms.uAspect.value = aspect;
      (starsFar.material as THREE.ShaderMaterial).uniforms.uPR.value = pr;
      (starsNear.material as THREE.ShaderMaterial).uniforms.uPR.value = pr;

      const dist = camera.position.z - PLANET_Z;
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
      const halfW = halfH * aspect;

      // Item #3 Fix: Position set to halfW * 0.70 and scale 0.85 so planet & ring never get clipped on 1366px, 1920px, 2560px
      if (aspect >= 1) {
        planetRoot.position.set(halfW * 0.70, halfH * 0.45, PLANET_Z);
        planetRoot.scale.setScalar(0.85);

        leftPlanetRoot.position.set(-halfW * 0.76, -halfH * 0.52, PLANET_Z - 3);
        leftPlanetRoot.scale.setScalar(0.78);
      } else {
        planetRoot.position.set(halfW * 0.5, halfH * 0.78, PLANET_Z);
        planetRoot.scale.setScalar(0.55);

        leftPlanetRoot.position.set(-halfW * 0.65, -halfH * 0.75, PLANET_Z - 3);
        leftPlanetRoot.scale.setScalar(0.5);
      }
      camera.updateMatrixWorld();
      const ndc = planetRoot.position.clone().project(camera);
      nebulaMat.uniforms.uHalo.value.set(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);
      ringMat.uniforms.uPlanetCenter.value.copy(planetRoot.position);
      ringMat.uniforms.uPlanetR.value = PLANET_R * planetRoot.scale.x;
    };
    layout();

    /* ---------- input ---------- */
    const onMove = (e: MouseEvent | TouchEvent) => {
      const p = "touches" in e ? e.touches[0] : (e as MouseEvent);
      if (!p) return;
      mouseRef.current.tx = (p.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.ty = -(p.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("resize", layout);

    /* ---------- loop ---------- */
    const clock = new THREE.Clock();
    let t = 0;
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt * timeScale;

      const m = mouseRef.current;
      m.x += (m.tx - m.x) * 0.04;
      m.y += (m.ty - m.y) * 0.04;

      nebulaMat.uniforms.uTime.value = t;
      nebulaMat.uniforms.uMouse.value.set(m.x, m.y);
      (starsFar.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      (starsNear.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      planetMat.uniforms.uTime.value = t;
      atmoMat.uniforms.uTime.value = t;
      leftAtmoMat.uniforms.uTime.value = t;

      planetMesh.rotation.y = t * 0.06;
      leftPlanetMesh.rotation.y = t * 0.03;
      moonPivot.rotation.y = t * 0.35;
      moon.rotation.y = t * 0.5;

      starsFar.rotation.y = t * 0.002;
      starsNear.rotation.y = t * 0.004;

      // gentle parallax
      camera.position.x = m.x * 0.9;
      camera.position.y = m.y * 0.6;
      camera.lookAt(0, 0, 0);

      // shooting star
      if (isDark && !reduceMotion) {
        if (shootStart < 0 && t > nextShoot) {
          shootStart = t;
          shootOrigin.set(-16 + Math.random() * 14, 3 + Math.random() * 6, -8);
        }
        if (shootStart >= 0) {
          const p = (t - shootStart) / 0.9;
          if (p >= 1) {
            shootStart = -1;
            nextShoot = t + 5 + Math.random() * 7;
            shootMat.opacity = 0;
          } else {
            shoot.position.set(shootOrigin.x + p * 14, shootOrigin.y - p * 6.5, shootOrigin.z);
            shootMat.opacity = Math.sin(p * Math.PI);
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    /* ---------- cleanup ---------- */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("resize", layout);

      scene.traverse((obj) => {
        const o = obj as THREE.Mesh;
        if (o.geometry) o.geometry.dispose();
        const mat = o.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [isDark]);

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ width: "100vw", height: "100vh" }}
      />
      {/* soft scrim: keeps headline + cards readable on top of the scene */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 70% 55% at 45% 40%, rgba(2,3,10,0.55) 0%, rgba(2,3,10,0) 70%)"
            : "radial-gradient(ellipse 70% 55% at 45% 40%, rgba(245,248,255,0.65) 0%, rgba(245,248,255,0) 70%)",
        }}
      />
    </>
  );
}
