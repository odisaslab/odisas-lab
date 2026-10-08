/**
 * Motor 3D de Zona Pies (Three.js, sin React Three Fiber).
 *
 * Justificación: la escena es una sola, procedural y muy controlada. Un componente
 * imperativo con ciclo de vida propio pesa menos y da control total sobre el bucle de
 * render (pausa fuera de pantalla, degradación por FPS, liberación de memoria).
 *
 * Este módulo se carga SIEMPRE con import() dinámico desde ScanScene: Three.js no entra
 * en el bundle inicial ni retrasa el LCP.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { LOOKS, type Look } from "./materials3d";
import {
  ANATOMY_MARKS,
  buildPointCloud,
  buildShapeModel,
  clamp,
  footHeight,
  FOOT_BASE_Y,
  insoleHeight,
  lerp,
  slabPositions,
  smoothstep,
  type ShapeModel,
} from "./shape";
import { materialTextures, type MaterialId } from "./textures";
import { cameraPose, sceneState, type ClipMode } from "./timeline";

export type Tier = "full" | "lite";

export interface SceneInput {
  /** Tiempo de historia 0–7 */
  time: number;
  material: MaterialId;
  /** Desplazamiento del modelo respecto al centro, como fracción del ancho / alto */
  offsetX: number;
  offsetY: number;
}

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  /** Contenedor: recibe los marcadores HUD y los eventos de puntero */
  host: HTMLElement;
  tier: Tier;
  getInput: () => SceneInput;
  /** Permite girar la pieza arrastrando */
  drag?: boolean;
  /** Muestra marcadores anatómicos y de capas */
  markers?: boolean;
  onInteract?: () => void;
  /** Vigila los FPS y avisa de la degradación (se desactiva al forzar el nivel con ?scene=) */
  govern?: boolean;
  /** El dispositivo no alcanza los FPS mínimos */
  onSlow?: (averageMs: number) => void;
  onContextLost?: () => void;
}

const SIGNAL = new THREE.Color("#3ee6c9");
const SEGMENTS = { full: { rings: 44, segments: 288, points: 9000 }, lite: { rings: 26, segments: 144, points: 3600 } } as const;

const FORRO_RISE = 0.7;
const CUSHION_RISE = 0.18;
const SHELL_DROP = -0.34;

interface MarkerDef {
  el: HTMLElement;
  /** Calcula el ancla en coordenadas locales del modelo */
  anchor: (out: THREE.Vector3) => void;
  opacity: () => number;
}

export class SceneEngine {
  private readonly opts: EngineOptions;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  private readonly rig = new THREE.Group();
  private readonly model = new THREE.Group();
  private readonly shape: ShapeModel;
  private readonly tier: Tier;

  private envMap: THREE.Texture | null = null;
  private readonly disposables: { dispose: () => void }[] = [];
  private readonly textureCache = new Map<string, { color: THREE.CanvasTexture; bump: THREE.CanvasTexture }>();

  // Losa principal (pie → plantilla)
  private readonly slab: THREE.Mesh;
  private readonly slabMat: THREE.MeshPhysicalMaterial;
  private readonly slabPos: Float32Array;
  private readonly slabNor: Float32Array;
  private readonly slabUv: Float32Array;

  // Puntos y alambre
  private readonly points: THREE.Points;
  private readonly pointsMat: THREE.PointsMaterial;
  private readonly pointsPos: Float32Array;
  private readonly cloud: ReturnType<typeof buildPointCloud>;
  private readonly wire: THREE.LineSegments;
  private readonly wireMat: THREE.LineBasicMaterial;

  // Láser, perfil, contorno
  private readonly laser: THREE.Mesh;
  private readonly laserMat: THREE.ShaderMaterial;
  private readonly profile: THREE.Line;
  private readonly profileMat: THREE.LineBasicMaterial;
  private readonly profilePos: Float32Array;
  private readonly contour: THREE.Line;
  private readonly contourMat: THREE.LineBasicMaterial;
  private readonly contourPos: Float32Array;
  private readonly head: THREE.Points;
  private readonly headMat: THREE.PointsMaterial;

  // Capas
  private readonly layers: { mesh: THREE.Mesh; mat: THREE.MeshPhysicalMaterial; id: "forro" | "cushion" | "shell"; rise: number }[] = [];

  // Suelo técnico
  private readonly platform = new THREE.Group();
  private readonly platformMats: THREE.LineBasicMaterial[] = [];
  private readonly shadow: THREE.Mesh;

