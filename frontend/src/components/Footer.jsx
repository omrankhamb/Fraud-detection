import React from 'react';
import { FaShieldAlt, FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-dark text-white-50 py-5 border-top border-secondary border-opacity-25">
      <div className="container">
        <div className="row g-4 align-items-center mb-4">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <FaShieldAlt size={16} />
              </div>
              <span className="h5 fw-bold text-white mb-0">CBL-01 ScamShield</span>
            </div>
            <p className="small mb-0" style={{ maxWidth: 420 }}>
              AI-driven multilingual smishing and suspicious link detector defending Indian citizens across Hindi, Marathi, Hinglish, and English.
            </p>
          </div>

          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-3 small mb-2">
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white-50 text-decoration-none"
              >
                National Cyber Crime Portal
              </a>
              <span>•</span>
              <a
                href="https://sancharsaathi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white-50 text-decoration-none"
              >
                Chakshu (DoT)
              </a>
              <span>•</span>
              <a
                href="https://rbikehtahai.rbi.org.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white-50 text-decoration-none"
              >
                RBI Kehta Hai
              </a>
            </div>
            <div className="text-secondary small">
              National Cyber Helpline: <strong>1930</strong> (Toll Free, 24x7)
            </div>
          </div>
        </div>

        <div className="pt-4 border-top border-secondary border-opacity-25 text-center small text-secondary">
          CBL-01 Cyber Defense Project • Built for Indian Cyber Fraud Prevention • MIT License
        </div>
      </div>
    </footer>
  );
}
