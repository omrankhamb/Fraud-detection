import React from 'react';
import { motion } from 'framer-motion';
import {
  FaBriefcase,
  FaBolt,
  FaGavel,
  FaUniversity,
  FaQrcode,
  FaAndroid,
  FaArrowRight,
} from 'react-icons/fa';

const SERVICES = [
  {
    icon: <FaBriefcase />,
    title: 'Fake Job Offer & Task Scam Checker',
    desc: 'Verify Telegram-based YouTube video liking, Amazon hotel review tasks, and daily income work-from-home offers.',
    badge: 'Popular Scam Theme',
  },
  {
    icon: <FaBolt />,
    title: 'Electricity Bill Disconnection Checker',
    desc: 'Check urgent power cutoff notices claiming unpaid bills and threatening immediate disconnection tonight.',
    badge: 'Urgent Threat',
  },
  {
    icon: <FaGavel />,
    title: 'Digital Arrest & Legal Notice Checker',
    desc: 'Detect extortion calls impersonating CBI, ED, court summons, or Mumbai Cyber Police regarding illegal parcels.',
    badge: 'High Severity',
  },
  {
    icon: <FaUniversity />,
    title: 'Bank KYC & YONO Suspension Checker',
    desc: 'Verify SMS claims that your SBI, HDFC, or ICICI account is blocked requiring PAN or Aadhaar verification link.',
    badge: 'Financial Risk',
  },
  {
    icon: <FaQrcode />,
    title: 'UPI Cashback & Reward Bait Checker',
    desc: 'Unmask fake PhonePe, Paytm, and Google Pay rewards that trick victims into entering their UPI PIN to "receive" money.',
    badge: 'UPI Vector',
  },
  {
    icon: <FaAndroid />,
    title: 'Malicious APK Dropper Detector',
    desc: 'Scan direct Android APK download links masquerading as banking security updates or utility payment apps.',
    badge: 'Malware Risk',
  },
];

export default function ServiceCards({ onSelectService }) {
  return (
    <section className="py-5 bg-white border-top border-bottom" id="services">
      <div className="container">
        {/* Section Heading */}
        <div className="text-center mb-5">
          <span className="badge rounded-pill bg-light text-primary border px-3 py-2 fw-semibold mb-2">
            CBL-01 Project Taxonomies
          </span>
          <h2 className="display-6 fw-bold text-dark">
            Comprehensive Defense Across Indian Scam Themes
          </h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: 620 }}>
            Trained on authentic regulatory advisories from I4C, CERT-In, and the Reserve Bank of India with hard-negative safeguards.
          </p>
        </div>

        {/* 6 Cards Grid matching Screenshot 2 */}
        <div className="row g-4">
          {SERVICES.map((srv, idx) => (
            <motion.div
              key={idx}
              className="col-md-6 col-lg-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <div
                className="service-checker-card"
                onClick={() => onSelectService && onSelectService(srv.title)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="service-card-icon-wrap">{srv.icon}</div>
                  <span className="badge bg-light text-secondary border rounded-pill px-2 py-1 small">
                    {srv.badge}
                  </span>
                </div>

                <h5 className="fw-bold mb-2 text-dark">{srv.title}</h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.6 }}>
                  {srv.desc}
                </p>

                <div className="d-flex align-items-center gap-2 text-primary fw-semibold small mt-auto">
                  <span>Verify with CBL-01</span>
                  <FaArrowRight size={12} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
