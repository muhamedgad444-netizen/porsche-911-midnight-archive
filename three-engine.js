import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'https://unpkg.com/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js';

class ThreeEngine {
    constructor() {
        this.scenes = new Map();
        this._modelCache = new Map();
        this._ktx2Ready = false;
        this.ktx2Loader = new KTX2Loader();
        this.ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/');
        this.loader = new GLTFLoader();
        this.loader.setKTX2Loader(this.ktx2Loader);
        this.loader.setMeshoptDecoder(MeshoptDecoder);
    }

    async init(containerId, modelPath, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        this._destroy(containerId);

        const w = container.clientWidth || 800;
        const h = container.clientHeight || 600;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        const baseExposure = 2.4;
        renderer.toneMappingExposure = baseExposure;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.zIndex = '0';
        container.prepend(renderer.domElement);

        if (!this._ktx2Ready) { this.ktx2Loader.detectSupport(renderer); this._ktx2Ready = true; }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 500);
        camera.position.z = options.cameraZ || 5;

        scene.add(new THREE.AmbientLight(0xffffff, 2.5));
        const keyLight = new THREE.DirectionalLight(0xffffff, 5.0);
        keyLight.position.set(5, 8, 5);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0xaaaaee, 2.5);
        rimLight.position.set(-5, 0, -5);
        scene.add(rimLight);

        let targetRotX = 0, targetRotY = 0, targetExp = baseExposure, initialY = 0;

        const onMouseMove = (e) => {
            if (!options.mouseReact) return;
            const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            targetRotY = mouseX * 0.4;
            targetRotX = -mouseY * 0.15;
            const moveSpeed = Math.abs(e.movementX) + Math.abs(e.movementY);
            targetExp = Math.min(baseExposure + (moveSpeed * 0.03), 5.0);
        };

        if (options.mouseReact) document.addEventListener('mousemove', onMouseMove);

        const io = new IntersectionObserver((entries) => {
            const entry = this.scenes.get(containerId);
            if (entry) entry.isVisible = entries[0].isIntersecting;
        }, { threshold: 0.01 });
        io.observe(container);

        this.scenes.set(containerId, { scene, camera, renderer, io, isVisible: true, rafId: null, onMouseMove });

        try {
            const gltf = this._modelCache.has(modelPath) ? this._modelCache.get(modelPath) : await this.loader.loadAsync(modelPath);
            this._modelCache.set(modelPath, gltf);
            const model = gltf.scene.clone(true);
            model.traverse(n => { if (n.isMesh) { n.castShadow = n.receiveShadow = false; n.frustumCulled = true; } });

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const scale = options.scale || ( (options.baseScale || 3.5) / box.getSize(new THREE.Vector3()).length() );
            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            initialY = model.position.y;
            scene.add(model);

            const animate = () => {
                const entry = this.scenes.get(containerId);
                if (!entry) return;
                entry.rafId = requestAnimationFrame(animate);
                if (!entry.isVisible) return;

                if (options.float) {
                    model.position.y = initialY + Math.sin(performance.now() * 0.0015) * 0.15;
                }
                if (options.mouseReact) {
                    model.rotation.y += (targetRotY - model.rotation.y) * 0.05;
                    model.rotation.x += (targetRotX - model.rotation.x) * 0.05;
                    targetExp += (baseExposure - targetExp) * 0.05;
                    renderer.toneMappingExposure += (targetExp - renderer.toneMappingExposure) * 0.1;
                } else if (options.autoRotate) {
                    model.rotation.y += 0.004;
                }
                renderer.render(scene, camera);
            };
            animate();
        } catch (e) { console.warn(e); }
    }

    _destroy(id) {
        const e = this.scenes.get(id);
        if (!e) return;
        cancelAnimationFrame(e.rafId);
        e.io?.disconnect();
        if (e.onMouseMove) document.removeEventListener('mousemove', e.onMouseMove);
        e.renderer.dispose();
        this.scenes.delete(id);
    }
}
export const GlobalThreeEngine = new ThreeEngine();