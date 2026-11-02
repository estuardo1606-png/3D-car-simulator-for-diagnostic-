import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  HARNESS_NODES, 
  HARNESS_RUNS, 
  HarnessNode, 
  SubsystemCategory, 
  DiagnosticFault,
  OEM_DIAGRAM_IMAGE_PATH,
  OEM_DIAGRAM_HOTSPOTS 
} from '../data/electricalData';
import { 
  Eye, 
  RotateCcw, 
  Layers, 
  Zap, 
  Compass, 
  Maximize2,
  Sparkles,
  AlertTriangle,
  FileImage,
  Sliders
} from 'lucide-react';

export type ViewRenderMode = 'realistic' | 'electrical_glow' | 'xray' | 'exploded';

interface Viewport3DProps {
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  activeFilter: SubsystemCategory;
  activeFault: DiagnosticFault | null;
  signalSimActive: boolean;
  onToggleSignalSim: () => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  selectedNodeId,
  onSelectNode,
  activeFilter,
  activeFault,
  signalSimActive,
  onToggleSignalSim,
  hoveredNodeId,
  setHoveredNodeId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [renderMode, setRenderMode] = useState<ViewRenderMode>('realistic');
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeCameraBookmark, setActiveCameraBookmark] = useState<string>('diagram_top');
  const [showBlueprintFloor, setShowBlueprintFloor] = useState<boolean>(true);
  const [blueprintOpacity, setBlueprintOpacity] = useState<number>(0.85);
  const [showCalloutBadges, setShowCalloutBadges] = useState<boolean>(true);

  // Three.js instance references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mesh registries
  const nodeMeshesRef = useRef<THREE.Object3D[]>([]);
  const harnessMeshesRef = useRef<THREE.Mesh[]>([]);
  const particleRegistryRef = useRef<{
    mesh: THREE.Mesh;
    curve: THREE.CatmullRomCurve3;
    progress: number;
    speed: number;
    category: SubsystemCategory;
    runId: string;
    harnessTag?: string;
  }[]>([]);
  const engineBodyGroupRef = useRef<THREE.Group | null>(null);
  const mechanicalMeshesRef = useRef<THREE.Mesh[]>([]);
  const blueprintMeshRef = useRef<THREE.Mesh | null>(null);
  const redCircleMeshRef = useRef<THREE.Mesh | null>(null);
  const badgeSpritesRef = useRef<THREE.Sprite[]>([]);

  // Orbit state - Initialized facing the Top/Diagram Alignment view
  const orbitState = useRef({
    isDragging: false,
    isPanning: false,
    prevX: 0,
    prevY: 0,
    radius: 4.8,
    theta: 0,            // Top-down diagram orientation
    phi: 0.16,           // Steep top-down angle matching Toyota drawing
    target: new THREE.Vector3(0, 0.25, 0.1),
  });

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const o = orbitState.current;
    o.phi = Math.max(0.06, Math.min(Math.PI - 0.06, o.phi));
    o.radius = Math.max(1.1, Math.min(10.0, o.radius));

    cameraRef.current.position.x = o.target.x + o.radius * Math.sin(o.phi) * Math.sin(o.theta);
    cameraRef.current.position.y = o.target.y + o.radius * Math.cos(o.phi);
    cameraRef.current.position.z = o.target.z + o.radius * Math.sin(o.phi) * Math.cos(o.theta);
    cameraRef.current.lookAt(o.target);
  }, []);

  const setCameraPreset = (key: string) => {
    setActiveCameraBookmark(key);
    const o = orbitState.current;
    if (key === 'diagram_top') {
      // Exact alignment with the user's uploaded Toyota parts blueprint
      o.target.set(0.0, 0.2, 0.15);
      o.radius = 4.8;
      o.theta = 0;
      o.phi = 0.14; // Almost pure plan view
    } else if (key === 'rear') {
      o.target.set(0.0, 0.45, -0.45);
      o.radius = 3.8;
      o.theta = Math.PI; // 180° - Rear looking forward to firewall
      o.phi = Math.PI * 0.38;
    } else if (key === 'front') {
      o.target.set(0.0, 0.25, 0.4);
      o.radius = 4.2;
      o.theta = 0; // Front looking back
      o.phi = Math.PI * 0.36;
    } else if (key === 'joint_82114') {
      // Focus on the red-circled area on left front frame rail
      o.target.set(-1.45, 0.28, 1.25);
      o.radius = 2.2;
      o.theta = -Math.PI * 0.3;
      o.phi = Math.PI * 0.32;
    } else if (key === 'fuse') {
      o.target.set(-1.3, 0.4, 0.1);
      o.radius = 2.8;
      o.theta = Math.PI * 0.48; // Left apron
      o.phi = Math.PI * 0.35;
    } else if (key === 'alt') {
      o.target.set(0.65, -0.2, 0.35);
      o.radius = 2.6;
      o.theta = -Math.PI * 0.42; // Right front accessory
      o.phi = Math.PI * 0.42;
    }
    updateCameraPosition();
  };

  // Helper to create circular canvas sprite badge for diagram letters (B, D, H, J...)
  const createDiagramBadgeSprite = (label: string, isRedCircled = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Outer circle
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    if (isRedCircled) {
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#f87171';
      ctx.stroke();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = label.includes('82114') ? '#f59e0b' : '#38bdf8';
      ctx.stroke();
    }

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.length > 5 ? label.slice(0, 5) : label, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.32, 0.32, 1);
    return sprite;
  };

  // Main Scene Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040711);
    scene.fog = new THREE.FogExp2(0x040711, 0.08);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Three-point Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirFront = new THREE.DirectionalLight(0xe0f2fe, 1.3);
    dirFront.position.set(4, 9, 6);
    dirFront.castShadow = true;
    scene.add(dirFront);

    const dirRear = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirRear.position.set(-3, 7, -6);
    scene.add(dirRear);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.7);
    rimLight.position.set(5, 3, -4);
    scene.add(rimLight);

    // Build the OEM Blueprint Frame Floor (loaded directly from user's uploaded diagram)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      OEM_DIAGRAM_IMAGE_PATH,
      (tex) => {
        tex.anisotropy = 8;
        tex.generateMipmaps = true;
        // Aspect ratio of user's uploaded diagram: 1040 x 1600 approx (height/width ratio ~1.54)
        const planeGeo = new THREE.PlaneGeometry(3.6, 3.6 * 1.54);
        const planeMat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: blueprintOpacity,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        // Offset so firewall cowl is near Z=-1.25 and front bumper is near Z=1.8
        plane.position.set(0, -0.69, 0.25);
        scene.add(plane);
        blueprintMeshRef.current = plane;
      },
      undefined,
      (err) => {
        console.warn('Blueprint texture load fallback:', err);
      }
    );

    // Build Unibody Chassis Frame, Mechanicals & Harness
    buildChassisUnibodyFrame(scene);
    buildEngineMechanicals(scene);
    buildWiringHarness(scene);
    buildConnectorComponents(scene);

    // Event handlers for orbit controls
    const dom = renderer.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) orbitState.current.isDragging = true;
      if (e.button === 2) orbitState.current.isPanning = true;
      orbitState.current.prevX = e.clientX;
      orbitState.current.prevY = e.clientY;
    };

    const handleMouseUp = () => {
      orbitState.current.isDragging = false;
      orbitState.current.isPanning = false;
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleMouseMove = (e: MouseEvent) => {
      const o = orbitState.current;
      if (!o.isDragging && !o.isPanning) {
        // Raycast for hover
        const rect = dom.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(nodeMeshesRef.current, true);
        if (hits.length > 0) {
          let root: THREE.Object3D | null = hits[0].object;
          while (root && !root.userData?.id && root.parent) {
            root = root.parent;
          }
          if (root?.userData?.id) {
            setHoveredNodeId(root.userData.id);
            dom.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredNodeId(null);
        dom.style.cursor = 'grab';
        return;
      }

      const dx = e.clientX - o.prevX;
      const dy = e.clientY - o.prevY;

      if (o.isDragging) {
        o.theta -= dx * 0.007;
        o.phi -= dy * 0.007;
        updateCameraPosition();
      } else if (o.isPanning) {
        const panSpeed = 0.0028 * o.radius;
        const forward = new THREE.Vector3().subVectors(o.target, camera.position).normalize();
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        o.target.addScaledVector(right, -dx * panSpeed);
        o.target.y += dy * panSpeed;
        updateCameraPosition();
      }

      o.prevX = e.clientX;
      o.prevY = e.clientY;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitState.current.radius += e.deltaY * 0.0035;
      updateCameraPosition();
    };

    const handleClick = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Check connectors
      const nodeHits = raycaster.intersectObjects(nodeMeshesRef.current, true);
      if (nodeHits.length > 0) {
        let obj: THREE.Object3D | null = nodeHits[0].object;
        while (obj && !obj.userData?.id && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.id) {
          onSelectNode(obj.userData.id);
          return;
        }
      }

      // Check harness conduits
      const harnessHits = raycaster.intersectObjects(harnessMeshesRef.current);
      if (harnessHits.length > 0) {
        const runData = harnessHits[0].object.userData?.runData;
        if (runData) {
          onSelectNode(runData.to);
        }
      }
    };

    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('contextmenu', handleContextMenu);
    dom.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let time = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      time += 0.016;

      // Auto-rotation if enabled
      if (autoRotate && !orbitState.current.isDragging) {
        orbitState.current.theta += 0.003;
        updateCameraPosition();
      }

      // Animate electric particles along both 82111 and 82114 harnesses
      if (signalSimActive) {
        particleRegistryRef.current.forEach((p) => {
          let speed = p.speed;
          const isAffected = activeFault && (
            (activeFault.affectedNodeId === 'coils_pack' && p.runId.includes('coils')) ||
            (activeFault.affectedNodeId === 'throttle_etcs' && p.runId.includes('etcs')) ||
            (activeFault.affectedNodeId === 'alternator' && p.runId.includes('alt')) ||
            (activeFault.affectedNodeId === 'fan' && p.runId.includes('fan')) ||
            (activeFault.affectedNodeId === 'knock_sensor' && p.runId.includes('knock')) ||
            (activeFault.affectedNodeId === 'ground_ec' && p.runId.includes('ground_ec')) ||
            (activeFault.affectedNodeId === 'fusebox' && (p.runId.includes('fuse') || p.runId.includes('ecm')))
          );

          if (isAffected && activeFault) {
            if (activeFault.faultType === 'open_circuit') {
              p.mesh.visible = false;
              return;
            } else if (activeFault.faultType === 'short_ground') {
              speed = p.speed * 3.5;
              (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(Math.random() > 0.4 ? 0xef4444 : 0xfbbf24);
            } else if (activeFault.faultType === 'high_resistance') {
              speed = p.speed * 0.28;
              (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xf97316);
            } else {
              (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
            }
          } else {
            // Front harness 82114 is yellow/amber, main 82111 is cyan/blue
            (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(
              p.harnessTag === '82114' ? 0xf59e0b : 0x38bdf8
            );
          }

          p.mesh.visible = true;
          p.progress += speed;
          if (p.progress > 1) p.progress = 0;
          const pt = p.curve.getPoint(p.progress);
          p.mesh.position.copy(pt);
        });
      }

      // Animate Red Circle Torus around LH apron junction 82114 (the user's marked area)
      if (redCircleMeshRef.current) {
        const s = 1.0 + Math.sin(time * 4) * 0.12;
        redCircleMeshRef.current.scale.set(s, s, s);
      }

      // Animate diagnostic beacons
      nodeMeshesRef.current.forEach((root) => {
        const beacon = root.userData?.beacon as THREE.Mesh | undefined;
        if (beacon) {
          beacon.position.y = 0.28 + Math.sin(time * 3 + root.position.x * 2) * 0.03;
          if (activeFault && root.userData?.id === activeFault.affectedNodeId) {
            beacon.scale.setScalar(1.4 + Math.sin(time * 9) * 0.45);
            (beacon.material as THREE.MeshBasicMaterial).color.setHex(
              activeFault.faultType === 'short_ground' ? 0xef4444 : 0xf59e0b
            );
          } else {
            beacon.scale.setScalar(1.0);
            (beacon.material as THREE.MeshBasicMaterial).color.setHex(
              root.userData?.id === selectedNodeId ? 0x38bdf8 : 0x0284c7
            );
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('contextmenu', handleContextMenu);
      dom.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [onSelectNode, setHoveredNodeId, autoRotate, signalSimActive, updateCameraPosition, activeFault, selectedNodeId]);

  // Build the Precise Unibody Chassis Frame Matching the Dashed Lines in the Diagram
  const buildChassisUnibodyFrame = (scene: THREE.Scene) => {
    const frameGroup = new THREE.Group();

    const chassisLineMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.12,
      gapSize: 0.06,
      linewidth: 2,
      transparent: true,
      opacity: 0.55,
    });

    const solidFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.3,
    });

    // 1. Left Wheelhouse Apron Rail Curve
    const lhCurvePoints = [
      new THREE.Vector3(-1.45, 0.65, -1.25),
      new THREE.Vector3(-1.55, 0.55, -0.6),
      new THREE.Vector3(-1.58, 0.45, 0.0),
      new THREE.Vector3(-1.55, 0.35, 0.8),
      new THREE.Vector3(-1.45, 0.28, 1.25), // Junction 82114
      new THREE.Vector3(-1.3, 0.2, 1.8),
    ];
    const lhCurve = new THREE.CatmullRomCurve3(lhCurvePoints);
    const lhRailGeo = new THREE.TubeGeometry(lhCurve, 32, 0.035, 8, false);
    const lhRailMesh = new THREE.Mesh(lhRailGeo, solidFrameMat);
    frameGroup.add(lhRailMesh);

    // 2. Right Wheelhouse Apron Rail Curve
    const rhCurvePoints = [
      new THREE.Vector3(1.45, 0.65, -1.25),
      new THREE.Vector3(1.55, 0.55, -0.6),
      new THREE.Vector3(1.58, 0.45, 0.0),
      new THREE.Vector3(1.55, 0.35, 0.8),
      new THREE.Vector3(1.45, 0.28, 1.25),
      new THREE.Vector3(1.3, 0.2, 1.8),
    ];
    const rhCurve = new THREE.CatmullRomCurve3(rhCurvePoints);
    const rhRailGeo = new THREE.TubeGeometry(rhCurve, 32, 0.035, 8, false);
    const rhRailMesh = new THREE.Mesh(rhRailGeo, solidFrameMat);
    frameGroup.add(rhRailMesh);

    // 3. Front Radiator Core Support Crossmember Beam
    const frontBeam = new THREE.Mesh(
      new THREE.BoxGeometry(2.9, 0.08, 0.08),
      solidFrameMat
    );
    frontBeam.position.set(0, 0.18, 1.8);
    frameGroup.add(frontBeam);

    // 4. Rear Cowl Dash Panel / Firewall Crossbeam with Center Clamp 82712A Mount
    const cowlBeam = new THREE.Mesh(
      new THREE.BoxGeometry(3.1, 0.1, 0.1),
      solidFrameMat
    );
    cowlBeam.position.set(0, 0.72, -1.25);
    frameGroup.add(cowlBeam);

    // 5. RED CIRCLED AREA IN USER'S DIAGRAM: Left Front Rail Junction 82114 Highlight
    const redTorusGeo = new THREE.TorusGeometry(0.24, 0.025, 12, 32);
    const redTorusMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.9,
    });
    const redTorus = new THREE.Mesh(redTorusGeo, redTorusMat);
    redTorus.rotation.x = Math.PI / 2;
    redTorus.position.set(-1.45, 0.28, 1.25);
    frameGroup.add(redTorus);
    redCircleMeshRef.current = redTorus;

    // Fastener Bolts (90119-06A06 and 90119-A0255)
    [
      [-1.45, 0.32, 1.25],
      [0.0, 0.74, -1.22],
      [-1.45, 0.52, -0.1],
      [1.4, 0.35, 1.7],
    ].forEach(([bx, by, bz]) => {
      const boltMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.04, 6),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
      );
      boltMesh.position.set(bx, by, bz);
      frameGroup.add(boltMesh);
    });

    scene.add(frameGroup);
  };

  // Procedural 3D Mechanical Assembly Builder
  const buildEngineMechanicals = (scene: THREE.Scene) => {
    mechanicalMeshesRef.current = [];
    const engineGroup = new THREE.Group();
    engineGroup.position.set(0.05, -0.05, -0.1);
    engineBodyGroupRef.current = engineGroup;

    // 1. Lower Engine Block (Cast aluminum cylinder crankcase)
    const blockGeo = new THREE.BoxGeometry(1.28, 0.74, 0.96);
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.35,
    });
    const blockMesh = new THREE.Mesh(blockGeo, blockMat);
    blockMesh.castShadow = true;
    engineGroup.add(blockMesh);
    mechanicalMeshesRef.current.push(blockMesh);

    // Sump / Oil pan below
    const panGeo = new THREE.BoxGeometry(1.15, 0.22, 0.85);
    const panMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.2 });
    const panMesh = new THREE.Mesh(panGeo, panMat);
    panMesh.position.y = -0.46;
    engineGroup.add(panMesh);
    mechanicalMeshesRef.current.push(panMesh);

    // 2. Cylinder Head & Dual Overhead Cam Cover
    const headGeo = new THREE.BoxGeometry(1.22, 0.18, 0.84);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.55 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 0.44;
    engineGroup.add(headMesh);
    mechanicalMeshesRef.current.push(headMesh);

    // 4x Spark plug recesses
    [-0.27, -0.09, 0.09, 0.27].forEach((x) => {
      const wellGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16);
      const wellMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
      const well = new THREE.Mesh(wellGeo, wellMat);
      well.position.set(x, 0.52, -0.18);
      engineGroup.add(well);
    });

    // Oil Filler Cap
    const capGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 14);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0.38, 0.54, 0.2);
    engineGroup.add(cap);

    // 3. Intake Manifold Runners & Plenum
    const intakeGroup = new THREE.Group();
    intakeGroup.position.set(-0.25, 0.32, -0.62);
    const plenum = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.32, 0.36),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.75 })
    );
    intakeGroup.add(plenum);
    engineGroup.add(intakeGroup);
    mechanicalMeshesRef.current.push(plenum);

    // 4. Alternator Pulley & Serpentine Belt Assembly
    const altPulleysGroup = new THREE.Group();
    altPulleysGroup.position.set(0.65, -0.3, 0.4);
    const pulleyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 20);
    const pulleyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    const pulleyMesh = new THREE.Mesh(pulleyGeo, pulleyMat);
    pulleyMesh.rotation.z = Math.PI / 2;
    altPulleysGroup.add(pulleyMesh);

    const crankPulley = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.06, 24),
      pulleyMat
    );
    crankPulley.rotation.z = Math.PI / 2;
    crankPulley.position.set(-0.65, -0.25, 0);
    altPulleysGroup.add(crankPulley);
    engineGroup.add(altPulleysGroup);

    scene.add(engineGroup);

    // 5. 12V Battery on Tray
    const battGroup = new THREE.Group();
    battGroup.position.set(-1.35, 0.18, -0.3);
    const battBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.42, 0.38),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.6 })
    );
    battGroup.add(battBox);

    const posTerminal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4 })
    );
    posTerminal.position.set(-0.14, 0.24, -0.1);
    battGroup.add(posTerminal);

    const negTerminal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
    );
    negTerminal.position.set(-0.14, 0.24, 0.1);
    battGroup.add(negTerminal);
    scene.add(battGroup);
    mechanicalMeshesRef.current.push(battBox);

    // 6. Firewall Bulkhead Partition
    const firewallGeo = new THREE.BoxGeometry(3.5, 1.45, 0.08);
    const firewallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.2,
    });
    const firewall = new THREE.Mesh(firewallGeo, firewallMat);
    firewall.position.set(0, 0.35, -1.25);
    scene.add(firewall);
    mechanicalMeshesRef.current.push(firewall);

    // 7. Radiator Assembly & Dual Electric Fan Shroud
    const radGroup = new THREE.Group();
    radGroup.position.set(0, 0.15, 1.82);
    const radCore = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.72, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8, transparent: true, opacity: 0.65 })
    );
    radGroup.add(radCore);

    [-0.5, 0.5].forEach((fx) => {
      const ringGeo = new THREE.TorusGeometry(0.24, 0.025, 12, 28);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(fx, 0, -0.06);
      radGroup.add(ring);
    });
    scene.add(radGroup);
    mechanicalMeshesRef.current.push(radCore);
  };

  // Wire Harness 82111 (Blue) and 82114 (Yellow) Builder
  const buildWiringHarness = (scene: THREE.Scene) => {
    harnessMeshesRef.current = [];
    particleRegistryRef.current = [];

    HARNESS_RUNS.forEach((run) => {
      const points = run.waypoints.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(points);
      const is82114 = run.harnessTag === '82114';

      // Corrugated Split Loom Tube
      const tubeGeo = new THREE.TubeGeometry(curve, 52, run.radius, 14, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.5,
        metalness: 0.2,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.castShadow = true;
      tubeMesh.userData = {
        type: 'harness_run',
        id: run.id,
        runData: run,
        originalColor: 0x111827,
      };
      scene.add(tubeMesh);
      harnessMeshesRef.current.push(tubeMesh);

      // Vinyl Electrical Tape Collars
      [0.2, 0.5, 0.8].forEach((t) => {
        const pt = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        const tapeGeo = new THREE.CylinderGeometry(run.radius * 1.14, run.radius * 1.14, 0.038, 14);
        const tapeMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.15 });
        const tapeMesh = new THREE.Mesh(tapeGeo, tapeMat);
        tapeMesh.position.copy(pt);
        tapeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        scene.add(tapeMesh);
      });

      // Accent color tracer: Amber/Gold for 82114, Cyan/Blue for 82111 (matching Toyota drawing)
      const tracerHex = is82114 ? 0xf59e0b : 0x38bdf8;
      const accentGeo = new THREE.TubeGeometry(curve, 52, run.radius * 0.24, 6, false);
      const accentMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(tracerHex),
        transparent: true,
        opacity: 0.9,
      });
      const accentMesh = new THREE.Mesh(accentGeo, accentMat);
      accentMesh.position.y += run.radius * 0.55;
      scene.add(accentMesh);

      // Animated Electrical Pulse Particle
      const particleGeo = new THREE.SphereGeometry(run.radius * 0.55, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({ color: tracerHex });
      const particleMesh = new THREE.Mesh(particleGeo, particleMat);
      scene.add(particleMesh);

      particleRegistryRef.current.push({
        mesh: particleMesh,
        curve,
        progress: Math.random(),
        speed: 0.0035 + Math.random() * 0.0025,
        category: run.category,
        runId: run.id,
        harnessTag: run.harnessTag,
      });
    });
  };

  // High-Fidelity Automotive Connectors and 3D Diagram Callout Badges
  const buildConnectorComponents = (scene: THREE.Scene) => {
    nodeMeshesRef.current = [];
    badgeSpritesRef.current = [];

    HARNESS_NODES.forEach((node) => {
      const rootGroup = new THREE.Group();
      rootGroup.position.set(node.coords[0], node.coords[1], node.coords[2]);
      rootGroup.userData = { id: node.id, nodeData: node };

      let interactiveMesh: THREE.Mesh;

      if (node.componentKind === 'fusebox') {
        const fbGroup = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(0.62, 0.26, 0.48);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        fbGroup.add(body);

        const relayCoords = [
          [-0.16, 0.17, -0.12], [-0.05, 0.17, -0.12], [0.06, 0.17, -0.12],
          [-0.16, 0.17, 0.03], [-0.05, 0.17, 0.03]
        ];
        relayCoords.forEach(([rx, ry, rz]) => {
          const rGeo = new THREE.BoxGeometry(0.075, 0.095, 0.075);
          const rMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35 });
          const rMesh = new THREE.Mesh(rGeo, rMat);
          rMesh.position.set(rx, ry, rz);
          fbGroup.add(rMesh);
        });

        const fuseRack = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.045, 0.24),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 })
        );
        fuseRack.position.set(0.16, 0.15, -0.02);
        fbGroup.add(fuseRack);

        interactiveMesh = body;
        rootGroup.add(fbGroup);

      } else if (node.componentKind === 'ecm_header') {
        const ecmGroup = new THREE.Group();
        const casing = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.46, 0.16),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.4 })
        );
        ecmGroup.add(casing);

        const lever = new THREE.Mesh(
          new THREE.BoxGeometry(0.44, 0.065, 0.085),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25 })
        );
        lever.position.set(0, 0.19, 0.08);
        ecmGroup.add(lever);

        interactiveMesh = casing;
        rootGroup.add(ecmGroup);

      } else if (node.componentKind === 'coils') {
        const coilGroup = new THREE.Group();
        const carrier = new THREE.Mesh(
          new THREE.BoxGeometry(0.76, 0.07, 0.14),
          new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 })
        );
        coilGroup.add(carrier);

        [-0.27, -0.09, 0.09, 0.27].forEach((cx) => {
          const boot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.038, 0.038, 0.19, 14),
            new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 })
          );
          boot.position.set(cx, -0.09, 0);
          coilGroup.add(boot);

          const headCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.045, 0.035, 14),
            new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 })
          );
          headCap.position.set(cx, 0.045, 0);
          coilGroup.add(headCap);
        });

        interactiveMesh = carrier;
        rootGroup.add(coilGroup);

      } else if (node.componentKind === 'ground_lug') {
        const lugGroup = new THREE.Group();
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(0.095, 0.095, 0.026, 16),
          new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.25 })
        );
        lugGroup.add(ring);

        const hexBolt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.065, 6),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
        );
        hexBolt.position.y = 0.035;
        lugGroup.add(hexBolt);

        interactiveMesh = ring;
        rootGroup.add(lugGroup);

      } else if (node.componentKind === 'grommet') {
        const grommet = new THREE.Mesh(
          new THREE.CylinderGeometry(0.19, 0.23, 0.09, 24),
          new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.85 })
        );
        grommet.rotateX(Math.PI / 2);
        interactiveMesh = grommet;
        rootGroup.add(grommet);

      } else {
        const connGroup = new THREE.Group();
        const shell = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.2, 0.24),
          new THREE.MeshStandardMaterial({ color: node.housingColor, roughness: 0.4 })
        );
        connGroup.add(shell);

        const seal = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.035, 0.25),
          new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.35 })
        );
        seal.position.y = -0.05;
        connGroup.add(seal);

        const latch = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 0.045, 0.15),
          new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3 })
        );
        latch.position.set(0, 0.12, 0);
        connGroup.add(latch);

        interactiveMesh = shell;
        rootGroup.add(connGroup);
      }

      interactiveMesh.castShadow = true;
      interactiveMesh.userData = { id: node.id, nodeData: node };

      // Pulsating Diagnostic Beacon
      const beaconGeo = new THREE.SphereGeometry(0.058, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.28;
      rootGroup.add(beacon);
      rootGroup.userData.beacon = beacon;

      // 3D Diagram Callout Badge (Letters B, D, H, J, 82712A, 82684, C, I, F, E, G, L, 82114, 82821M)
      if (node.diagramCallout) {
        const isRed = node.id === 'junction_82114';
        const badge = createDiagramBadgeSprite(node.diagramCallout, isRed);
        badge.position.y = 0.46;
        rootGroup.add(badge);
        badgeSpritesRef.current.push(badge);
      }

      scene.add(rootGroup);
      nodeMeshesRef.current.push(rootGroup);
    });
  };

  // Synchronize Render Modes, Blueprint Floor, Callouts & Filters
  useEffect(() => {
    // 1. Update filter visibility
    nodeMeshesRef.current.forEach((root) => {
      const node = root.userData?.nodeData as HarnessNode;
      const isVisible = activeFilter === 'all' || node.category === activeFilter;
      root.visible = isVisible;
    });

    harnessMeshesRef.current.forEach((mesh) => {
      const run = mesh.userData?.runData;
      const isVisible = activeFilter === 'all' || run.category === activeFilter;
      mesh.visible = isVisible;
    });

    particleRegistryRef.current.forEach((p) => {
      p.mesh.visible = (activeFilter === 'all' || p.category === activeFilter) && signalSimActive;
    });

    // 2. Blueprint floor visibility and opacity
    if (blueprintMeshRef.current) {
      blueprintMeshRef.current.visible = showBlueprintFloor;
      (blueprintMeshRef.current.material as THREE.MeshBasicMaterial).opacity = blueprintOpacity;
    }

    // 3. Diagram Callout badges visibility
    badgeSpritesRef.current.forEach((b) => {
      b.visible = showCalloutBadges;
    });

    // 4. Render Mode application
    if (renderMode === 'electrical_glow') {
      mechanicalMeshesRef.current.forEach((m) => {
        m.material = new THREE.MeshStandardMaterial({
          color: 0x050811,
          roughness: 0.9,
          transparent: true,
          opacity: 0.25,
        });
      });
      harnessMeshesRef.current.forEach((mesh) => {
        const is82114 = mesh.userData?.runData?.harnessTag === '82114';
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(is82114 ? 0xf59e0b : 0x0284c7);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(is82114 ? 0xb45309 : 0x0369a1);
      });
    } else if (renderMode === 'xray') {
      mechanicalMeshesRef.current.forEach((m) => {
        m.material = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.3,
          wireframe: true,
          transparent: true,
          opacity: 0.3,
        });
      });
      harnessMeshesRef.current.forEach((mesh) => {
        (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x111827);
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
      });
    } else {
      mechanicalMeshesRef.current.forEach((m) => {
        m.material = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.65,
          metalness: 0.35,
          transparent: false,
          opacity: 1.0,
        });
      });
      harnessMeshesRef.current.forEach((mesh) => {
        const isSelectedRun = selectedNodeId && (mesh.userData?.runData?.from === selectedNodeId || mesh.userData?.runData?.to === selectedNodeId);
        const is82114 = mesh.userData?.runData?.harnessTag === '82114';
        if (isSelectedRun) {
          (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x38bdf8);
          (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x0284c7);
        } else {
          (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x111827);
          (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(is82114 ? 0x78350f : 0x000000);
        }
      });
    }
  }, [renderMode, activeFilter, signalSimActive, selectedNodeId, showBlueprintFloor, blueprintOpacity, showCalloutBadges]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Modern Workspace Controls Toolbar */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between pointer-events-none gap-2 z-10">
        {/* Left: Camera Presets (Quick Perspectives) */}
        <div className="flex items-center gap-1 bg-neutral-900/95 backdrop-blur-md p-1 rounded-lg border border-neutral-800 pointer-events-auto shadow-xl overflow-x-auto max-w-[70vw]">
          <span className="text-[11px] font-mono text-neutral-400 px-2 py-1 shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Perspective:</span>
          </span>
          <button
            onClick={() => setCameraPreset('diagram_top')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeCameraBookmark === 'diagram_top'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
            title="Exact Top-Down alignment matching the Toyota Diagram Frame"
          >
            <span>📐</span>
            <span>Diagram Align (Top View)</span>
          </button>
          <button
            onClick={() => setCameraPreset('joint_82114')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeCameraBookmark === 'joint_82114'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
            title="Focus on the Red Circled Joint (82111/82114 on Left Apron)"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            <span>Joint 82114 (Red Circle)</span>
          </button>
          <button
            onClick={() => setCameraPreset('rear')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeCameraBookmark === 'rear'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Rear Firewall (82712A)
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeCameraBookmark === 'front'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Front Bumper (82114)
          </button>
          <button
            onClick={() => setCameraPreset('fuse')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeCameraBookmark === 'fuse'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Fuse Tray (82684)
          </button>
        </div>

        {/* Right: Diagram Blueprint Frame Toggle & Visual Mode */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Blueprint Floor Overlay Toggle */}
          <button
            onClick={() => setShowBlueprintFloor(!showBlueprintFloor)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg ${
              showBlueprintFloor
                ? 'bg-sky-950/90 border-sky-500/60 text-sky-300'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle the Toyota OEM Diagram Blueprint projected on the 3D floor"
          >
            <FileImage className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Diagram Frame</span>
          </button>

          {/* Callout Letter Badges Toggle */}
          <button
            onClick={() => setShowCalloutBadges(!showCalloutBadges)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg ${
              showCalloutBadges
                ? 'bg-sky-950/90 border-sky-500/60 text-sky-300'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle 3D Diagram Letters (B, D, H, J, 82712A, 82684, C, I...)"
          >
            <span className="font-mono font-bold text-[10px]">B·D·H</span>
            <span className="hidden sm:inline">Tags</span>
          </button>

          {/* Signal Pulse Toggle */}
          <button
            onClick={onToggleSignalSim}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg ${
              signalSimActive
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle electric current pulse flow"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Render Mode Segmented Switch */}
          <div className="flex items-center gap-0.5 bg-neutral-900/90 backdrop-blur-md p-1 rounded-lg border border-neutral-800 text-xs shadow-lg">
            <button
              onClick={() => setRenderMode('realistic')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                renderMode === 'realistic' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Realistic
            </button>
            <button
              onClick={() => setRenderMode('electrical_glow')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                renderMode === 'electrical_glow' ? 'bg-sky-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Wire Loom
            </button>
          </div>

          {/* 360 Auto-Rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg border text-xs transition-colors shadow-lg ${
              autoRotate
                ? 'bg-sky-600 text-white border-sky-400'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Continuous 360° Inspection Orbit"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Fault Notification Badge Overlay */}
      {activeFault && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-950/90 backdrop-blur-md border border-red-500/60 px-4 py-2 rounded-xl text-xs text-red-200 shadow-2xl flex items-center gap-2.5 z-10 pointer-events-auto">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
          <div>
            <span className="font-bold text-red-300 font-mono mr-1.5">{activeFault.code}:</span>
            <span>{activeFault.title}</span>
          </div>
        </div>
      )}

      {/* Hover Info Tooltip in Bottom Corner with OEM Diagram Tag */}
      {hoveredNodeId && (
        <div className="absolute bottom-4 left-4 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs shadow-2xl pointer-events-none z-10 animate-in fade-in duration-150">
          <div className="font-bold text-white flex items-center gap-2">
            <span>{HARNESS_NODES.find((n) => n.id === hoveredNodeId)?.name}</span>
            {HARNESS_NODES.find((n) => n.id === hoveredNodeId)?.diagramCallout && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 uppercase font-bold">
                Tag [{HARNESS_NODES.find((n) => n.id === hoveredNodeId)?.diagramCallout}]
              </span>
            )}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
            {HARNESS_NODES.find((n) => n.id === hoveredNodeId)?.subtitle}
          </div>
          {HARNESS_NODES.find((n) => n.id === hoveredNodeId)?.diagramFastener && (
            <div className="text-[10px] text-amber-400 font-mono mt-0.5">
              Bolt: {HARNESS_NODES.find((n) => n.id === hoveredNodeId)?.diagramFastener}
            </div>
          )}
        </div>
      )}

      {/* Subtle 3D Interaction Cue */}
      <div className="absolute bottom-3 right-3 text-[11px] font-mono text-neutral-400 bg-neutral-950/85 px-2.5 py-1 rounded border border-neutral-800 pointer-events-none hidden sm:flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
        <span>Harness 82111 (Blue) & 82114 (Yellow) · Aligned with Toyota Frame</span>
      </div>
    </div>
  );
};
