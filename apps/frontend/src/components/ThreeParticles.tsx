import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeParticles() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000010, 0.001);

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ⭐ STARFIELD
    const starCount = 2600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const r = 18 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.035 + Math.random() * 0.055;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uPixelRatio;
        varying float vTwinkle;
        void main(){
          vTwinkle = fract(sin(dot(position.xy, vec2(12.9898,78.233))) * 43758.5453);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 100.0 * uPixelRatio / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        void main(){
          vec2 uv = gl_PointCoord * 2.0 - 1.0;
          float r = dot(uv, uv);
          if(r > 1.0) discard;
          float core = smoothstep(1.0, 0.0, r);
          float glow = smoothstep(1.2, 0.0, r) * 0.35;
          float twinkle = 0.5 + 0.5 * vTwinkle;
          vec3 col = vec3(1.0, 1.15, 1.4) * (core * 1.2 + glow * 1.4) * twinkle;
          gl_FragColor = vec4(col, (core*1.4 + glow*1.2));
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 🌠 SHOOTING STAR
    const trailGeo = new THREE.CylinderGeometry(0.002, 0.04, 1.6, 8, 1, true);
    const trailMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#b38aff"),
      transparent: true,
      opacity: 0.7,
    });
    const meteor = new THREE.Mesh(trailGeo, trailMat);
    meteor.rotation.z = Math.PI / 2;
    meteor.visible = false;
    scene.add(meteor);

    function launchMeteor() {
      meteor.visible = true;
      meteor.position.set(4, Math.random() * 2 - 1, -3);
      meteor.rotation.y = Math.random() * Math.PI * 2;
    }

    const meteorTimer = setInterval(() => launchMeteor(), 4000 + Math.random() * 4000);

    // Mouse Parallax
    window.addEventListener("mousemove", (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let t = 0;
    const animate = () => {
      t += 0.005;
      material.uniforms.uTime.value = t;

      points.rotation.y += 0.0005;
      points.rotation.x += 0.0002;

      camera.position.x += (mouse.current.x * 0.6 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.current.y * 0.4 - camera.position.y) * 0.03;

      // Meteor movement
      if (meteor.visible) {
        meteor.position.x -= 0.065;
        meteor.position.y -= 0.015;
        meteor.position.z += 0.02;
        if (meteor.position.x < -4) meteor.visible = false;
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    const resizeObserver = new ResizeObserver(() => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    resizeObserver.observe(mount);

    return () => {
      clearInterval(meteorTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute  h-full w-full inset-0 z-[5]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
