/**
 * ANTIGRAVITY.JS — Zero-G Cinematic Particle System v2.0
 * · 2500 particles (halved) — single GPU draw call
 * · Worker offsets applied every 2nd frame
 * · No per-frame seedArray copy — reuse buffer
 * · Delta-time animation
 */

const WORKER_SRC = /* js */`
  function hash(n) {
    let x = Math.sin(n) * 43758.5453123;
    return x - Math.floor(x);
  }

  function noise3(x, y, z) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = x - ix, fy = y - iy, fz = z - iz;
    const ux = fx*fx*fx*(fx*(fx*6-15)+10);
    const uy = fy*fy*fy*(fy*(fy*6-15)+10);
    const uz = fz*fz*fz*(fz*(fz*6-15)+10);

    const a  = hash(ix     + iy*57     + iz*131);
    const b  = hash(ix+1   + iy*57     + iz*131);
    const c  = hash(ix     + (iy+1)*57 + iz*131);
    const d  = hash(ix+1   + (iy+1)*57 + iz*131);
    const e  = hash(ix     + iy*57     + (iz+1)*131);
    const f  = hash(ix+1   + iy*57     + (iz+1)*131);
    const g  = hash(ix     + (iy+1)*57 + (iz+1)*131);
    const h  = hash(ix+1   + (iy+1)*57 + (iz+1)*131);

    const lerp = (a,b,t) => a + (b-a)*t;
    return lerp(lerp(lerp(a,b,ux), lerp(c,d,ux), uy),
                lerp(lerp(e,f,ux), lerp(g,h,ux), uy), uz) * 2 - 1;
  }

  self.onmessage = function(e) {
    const { time, count, seeds, speedMult } = e.data;
    const offsets = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const s  = seeds[i];
      const t  = time * 0.35 + s * 6.28318;
      const ox = noise3(s * 2.1,  t,            s * 0.7)  * 1.2;
      const oy = noise3(s * 1.3,  s * 0.9,     t + 1.7)  * 1.2;
      const oz = noise3(t + 3.4,  s * 1.8,     s * 2.3)  * 0.6;
      const sine = Math.sin(t * 0.8 + s * 3.14) * 0.4;

      offsets[i*3]   = ox * speedMult;
      offsets[i*3+1] = (oy + sine) * speedMult;
      offsets[i*3+2] = oz * speedMult;
    }

    self.postMessage({ offsets }, [offsets.buffer]);
  };
`;

