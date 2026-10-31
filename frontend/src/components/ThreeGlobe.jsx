import React, { useEffect, useRef } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';

const MARKERS = [
  { lat: 19.0760, lng: 72.8777, city: "Mumbai", state: "Maharashtra", country: "India", type: "Phishing Attack", severity: "high" },
  { lat: 28.6139, lng: 77.2090, city: "Delhi NCR", state: "Delhi", country: "India", type: "Digital Arrest Call", severity: "high" },
  { lat: 12.9716, lng: 77.5946, city: "Bengaluru", state: "Karnataka", country: "India", type: "Part-Time Task Scam", severity: "medium" },
  { lat: 17.3850, lng: 78.4867, city: "Hyderabad", state: "Telangana", country: "India", type: "Job Offer Fraud", severity: "medium" },
  { lat: 18.5204, lng: 73.8567, city: "Pune", state: "Maharashtra", country: "India", type: "UPI Cashback Fraud", severity: "high" },
  { lat: 22.5726, lng: 88.3639, city: "Kolkata", state: "West Bengal", country: "India", type: "Lottery Scam", severity: "medium" },
  { lat: 13.0827, lng: 80.2707, city: "Chennai", state: "Tamil Nadu", country: "India", type: "Customs Parcel Extortion", severity: "medium" },
  { lat: 26.8467, lng: 80.9462, city: "Lucknow", state: "Uttar Pradesh", country: "India", type: "SBI YONO Netbanking Phishing", severity: "high" },
  { lat: 26.9124, lng: 75.7873, city: "Jaipur", state: "Rajasthan", country: "India", type: "QR Code Fraud", severity: "medium" },
  { lat: 23.0225, lng: 72.5714, city: "Ahmedabad", state: "Gujarat", country: "India", type: "Fake Bank KYC Update", severity: "high" },
  { lat: 51.5072, lng: -0.1276, city: "London", state: "England", country: "United Kingdom", type: "Crypto Fraud", severity: "medium" },
  { lat: 40.7128, lng: -74.0060, city: "New York", state: "New York", country: "United States", type: "Romance Scam", severity: "medium" },
  { lat: 1.3521, lng: 103.8198, city: "Singapore", state: "", country: "Singapore", type: "Fake Investment App", severity: "medium" },
  { lat: 25.2048, lng: 55.2708, city: "Dubai", state: "", country: "United Arab Emirates", type: "Job Scam Ring", severity: "high" },
];

function buildMarkerArcs(markers) {
  const arcs = [];
  for (let i = 0; i < markers.length; i++) {
    const next = markers[(i + 1) % markers.length];
    arcs.push({
      startLat: markers[i].lat,
      startLng: markers[i].lng,
      endLat: next.lat,
      endLng: next.lng,
    });
  }
  return arcs;
}

