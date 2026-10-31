import React from 'react';
import { FaShieldAlt, FaFileAlt, FaTrashAlt, FaStar, FaPhoneAlt, FaArrowDown } from 'react-icons/fa';

export default function Hero({ onStartScanning }) {
  return (
    <section className="hero-outer-section" id="home">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left Column: Heading, Subtitle & Badges */}
          <div className="col-lg-7">
            <div className="d-inline-flex align-items-center gap-2 mb-3">
              <span className="badge rounded-pill bg-dark text-white px-3 py-2 fw-semibold" style={{ fontSize: '0.82rem' }}>
                🛡️ Project CBL-01
              </span>
              <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.82rem' }}>
                Hindi • Marathi • Hinglish • English
              </span>
            </div>

            <h1 className="hero-main-title">
              Free Scam Checker for India <br />
              Check Websites, Links, <br />
              Messages &amp; UPI <span className="hero-title-orange">Instantly.</span>
            </h1>

            <p className="hero-subtext">
              Check suspicious websites, links, WhatsApp messages, UPI IDs and payment screenshots before you click, pay or share. Free, instant and no login required.
            </p>

            {/* Feature Badges in 2 Rows */}
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="scamdekho-pill">
                <FaShieldAlt size={12} className="text-secondary" />
                <span>No signup required</span>
              </span>
              <span className="scamdekho-pill">
                <FaTrashAlt size={12} className="text-secondary" />
                <span>Files auto-deleted</span>
              </span>
              <span className="scamdekho-pill">
                <FaFileAlt size={12} className="text-secondary" />
                <span>Reasons behind every result</span>
              </span>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
              <span className="scamdekho-pill">
                <FaStar size={12} className="text-secondary" />
                <span>Multiple threat signals checked</span>
              </span>
              <span className="scamdekho-pill">
                <FaPhoneAlt size={12} className="text-secondary" />
                <span>Free for everyone</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="d-flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                className="btn btn-dark btn-lg px-4 py-3 rounded-pill fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
                style={{ background: '#0F172A', borderColor: '#0F172A' }}
                onClick={onStartScanning}
              >
                <span>Check Suspicious SMS / WhatsApp / URL Now</span>
                <FaArrowDown size={14} className="text-warning" />
              </button>
              <a
                href="tel:1930"
                className="btn btn-outline-danger btn-lg px-4 py-3 rounded-pill fw-semibold d-inline-flex align-items-center gap-2"
                style={{ background: '#FFF1F2', borderColor: '#F43F5E', color: '#E11D48' }}
              >
                <FaPhoneAlt size={14} />
                <span>Helpline 1930</span>
              </a>
            </div>
          </div>

          {/* Right Column: Exact 3D Visual with Noticeable Layered Animations */}
          <div className="col-lg-5">
            <div
              data-dc-tpl="89"
              aria-hidden="true"
              style={{
                position: 'relative',
                width: 'min(100%, 470px)',
                aspectRatio: '1 / 1',
                margin: '0 auto',
                animation: '0.9s cubic-bezier(0.22, 1, 0.36, 1) 0s 1 normal both running sd-heroRise',
              }}
            >
              {/* Layer 90: Pulsing Ambient Halo */}
              <div
                data-dc-tpl="90"
                style={{
                  position: 'absolute',
                  inset: '-16%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(50% 50% at 52% 44%, rgba(255, 214, 171, 0.76), rgba(255, 236, 215, 0.45) 46%, rgba(255, 247, 239, 0) 74%)',
                  animation: '6.5s ease-in-out 0s infinite normal none running sd-heroHalo',
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0px)',
                }}
              />

              {/* Layer 91: Warm Amber Ambient Orb */}
              <div
                data-dc-tpl="91"
                style={{
                  position: 'absolute',
                  left: '-6%',
                  top: '4%',
                  width: '46%',
                  height: '46%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 34% 30%, rgba(245, 129, 31, 0.38), rgba(245, 129, 31, 0) 70%)',
                  filter: 'blur(14px)',
                  animation: '8s ease-in-out 0s infinite normal none running sd-heroOrb',
                  willChange: 'transform',
                }}
              />

              {/* Layer 92: Deep Navy Ambient Orb */}
              <div
                data-dc-tpl="92"
                style={{
                  position: 'absolute',
                  right: '-4%',
                  bottom: '6%',
                  width: '50%',
                  height: '50%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 60% 60%, rgba(30, 44, 66, 0.22), rgba(30, 44, 66, 0) 70%)',
                  filter: 'blur(18px)',
                  animation: '10s ease-in-out 0s infinite normal none running sd-heroOrbAlt',
                  willChange: 'transform',
                }}
              />

              {/* Layer 93: Organic Ivory Page 1 (Back) */}
              <div
                data-dc-tpl="93"
                style={{
                  position: 'absolute',
                  left: '12%',
                  top: '9%',
                  width: '76%',
                  height: '82%',
                  borderRadius: '38% 42% 40% 44% / 40% 38% 44% 42%',
                  background:
                    'linear-gradient(150deg, rgba(255, 255, 255, 0.96), rgba(255, 232, 209, 0.62) 58%, rgba(255, 206, 158, 0.45))',
                  boxShadow:
                    'rgba(30, 44, 66, 0.32) 0px 34px 70px -26px, rgba(255, 255, 255, 0.9) 0px 2px 3px inset',
                  animation: '7s ease-in-out 0s infinite normal none running sd-heroTiltA',
                  willChange: 'transform',
                  transformOrigin: '50% 60%',
                }}
              />

              {/* Layer 94: Layered Card 2 (Middle) */}
              <div
                data-dc-tpl="94"
                style={{
                  position: 'absolute',
                  left: '9%',
                  top: '16%',
                  width: '82%',
                  height: '70%',
                  borderRadius: '44px',
                  background:
                    'linear-gradient(140deg, rgba(255, 250, 244, 0.94), rgba(255, 222, 192, 0.58))',
                  boxShadow:
                    'rgba(30, 44, 66, 0.28) 0px 26px 54px -22px, rgba(255, 255, 255, 0.95) 0px 1px 2px inset',
                  animation: '5.5s ease-in-out 0s infinite normal none running sd-heroTiltB',
                  willChange: 'transform',
                  transformOrigin: '50% 60%',
                }}
              />

              {/* Layer 95: Front Rounded Card 3 */}
              <div
                data-dc-tpl="95"
                style={{
                  position: 'absolute',
                  left: '16%',
                  top: '22%',
                  width: '68%',
                  height: '60%',
                  borderRadius: '52px',
                  background:
                    'linear-gradient(160deg, rgba(255, 255, 255, 0.82), rgba(255, 238, 222, 0.4))',
                  boxShadow: 'rgba(30, 44, 66, 0.24) 0px 18px 40px -20px',
                  animation: '4.8s ease-in-out 0s infinite normal none running sd-heroTiltC',
                  willChange: 'transform',
                  transformOrigin: '50% 60%',
                }}
              />

              {/* Layer 96: Shield Contact Soft Shadow */}
              <div
                data-dc-tpl="96"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '53%',
                  width: '44%',
                  height: '9%',
                  transform: 'translate(-50%, 0px)',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(50% 50%, rgba(30, 44, 66, 0.28), rgba(30, 44, 66, 0) 72%)',
                  filter: 'blur(9px)',
                }}
              />

              {/* Layer 97 & 98: 3D Dark Navy Shield & Floating Padlock Container */}
              <div
                data-dc-tpl="97"
                style={{
                  position: 'absolute',
                  left: '22%',
                  top: '14%',
                  width: '56%',
                }}
              >
                <div
                  data-dc-tpl="98"
                  style={{
                    position: 'relative',
                    animation: '4.5s ease-in-out 0s infinite normal none running sd-shieldSway',
                    willChange: 'transform',
                  }}
                >
                  {/* Layer 99: Exact SVG Shield */}
                  <svg
                    data-dc-tpl="99"
                    viewBox="0 0 200 224"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      filter: 'drop-shadow(rgba(30, 44, 66, 0.32) 0px 26px 34px)',
                      willChange: 'filter',
                      transform: 'translateZ(0px)',
                    }}
                  >
                    <defs data-dc-tpl="100">
                      <linearGradient data-dc-tpl="101" id="sdShieldBody" x1="0.12" y1="0" x2="0.86" y2="1">
                        <stop data-dc-tpl="102" offset="0" stopColor="#31486A" />
                        <stop data-dc-tpl="103" offset="0.48" stopColor="#1B2C46" />
                        <stop data-dc-tpl="104" offset="1" stopColor="#0C1626" />
                      </linearGradient>
                      <linearGradient data-dc-tpl="105" id="sdShieldGloss" x1="0.2" y1="0" x2="0.7" y2="1">
                        <stop data-dc-tpl="106" offset="0" stopColor="#FFFFFF" stopOpacity="0.30" />
                        <stop data-dc-tpl="107" offset="0.55" stopColor="#FFFFFF" stopOpacity="0.05" />
                        <stop data-dc-tpl="108" offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                      </linearGradient>
                      <clipPath data-dc-tpl="109" id="sdShieldClip">
                        <path
                          data-dc-tpl="110"
                          d="M100 8c4 0 7 1 10 2l64 21c9 3 14 10 14 19v60c0 50-33 83-81 100-4 2-10 2-14 0C45 193 12 160 12 110V50c0-9 5-16 14-19l64-21c3-1 6-2 10-2z"
                        />
                      </clipPath>
                    </defs>

                    <path
                      data-dc-tpl="111"
                      d="M100 8c4 0 7 1 10 2l64 21c9 3 14 10 14 19v60c0 50-33 83-81 100-4 2-10 2-14 0C45 193 12 160 12 110V50c0-9 5-16 14-19l64-21c3-1 6-2 10-2z"
                      fill="url(#sdShieldBody)"
                    />
                    <g data-dc-tpl="112" clipPath="url(#sdShieldClip)">
                      <ellipse data-dc-tpl="113" cx="66" cy="30" rx="104" ry="76" fill="url(#sdShieldGloss)" />
                      <ellipse data-dc-tpl="114" cx="150" cy="212" rx="86" ry="60" fill="#000000" opacity="0.16" />
                    </g>
                    <path
                      data-dc-tpl="115"
                      d="M100 8c4 0 7 1 10 2l64 21c9 3 14 10 14 19v60c0 50-33 83-81 100-4 2-10 2-14 0C45 193 12 160 12 110V50c0-9 5-16 14-19l64-21c3-1 6-2 10-2z"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeOpacity="0.22"
                      strokeWidth="2.4"
                    />
                  </svg>

                  {/* Layer 116: Dynamic Lock Lift Shadow */}
                  <div
                    data-dc-tpl="116"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '71.9%',
                      width: '41%',
                      height: '7%',
                      borderRadius: '50%',
                      background: 'radial-gradient(50% 50%, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0) 78%)',
                      transform: 'translate3d(-50%, -50%, 0px)',
                      opacity: 0.34,
                      animation: '3.2s linear 0s infinite normal none running sd-lockShadow',
                      willChange: 'transform, opacity',
                    }}
                  />

                  {/* Layer 117: Floating Padlock with Dynamic Movement */}
                  <div
                    data-dc-tpl="117"
                    style={{
                      position: 'absolute',
                      left: '0px',
                      top: '0px',
                      width: '100%',
                      animation: '3.2s linear 0s infinite normal none running sd-lockLift',
                      transformOrigin: '50% 67.9%',
                      willChange: 'transform',
                    }}
                  >
                    <svg
                      data-dc-tpl="118"
                      viewBox="0 0 200 224"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        filter: 'drop-shadow(rgba(30, 44, 66, 0.24) 0px 12px 18px)',
                        willChange: 'filter',
                        transform: 'translateZ(0px)',
                      }}
                    >
                      <defs data-dc-tpl="119">
                        <linearGradient data-dc-tpl="120" id="sdLockBody" x1="0.15" y1="0" x2="0.8" y2="1">
                          <stop data-dc-tpl="121" offset="0" stopColor="#FFB169" />
                          <stop data-dc-tpl="122" offset="0.5" stopColor="#F5811F" />
                          <stop data-dc-tpl="123" offset="1" stopColor="#DC6C12" />
                        </linearGradient>
                        <radialGradient data-dc-tpl="124" id="sdLockSheen" cx="0.34" cy="0.24" r="0.7">
                          <stop data-dc-tpl="125" offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
                          <stop data-dc-tpl="126" offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Shackle */}
                      <path
                        data-dc-tpl="127"
                        d="M100 62c14 0 24 10 24 23v13"
                        fill="none"
                        stroke="#FFE7D0"
                        strokeOpacity="0.35"
                        strokeWidth="13"
                        strokeLinecap="round"
                      />
                      <path
                        data-dc-tpl="128"
                        d="M100 62c-14 0-24 10-24 23v13"
                        fill="none"
                        stroke="#FFF3E6"
                        strokeWidth="13"
                        strokeLinecap="round"
                      />
                      <path
                        data-dc-tpl="129"
                        d="M100 62c14 0 24 10 24 23v13"
                        fill="none"
                        stroke="#FFF3E6"
                        strokeWidth="13"
                        strokeLinecap="round"
                      />
                      <path
                        data-dc-tpl="130"
                        d="M97 55c-11 1-19 7-23 16"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity="0.75"
                      />

                      {/* Lock Body with Gradients & Highlights */}
                      <rect data-dc-tpl="131" x="62" y="94" width="76" height="62" rx="20" fill="url(#sdLockBody)" />
                      <rect data-dc-tpl="132" x="62" y="94" width="76" height="62" rx="20" fill="url(#sdLockSheen)" />
                      <rect
                        data-dc-tpl="133"
                        x="62"
                        y="94"
                        width="76"
                        height="62"
                        rx="20"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeOpacity="0.32"
                        strokeWidth="1.6"
                      />
                      <path
                        data-dc-tpl="134"
                        d="M100 112a8 8 0 0 1 4 15l3 12h-14l3-12a8 8 0 0 1 4-15z"
                        fill="#7A3B05"
                        opacity="0.55"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Layer 135: Floating Pearl Ivory Sphere (Left) */}
              <div
                data-dc-tpl="135"
                style={{
                  position: 'absolute',
                  left: '4%',
                  top: '44%',
                  width: '16%',
                  height: '16%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 32% 28%, rgb(255, 255, 255), rgb(255, 227, 198) 46%, rgb(248, 199, 154))',
                  boxShadow:
                    'rgba(30, 44, 66, 0.34) 0px 16px 26px -12px, rgba(216, 150, 96, 0.34) -3px -5px 10px inset',
                  animation: '5.5s ease-in-out 0s infinite normal none running sd-heroDriftA',
                  willChange: 'transform',
                }}
              />

              {/* Layer 136: Floating Golden Amber Sphere (Top Right) */}
              <div
                data-dc-tpl="136"
                style={{
                  position: 'absolute',
                  right: '6%',
                  top: '22%',
                  width: '11%',
                  height: '11%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 34% 26%, rgb(255, 197, 140), rgb(245, 129, 31) 58%, rgb(217, 103, 15))',
                  boxShadow:
                    'rgba(220, 108, 18, 0.55) 0px 14px 24px -10px, rgba(150, 66, 4, 0.35) -2px -4px 8px inset',
                  animation: '4.8s ease-in-out 0.6s infinite normal none running sd-heroDriftB',
                  willChange: 'transform',
                }}
              />

              {/* Layer 137: Floating Navy Sphere (Bottom Right) */}
              <div
                data-dc-tpl="137"
                style={{
                  position: 'absolute',
                  right: '16%',
                  bottom: '12%',
                  width: '8%',
                  height: '8%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 34% 28%, rgb(81, 111, 155), rgb(27, 44, 70) 60%, rgb(12, 22, 38))',
                  boxShadow: 'rgba(30, 44, 66, 0.5) 0px 12px 20px -10px',
                  animation: '6.5s ease-in-out 1.2s infinite normal none running sd-heroDriftC',
                  willChange: 'transform',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
