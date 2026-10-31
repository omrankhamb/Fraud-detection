import React from 'react';
import { FaUser, FaTrashAlt, FaFileAlt, FaShieldAlt, FaStar, FaArrowDown, FaPhoneAlt } from 'react-icons/fa';

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
              Detect Scam SMS &amp; <br />
              WhatsApp Messages in <br />
              Indian Languages &amp; <span className="hero-title-orange">Hinglish.</span>
            </h1>

            <p className="hero-subtext">
              Real-time cybersecurity defense powered by machine learning, live threat intelligence, and brand lookalike detection.
              Protects citizens against fake electricity cutoffs, digital arrest intimidation, KYC deactivations, and malicious APK droppers.
            </p>

            {/* Feature Badges in 2 Rows */}
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="scamdekho-pill">
                <FaShieldAlt size={12} className="text-secondary" />
                <span>Trained on I4C &amp; CERT-In Advisories</span>
              </span>
              <span className="scamdekho-pill">
                <FaFileAlt size={12} className="text-secondary" />
                <span>Trilingual Explanations (EN / HI / MR)</span>
              </span>
              <span className="scamdekho-pill">
                <FaTrashAlt size={12} className="text-secondary" />
                <span>Zero Data Retention / Private</span>
              </span>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
              <span className="scamdekho-pill">
                <FaStar size={12} className="text-secondary" />
                <span>Leave-One-Theme-Out ML Evaluation</span>
              </span>
              <span className="scamdekho-pill">
                <FaPhoneAlt size={12} className="text-secondary" />
                <span>National Cyber Helpline 1930 Integrated</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="d-flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                className="btn btn-dark btn-lg px-4 py-3 rounded-pill fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
                onClick={onStartScanning}
              >
                <span>Check Suspicious SMS / WhatsApp / URL Now</span>
                <FaArrowDown size={14} className="text-warning" />
              </button>
              <a
                href="tel:1930"
                className="btn btn-outline-danger btn-lg px-4 py-3 rounded-pill fw-semibold d-inline-flex align-items-center gap-2"
              >
                <FaPhoneAlt size={14} />
                <span>Helpline 1930</span>
              </a>
            </div>
          </div>

          {/* Right Column: 3D Visual with Exact Halo Layer & Spheres */}
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
              {/* Halo Layer 90 from User Inspector */}
              <div
                data-dc-tpl="90"
                style={{
                  position: 'absolute',
                  inset: '-16%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(50% 50% at 52% 44%, rgba(255, 214, 171, 0.72), rgba(255, 236, 215, 0.42) 46%, rgba(255, 247, 239, 0) 74%)',
                  animation: '9s ease-in-out 0s infinite normal none running sd-heroHalo',
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0px)',
                }}
              />

              {/* Orb Layer 91 from User Inspector */}
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
                    'radial-gradient(circle at 34% 30%, rgba(245, 129, 31, 0.34), rgba(245, 129, 31, 0) 70%)',
                  filter: 'blur(14px)',
                  animation: '13s ease-in-out 0s infinite normal none running sd-heroOrb',
                  willChange: 'transform',
                }}
              />

              {/* Center 3D Ivory Rounded Card */}
              <div className="shield-card-outer">
                <div className="shield-card-layer-bg" />

                <div className="shield-card-layer-front">
                  {/* 3D Dark Navy Shield */}
                  <div
                    className="shield-dark-badge"
                    style={{ animation: 'sd-shieldBreath 6s ease-in-out infinite' }}
                  >
                    {/* Golden Padlock inside */}
                    <div className="golden-padlock-wrap">
                      <div className="padlock-shackle" />
                      <div className="padlock-body">
                        <div className="padlock-keyhole" />
                      </div>
                    </div>
                  </div>

                  {/* Floating 3D Spheres with Gentle Motion */}
                  <div className="sphere-floating-amber" />
                  <div className="sphere-floating-ivory" />
                  <div className="sphere-floating-navy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