export default function ThreeGlobe() {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = '';

    const width = el.clientWidth || window.innerWidth;
    const height = Math.min(window.innerHeight * 0.9, 750);

    // Instantiate Globe
    const world = Globe({ rendererConfig: { antialias: true, alpha: true, powerPreference: 'high-performance' } })(el)
      .width(width)
      .height(height)
      .backgroundColor('rgba(0, 0, 0, 0)')
      .showAtmosphere(true)
      .atmosphereColor('#2E7BD6')
      .atmosphereAltitude(0.22)
      .showGraticules(true)
      .pointsData(MARKERS)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor((d) => (d.severity === 'high' ? '#FF3B30' : '#FF9E52'))
      .pointAltitude(0.014)
      .pointRadius((d) => (d.severity === 'high' ? 0.36 : 0.28))
      .pointResolution(24)
      .pointLabel((d) => `
        <div style="position:relative;font-family:'IBM Plex Mono',monospace;background:rgba(7,17,31,0.94);border:1px dashed rgba(46,123,214,0.65);padding:14px 18px;min-width:196px;color:#fff;">
          <span style="position:absolute;top:-1px;left:-1px;width:9px;height:9px;border-top:1.5px solid #2E7BD6;border-left:1.5px solid #2E7BD6;"></span>
          <span style="position:absolute;top:-1px;right:-1px;width:9px;height:9px;border-top:1.5px solid #2E7BD6;border-right:1.5px solid #2E7BD6;"></span>
          <span style="position:absolute;bottom:-1px;left:-1px;width:9px;height:9px;border-bottom:1.5px solid #2E7BD6;border-left:1.5px solid #2E7BD6;"></span>
          <span style="position:absolute;bottom:-1px;right:-1px;width:9px;height:9px;border-bottom:1.5px solid #2E7BD6;border-right:1.5px solid #2E7BD6;"></span>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="width:6px;height:6px;border-radius:50%;background:${d.severity === 'high' ? '#FF3B30' : '#FF9E52'};display:inline-block;"></span>
            <span style="font-size:10px;font-weight:600;letter-spacing:0.06em;color:#7FB2EC;">RECENT PATTERN</span>
          </div>
          <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:800;color:#FFFFFF;margin-bottom:4px;">${d.type}</div>
          <div style="font-size:12px;color:#9AB2CC;">${d.city}${d.state ? ', ' + d.state : ''}</div>
          <div style="font-size:11px;color:#6B8199;letter-spacing:0.05em;text-transform:uppercase;margin-top:3px;">${d.country || ''}</div>
          <div style="font-size:10px;color:#5E7590;letter-spacing:0.05em;margin-top:7px;">Reported scam pattern</div>
        </div>
      `)
      .ringsData(MARKERS)
      .ringLat('lat')
      .ringLng('lng')
      .ringColor((d) => (t) => `rgba(${d.severity === 'high' ? '255,59,48' : '255,158,82'},${0.9 * (1 - t)})`)
      .ringMaxRadius(3.6)
      .ringPropagationSpeed(1.7)
      .ringRepeatPeriod(1500)
      .ringAltitude(0.013)
      .arcsData(buildMarkerArcs(MARKERS))
      .arcStartLat('startLat')
      .arcStartLng('startLng')
      .arcEndLat('endLat')
      .arcEndLng('endLng')
      .arcColor(() => ['rgba(46,123,214,0.32)', 'rgba(46,123,214,0.04)'])
      .arcAltitude(0.18)
      .arcStroke(0.3)
      .arcDashLength(0.5)
      .arcDashGap(2)
      .arcDashAnimateTime(3500);

    globeInstanceRef.current = world;

    // Lighting setup
    world.scene().add(new THREE.AmbientLight(0xffffff, 1.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(1, 1, 1);
    world.scene().add(dirLight);

    // Glowing Sprite Texture for Hotspots
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const gctx = glowCanvas.getContext('2d');
    const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.25, 'rgba(255,158,82,0.75)');
    grad.addColorStop(1, 'rgba(255,122,26,0)');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const spriteMat = new THREE.SpriteMaterial({ map: glowTexture, color: '#FF9E52', transparent: true, depthWrite: false });

    world
      .customLayerData(MARKERS)
      .customThreeObjectUpdate((obj, d) => {
        if (!obj || !obj.position) return;
        const coords = world.getCoords(d.lat, d.lng, 0.02);
        obj.position.set(coords.x, coords.y, coords.z);
      })
      .customThreeObject((d) => {
        const sprite = new THREE.Sprite(spriteMat.clone());
        if (d.severity === 'high' && sprite.material && sprite.material.color) {
          sprite.material.color.set('#FF3B30');
        }
        const scale = d.severity === 'high' ? 7 : 5.2;
        sprite.scale.set(scale, scale, 1);
        return sprite;
      });

    // Dark Globe Material
    const applyGlobeMaterial = () => {
      const gMat = world.globeMaterial();
      if (!gMat) return;
      if (gMat.color) gMat.color.set('#07111F');
      gMat.transparent = true;
      gMat.opacity = 0.95;
      gMat.depthWrite = true;
      if (gMat.emissive) {
        gMat.emissive.set('#07111F');
        if (typeof gMat.emissiveIntensity === 'number') gMat.emissiveIntensity = 1;
      }
      gMat.needsUpdate = true;
    };

    if (typeof world.onGlobeReady === 'function') {
      world.onGlobeReady(applyGlobeMaterial);
    }
    applyGlobeMaterial();
    setTimeout(applyGlobeMaterial, 250);

    // Focus on India
    world.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 2.1 }, 1000);

    // Controls
    const controls = world.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;

    // Load Natural Earth Countries GeoJSON
    fetch('/ne_110m_admin_0_countries.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((countries) => {
        world
          .polygonsData(countries.features)
          .polygonCapColor(() => '#123C68')
          .polygonSideColor(() => '#0D2C4D')
          .polygonStrokeColor(() => '#3E86D8')
          .polygonAltitude(0.006);
      })
      .catch((err) => {
        console.warn('Globe local geojson fallback:', err);
        fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
          .then((r) => r.json())
          .then((countries) => {
            world
              .polygonsData(countries.features)
              .polygonCapColor(() => '#123C68')
              .polygonSideColor(() => '#0D2C4D')
              .polygonStrokeColor(() => '#3E86D8')
              .polygonAltitude(0.006);
          });
      });

    // Resize
    const handleResize = () => {
      if (!el || !globeInstanceRef.current) return;
      const newWidth = el.clientWidth;
      const newHeight = Math.min(window.innerHeight * 0.9, 750);
      globeInstanceRef.current.width(newWidth).height(newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeInstanceRef.current) {
        globeInstanceRef.current._destructor && globeInstanceRef.current._destructor();
      }
      el.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="sd-globe-host"
      style={{
        width: '100%',
        height: '750px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
}
