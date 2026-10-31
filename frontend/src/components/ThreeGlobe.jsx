import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

const THREAT_POINTS = [
  { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567, color: 0xf97316 },
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.2090, color: 0xef4444 },
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777, color: 0xf97316 },
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946, color: 0xf97316 },
  { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867, color: 0xf59e0b },
  { name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639, color: 0xf97316 },
  { name: 'Ahmedabad, Gujarat', lat: 23.0225, lon: 72.5714, color: 0xf97316 },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, color: 0xf97316 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278, color: 0xf59e0b },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, color: 0xf97316 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060, color: 0xef4444 },
];

function isLand(lat, lon) {
  // India & South Asia
  if (lat >= 6 && lat <= 38 && lon >= 66 && lon <= 96) return true;
  // East & Southeast Asia
  if (lat >= -10 && lat <= 60 && lon >= 96 && lon <= 150) return true;
  // Middle East & Central Asia
  if (lat >= 12 && lat <= 60 && lon >= 32 && lon <= 75) return true;
  // Europe
  if (lat >= 34 && lat <= 72 && lon >= -12 && lon <= 45) return true;
  // Africa
  if (lat >= -35 && lat <= 37 && lon >= -18 && lon <= 52) return true;
  // North America
  if (lat >= 15 && lat <= 72 && lon >= -168 && lon <= -52) return true;
  // South America
  if (lat >= -56 && lat <= 13 && lon >= -82 && lon <= -34) return true;
  // Australia
  if (lat >= -44 && lat <= -10 && lon >= 110 && lon <= 155) return true;
  return false;
}

export default function ThreeGlobe() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 580;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    // Position camera closer so the globe fills the section nicely
    camera.position.z = 185;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const canvas = renderer.domElement;
    canvas.setAttribute('data-engine', 'three.js r183');
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    // 2. Earth Group (Tilted to showcase India & Asia in center)
    const earthGroup = new THREE.Group();
    earthGroup.rotation.x = 0.32;
    earthGroup.rotation.y = -1.25;
    scene.add(earthGroup);

    const GLOBE_RADIUS = 72;

    // 3. Dark Navy Core Sphere
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.4, 64, 64);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x070e1c,
      transparent: true,
      opacity: 0.96,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    earthGroup.add(coreMesh);

    // 4. Subtle Latitude & Longitude Wireframe Grid
    const wireGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 24, 16);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    earthGroup.add(wireMesh);

    // 5. Atmosphere Glow Rim
    const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS + 3.2, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.24, 0.6, 1.0, 1.0) * intensity * 1.8;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmoMesh);

    // 6. High-density Continental Dots (12,000 Points)
    const dotPositions = [];
    const dotColors = [];
    const sampleCount = 12000;

    for (let i = 0; i < sampleCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / sampleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const lat = 90 - (phi * 180) / Math.PI;
      const lon = ((theta * 180) / Math.PI) % 360 - 180;

      if (isLand(lat, lon)) {
        const v = latLonToVector3(lat, lon, GLOBE_RADIUS);
        dotPositions.push(v.x, v.y, v.z);

        // Highlight India with vibrant cyan
        if (lat >= 8 && lat <= 35 && lon >= 68 && lon <= 92) {
          dotColors.push(0.35, 0.82, 1.0);
        } else {
          dotColors.push(0.18, 0.44, 0.78);
        }
      }
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute('color', new THREE.Float32BufferAttribute(dotColors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
    });
    const dotMesh = new THREE.Points(dotGeo, dotMat);
    earthGroup.add(dotMesh);

    // 7. Threat Nodes & Shockwave Pulsing Rings
    const rings = [];
    THREAT_POINTS.forEach((pt) => {
      const pos = latLonToVector3(pt.lat, pt.lon, GLOBE_RADIUS + 0.6);

      // Glowing center pin
      const pinGeo = new THREE.SphereGeometry(1.4, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: pt.color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      earthGroup.add(pinMesh);

      // Expanding pulse ring
      const ringGeo = new THREE.RingGeometry(1.4, 2.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pt.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      earthGroup.add(ringMesh);

      rings.push({
        mesh: ringMesh,
        scale: 1,
        maxScale: 3.2,
        speed: 0.024 + Math.random() * 0.012,
      });
    });

    // 8. Pointer Drag-To-Rotate Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      velocityX = deltaX * 0.005;
      velocityY = deltaY * 0.005;

      earthGroup.rotation.y += velocityX;
      earthGroup.rotation.x += velocityY;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 9. Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        velocityX *= 0.95;
        velocityY *= 0.95;
        earthGroup.rotation.y += velocityX + 0.0018;
        earthGroup.rotation.x += velocityY;
      }

      rings.forEach((r) => {
        r.scale += r.speed;
        if (r.scale > r.maxScale) {
          r.scale = 1;
        }
        r.mesh.scale.set(r.scale, r.scale, r.scale);
        r.mesh.material.opacity = Math.max(0, 1 - (r.scale - 1) / (r.maxScale - 1));
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '580px',
        position: 'relative',
        cursor: 'grab',
      }}
    />
  );
}
