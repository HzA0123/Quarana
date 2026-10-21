"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { QROptions } from '@/lib/types';
import { QRMatrixResult } from '@/lib/orbit-qr-matrix';
import { SpaceThemeConfig } from './types';
import saveAs from 'file-saver';

export interface OrbitPlaygroundSceneHandle {
  takeSnapshot: () => void;
  resetCamera: () => void;
}

interface OrbitPlaygroundSceneProps {
  options: QROptions;
  qrData: QRMatrixResult;
  theme: SpaceThemeConfig;
  themeMode: 'dark' | 'light';
  isFlatMode: boolean;
  onToggleFlatMode?: () => void;
}

// Convert Hex string to THREE.Color
function parseHexColor(hex: string, fallback = 0x000000): THREE.Color {
  try {
    return new THREE.Color(hex);
  } catch {
    return new THREE.Color(fallback);
  }
}

// Check relative luminance to ensure high-contrast scannability against white panel
function getLuminance(color: THREE.Color): number {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

export const OrbitPlaygroundScene = forwardRef<OrbitPlaygroundSceneHandle, OrbitPlaygroundSceneProps>(
  ({ options, qrData, theme, themeMode, isFlatMode }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    // Current animation & morph state
    const morphTargetRef = useRef<number>(isFlatMode ? 1 : 0);
    const morphCurrentRef = useRef<number>(isFlatMode ? 1 : 0);
    const pointerPosRef = useRef<{ x: number; z: number; active: boolean }>({ x: 0, z: 0, active: false });

    // Update target morph value when prop changes
    useEffect(() => {
      morphTargetRef.current = isFlatMode ? 1 : 0;
    }, [isFlatMode]);

    // Expose snapshot and reset camera functions
    useImperativeHandle(ref, () => ({
      takeSnapshot: () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
        // Convert to blob and save
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => {
            saveAs(blob, `quarana-3d-orbit-${theme.id}-${Date.now()}.png`);
          })
          .catch((err) => console.error('Snapshot failed', err));
      },
      resetCamera: () => {
        if (!cameraRef.current || !controlsRef.current) return;
        const count = qrData.moduleCount;
        cameraRef.current.position.set(count * 0.75, count * 0.9, count * 1.1);
        controlsRef.current.target.set(0, 0, 0);
        cameraRef.current.up.set(0, 1, 0);
        controlsRef.current.update();
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth || 360;
      const height = container.clientHeight || 360;

      // 1. Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const bgColor = themeMode === 'dark' ? theme.spaceBgDark : theme.spaceBgLight;
      scene.background = new THREE.Color(bgColor);

      // 2. Camera setup
      const moduleCount = qrData.moduleCount;
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      cameraRef.current = camera;

      // Initial camera positioning
      const initial3DPos = new THREE.Vector3(moduleCount * 0.8, moduleCount * 0.95, moduleCount * 1.15);
      const flatCameraPos = new THREE.Vector3(0, moduleCount * 1.68, 0.0001);

      if (isFlatMode) {
        camera.position.copy(flatCameraPos);
        camera.up.set(0, 0, -1);
      } else {
        camera.position.copy(initial3DPos);
        camera.up.set(0, 1, 0);
      }
      camera.lookAt(0, 0, 0);

      // 3. Renderer setup
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 4. OrbitControls setup
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.maxDistance = moduleCount * 3.5;
      controls.minDistance = moduleCount * 0.5;
      controls.maxPolarAngle = Math.PI / 2 + 0.15; // Don't flip below base
      controlsRef.current = controls;

      // 5. Lighting Setup
      // Neutral Flat light (activated during flat QR scan mode)
      const neutralFlatLight = new THREE.AmbientLight(0xffffff, isFlatMode ? 1.5 : 0.2);
      scene.add(neutralFlatLight);

      // 3D Directional Key Light with soft shadow
      const dirLight = new THREE.DirectionalLight(0xffffff, theme.ambientIntensity + 0.6);
      dirLight.position.set(moduleCount * 0.8, moduleCount * 1.4, moduleCount * 0.9);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.001;
      const d = moduleCount * 0.9;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      scene.add(dirLight);

      // Accent color rim light (from space theme)
      const accentLight = new THREE.PointLight(parseHexColor(theme.accentColor), 2.2, moduleCount * 3);
      accentLight.position.set(-moduleCount * 0.7, moduleCount * 0.8, -moduleCount * 0.6);
      scene.add(accentLight);

      // Ambient fill light for 3D depth
      const hemiLight = new THREE.HemisphereLight(
        parseHexColor(theme.secondaryColor),
        parseHexColor(theme.platformColor),
        0.5
      );
      scene.add(hemiLight);

      // 6. Base Quiet-Zone Panel (Crucial for 100% reliable camera scan!)
      // Guaranteed quiet zone: at least 4 modules margin on all sides => total width: moduleCount + 8
      const quietZoneModules = 8;
      const basePanelSize = (moduleCount + quietZoneModules);
      const basePanelGeo = new THREE.BoxGeometry(basePanelSize, 0.4, basePanelSize);
      const basePanelMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.05,
      });
      const basePanel = new THREE.Mesh(basePanelGeo, basePanelMat);
      basePanel.position.set(0, -0.2, 0);
      basePanel.receiveShadow = true;
      scene.add(basePanel);

      // 7. Decorative 3D Elements Group (scaled to 0 when in flat scannable mode)
      const decorGroup = new THREE.Group();
      scene.add(decorGroup);

      // 7a. Celestial Diorama Planet Base (Underneath the panel)
      const planetRadius = moduleCount * 0.72;
      const planetBaseGeo = new THREE.CylinderGeometry(planetRadius * 0.98, planetRadius * 1.06, 1.8, 36);
      const planetBaseMat = new THREE.MeshStandardMaterial({
        color: parseHexColor(theme.platformColor),
        roughness: 0.65,
        metalness: 0.2,
      });
      const planetBase = new THREE.Mesh(planetBaseGeo, planetBaseMat);
      planetBase.position.set(0, -1.2, 0);
      decorGroup.add(planetBase);

      // 7b. Stylized Orbital Rings
      const ringGeo = new THREE.TorusGeometry(moduleCount * 0.92, 0.22, 12, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: parseHexColor(theme.ringColor),
        roughness: 0.3,
        metalness: 0.6,
        emissive: parseHexColor(theme.ringColor),
        emissiveIntensity: 0.25,
      });
      const orbitRing = new THREE.Mesh(ringGeo, ringMat);
      orbitRing.rotation.x = Math.PI * 0.42;
      orbitRing.rotation.y = Math.PI * 0.12;
      orbitRing.position.set(0, -0.4, 0);
      decorGroup.add(orbitRing);

      // Secondary thin inner ring
      const innerRingGeo = new THREE.TorusGeometry(moduleCount * 0.82, 0.08, 8, 48);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: parseHexColor(theme.secondaryColor),
        transparent: true,
        opacity: 0.6,
      });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRing.rotation.x = Math.PI * 0.38;
      innerRing.position.set(0, -0.6, 0);
      decorGroup.add(innerRing);

      // 7c. Orbiting Mini Satellite / Cosmic Beacon
      const satGroup = new THREE.Group();
      const satCoreGeo = new THREE.OctahedronGeometry(0.8, 0);
      const satCoreMat = new THREE.MeshStandardMaterial({
        color: parseHexColor(theme.accentColor),
        emissive: parseHexColor(theme.accentColor),
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.2,
      });
      const satCore = new THREE.Mesh(satCoreGeo, satCoreMat);
      satGroup.add(satCore);
      decorGroup.add(satGroup);

      // 7d. Cosmic Particles Dust (Points)
      const particleCount = theme.particleCount;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleSpeeds = new Float32Array(particleCount);

      for (let p = 0; p < particleCount; p++) {
        const angle = Math.random() * Math.PI * 2;
        const rad = moduleCount * 0.6 + Math.random() * (moduleCount * 1.5);
        particlePositions[p * 3] = Math.cos(angle) * rad;
        particlePositions[p * 3 + 1] = (Math.random() - 0.5) * (moduleCount * 1.2);
        particlePositions[p * 3 + 2] = Math.sin(angle) * rad;
        particleSpeeds[p] = 0.2 + Math.random() * 0.8;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: parseHexColor(theme.particleColor),
        size: 0.45,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const cosmicParticles = new THREE.Points(particleGeo, particleMat);
      decorGroup.add(cosmicParticles);

      // 8. Build InstancedMesh for Dark QR Voxel Modules
      const matrix = qrData.matrix;
      let darkCount = 0;
      interface VoxelData {
        row: number;
        col: number;
        x: number;
        z: number;
        isFinder: boolean;
        color: THREE.Color;
        flatColor: THREE.Color;
      }
      const voxels: VoxelData[] = [];

      // Determine voxel geometry based on dotStyle
      let voxelGeo: THREE.BufferGeometry;
      const dotStyle = options.dotStyle || 'square';
      if (dotStyle === 'dots') {
        voxelGeo = new THREE.SphereGeometry(0.46, 16, 14);
      } else if (dotStyle === 'square') {
        voxelGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92);
      } else {
        // rounded / extra-rounded / classy => smooth cylinder
        voxelGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.92, 16);
      }

      // Base voxel material with specular response
      const voxelMat = new THREE.MeshStandardMaterial({
        roughness: 0.35,
        metalness: 0.15,
      });

      // User colors
      const userCol1 = parseHexColor(options.color1 || '#000000');
      const userCol2 = parseHexColor(options.color2 || options.color1 || '#10b981');
      const gradRotationRad = (options.gradientRotation || 45) * (Math.PI / 180);

      // Helper to compute contrast-safe color for flat scannable mode
      // Scannability rule: QR dots on white base must have high contrast (WCAG >= 3.0)
      function getContrastSafeColor(inputCol: THREE.Color): THREE.Color {
        const lum = getLuminance(inputCol);
        if (lum > 0.45) {
          // Color is too bright to scan reliably on white background -> darken it
          return inputCol.clone().multiplyScalar(0.25);
        }
        return inputCol.clone();
      }

      const halfCount = (moduleCount - 1) / 2;

      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (matrix[r][c]) {
            const x = c - halfCount;
            const z = r - halfCount;

            // Check if finder pattern (the 3 corner squares: 7x7)
            const isFinder =
              (r < 7 && c < 7) ||
              (r < 7 && c >= moduleCount - 7) ||
              (r >= moduleCount - 7 && c < 7);

            // Compute 3D gradient color
            let t = 0;
            if (options.gradientType === 'radial') {
              const maxDist = Math.SQRT2 * halfCount;
              t = Math.min(1, Math.hypot(x, z) / maxDist);
            } else if (options.gradientType === 'linear') {
              const proj = x * Math.cos(gradRotationRad) + z * Math.sin(gradRotationRad);
              t = Math.min(1, Math.max(0, (proj + halfCount) / moduleCount));
            }

            const col = userCol1.clone().lerp(userCol2, t);
            const flatCol = getContrastSafeColor(col);

            voxels.push({
              row: r,
              col: c,
              x,
              z,
              isFinder,
              color: col,
              flatColor: flatCol,
            });
            darkCount++;
          }
        }
      }

      // Create InstancedMesh
      const instancedMesh = new THREE.InstancedMesh(voxelGeo, voxelMat, darkCount);
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;
      scene.add(instancedMesh);

      // Dummy object for calculating transform matrix
      const dummy = new THREE.Object3D();
      const tempColor = new THREE.Color();

      // 9. Interactive Hover Raycasting
      const raycaster = new THREE.Raycaster();
      const mouseVec = new THREE.Vector2();
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);

      const handlePointerMove = (e: MouseEvent | TouchEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;
        if ('touches' in e && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
          clientX = (e as MouseEvent).clientX;
          clientY = (e as MouseEvent).clientY;
        }
        mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseVec, camera);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
          pointerPosRef.current = {
            x: intersectPoint.x,
            z: intersectPoint.z,
            active: true,
          };
        }
      };

      const handlePointerLeave = () => {
        pointerPosRef.current.active = false;
      };

      const dom = renderer.domElement;
      dom.addEventListener('mousemove', handlePointerMove);
      dom.addEventListener('mouseleave', handlePointerLeave);
      dom.addEventListener('touchmove', handlePointerMove, { passive: true });
      dom.addEventListener('touchend', handlePointerLeave);

      // 10. Window Resize Handling
      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
        const newW = containerRef.current.clientWidth;
        const newH = containerRef.current.clientHeight;
        cameraRef.current.aspect = newW / newH;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newW, newH);
      };
      window.addEventListener('resize', handleResize);

      // 11. Main Animation & Render Loop
      let rafId = 0;
      let clock = new THREE.Clock();

      const animate = () => {
        rafId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Smooth morph lerp (morphCurrent -> morphTarget)
        // 0 = 3D Diorama, 1 = Flat QR Scannable
        const targetMorph = morphTargetRef.current;
        morphCurrentRef.current += (targetMorph - morphCurrentRef.current) * Math.min(1, delta * 6.0);
        const morph = morphCurrentRef.current;

        // Camera transition
        if (morph > 0.001) {
          // Interpolate camera towards top-down flat position
          camera.position.lerp(flatCameraPos, Math.min(1, delta * 5.0 * morph));
          camera.up.lerp(new THREE.Vector3(0, 0, -1), Math.min(1, delta * 5.0 * morph));
          controls.target.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, delta * 5.0 * morph));
          
          if (morph > 0.98) {
            // Lock controls in flat mode so user cannot tilt and corrupt camera scan
            controls.enabled = false;
          } else {
            controls.enabled = true;
          }
        } else {
          controls.enabled = true;
        }

        controls.update();

        // Animate decorative elements (rotate ring, satellite, particles)
        orbitRing.rotation.z += delta * 0.15;
        innerRing.rotation.z -= delta * 0.22;

        const satAngle = time * 0.8;
        const satRadius = moduleCount * 0.88;
        satGroup.position.set(
          Math.cos(satAngle) * satRadius,
          Math.sin(time * 1.5) * 1.5 + 0.5,
          Math.sin(satAngle) * satRadius
        );
        satGroup.rotation.y += delta * 2.0;

        // Animate cosmic particles
        const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;
        for (let p = 0; p < particleCount; p++) {
          posArr[p * 3 + 1] += Math.sin(time + p) * 0.015;
        }
        posAttr.needsUpdate = true;

        // Morph decorative elements scale (scale to 0 in flat mode)
        const decorScale = Math.max(0.0001, 1 - morph);
        decorGroup.scale.set(decorScale, decorScale, decorScale);
        decorGroup.visible = decorScale > 0.01;

        // Adjust lighting based on morph
        // In flat mode: uniform neutral bright ambient light, no harsh directional shadows
        neutralFlatLight.intensity = THREE.MathUtils.lerp(0.2, 1.6, morph);
        dirLight.intensity = THREE.MathUtils.lerp(theme.ambientIntensity + 0.6, 0.1, morph);
        accentLight.intensity = THREE.MathUtils.lerp(2.2, 0.0, morph);

        // Update InstancedMesh Voxel Transforms & Colors
        const pointer = pointerPosRef.current;
        for (let i = 0; i < darkCount; i++) {
          const v = voxels[i];

          // 3D elevation formula
          let y3D = 1.0;
          if (v.isFinder) {
            // Finder beacon towers sit steady and prominent
            y3D = 1.8 + Math.sin(time * 2.0) * 0.15;
          } else {
            // Cosmic undulating wave
            const wave = Math.sin(v.row * 0.38 + v.col * 0.38 + time * 2.0) * 0.45;
            const distCenter = Math.hypot(v.x, v.z);
            const rippleCenter = Math.cos(distCenter * 0.32 - time * 1.8) * 0.35;
            y3D = 1.1 + wave + rippleCenter;

            // Interactive pointer ripple
            if (pointer.active && morph < 0.5) {
              const pointerDist = Math.hypot(v.x - pointer.x, v.z - pointer.z);
              if (pointerDist < 4.5) {
                const pointerRipple = (1 - pointerDist / 4.5) * Math.sin(time * 10 - pointerDist * 2.0) * 0.6;
                y3D += pointerRipple;
              }
            }
          }

          // Flat elevation (flat on base plate with height = 0.05)
          const yFlat = 0.05;
          const currentY = THREE.MathUtils.lerp(y3D, yFlat, morph);

          // Voxel scale (flatten slightly in Y in flat mode for a neat flush surface)
          const scaleY = THREE.MathUtils.lerp(1.0, 0.15, morph);

          dummy.position.set(v.x, currentY, v.z);
          dummy.scale.set(1.0, scaleY, 1.0);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();

          instancedMesh.setMatrixAt(i, dummy.matrix);

          // Interpolate color (3D theme color -> flat high-contrast scannable color)
          tempColor.copy(v.color).lerp(v.flatColor, morph);
          instancedMesh.setColorAt(i, tempColor);
        }

        instancedMesh.instanceMatrix.needsUpdate = true;
        if (instancedMesh.instanceColor) {
          instancedMesh.instanceColor.needsUpdate = true;
        }

        renderer.render(scene, camera);
      };

      animate();

      // 12. Cleanup (Dispose everything to prevent memory leaks)
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', handleResize);
        dom.removeEventListener('mousemove', handlePointerMove);
        dom.removeEventListener('mouseleave', handlePointerLeave);
        dom.removeEventListener('touchmove', handlePointerMove);
        dom.removeEventListener('touchend', handlePointerLeave);

        controls.dispose();

        // Traverse & dispose geometries, materials, textures
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });

        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }, [options, qrData, theme, themeMode]);

    return (
      <div className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center overflow-hidden rounded-2xl select-none">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>
    );
  }
);

OrbitPlaygroundScene.displayName = 'OrbitPlaygroundScene';