export async function initAntigravity(canvas) {
    const THREE = await import('three');

    const PARTICLE_COUNT = 2500;
    const SPAWN_RADIUS = 28;
    const SCROLL_STRENGTH = 0.004;
    const SPEED_MULT = 1.0;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        stencil: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60, window.innerWidth / window.innerHeight, 0.1, 200
    );
    camera.position.set(0, 0, 18);

    const vertexShader = /* glsl */`
      uniform float uTime;
      uniform vec2  uMouse;
      uniform vec2  uGravityDir;
      uniform float uPixelRatio;
      attribute float aSeed;
      varying float vBrightness;

      vec3 mod289v(vec3 x) { return x - floor(x*(1./289.))*289.; }
      vec4 mod289v(vec4 x) { return x - floor(x*(1./289.))*289.; }
      vec4 permute4(vec4 x){ return mod289v(((x*34.)+1.)*x); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

      float snoise(vec3 v) {
        const vec2  C = vec2(1./6., 1./3.);
        const vec4  D = vec4(0., .5, 1., 2.);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g  = step(x0.yzx, x0.xyz);
        vec3 l  = 1. - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289v(i);
        vec4 p = permute4(permute4(permute4(
          i.z + vec4(0., i1.z, i2.z, 1.))
          + i.y + vec4(0., i1.y, i2.y, 1.))
          + i.x + vec4(0., i1.x, i2.x, 1.));
        float n_ = 1./7.;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j  = p - 49.*floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.*x_);
        vec4 x  = x_*ns.x + ns.yyyy;
        vec4 y  = y_*ns.x + ns.yyyy;
        vec4 h  = 1. - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.+1.;
        vec4 s1 = floor(b1)*2.+1.;
        vec4 sh = -step(h, vec4(0.));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 g0 = vec3(a0.xy, h.x);
        vec3 g1 = vec3(a0.zw, h.y);
        vec3 g2 = vec3(a1.xy, h.z);
        vec3 g3 = vec3(a1.zw, h.w);
        vec4 norm= taylorInvSqrt(vec4(dot(g0,g0),dot(g1,g1),dot(g2,g2),dot(g3,g3)));
        g0 *= norm.x; g1 *= norm.y; g2 *= norm.z; g3 *= norm.w;
        vec4 m  = max(.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.);
        m = m * m;
        return 42. * dot(m*m, vec4(dot(g0,x0),dot(g1,x1),dot(g2,x2),dot(g3,x3)));
      }

      void main() {
        vec4 worldPos = instanceMatrix * vec4(position, 1.0);
        float phase = uTime * 0.4 + aSeed * 6.283185;
        float wx = snoise(vec3(worldPos.x * 0.12, worldPos.y * 0.12, phase));
        float wy = snoise(vec3(worldPos.y * 0.12, worldPos.z * 0.12, phase + 1.7));
        float wz = snoise(vec3(worldPos.z * 0.12, worldPos.x * 0.12, phase + 3.4));
        wy += sin(phase) * 0.18;
        worldPos.xyz += vec3(wx, wy, wz) * 0.35;
        worldPos.xy += uGravityDir * 0.25;

        vec4 clipPos = projectionMatrix * viewMatrix * worldPos;
        vec2 ndcPos  = clipPos.xy / clipPos.w;
        vec2 toMouse = ndcPos - uMouse;
        float mDist  = length(toMouse);
        float mForce = smoothstep(0.35, 0.0, mDist) * 1.2;
        worldPos.xy -= normalize(toMouse + vec2(0.0001)) * mForce * 0.8;

        vBrightness = 0.4 + snoise(vec3(aSeed * 7., phase * 0.3, 0.)) * 0.5;
        vBrightness = clamp(vBrightness, 0.15, 1.0);

        gl_Position  = projectionMatrix * viewMatrix * worldPos;
        float dist   = length(worldPos.xyz - cameraPosition);
        gl_PointSize = (3.5 + aSeed * 2.5) * uPixelRatio * (18.0 / max(dist, 1.0));
      }
    `;

    const fragmentShader = /* glsl */`
      varying float vBrightness;
      void main() {
        vec2  coord = gl_PointCoord - 0.5;
        float r     = length(coord);
        if (r > 0.5) discard;
        float alpha = (1.0 - r * 2.0);
        alpha = pow(alpha, 1.6);
        vec3 color = mix(
          vec3(0.55, 0.72, 1.0),
          vec3(1.0,  1.0,  1.0),
          vBrightness
        );
        gl_FragColor = vec4(color, alpha * vBrightness * 0.75);
      }
    `;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));

    const seedArray = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) seedArray[i] = Math.random();
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seedArray, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uGravityDir: { value: new THREE.Vector2(0, 0) },
            uPixelRatio: { value: renderer.getPixelRatio() }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const dummy = new THREE.Object3D();
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.cbrt(Math.random()) * SPAWN_RADIUS;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi) * 0.4;
        basePositions[i * 3] = x;
        basePositions[i * 3 + 1] = y;
        basePositions[i * 3 + 2] = z;
        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    const workerBlob = new Blob([WORKER_SRC], { type: 'application/javascript' });
    const workerURL = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerURL);

    let workerBusy = false;
    let latestOffsets = null;
    // Reusable seed buffer — never re-allocate
    const seedsForWorker = new Float32Array(seedArray);

    worker.onmessage = (e) => {
        latestOffsets = e.data.offsets;
        workerBusy = false;
    };

    let mouseNDC = { x: 0, y: 0 };
    let gravityDir = { x: 0, y: 0 };
    let lastScrollY = window.scrollY;
    let gravityVelX = 0, gravityVelY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener('scroll', () => {
        const dy = window.scrollY - lastScrollY;
        gravityVelY -= dy * SCROLL_STRENGTH;
        lastScrollY = window.scrollY;
    }, { passive: true });

    // Resize — debounced
    let _rt = null;
    window.addEventListener('resize', () => {
        clearTimeout(_rt);
        _rt = setTimeout(() => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
        }, 100);
    });

    const clock = new THREE.Clock();
    let rafId = null;
    let frameCount = 0;

    function animate() {
        rafId = requestAnimationFrame(animate);
        frameCount++;

        const time = clock.getElapsedTime();

        gravityVelX *= 0.92;
        gravityVelY *= 0.92;
        gravityDir.x += gravityVelX;
        gravityDir.y += gravityVelY;
        gravityDir.x = Math.max(-3, Math.min(3, gravityDir.x));
        gravityDir.y = Math.max(-3, Math.min(3, gravityDir.y));

        material.uniforms.uTime.value = time;
        material.uniforms.uMouse.value.set(mouseNDC.x, mouseNDC.y);
        material.uniforms.uGravityDir.value.set(gravityDir.x, gravityDir.y);

        // Only dispatch worker every 2nd frame — halves CPU cost
        if (!workerBusy && (frameCount & 1) === 0) {
            workerBusy = true;
            // Copy seeds into reusable buffer (no new allocation)
            seedsForWorker.set(seedArray);
            const transferBuf = new Float32Array(seedsForWorker);
            worker.postMessage(
                { time, count: PARTICLE_COUNT, seeds: transferBuf, speedMult: SPEED_MULT },
                [transferBuf.buffer]
            );
        }

        // Apply latest offsets
        if (latestOffsets) {
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;
                dummy.position.set(
                    basePositions[i3]     + latestOffsets[i3],
                    basePositions[i3 + 1] + latestOffsets[i3 + 1],
                    basePositions[i3 + 2] + latestOffsets[i3 + 2]
                );
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }
            mesh.instanceMatrix.needsUpdate = true;
            latestOffsets = null;
        }

        renderer.render(scene, camera);
    }

    animate();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(rafId);
            rafId = null;
        } else if (!rafId) {
            animate();
        }
    });

    return {
        dispose() {
            cancelAnimationFrame(rafId);
            worker.terminate();
            URL.revokeObjectURL(workerURL);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        }
    };
}