  // Planos de recorte (en espacio mundo, se recalculan cada fotograma)
  private readonly planeSlabAhead = new THREE.Plane();
  private readonly planeSlabBehind = new THREE.Plane();
  private readonly planePoints = new THREE.Plane();
  private readonly planeLayers = new THREE.Plane();

  // Marcadores HUD
  private readonly markerLayer: HTMLElement;
  private readonly markers: MarkerDef[] = [];

  // Estado
  private raf = 0;
  private visible = false;
  private last = 0;
  private clock = 0;
  private T = 0;
  private morphApplied = -1;
  private slabLookKey = "";
  private readonly slabLook: Look = { ...LOOKS.clay };
  private readonly shellLook: Look = { ...LOOKS.carbono };
  private shellLookKey = "";
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private dragYaw = 0;
  private dragVel = 0;
  private dragging = false;
  private spinAngle = 0;
  private size = { w: 1, h: 1 };
  private frames = 0;
  private slowAccum = 0;
  private slowCount = 0;
  private interacted = false;
  private disposed = false;
  private readonly tmpA = new THREE.Vector3();
  private readonly tmpB = new THREE.Vector3();
  private readonly resizeObserver: ResizeObserver;
  private readonly cleanups: (() => void)[] = [];

  constructor(opts: EngineOptions) {
    this.opts = opts;
    this.tier = opts.tier;
    const cfg = SEGMENTS[this.tier];

    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas,
      antialias: this.tier === "full",
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.localClippingEnabled = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.tier === "full" ? 2 : 1.25));

    const onLost = (event: Event) => {
      event.preventDefault();
      opts.onContextLost?.();
    };
    opts.canvas.addEventListener("webglcontextlost", onLost);
    this.cleanups.push(() => opts.canvas.removeEventListener("webglcontextlost", onLost));

    // --- Entorno y luces ---------------------------------------------------
    if (this.tier === "full") {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const env = new RoomEnvironment();
      this.envMap = pmrem.fromScene(env, 0.04).texture;
      pmrem.dispose();
      env.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose?.();
      });
      this.disposables.push(this.envMap);
      this.scene.environment = this.envMap;
      this.scene.environmentIntensity = 0.42;
    } else {
      this.scene.add(new THREE.HemisphereLight(0xdfe9f0, 0x1a232b, 1.1));
    }
    const key = new THREE.DirectionalLight(0xfff3e4, this.tier === "full" ? 1.25 : 2.0);
    key.position.set(2.2, 4, 3);
    const rim = new THREE.DirectionalLight(0x3ee6c9, this.tier === "full" ? 1.5 : 1.2);
    rim.position.set(-3.2, 2, -3);
    this.scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.12));

    this.scene.add(this.rig);
    this.rig.add(this.model);

    // --- Geometría -----------------------------------------------------------
    this.shape = buildShapeModel({ rings: cfg.rings, segments: cfg.segments });
    const shape = this.shape;

    // Losa
    this.slabPos = new Float32Array(shape.slab.foot);
    this.slabNor = new Float32Array(shape.normals.foot);
    this.slabUv = new Float32Array(shape.vertexCount * 2);
    const slabGeo = new THREE.BufferGeometry();
    slabGeo.setAttribute("position", new THREE.BufferAttribute(this.slabPos, 3).setUsage(THREE.DynamicDrawUsage));
    slabGeo.setAttribute("normal", new THREE.BufferAttribute(this.slabNor, 3).setUsage(THREE.DynamicDrawUsage));
    slabGeo.setAttribute("uv", new THREE.BufferAttribute(this.slabUv, 2).setUsage(THREE.DynamicDrawUsage));
    slabGeo.setIndex(new THREE.BufferAttribute(shape.indices, 1));
    this.disposables.push(slabGeo);

    this.slabMat = this.makePhysical();
    this.slabMat.side = THREE.DoubleSide;
    this.slabMat.polygonOffset = true;
    this.slabMat.polygonOffsetFactor = 1;
    this.slabMat.polygonOffsetUnits = 1;
    this.slabMat.clippingPlanes = [this.planeSlabAhead];
    this.slab = new THREE.Mesh(slabGeo, this.slabMat);
    this.slab.frustumCulled = false;
    this.model.add(this.slab);

    // Nube de puntos
    this.cloud = buildPointCloud(cfg.points, cfg.segments);
    this.pointsPos = new Float32Array(this.cloud.foot);
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(this.pointsPos, 3).setUsage(THREE.DynamicDrawUsage));
    this.disposables.push(pointsGeo);
    const dot = this.dotTexture();
    this.pointsMat = new THREE.PointsMaterial({
      color: SIGNAL,
      size: this.tier === "full" ? 0.017 : 0.026,
      sizeAttenuation: true,
      map: dot,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      alphaTest: 0.01,
      clippingPlanes: [this.planePoints],
    });
    this.disposables.push(this.pointsMat);
    this.points = new THREE.Points(pointsGeo, this.pointsMat);
    this.points.frustumCulled = false;
    this.model.add(this.points);

    // Alambre sobre la superficie superior (comparte el buffer de posiciones de la losa)
    const wireGeo = new THREE.BufferGeometry();
    wireGeo.setAttribute("position", slabGeo.getAttribute("position"));
    wireGeo.setIndex(new THREE.BufferAttribute(shape.wireIndices, 1));
    this.disposables.push(wireGeo);
    this.wireMat = new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    this.disposables.push(this.wireMat);
    this.wire = new THREE.LineSegments(wireGeo, this.wireMat);
    this.wire.frustumCulled = false;
    this.model.add(this.wire);

    // Estado inicial de la malla (pie) una vez creados losa y puntos
    this.applyMorph(0);

    // Láser (cortina luminosa)
    this.laserMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: SIGNAL }, uAlpha: { value: 0 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader:
        "varying vec2 vUv; uniform vec3 uColor; uniform float uAlpha; void main(){ float h = 1.0 - smoothstep(0.62, 1.0, abs(vUv.x*2.0-1.0)); float v = pow(1.0 - abs(vUv.y*2.0-1.0), 2.2); float core = smoothstep(0.93, 1.0, 1.0 - abs(vUv.y*2.0-1.0)); gl_FragColor = vec4(uColor, (v*0.5 + core*0.5) * h * uAlpha); }",
    });
    const laserGeo = new THREE.PlaneGeometry(1.25, 0.55);
    this.disposables.push(laserGeo, this.laserMat);
    this.laser = new THREE.Mesh(laserGeo, this.laserMat);
    this.laser.position.y = 0.16;
    this.laser.visible = false;
    this.laser.renderOrder = 3;
    this.model.add(this.laser);

    // Perfil de la sección que corta el láser
    this.profilePos = new Float32Array(96 * 3);
    const profileGeo = new THREE.BufferGeometry();
    profileGeo.setAttribute("position", new THREE.BufferAttribute(this.profilePos, 3).setUsage(THREE.DynamicDrawUsage));
    this.disposables.push(profileGeo);
    this.profileMat = new THREE.LineBasicMaterial({ color: 0xbffcf2, transparent: true, opacity: 0, depthTest: false, blending: THREE.AdditiveBlending });
    this.disposables.push(this.profileMat);
    this.profile = new THREE.Line(profileGeo, this.profileMat);
    this.profile.frustumCulled = false;
    this.profile.renderOrder = 4;
    this.profile.visible = false;
    this.model.add(this.profile);

    // Contorno de la plantilla / trayectoria de fabricación
    const S = cfg.segments;
    this.contourPos = new Float32Array((S + 1) * 3);
    const contourGeo = new THREE.BufferGeometry();
    contourGeo.setAttribute("position", new THREE.BufferAttribute(this.contourPos, 3).setUsage(THREE.DynamicDrawUsage));
    this.disposables.push(contourGeo);
    this.contourMat = new THREE.LineBasicMaterial({ color: 0xbffcf2, transparent: true, opacity: 0, depthTest: false, blending: THREE.AdditiveBlending });
    this.disposables.push(this.contourMat);
    this.contour = new THREE.Line(contourGeo, this.contourMat);
    this.contour.frustumCulled = false;
    this.contour.renderOrder = 5;
    this.contour.visible = false;
    this.model.add(this.contour);

    const headGeo = new THREE.BufferGeometry();
    headGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3).setUsage(THREE.DynamicDrawUsage));
    this.disposables.push(headGeo);
    this.headMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.11, sizeAttenuation: true, map: dot, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    this.disposables.push(this.headMat);
    this.head = new THREE.Points(headGeo, this.headMat);
    this.head.frustumCulled = false;
    this.head.renderOrder = 6;
    this.head.visible = false;
    this.model.add(this.head);

    // Capas de fabricación: forro (arriba) · amortiguación · shell (abajo)
    const layerSpecs = [
      { id: "forro" as const, f0: -0.16, f1: 0, rise: FORRO_RISE, look: "forro" as MaterialId },
      { id: "cushion" as const, f0: 0, f1: 0.3, rise: CUSHION_RISE, look: "memory" as MaterialId },
      { id: "shell" as const, f0: 0.3, f1: 1, rise: SHELL_DROP, look: "carbono" as MaterialId },
    ];
    for (const spec of layerSpecs) {
      const positions = slabPositions(shape, "insole", spec.f0, spec.f1);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const uv = new Float32Array(shape.vertexCount * 2);
      for (let i = 0; i < shape.vertexCount; i++) {
        uv[i * 2] = positions[i * 3] * 0.5 + 0.5;
        uv[i * 2 + 1] = positions[i * 3 + 2] * 0.5 + 0.5;
      }
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      geo.setIndex(new THREE.BufferAttribute(shape.indices, 1));
      geo.computeVertexNormals();
      this.disposables.push(geo);
      const mat = this.makePhysical();
      mat.side = THREE.DoubleSide;
      mat.clippingPlanes = [this.planeLayers];
      this.applyLook(mat, LOOKS[spec.look], spec.look);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      mesh.frustumCulled = false;
      this.model.add(mesh);
      this.layers.push({ mesh, mat, id: spec.id, rise: spec.rise });
    }

    // Suelo técnico: anillos, marcas y cruz de registro
    this.buildPlatform();
    const shadowTex = this.shadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.55, depthWrite: false });
    this.disposables.push(shadowMat);
    const shadowGeo = new THREE.PlaneGeometry(2.1, 3.3);
    this.disposables.push(shadowGeo);
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(-0.02, FOOT_BASE_Y - 0.03, -0.05);
    this.scene.add(this.shadow);

    // Marcadores HUD
    this.markerLayer = document.createElement("div");
    this.markerLayer.setAttribute("aria-hidden", "true");
    this.markerLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
    opts.host.appendChild(this.markerLayer);
    if (opts.markers) this.buildMarkers();

    // Estado inicial del material de la losa y de las capas
    const initial = opts.getInput();
    this.applyLook(this.slabMat, LOOKS.clay, "clay");
    this.slabLookKey = "clay";
    this.shellLookKey = initial.material;
    this.applyLook(this.layers[2].mat, LOOKS[initial.material], initial.material);
    Object.assign(this.shellLook, LOOKS[initial.material]);

    // Tamaño y entradas
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(opts.host);
    this.resize();
    this.bindPointer();
  }

  /* ----------------------------------------------------------------------- */
  /* API pública                                                             */
  /* ----------------------------------------------------------------------- */

  setVisible(visible: boolean) {
    if (this.disposed || visible === this.visible) return;
    this.visible = visible;
    if (visible) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    } else {
      cancelAnimationFrame(this.raf);
    }
  }

  /** Dibuja un fotograma sin esperar al bucle (p. ej. al montar, para evitar parpadeo). */
  renderOnce() {
    if (this.disposed) return;
    this.T = this.opts.getInput().time;
    this.update(0.016, this.opts.getInput());
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.cleanups.forEach((fn) => fn());
    this.markerLayer.remove();
    this.textureCache.forEach(({ color, bump }) => {
      color.dispose();
      bump.dispose();
    });
    this.disposables.forEach((item) => item.dispose());
    this.slabMat.dispose();
    this.layers.forEach((layer) => layer.mat.dispose());
    this.platformMats.forEach((m) => m.dispose());
    this.platform.traverse((object) => (object as THREE.Mesh).geometry?.dispose?.());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  /* ----------------------------------------------------------------------- */
  /* Construcción auxiliar                                                   */
  /* ----------------------------------------------------------------------- */

  private makePhysical() {
    const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
    // Valores mínimos > 0 para que el programa de shader no cambie al variar el material
    material.clearcoat = 0.001;
    material.sheen = 0.001;
    material.sheenColor = new THREE.Color(0xffffff);
    material.sheenRoughness = 0.8;
    material.bumpScale = 1;
    if (this.envMap) material.envMap = this.envMap;
    return material;
  }

  private textures(id: MaterialId) {
    const hit = this.textureCache.get(id);
    if (hit) return hit;
    const pair = materialTextures(id, this.tier === "full" ? 256 : 128);
    const aniso = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    const color = new THREE.CanvasTexture(pair.color);
    color.colorSpace = THREE.SRGBColorSpace;
    const bump = new THREE.CanvasTexture(pair.bump);
    for (const tex of [color, bump]) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = aniso;
    }
    const entry = { color, bump };
    this.textureCache.set(id, entry);
    return entry;
  }

  /** Aplica un aspecto de material (texturas y parámetros PBR) a un material físico. */
  private applyLook(material: THREE.MeshPhysicalMaterial, look: Look, id: MaterialId) {
    const tex = this.textures(id);
    material.map = tex.color;
    material.bumpMap = tex.bump;
    tex.color.repeat.set(look.repeat, look.repeat);
    tex.bump.repeat.set(look.repeat, look.repeat);
    this.writeLook(material, look);
    material.needsUpdate = true;
  }

  private writeLook(material: THREE.MeshPhysicalMaterial, look: Look) {
    material.roughness = look.roughness;
    material.metalness = look.metalness;
    material.clearcoat = Math.max(0.001, look.clearcoat);
    material.clearcoatRoughness = look.clearcoatRoughness;
    material.sheen = Math.max(0.001, look.sheen);
    material.bumpScale = look.bumpScale;
    material.opacity = look.opacity;
    material.transparent = look.opacity < 0.999;
    material.envMapIntensity = look.envIntensity;
  }

  private dotTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    return texture;
  }

  private shadowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,0.85)");
    g.addColorStop(0.55, "rgba(0,0,0,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    this.disposables.push(texture);
    return texture;
  }

  private buildPlatform() {
    const y = FOOT_BASE_Y - 0.035;
    const makeMat = (opacity: number) => {
      const m = new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
      this.platformMats.push(m);
      return m;
    };
    const circle = (radius: number, material: THREE.LineBasicMaterial) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material);
      this.platform.add(line);
    };
    circle(1.55, makeMat(0.32));
    circle(1.9, makeMat(0.16));
    circle(2.35, makeMat(0.08));

    // Marcas de graduación
    const ticks: number[] = [];
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const r0 = 1.9;
      const r1 = i % 6 === 0 ? 2.08 : 1.99;
      ticks.push(Math.cos(a) * r0, y, Math.sin(a) * r0, Math.cos(a) * r1, y, Math.sin(a) * r1);
    }
    const tickGeo = new THREE.BufferGeometry();
    tickGeo.setAttribute("position", new THREE.Float32BufferAttribute(ticks, 3));
    this.platform.add(new THREE.LineSegments(tickGeo, makeMat(0.34)));

    // Cruz de registro
    const cross = new THREE.BufferGeometry();
    cross.setAttribute("position", new THREE.Float32BufferAttribute([-2.5, y, 0, 2.5, y, 0, 0, y, -2.5, 0, y, 2.5], 3));
    this.platform.add(new THREE.LineSegments(cross, makeMat(0.07)));
    this.scene.add(this.platform);
  }

  private buildMarkers() {
    const make = (label: string) => {
      const el = document.createElement("div");
      el.className = "hud-marker";
      el.innerHTML = `<i></i><b></b><span></span>`;
      (el.querySelector("span") as HTMLElement).textContent = label;
      this.markerLayer.appendChild(el);
      return el;
    };

    for (const mark of ANATOMY_MARKS) {
      this.markers.push({
        el: make(mark.label),
        anchor: (out) => out.set(mark.x, footHeight(mark.x, mark.z) + 0.035, mark.z),
        opacity: () => sceneState(this.T).anatomyMarkers,
      });
    }

    const layerLabels: Record<string, string> = { forro: "Forro", cushion: "Amortiguación", shell: "Shell" };
    for (const layer of this.layers) {
      this.markers.push({
        el: make(layerLabels[layer.id]),
        anchor: (out) => {
          const e = sceneState(this.T).explode;
          const mid = layer.id === "forro" ? -0.01 : layer.id === "cushion" ? -0.1 * 0.075 * 1.6 : -0.075 * 0.65;
          out.set(0.3, insoleHeight(0.3, -0.35, 0.92) + mid + layer.rise * e, -0.35);
        },
        opacity: () => sceneState(this.T).layerMarkers,
      });
    }
  }

  /* ----------------------------------------------------------------------- */
  /* Entradas                                                                */
  /* ----------------------------------------------------------------------- */

  private bindPointer() {
    const host = this.opts.host;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // El paralaje escucha en la ventana: el texto superpuesto no debe «tapar» el puntero
    const onMove = (event: PointerEvent) => {
      if (!this.visible) return;
      const rect = host.getBoundingClientRect();
      if (fine && event.pointerType !== "touch") {
        this.pointer.tx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1.2, 1.2);
        this.pointer.ty = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1.2, 1.2);
      }
      if (this.dragging) {
        const dx = event.movementX;
        this.dragYaw += dx * 0.009;
        this.dragVel = dx * 0.009;
        this.markInteract();
      }
    };
    const onLeave = () => {
      this.pointer.tx = 0;
      this.pointer.ty = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    this.cleanups.push(() => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    });

    if (this.opts.drag) {
      const canvas = this.opts.canvas;
      const down = (event: PointerEvent) => {
        this.dragging = true;
        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = "grabbing";
      };
      const up = (event: PointerEvent) => {
        this.dragging = false;
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
        canvas.style.cursor = "grab";
      };
      canvas.style.cursor = "grab";
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      this.cleanups.push(() => {
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
      });
    }
  }

  private markInteract() {
    if (this.interacted) return;
    this.interacted = true;
    this.opts.onInteract?.();
  }

  private resize() {
    const rect = this.opts.host.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    this.size = { w, h };
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.applyView();
  }

  private applyView() {
    const { w, h } = this.size;
    const input = this.opts.getInput();
    // Un desplazamiento negativo en x mueve la escena hacia la derecha; positivo en y, hacia arriba
    this.camera.setViewOffset(w, h, -input.offsetX * w, input.offsetY * h, w, h);
    // Encuadre: en pantallas estrechas se aleja la cámara para que la pieza quepa
    this.camera.fov = w / h < 0.8 ? 38 : 30;
    this.camera.updateProjectionMatrix();
  }

  /* ----------------------------------------------------------------------- */
  /* Morfología pie → plantilla                                              */
  /* ----------------------------------------------------------------------- */

  private applyMorph(m: number) {
    const { slab, normals, vertexCount } = this.shape;
    const f = slab.foot;
    const i2 = slab.insole;
    const nf = normals.foot;
    const ni = normals.insole;
    const pos = this.slabPos;
    const nor = this.slabNor;
    const uv = this.slabUv;

    for (let v = 0; v < vertexCount; v++) {
      const i = v * 3;
      const x = f[i] + (i2[i] - f[i]) * m;
      const y = f[i + 1] + (i2[i + 1] - f[i + 1]) * m;
      const z = f[i + 2] + (i2[i + 2] - f[i + 2]) * m;
      pos[i] = x;
      pos[i + 1] = y;
      pos[i + 2] = z;
      let nx = nf[i] + (ni[i] - nf[i]) * m;
      let ny = nf[i + 1] + (ni[i + 1] - nf[i + 1]) * m;
      let nz = nf[i + 2] + (ni[i + 2] - nf[i + 2]) * m;
      const l = Math.hypot(nx, ny, nz) || 1;
      nx /= l;
      ny /= l;
      nz /= l;
      nor[i] = nx;
      nor[i + 1] = ny;
      nor[i + 2] = nz;
      uv[v * 2] = x * 0.5 + 0.5;
      uv[v * 2 + 1] = z * 0.5 + 0.5;
    }

    // Puntos: misma interpolación sobre su propio conjunto
    const cf = this.cloud.foot;
    const ci = this.cloud.insole;
    const pp = this.pointsPos;
    for (let i = 0; i < pp.length; i++) pp[i] = cf[i] + (ci[i] - cf[i]) * m;

    const g = this.slab.geometry;
    g.getAttribute("position").needsUpdate = true;
    g.getAttribute("normal").needsUpdate = true;
    g.getAttribute("uv").needsUpdate = true;
    this.points.geometry.getAttribute("position").needsUpdate = true;
    this.morphApplied = m;
  }

  /* ----------------------------------------------------------------------- */
  /* Bucle                                                                   */
  /* ----------------------------------------------------------------------- */

  private frame = (now: number) => {
    if (this.disposed || !this.visible) return;
    this.raf = requestAnimationFrame(this.frame);

    const rawDt = now - this.last;
    this.last = now;
    const dt = Math.min(0.05, rawDt / 1000);

    const input = this.opts.getInput();
    const k = 1 - Math.exp(-dt * 7);
    const diff = input.time - this.T;
    this.T = Math.abs(diff) < 1e-4 ? input.time : this.T + diff * k;

    this.update(dt, input);
    this.renderer.render(this.scene, this.camera);
    if (this.opts.govern !== false) this.governor(rawDt);
  };

  /** Si el dispositivo no llega a unos FPS mínimos de forma sostenida, avisa para degradar. */
  private governor(rawDt: number) {
    this.frames++;
    if (this.frames < 60 || rawDt > 250) return; // calentamiento (compilación de shaders) y pausas
    this.slowAccum += rawDt;
    this.slowCount++;
    if (this.slowCount >= 90) {
      const average = this.slowAccum / this.slowCount;
      this.slowAccum = 0;
      this.slowCount = 0;
      if (average > 38) this.opts.onSlow?.(average);
    }
  }

  private update(dt: number, input: SceneInput) {
    const s = sceneState(this.T);
    this.clock += dt;

    // Entrada → vista
    this.applyView();

    // Puntero suavizado y arrastre con inercia
    const pk = 1 - Math.exp(-dt * 5);
    this.pointer.x += (this.pointer.tx - this.pointer.x) * pk;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * pk;
    if (!this.dragging && Math.abs(this.dragVel) > 1e-4) {
      this.dragYaw += this.dragVel;
      this.dragVel *= Math.exp(-dt * 3);
    }
    this.spinAngle += dt * 0.38 * s.spin;

    // Cámara
    const pose = cameraPose(this.T);
    const az = (pose.az * Math.PI) / 180;
    const el = (pose.el * Math.PI) / 180;
    const narrow = this.size.w / this.size.h < 0.8 ? 1.3 : 1;
    this.tmpA.set(0, pose.ty, pose.tz);
    this.camera.position.set(
      this.tmpA.x + pose.dist * narrow * Math.cos(el) * Math.sin(az),
      this.tmpA.y + pose.dist * narrow * Math.sin(el),
      this.tmpA.z + pose.dist * narrow * Math.cos(el) * Math.cos(az),
    );
    this.camera.lookAt(this.tmpA);

    // Plataforma giratoria (rig): paralaje, giro, volteo y flotación
    this.rig.rotation.order = "YXZ";
    this.rig.rotation.y = this.pointer.x * 0.22 + this.spinAngle + this.dragYaw;
    this.rig.rotation.x = this.pointer.y * 0.08;
    this.rig.rotation.z = s.flip * Math.PI;
    this.rig.position.y = s.float * (0.07 + 0.035 * Math.sin(this.clock * 1.1));
    this.rig.scale.setScalar(s.scale);
    this.rig.updateMatrixWorld(true);

    this.platform.rotation.y = this.clock * 0.04;
    this.platformMats.forEach((mat, i) => (mat.opacity = [0.32, 0.16, 0.08, 0.34, 0.07][i] * s.platform));
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - s.float * 0.55);

    // Morfología
    if (Math.abs(s.morph - this.morphApplied) > 5e-4) this.applyMorph(s.morph);

    // Planos de recorte
    this.setPlane(this.planeSlabAhead, 1, s.slabClip === "ahead" ? s.slabClipZ : -9);
    this.setPlane(this.planeSlabBehind, -1, s.slabClip === "behind" ? s.slabClipZ : 9);
    this.setPlane(this.planePoints, -1, s.pointsClipZ);
    this.setPlane(this.planeLayers, -1, s.layersClip === "behind" ? s.layersClipZ : 9);

    // Losa principal
    this.slab.visible = s.slabVisible;
    const clip: ClipMode = s.slabClip;
    this.slabMat.clippingPlanes = [clip === "behind" ? this.planeSlabBehind : this.planeSlabAhead];
    const lookId: MaterialId = s.slabFoot ? "clay" : input.material;
    if (this.slabLookKey !== lookId) {
      this.slabLookKey = lookId;
      this.applyLook(this.slabMat, LOOKS[lookId], lookId);
      Object.assign(this.slabLook, LOOKS[lookId]);
    }

    // Capas
    if (this.shellLookKey !== input.material) {
      this.shellLookKey = input.material;
      this.applyLook(this.layers[2].mat, LOOKS[input.material], input.material);
    }
    for (const layer of this.layers) {
      layer.mesh.visible = s.layersVisible;
      layer.mesh.position.y = layer.rise * s.explode;
    }

    // Puntos, alambre
    this.points.visible = s.pointsOpacity > 0.01;
    this.pointsMat.opacity = s.pointsOpacity * 0.95;
    this.wire.visible = s.wireOpacity > 0.01;
    this.wireMat.opacity = s.wireOpacity * 0.32;

    // Láser (con pulso suave en la portada, antes de que empiece el escaneo)
    const heroPulse = (1 - smoothstep(0.0, 0.04, this.T)) * 0.36;
    const heroZ = lerp(-0.95, 0.95, 0.5 + 0.5 * Math.sin(this.clock * 0.75));
    const laserAlpha = Math.max(s.laserAlpha, heroPulse);
    const laserZ = this.T < 0.045 ? heroZ : s.laserZ;
    this.laser.visible = laserAlpha > 0.01;
    this.laser.position.z = laserZ;
    this.laserMat.uniforms.uAlpha.value = laserAlpha;

    // Perfil de la sección
    const showProfile = s.profile && laserAlpha > 0.02 && Math.abs(laserZ) < 1;
    this.profile.visible = showProfile;
    if (showProfile) {
      const [x0, x1] = this.shape.footXRange(laserZ);
      const N = 96;
      for (let i = 0; i < N; i++) {
        const x = lerp(x0, x1, i / (N - 1));
        this.profilePos[i * 3] = x;
        this.profilePos[i * 3 + 1] = footHeight(x, laserZ) + 0.014;
        this.profilePos[i * 3 + 2] = laserZ;
      }
      this.profile.geometry.getAttribute("position").needsUpdate = true;
      this.profileMat.opacity = Math.min(1, laserAlpha * 2.2);
    }

    // Contorno / trayectoria
    this.updateContour(s);

    // Marcadores
    this.updateMarkers();
  }

  private setPlane(plane: THREE.Plane, nz: number, z: number) {
    this.tmpA.set(0, 0, nz).transformDirection(this.model.matrixWorld);
    this.tmpB.set(0, 0, z).applyMatrix4(this.model.matrixWorld);
    plane.setFromNormalAndCoplanarPoint(this.tmpA, this.tmpB);
  }

  private updateContour(s: ReturnType<typeof sceneState>) {
    const c = s.contour;
    const visible = c.opacity > 0.01 && c.draw > 0.001;
    this.contour.visible = visible;
    this.head.visible = false;
    if (!visible) return;

    const { segments } = this.shape.spec;
    const outline = this.shape.outline.insole;
    const m = s.morph;
    const toolLift = c.toolpath ? s.explode * FORRO_RISE : 0;
    const sway = c.lift > 0.1 ? Math.sin(this.clock * 1.4) * 0.012 : 0;

    for (let j = 0; j <= segments; j++) {
      const [x, z] = outline[j % segments];
      const y = lerp(footHeight(x, z), insoleHeight(x, z, 1), m) + c.lift + toolLift + sway + (c.toolpath ? 0.02 : 0);
      this.contourPos[j * 3] = x;
      this.contourPos[j * 3 + 1] = y;
      this.contourPos[j * 3 + 2] = z;
    }
    this.contour.geometry.getAttribute("position").needsUpdate = true;
    const count = Math.max(2, Math.floor(c.draw * (segments + 1)));
    this.contour.geometry.setDrawRange(0, count);
    this.contourMat.opacity = c.opacity * 0.9;

    if (c.draw < 0.999) {
      const idx = Math.min(segments, count - 1);
      const attr = this.head.geometry.getAttribute("position") as THREE.BufferAttribute;
      attr.setXYZ(0, this.contourPos[idx * 3], this.contourPos[idx * 3 + 1], this.contourPos[idx * 3 + 2]);
      attr.needsUpdate = true;
      this.head.visible = true;
      this.headMat.opacity = c.opacity;
    }
  }

  private updateMarkers() {
    if (this.markers.length === 0) return;
    const { w, h } = this.size;
    for (const marker of this.markers) {
      const opacity = marker.opacity();
      if (opacity < 0.02) {
        if (marker.el.style.opacity !== "0") marker.el.style.opacity = "0";
        continue;
      }
      marker.anchor(this.tmpA);
      this.model.localToWorld(this.tmpA);
      this.tmpA.project(this.camera);
      const behind = this.tmpA.z > 1;
      const px = (this.tmpA.x * 0.5 + 0.5) * w;
      const py = (-this.tmpA.y * 0.5 + 0.5) * h;
      marker.el.style.transform = `translate3d(${px - 4.5}px, ${py - 4.5}px, 0)`;
      marker.el.style.opacity = behind ? "0" : String(opacity);
    }
  }
}

