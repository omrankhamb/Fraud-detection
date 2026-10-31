import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeGlobe from './ThreeGlobe';

const RECENT_PATTERNS = [
  {
    theme: 'UPI Fraud',
    city: 'Pune',
    state: 'Maharashtra',
    snippet: 'Fake PhonePe cashback reward link requesting UPI PIN to receive money',
    loss: '₹4,999',
    time: '2 mins ago',
  },
  {
    theme: 'Digital Arrest',
    city: 'Delhi NCR',
    state: 'Delhi',
    snippet: 'Fake CBI narcotics summons via Skype video call threatening digital arrest',
    loss: '₹4,50,000',
    time: '8 mins ago',
  },
  {
    theme: 'Electricity Disconnection',
    city: 'Mumbai',
    state: 'Maharashtra',
    snippet: 'Urgent notice claiming electricity power cutoff tonight at 9:30 PM for unpaid bill',
    loss: '₹12,000',
    time: '15 mins ago',
  },
  {
    theme: 'Part-Time Task Scam',
    city: 'Bengaluru',
    state: 'Karnataka',
    snippet: 'Telegram task scam promising ₹3000 daily for liking YouTube videos',
    loss: '₹65,000',
    time: '24 mins ago',
  },
  {
    theme: 'SBI YONO KYC Phishing',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    snippet: 'Dear customer your account has been blocked, update PAN on sbi-kyc-verify.net',
    loss: '₹84,000',
    time: '35 mins ago',
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
        paddingBottom: 80,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container">
        {/* Title */}
        <div className="text-center mb-4">
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(26px, 3.8vw, 42px)',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: 12,
            }}
          >
            Recent Scam Patterns Across World
          </h2>
          <p style={{ fontSize: '16px', color: '#8fa3bc', lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
            Based on recent checks run by CBL-01 users and verified national cybercrime feeds.
          </p>
        </div>

        {/* 3D Interactive World Globe */}
        <div className="position-relative d-flex justify-content-center align-items-center" style={{ minHeight: '750px' }}>
          <ThreeGlobe />

          {/* Authentic Corner-Bordered Incident Card matching ScamDekho */}
          <div
            style={{
              position: 'absolute',
              left: '4%',
              bottom: '10%',
              maxWidth: 320,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activePattern.theme}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                style={{
                  position: 'relative',
                  border: '1px dashed rgba(46, 123, 214, 0.65)',
                  padding: '16px 20px',
                  background: 'rgba(7, 17, 31, 0.94)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                }}
              >
                {/* 4 Tech Corner Brackets */}
                <span style={{ position: 'absolute', top: -1, left: -1, width: 9, height: 9, borderTop: '2px solid #2E7BD6', borderLeft: '2px solid #2E7BD6' }} />
                <span style={{ position: 'absolute', top: -1, right: -1, width: 9, height: 9, borderTop: '2px solid #2E7BD6', borderRight: '2px solid #2E7BD6' }} />
                <span style={{ position: 'absolute', bottom: -1, left: -1, width: 9, height: 9, borderBottom: '2px solid #2E7BD6', borderLeft: '2px solid #2E7BD6' }} />
                <span style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderBottom: '2px solid #2E7BD6', borderRight: '2px solid #2E7BD6' }} />

                <div className="d-flex align-items-center gap-2 mb-1">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#F97316',
                      boxShadow: '0 0 8px #F97316',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace, sans-serif",
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

                <h6 className="fw-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>
                  {activePattern.theme}
                </h6>
                <div className="text-secondary small mb-2" style={{ fontSize: '0.8rem' }}>
                  {activePattern.city}, {activePattern.state} • {activePattern.time}
                </div>

                <p className="text-white-50 small mb-2" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
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

        {/* Threat Severity Legend matching Screenshot 6 */}
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mt-3 pt-3 border-top border-secondary border-opacity-25 text-secondary small">
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#F59E0B',
                boxShadow: '0 0 8px #F59E0B',
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Low severity scam</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#F97316',
                boxShadow: '0 0 8px #F97316',
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>High severity scam</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#EF4444',
                boxShadow: '0 0 8px #EF4444',
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Critical scam / urgent response only</span>
          </div>
        </div>
      </div>
    </section>
  );
}
