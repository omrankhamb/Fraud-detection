import React from 'react';
import { motion } from 'framer-motion';
import {
  FaCommentDots,
  FaLink,
  FaGavel,
  FaQrcode,
  FaShieldAlt,
  FaBoxOpen,
  FaArrowRight,
  FaCheckCircle,
} from 'react-icons/fa';

export const INSPECTOR_MODES = [
  {
    id: 'deep-message',
    icon: <FaCommentDots />,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    badge: 'Multimodal Ensemble',
    badgeColor: 'text-primary bg-primary-subtle border-primary-subtle',
    title: 'Full Message & WhatsApp Deep Scan',
    desc: 'Deep multi-stream analysis: combines text linguistic threats, extracted links, and 10-digit sender spoofing into one calibrated verdict.',
    tab: 'message',
    sampleText:
      'Dear consumer, your electricity power will be disconnected tonight at 9.30 pm because previous month bill was not updated. Please contact electricity officer at 9876543210 immediately: http://power-bill-update.xyz',
    sampleSender: '9876543210',
    sampleUrl: '',
    ctaText: 'Test Full Message Scan',
  },
  {
    id: 'url-inspector',
    icon: <FaLink />,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    badge: 'Live Threat Intelligence',
    badgeColor: 'text-warning bg-warning-subtle border-warning-subtle',
    title: 'Phishing URL & Domain Inspector',
    desc: 'Pure link inspection: matches Tranco top 25,000 whitelist, OpenPhish zero-day feed, brand typosquatting (sbi, hdfc, indiapost), and malicious APKs.',
    tab: 'url',
    sampleText: '',
    sampleSender: '',
    sampleUrl: 'http://sbi-kyc-verification.xyz/login.php',
    ctaText: 'Inspect Phishing Link',
  },
  {
    id: 'digital-arrest',
    icon: <FaGavel />,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    badge: 'Zero-Link Cyber Threat',
    badgeColor: 'text-danger bg-danger-subtle border-danger-subtle',
    title: 'Digital Arrest & Legal Extortion Checker',
    desc: 'Detects psychological intimidation and fake CBI, ED, or Mumbai Police arrest warrants demanding Skype/WhatsApp video calls with NO URLs.',
    tab: 'message',
    sampleText:
      'सीबीआई साइबर शाखा नोटिस: मनी लॉन्ड्रिंग और नशीले पदार्थों के पार्सल मामले में आपके आधार पर डिजिटल अरेस्ट वारंट जारी हुआ है। तुरंत स्काइप वीडियो कॉल से जुड़ें, कॉल डिस्कनेक्ट न करें।',
    sampleSender: '+919988776655',
    sampleUrl: '',
    ctaText: 'Test Digital Arrest Notice',
  },
  {
    id: 'upi-cashback',
    icon: <FaQrcode />,
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    badge: 'UPI Vector Protection',
    badgeColor: 'text-purple bg-purple-subtle border-purple-subtle',
    title: 'UPI Cashback & PIN Bait Verifier',
    desc: 'Unmasks deceptive PhonePe and GPay reward notifications that trick users into entering their secret UPI PIN to "receive" money.',
    tab: 'message',
    sampleText:
      'Aapko PhonePe cashback reward mila hai Rs 2499 ka. Abhi receive money pe click karke apna UPI PIN dalein aur bank account me paise transfer karein: http://phonepe-reward-claim.xyz',
    sampleSender: 'PhonePeCash',
    sampleUrl: '',
    ctaText: 'Test UPI Cashback Bait',
  },
  {
    id: 'hard-negative-otp',
    icon: <FaShieldAlt />,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    badge: 'Hard Negative Safeguard',
    badgeColor: 'text-success bg-success-subtle border-success-subtle',
    title: 'Authentic Bank OTP & Alert Verifier',
    desc: 'Validates that genuine transaction alerts with registered telecom DLT headers (VK-SBIINB) and safety disclaimers stay 100% SAFE with zero false alarms.',
    tab: 'message',
    sampleText:
      '482910 is your secret OTP for payment of Rs 1,250.00 to AMAZON PAY. Valid for 10 mins. SBI never asks for OTP or PIN. Do not share with anyone.',
    sampleSender: 'VK-SBIINB',
    sampleUrl: '',
    ctaText: 'Test Genuine Bank OTP',
  },
  {
    id: 'customs-parcel',
    icon: <FaBoxOpen />,
    iconBg: '#ffedd5',
    iconColor: '#ea580c',
    badge: 'Courier Smishing',
    badgeColor: 'text-orange bg-orange-subtle border-orange-subtle',
    title: 'India Post & Customs Delivery Hold',
    desc: 'Identifies fake India Post or courier SMS claiming package delivery failure due to incomplete address, requiring small customs clearance fees.',
    tab: 'message',
    sampleText:
      'इंडिया पोस्ट सूचना: तुमचे पार्सल अपूर्ण पत्त्यामुळे अडकून पडले आहे. डिलिव्हरीसाठी तात्काळ पत्ता अपडेट करा आणि रु. ४८ शुल्क भरा: http://indiapost-update.live',
    sampleSender: '+919876543210',
    sampleUrl: '',
    ctaText: 'Test Postal Parcel Scam',
  },
];

export default function ActionCards({ onSelectCard }) {
  return (
    <section className="py-5" id="inspectors" style={{ background: '#f8fafc' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-2">
            <span
              className="badge rounded-pill px-3 py-2 fw-semibold"
              style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.82rem' }}
            >
              🛡️ Specialized Cyber Checkers
            </span>
            <span
              className="badge rounded-pill px-3 py-2 fw-semibold"
              style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.82rem' }}
            >
              <FaCheckCircle className="me-1" /> Ready for Live Inspection
            </span>
          </div>

          <h2 className="display-6 fw-bold text-dark mb-3">
            Choose Your Cyber Threat Inspection Mode
          </h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: 680, fontSize: '1.02rem', lineHeight: 1.6 }}>
            Select an attack vector card below to automatically load its dedicated detection stream, pre-configured parameters, and authentic test patterns into the scanner.
          </p>
        </div>

        {/* 6 Interactive Cards Grid */}
        <div className="row g-4">
          {INSPECTOR_MODES.map((item, idx) => (
            <motion.div
              key={item.id}
              className="col-md-6 col-lg-4"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <div
                className="card h-100 border rounded-4 p-4 d-flex flex-column transition-all"
                style={{
                  background: '#ffffff',
                  borderColor: '#e2e8f0',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 35px rgba(15, 23, 42, 0.09)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                onClick={() => onSelectCard && onSelectCard(item)}
              >
                {/* Card Top: Icon & Badge */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: item.iconBg,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.35rem',
                      boxShadow: `0 4px 12px ${item.iconColor}22`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className={`badge rounded-pill border px-3 py-1 small fw-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.15rem' }}>
                  {item.title}
                </h5>
                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: 1.6, fontSize: '0.88rem' }}>
                  {item.desc}
                </p>

                {/* Card Action Button */}
                <div className="pt-3 border-top border-light d-flex align-items-center justify-content-between mt-auto">
                  <button
                    type="button"
                    className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                    style={{
                      background: item.iconBg,
                      color: item.iconColor,
                      border: `1px solid ${item.iconColor}40`,
                    }}
                  >
                    <span>{item.ctaText}</span>
                    <FaArrowRight size={11} />
                  </button>
                  <span className="text-muted small fw-semibold" style={{ fontSize: '0.74rem' }}>
                    Load in scanner ↵
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
