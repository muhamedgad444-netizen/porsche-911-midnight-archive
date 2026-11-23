import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FLEET_SPECS } from '../data/fleet';
import { CameraPreset, ChassisId, LightingMood } from '../types';
import { useLenis } from '../context/LenisContext';

interface PorscheStageProps {
  chassis: ChassisId;
  mood?: LightingMood;
  preset?: CameraPreset;
  autoRotate?: boolean;
  interactive?: boolean;
  scrollLinked?: boolean;
  wireframe?: boolean;
  paused?: boolean;
  targetScale?: number;
  className?: string;
}

const PRESET_ANGLES: Record<
  CameraPreset,
  { azimuth: number; elevation: number; distance: number; lookY: number }
> = {
  hero: { azimuth: -0.56, elevation: 0.19, distance: 4.85, lookY: 0.42 },
  profile: { azimuth: Math.PI * 0.5, elevation: 0.11, distance: 5.1, lookY: 0.42 },
  rear: { azimuth: Math.PI + 0.55, elevation: 0.19, distance: 4.85, lookY: 0.42 },
  top: { azimuth: -0.35, elevation: 1.05, distance: 5.4, lookY: 0.18 },
};

const MOOD_RIGS: Record<
  LightingMood,
  {
    exposure: number;
    keyColor: number;
    keyIntensity: number;
    leftColor: number;
    leftIntensity: number;
    rightColor: number;
    rightIntensity: number;
    ringColor: number;
  }
> = {
  cyber: {
    exposure: 1.65,
    keyColor: 0xeef6ff,
    keyIntensity: 3.4,
    leftColor: 0x0070ff,
    leftIntensity: 6.5,
    rightColor: 0x00e5ff,
    rightIntensity: 5.2,
    ringColor: 0x0099ff,
  },
  stuttgart: {
    exposure: 1.85,
    keyColor: 0xffffff,
    keyIntensity: 4.6,
    leftColor: 0xdbeafe,
    leftIntensity: 3.6,
    rightColor: 0xe2e8f0,
    rightIntensity: 3.6,
    ringColor: 0x94a3b8,
  },
  acid: {
    exposure: 1.58,
    keyColor: 0xdbeafe,
    keyIntensity: 2.9,
    leftColor: 0x7c3aed,
    leftIntensity: 6.8,
    rightColor: 0x22d3ee,
    rightIntensity: 5.8,
    ringColor: 0x818cf8,
  },
};

function createShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size * 0.48
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.45)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createTurntableTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  const baseGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, size * 0.48);
  baseGrad.addColorStop(0, 'rgba(12, 22, 38, 0.62)');
  baseGrad.addColorStop(0.65, 'rgba(6, 12, 22, 0.35)');
  baseGrad.addColorStop(1, 'rgba(3, 4, 6, 0)');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  const radii = [size * 0.24, size * 0.36, size * 0.45];
  radii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx === 2 ? 'rgba(0, 229, 255, 0.32)' : 'rgba(0, 112, 255, 0.22)';
    ctx.lineWidth = idx === 2 ? 2 : 1;
    if (idx === 1) ctx.setLineDash([8, 10]);
    else ctx.setLineDash([]);
    ctx.stroke();
  });

  ctx.setLineDash([]);
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const inner = i % 6 === 0 ? size * 0.425 : size * 0.44;
    const outer = size * 0.455;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.strokeStyle = i % 6 === 0 ? 'rgba(0, 229, 255, 0.55)' : 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = i % 6 === 0 ? 1.5 : 1;
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function disposeObject3D(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        if (!mat) return;
        for (const val of Object.values(mat)) {
          if (val && (val as THREE.Texture).isTexture) {
            (val as THREE.Texture).dispose();
          }
        }
        mat.dispose();
      });
    }
  });
}

interface StageRig {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  keyLight: THREE.DirectionalLight;
  leftRim: THREE.DirectionalLight;
  rightRim: THREE.DirectionalLight;
  ringMat: THREE.MeshBasicMaterial;
  modelGroup: THREE.Group;
  gltfLoader: GLTFLoader;
  userAzimuthOffset: number;
  userElevationOffset: number;
}

