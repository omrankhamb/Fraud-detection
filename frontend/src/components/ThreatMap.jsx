import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeGlobe from './ThreeGlobe';

const RECENT_PATTERNS = [
  {
    theme: 'UPI Fraud',
    city: 'Pune',
    state: 'Maharashtra',
    snippet: 'Fake PhonePe cashback reward link demanding UPI PIN to receive money',
    loss: '₹4,999',
    time: '2 mins ago',
  },
  {
    theme: 'Digital Arrest',
    city: 'Delhi NCR',
    state: 'Delhi',
    snippet: 'Fake CBI narcotics summons via Skype video call threatening digital arrest',
    loss: '₹4,50,000',
    time: '9 mins ago',
  },
  {
    theme: 'Electricity Disconnection',
    city: 'Mumbai',
    state: 'Maharashtra',
    snippet: 'Urgent notice claiming electricity power cutoff tonight at 9:30 PM',
    loss: '₹12,000',
    time: '18 mins ago',
  },
  {
    theme: 'Part-Time Task Scam',
    city: 'Bengaluru',
    state: 'Karnataka',
    snippet: 'Telegram task scam promising ₹3000 daily for liking YouTube videos',
    loss: '₹65,000',
    time: '28 mins ago',
  },
];

export default function ThreatMap() {
  const [patternIndex, setPatternIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPatternIndex((prev) => (prev + 1) % RECENT_PATTERNS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activePattern = RECENT_PATTERNS[patternIndex];

  return (
    <section
      className="threat-globe-section"
      id="threat-map"
      style={{
        background: '#070d18',
        paddingTop: 80,
        paddingBottom: 70,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container">
        {/* Title matching Screenshot 6 */}
        <div className="text-center mb-4">
          <h2 className="display-6 fw-bold text-white mb-2">
            Live Threat Radar: Recent Smishing Patterns
          </h2>
          <p className="text-secondary mx-auto small" style={{ maxWidth: 560 }}>
            Real-time cyber fraud intelligence based on reports from I4C, CERT-In, and CBL-01 detection nodes.
          </p>
        </div>

        {/* 3D Rotating Three.js Earth Canvas Container */}
        <div className="position-relative d-flex justify-content-center align-items-center">
          <ThreeGlobe />

          {/* Left Overlay Card matching Screenshot 6 */}
          <div
            style={{
              position: 'absolute',
              bottom: 30,
              left: 20,
              zIndex: 10,
              maxWidth: 320,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activePattern.theme}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35 }}
                className="p-3 rounded-3"
                style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#f97316',
                      boxShadow: '0 0 8px #f97316',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    RECENT PATTERN
                  </span>
                </div>

                <h6 className="fw-bold text-white mb-0" style={{ fontSize: '1rem' }}>
                  {activePattern.theme}
                </h6>
                <div className="text-secondary small mb-2" style={{ fontSize: '0.78rem' }}>
                  {activePattern.city}, {activePattern.state} • {activePattern.time}
                </div>

                <p
                  className="text-white-50 small mb-2"
                  style={{ fontSize: '0.78rem', lineHeight: 1.4 }}
                >
                  "{activePattern.snippet}"
                </p>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-25 text-white-50 small">
                  <span style={{ fontSize: '0.75rem' }}>Loss Reported:</span>
                  <span className="text-warning fw-bold">{activePattern.loss}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Legend at the bottom of the globe matching Screenshot 6 */}
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mt-3 pt-2 text-secondary small">
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#f59e0b',
                boxShadow: '0 0 6px #f59e0b',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Low severity scam</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#f97316',
                boxShadow: '0 0 6px #f97316',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>High severity scam</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 6px #ef4444',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Critical scam / urgent response only
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
