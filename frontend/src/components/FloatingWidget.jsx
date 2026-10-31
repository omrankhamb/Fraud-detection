import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaNewspaper, FaShieldAlt, FaPhoneAlt, FaExternalLinkAlt } from 'react-icons/fa';

export default function FloatingWidget({ onTriggerReport }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Pill matching the exact Screenshot (✕ 📰 Audit Security) */}
      <div
        className="floating-bottom-pill-scamdekho"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700 }}>
          {isOpen ? <FaTimes size={12} /> : '✕'}
        </span>
        <div className="d-flex align-items-center gap-2 fw-semibold text-dark" style={{ fontSize: '0.88rem' }}>
          <FaNewspaper size={14} className="text-dark" />
          <span>Audit Security</span>
        </div>
      </div>

      {/* Emergency Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              bottom: 80,
              right: 24,
              width: 360,
              maxWidth: '92vw',
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 45px rgba(0,0,0,0.2)',
              zIndex: 1045,
              padding: 24,
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <FaShieldAlt className="text-warning" />
                Indian Cyber Security Audit
              </h6>
              <button
                type="button"
                className="btn-close btn-sm"
                onClick={() => setIsOpen(false)}
              />
            </div>

            <div className="p-3 rounded-3 bg-danger-subtle text-danger-emphasis small mb-3">
              <strong>National Helpline 1930:</strong> If you lost money in a UPI or net-banking scam, report within the first 2 hours ("Golden Hour") to freeze funds immediately.
            </div>

            <div className="mb-2">
              <a
                href="tel:1930"
                className="btn btn-danger w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              >
                <FaPhoneAlt />
                <span>Call Helpline 1930 (Toll Free)</span>
              </a>
            </div>

            <div className="mb-3">
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-dark btn-sm w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
              >
                <span>cybercrime.gov.in (National Portal)</span>
                <FaExternalLinkAlt size={10} />
              </a>
            </div>

            <div className="text-secondary small border-top pt-2" style={{ fontSize: '0.72rem' }}>
              CBL-01 Automated Scam Attribution • I4C • CERT-In
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
