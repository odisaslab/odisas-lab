/**
 * Motor 3D compartido por los visores de la demo (Three.js sin React Three Fiber).
 * Se carga SIEMPRE con import() dinámico: Three.js no entra en el bundle inicial.
 *
 * Convención: los datos geométricos son z-arriba (ver lib/geometry.ts). `content` los centra
 * y `pivot` los gira −90° sobre X para que z pase a ser «arriba» en la escena de Three (Y-arriba).
 */
import type * as THREE_NS from "three";
import type { OrbitControls as OrbitControlsT } from "three/examples/jsm/controls/OrbitControls.js";
import { FOOT_LENGTH_MM } from "@/lib/geometry";

export type Preset = "planta" | "dorso" | "lateral";

export interface Viewer {
  THREE: typeof THREE_NS;
  scene: THREE_NS.Scene;
  camera: THREE_NS.PerspectiveCamera;
  renderer: THREE_NS.WebGLRenderer;
  controls: OrbitControlsT;
  /** Grupo en coordenadas de datos (z arriba, y a lo largo del pie), ya centrado */
  content: THREE_NS.Group;
  requestRender(): void;
  setPreset(p: Preset, animate?: boolean): void;
  onFrame(cb: (timeMs: number) => void): () => void;
  dispose(): void;
}

const POSES: Record<Preset, { pos: [number, number, number]; target: [number, number, number] }> = {
  planta: { pos: [215, -340, 245], target: [0, 6, 0] },
  dorso: { pos: [180, 350, 300], target: [0, 8, 0] },
  lateral: { pos: [430, 60, 50], target: [0, 15, 0] },
};

export async function createViewer(host: HTMLElement): Promise<Viewer | null> {
  const THREE = await import("three");
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

  let renderer: THREE_NS.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 5, 4000);

  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(180, 420, 260);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9fe8dc, 0.85);
  fill.position.set(-260, -300, 200);
  scene.add(fill);
  const under = new THREE.DirectionalLight(0xffffff, 0.7);
  under.position.set(40, -420, -120);
  scene.add(under);

  const pivot = new THREE.Group();
  pivot.rotation.x = -Math.PI / 2;
  const content = new THREE.Group();
  content.position.set(0, -FOOT_LENGTH_MM / 2, 0);
  pivot.add(content);
  scene.add(pivot);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.minDistance = 120;
  controls.maxDistance = 1100;
  controls.enablePan = false;

  let dirty = true;
  let visible = true;
  let raf = 0;
  const frameCbs = new Set<(t: number) => void>();
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  let tween: { from: THREE_NS.Vector3; to: THREE_NS.Vector3; fromT: THREE_NS.Vector3; toT: THREE_NS.Vector3; start: number } | null = null;

  const requestRender = () => {
    dirty = true;
  };
  controls.addEventListener("change", requestRender);

  const resize = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) requestRender();
  });
  io.observe(host);

  const setPreset = (p: Preset, animate = true) => {
    const pose = POSES[p];
    const to = new THREE.Vector3(...pose.pos);
    const toT = new THREE.Vector3(...pose.target);
    if (!animate || reduced) {
      camera.position.copy(to);
      controls.target.copy(toT);
      controls.update();
      requestRender();
      return;
    }
    tween = { from: camera.position.clone(), to, fromT: controls.target.clone(), toT, start: performance.now() };
  };
  setPreset("planta", false);

  const loop = (t: number) => {
    raf = requestAnimationFrame(loop);
    if (tween) {
      const k = Math.min(1, (t - tween.start) / 550);
      const e = k * k * (3 - 2 * k);
      camera.position.lerpVectors(tween.from, tween.to, e);
      controls.target.lerpVectors(tween.fromT, tween.toT, e);
      if (k >= 1) tween = null;
      dirty = true;
    }
    const moved = controls.update();
    for (const cb of frameCbs) cb(t);
    if (!visible || document.hidden) return;
    if (dirty || moved || frameCbs.size > 0) {
      renderer.render(scene, camera);
      dirty = false;
    }
  };
  raf = requestAnimationFrame(loop);
  resize();

  const dispose = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    controls.removeEventListener("change", requestRender);
    controls.dispose();
    scene.traverse((o) => {
      const m = o as THREE_NS.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    renderer.dispose();
    // Libera el contexto WebGL al momento (los navegadores limitan los contextos activos).
    renderer.forceContextLoss();
    canvas.remove();
  };

  return {
    THREE,
    scene,
    camera,
    renderer,
    controls,
    content,
    requestRender,
    setPreset,
    onFrame(cb) {
      frameCbs.add(cb);
      return () => frameCbs.delete(cb);
    },
    dispose,
  };
}
