import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

interface ZeroGPortalProps {
  onEnter: () => void;
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uWarp;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vBrightness;
  varying float vWarp;

  vec3 mod289v(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289v(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute4(vec4 x) { return mod289v(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289v(i);
    vec4 p = permute4(permute4(permute4(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 g0 = vec3(a0.xy, h.x);
    vec3 g1 = vec3(a0.zw, h.y);
    vec3 g2 = vec3(a1.xy, h.z);
    vec3 g3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
    g0 *= norm.x; g1 *= norm.y; g2 *= norm.z; g3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
  }

  void main() {
    vec4 worldPos = instanceMatrix * vec4(position, 1.0);
    float phase = uTime * 0.42 + aSeed * 6.283185;
    float wx = snoise(vec3(worldPos.x * 0.12, worldPos.y * 0.12, phase));
    float wy = snoise(vec3(worldPos.y * 0.12, worldPos.z * 0.12, phase + 1.7));
    float wz = snoise(vec3(worldPos.z * 0.12, worldPos.x * 0.12, phase + 3.4));
    worldPos.xyz += vec3(wx, wy + sin(phase) * 0.22, wz) * 0.55;

    // Hyperspace Z-Warp acceleration
    float zShift = mod(worldPos.z + uWarp * (28.0 + aSeed * 36.0) + 20.0, 42.0) - 20.0;
    worldPos.z = mix(worldPos.z, zShift, step(0.01, uWarp));
    worldPos.xy *= 1.0 + uWarp * 0.55;

    vec4 clipPos = projectionMatrix * viewMatrix * worldPos;
    vec2 ndcPos = clipPos.xy / max(clipPos.w, 0.001);
    vec2 toMouse = ndcPos - uMouse;
    float mDist = length(toMouse);
    float mForce = smoothstep(0.42, 0.0, mDist) * 1.45;
    worldPos.xy -= normalize(toMouse + vec2(0.0001)) * mForce * 0.9;

    vBrightness = clamp(0.45 + snoise(vec3(aSeed * 7.0, phase * 0.3, 0.0)) * 0.55, 0.2, 1.0);
    vWarp = uWarp;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
    float dist = length(worldPos.xyz - cameraPosition);
    gl_PointSize = (3.4 + aSeed * 2.8 + uWarp * 5.0) * uPixelRatio * (18.0 / max(dist, 1.0));
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying float vBrightness;
  varying float vWarp;
  void main() {
    vec2 coord = gl_PointCoord - 0.5;
    float r = length(coord);
    if (r > 0.5) discard;
    float alpha = pow(1.0 - r * 2.0, 1.5);
    vec3 shark = vec3(0.0, 0.44, 1.0);
    vec3 cyan = vec3(0.0, 0.9, 1.0);
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 baseCol = mix(shark, cyan, vBrightness);
    vec3 finalCol = mix(baseCol, white, clamp(vBrightness * 0.65 + vWarp * 0.5, 0.0, 1.0));
    gl_FragColor = vec4(finalCol, alpha * (0.65 + vWarp * 0.35));
  }
`;

export const ZeroGPortal: React.FC<ZeroGPortalProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const warpTargetRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [warping, setWarping] = useState(false);

  // Smooth telemetry boot meter
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / 1450) * 100));
      setProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Three.js GPU-Instanced Zero-G Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const PARTICLE_COUNT = 2800;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 160);
    camera.position.set(0, 0, 18);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    const seedArray = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) seedArray[i] = Math.random();
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seedArray, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uWarp: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT);
    mesh.frustumCulled = false;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * 27;
      dummy.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi) * 0.55
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let curWarp = 0;
    let rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      curWarp += (warpTargetRef.current - curWarp) * (1 - Math.exp(-3.4 * dt));
      material.uniforms.uTime.value = clock.elapsedTime;
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
      material.uniforms.uWarp.value = curWarp;

      camera.fov = 60 + curWarp * 36;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const triggerWarp = () => {
    if (warping) return;
    setWarping(true);
    warpTargetRef.current = 1.8;
    window.setTimeout(() => {
      onEnter();
    }, 950);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerWarp();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [warping]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: warping ? 0 : 1, scale: warping ? 1.07 : 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[80] overflow-hidden bg-[#030406] cyber-grid-bg flex flex-col items-center justify-center"
    >
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" />
      <div className="cyber-scanline" />

      {/* Radial Shark-Blue Ambient Core */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(0, 112, 255, 0.18) 0%, rgba(0, 229, 255, 0.06) 28%, rgba(3, 4, 6, 0.92) 74%)',
        }}
      />

      {/* Corner Telemetry HUD */}
      <div className="fixed top-6 left-6 z-20 hidden sm:flex flex-col gap-1 font-mono text-[10px] tracking-[0.26em] text-slate-400">
        <span className="text-cyanHud">STUTTGART_NET // ZERO-G LINK</span>
        <span>FLEET_READY: 992 GT3 · 911 S/T · 918 SPYDER</span>
      </div>

      <div className="fixed top-6 right-6 z-20 flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.26em] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-cyanHud animate-pulse" />
          <span>WEBGL_V2 // ONLINE</span>
        </div>
        <button
          onClick={onEnter}
          data-cursor="SKIP"
          className="font-mono text-[10px] tracking-[0.28em] uppercase text-slate-400 hover:text-cyanHud border border-white/10 hover:border-cyanHud/40 px-3 py-1.5 transition-colors"
        >
          SKIP_BOOT →
        </button>
      </div>

      {/* Main Centered Lockup */}
      <div className="relative z-10 max-w-4xl px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 border border-shark/40 bg-shark/10 px-4 py-1.5 mb-6 chamfer-sm"
        >
          <Zap className="w-3.5 h-3.5 text-cyanHud" />
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.38em] text-cyanHud uppercase">
            STUTTGART BLUE ARCHIVE // ACCESS TERMINAL
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.28em', y: 18 }}
          animate={{ opacity: 1, letterSpacing: '0.06em', y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold italic uppercase leading-[0.88] tracking-wider text-[clamp(2.4rem,9vw,6.8rem)]"
        >
          <span className="block text-white drop-shadow-[0_0_32px_rgba(0,112,255,0.45)]">
            MIDNIGHT
          </span>
          <span className="block bg-gradient-to-r from-shark via-cyanHud to-sky-300 bg-clip-text text-transparent">
            ARCHIVE
          </span>
        </motion.h1>

        {/* System Link Boot Bar */}
        <div className="w-full max-w-md mt-8 mb-9">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.28em] text-slate-400 mb-2">
            <span>{warping ? 'ENGAGING HYPERSPACE WARP...' : 'SYSTEM_LINK_CALIBRATION'}</span>
            <span className="text-cyanHud">{progress}%</span>
          </div>
          <div className="h-[3px] w-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-shark via-cyanHud to-white transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cyber Entry Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={triggerWarp}
          data-cursor="WARP"
          className="group relative inline-flex items-center gap-4 px-9 py-4 chamfer bg-gradient-to-r from-shark to-cyan-500 text-white font-display text-xs sm:text-sm font-bold tracking-[0.26em] uppercase shadow-shark hover:shadow-cyan transition-all"
        >
          <span>{warping ? 'WARPING TO SHOWROOM' : 'INITIATE ENTRY PROTOCOL'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
        </motion.button>

        <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-slate-500 uppercase">
          MOVE POINTER TO BEND ZERO-G FIELD · PRESS [ENTER] TO WARP
        </p>
      </div>

      {/* Bottom Corner Telemetry */}
      <div className="fixed bottom-6 left-6 right-6 z-20 flex items-center justify-between font-mono text-[10px] tracking-[0.24em] text-slate-500">
        <span>CHASSIS_POOL: 03 ACTIVE GLB</span>
        <span className="hidden sm:inline">COLOR_SPEC: SHARK_BLUE // CYBER_CYAN</span>
        <span className="text-cyanHud/80">STATUS: VERIFIED</span>
      </div>
    </motion.div>
  );
};