export const PorscheStage: React.FC<PorscheStageProps> = ({
  chassis,
  mood = 'cyber',
  preset = 'hero',
  autoRotate = true,
  interactive = true,
  scrollLinked = false,
  wireframe = false,
  paused = false,
  targetScale = 3.55,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYRef } = useLenis();
  const [loadPct, setLoadPct] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rigReady, setRigReady] = useState(false);

  const moodRef = useRef(mood);
  const presetRef = useRef(preset);
  const autoRotateRef = useRef(autoRotate);
  const wireframeRef = useRef(wireframe);
  const scrollLinkedRef = useRef(scrollLinked);
  const pausedRef = useRef(paused);
  const targetScaleRef = useRef(targetScale);
  const rigRef = useRef<StageRig | null>(null);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    presetRef.current = preset;
  }, [preset]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    wireframeRef.current = wireframe;
  }, [wireframe]);

  useEffect(() => {
    scrollLinkedRef.current = scrollLinked;
  }, [scrollLinked]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (rigRef.current) {
      rigRef.current.userAzimuthOffset = 0;
      rigRef.current.userElevationOffset = 0;
    }
  }, [preset]);

  // Apply wireframe live
  useEffect(() => {
    const group = rigRef.current?.modelGroup;
    if (!group) return;
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (m && 'wireframe' in m) {
            (m as THREE.MeshStandardMaterial).wireframe = wireframe;
          }
        });
      }
    });
  }, [wireframe, isLoaded]);

  // Apply lighting mood live
  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    const cfg = MOOD_RIGS[mood];
    rig.renderer.toneMappingExposure = cfg.exposure;
    rig.keyLight.color.setHex(cfg.keyColor);
    rig.keyLight.intensity = cfg.keyIntensity;
    rig.leftRim.color.setHex(cfg.leftColor);
    rig.leftRim.intensity = cfg.leftIntensity;
    rig.rightRim.color.setHex(cfg.rightColor);
    rig.rightRim.intensity = cfg.rightIntensity;
    rig.ringMat.color.setHex(cfg.ringColor);
  }, [mood]);

  // Effect 1: Create ONE persistent WebGLRenderer + RoomEnvironment + Studio Turntable per mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let inView = true;

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    const initialPreset = PRESET_ANGLES[presetRef.current];
    camera.position.set(
      Math.sin(initialPreset.azimuth) * initialPreset.distance,
      initialPreset.elevation * initialPreset.distance + initialPreset.lookY,
      Math.cos(initialPreset.azimuth) * initialPreset.distance
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = MOOD_RIGS[moodRef.current].exposure;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio PBR environment reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envRT = pmrem.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;
    envScene.dispose();

    // Cyber-Kinetic Lighting Rig
    const cfg = MOOD_RIGS[moodRef.current];
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x060b14, 1.15);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(cfg.keyColor, cfg.keyIntensity);
    keyLight.position.set(3.5, 7.5, 5.2);
    scene.add(keyLight);

    const leftRim = new THREE.DirectionalLight(cfg.leftColor, cfg.leftIntensity);
    leftRim.position.set(-6.5, 2.8, -2.5);
    scene.add(leftRim);

    const rightRim = new THREE.DirectionalLight(cfg.rightColor, cfg.rightIntensity);
    rightRim.position.set(6.5, 2.2, -3.5);
    scene.add(rightRim);

    const underFill = new THREE.PointLight(0x0070ff, 2.4, 9);
    underFill.position.set(0, 0.6, 0);
    scene.add(underFill);

    // Grounded Studio Floor + Turntable Ring + Contact Shadow
    const turntableTex = createTurntableTexture();
    const floorGeo = new THREE.PlaneGeometry(7.2, 7.2);
    const floorMat = new THREE.MeshBasicMaterial({
      map: turntableTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.92,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.02;
    scene.add(floorMesh);

    const ringGeo = new THREE.RingGeometry(2.52, 2.57, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: cfg.ringColor,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.015;
    scene.add(ringMesh);

    const shadowTex = createShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(4.5, 2.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.88,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.01;
    scene.add(shadowMesh);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Reusable Loaders (local basis, draco & meshopt — zero CDN dependency!)
    const gltfLoader = new GLTFLoader();
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('/basis/');
    ktx2Loader.detectSupport(renderer);
    gltfLoader.setKTX2Loader(ktx2Loader);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    gltfLoader.setDRACOLoader(dracoLoader);

    const rigState: StageRig = {
      renderer,
      scene,
      keyLight,
      leftRim,
      rightRim,
      ringMat,
      modelGroup,
      gltfLoader,
      userAzimuthOffset: 0,
      userElevationOffset: 0,
    };
    rigRef.current = rigState;
    setRigReady(true);

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let hoverX = 0;
    let hoverY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      hoverX = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      hoverY = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;

      if (isDragging && interactive) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        rigState.userAzimuthOffset -= dx * 0.0085;
        rigState.userElevationOffset = THREE.MathUtils.clamp(
          rigState.userElevationOffset + dy * 0.005,
          -0.14,
          0.72
        );
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      renderer.domElement.releasePointerCapture?.(e.pointerId);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    const ro = new ResizeObserver(() => {
      if (disposed || !container) return;
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 }
    );
    io.observe(container);

    let curAzimuth = initialPreset.azimuth;
    let curElevation = initialPreset.elevation;
    let curDistance = initialPreset.distance;
    let curLookY = initialPreset.lookY;
    let autoSpin = 0;

    const clock = new THREE.Clock();
    let rafId = 0;

    const animate = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);
      if (!inView || document.hidden || pausedRef.current) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      if (autoRotateRef.current && !isDragging) {
        autoSpin += dt * 0.24;
      }

      const target = PRESET_ANGLES[presetRef.current];
      const scrollNorm = scrollLinkedRef.current
        ? THREE.MathUtils.clamp(scrollYRef.current / Math.max(window.innerHeight, 1), 0, 1.2)
        : 0;

      const aspectBoost = camera.aspect < 1 ? (1 / Math.max(camera.aspect, 0.45)) * 1.05 : 1.0;

      const goalAzimuth =
        target.azimuth +
        autoSpin +
        rigState.userAzimuthOffset +
        scrollNorm * 1.15 +
        (isDragging ? 0 : hoverX * 0.16);
      const goalElevation = THREE.MathUtils.clamp(
        target.elevation +
          rigState.userElevationOffset +
          scrollNorm * 0.12 +
          (isDragging ? 0 : -hoverY * 0.05),
        0.06,
        1.2
      );
      const goalDistance = (target.distance + scrollNorm * 0.85) * aspectBoost;
      const goalLookY = target.lookY;

      const damp = 1 - Math.exp(-5.5 * dt);
      curAzimuth += (goalAzimuth - curAzimuth) * damp;
      curElevation += (goalElevation - curElevation) * damp;
      curDistance += (goalDistance - curDistance) * damp;
      curLookY += (goalLookY - curLookY) * damp;

      const horiz = Math.cos(curElevation) * curDistance;
      camera.position.set(
        Math.sin(curAzimuth) * horiz,
        Math.sin(curElevation) * curDistance + curLookY,
        Math.cos(curAzimuth) * horiz
      );
      camera.lookAt(0, curLookY, 0);

      floorMesh.rotation.z = elapsed * 0.08;
      ringMat.opacity = 0.36 + Math.sin(elapsed * 2.1) * 0.14;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      setRigReady(false);
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      disposeObject3D(modelGroup);
      floorGeo.dispose();
      floorMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      turntableTex.dispose();
      shadowTex.dispose();
      envRT.dispose();
      pmrem.dispose();
      ktx2Loader.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      rigRef.current = null;
    };
  }, [interactive, scrollYRef]);

  // Effect 2: Swap ONLY the chassis mesh inside modelGroup when `chassis` changes (zero WebGL context churn!)
  useEffect(() => {
    const rig = rigRef.current;
    if (!rigReady || !rig) return;

    let cancelled = false;
    setIsLoaded(false);
    setLoadPct(0);
    setLoadError(null);

    // Clear previous chassis mesh cleanly
    while (rig.modelGroup.children.length > 0) {
      const child = rig.modelGroup.children[0];
      rig.modelGroup.remove(child);
      disposeObject3D(child);
    }

    const spec = FLEET_SPECS[chassis];

    const mountModel = (gltfScene: THREE.Group) => {
      if (cancelled || !rigRef.current) {
        disposeObject3D(gltfScene);
        return;
      }

      const box = new THREE.Box3().setFromObject(gltfScene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = (targetScaleRef.current * spec.scaleMultiplier) / maxDim;
      gltfScene.scale.setScalar(scale);

      const scaledBox = new THREE.Box3().setFromObject(gltfScene);
      const center = scaledBox.getCenter(new THREE.Vector3());
      gltfScene.position.set(-center.x, -scaledBox.min.y + spec.yOffset, -center.z);

      gltfScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            const std = m as THREE.MeshStandardMaterial;
            if (std && 'envMapIntensity' in std) {
              std.envMapIntensity = 1.45;
              std.wireframe = wireframeRef.current;
              std.needsUpdate = true;
            }
          });
        }
      });

      rigRef.current.modelGroup.add(gltfScene);
      setLoadPct(100);
      setIsLoaded(true);
    };

    const loadUrl = (url: string, allowFallback: boolean) => {
      rig.gltfLoader.load(
        url,
        (gltf) => mountModel(gltf.scene),
        (xhr) => {
          if (!cancelled && xhr.total > 0) {
            setLoadPct(Math.min(99, Math.round((xhr.loaded / xhr.total) * 100)));
          }
        },
        () => {
          if (cancelled) return;
          if (allowFallback && spec.fallbackUrl && spec.fallbackUrl !== url) {
            loadUrl(spec.fallbackUrl, false);
          } else {
            setLoadError('CHASSIS MESH UNAVAILABLE');
          }
        }
      );
    };

    loadUrl(spec.modelUrl, true);

    return () => {
      cancelled = true;
    };
  }, [chassis, rigReady]);

  return (
    <div
      className={`relative w-full h-full select-none ${className}`}
      data-cursor={interactive ? 'ORBIT' : undefined}
    >
      <div ref={containerRef} className="w-full h-full touch-pan-y" />

      {!isLoaded && !loadError && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-[#030406]/55 backdrop-blur-sm">
          <div className="font-mono text-[10px] tracking-[0.35em] text-cyanHud uppercase mb-3">
            DECODING KTX2 CHASSIS // {FLEET_SPECS[chassis].name}
          </div>
          <div className="w-44 h-[2px] bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-shark to-cyanHud transition-all duration-150"
              style={{ width: `${Math.max(loadPct, 12)}%` }}
            />
          </div>
          <div className="font-mono text-[10px] tracking-widest text-slate-400 mt-2">
            {loadPct > 0 ? `${loadPct}%` : 'INIT STUDIO RIG'}
          </div>
        </div>
      )}

      {loadError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="border border-red-500/40 bg-red-950/40 px-4 py-2 font-mono text-[11px] tracking-widest text-red-300">
            {loadError}
          </div>
        </div>
      )}
    </div>
  );
};
