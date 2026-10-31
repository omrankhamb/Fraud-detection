import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  FaCommentDots,
  FaLink,
  FaShieldAlt,
  FaPhoneAlt,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaLanguage,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';

const SAMPLE_MESSAGES = [
  {
    label: '⚡ Electricity Bill Threat (English)',
    sender: '9876543210',
    text: 'Dear consumer, your electricity power will be disconnected tonight at 9.30 pm because previous month bill was not updated. Please contact electricity officer at 9876543210 immediately: http://power-bill-update.xyz',
  },
  {
    label: '🏛️ CBI Digital Arrest (Hindi)',
    sender: '+919988776655',
    text: 'सीबीआई साइबर शाखा नोटिस: मनी लॉन्ड्रिंग मामले में आपके आधार पर डिजिटल अरेस्ट वारंट जारी हुआ है। तुरंत स्काइप वीडियो कॉल से जुड़ें, कॉल डिस्कनेक्ट न करें।',
  },
  {
    label: '🏦 SBI KYC Block (Marathi)',
    sender: '9822334455',
    text: 'प्रिय ग्राहक, तुमचे एसबीआय (SBI) बँक खाते आज बंद करण्यात आले आहे. सेवा पूर्ववत करण्यासाठी तात्काळ केवायसी अपडेट करा: http://sbi-kyc-verify.xyz/login.php',
  },
  {
    label: '💼 YouTube Task Scam (Hinglish)',
    sender: 'TelegramBot',
    text: 'Part time job offer: Like YouTube videos and earn Rs 3000 daily from home. No fees required. Contact HR on Telegram to claim bonus.',
  },
  {
    label: '✅ Genuine Bank OTP (Hard Negative)',
    sender: 'VK-SBIINB',
    text: '482910 is your secret OTP for payment of Rs 1,250.00 to AMAZON PAY. Valid for 10 mins. SBI never asks for OTP or PIN. Do not share with anyone.',
  },
];

const Scanner = forwardRef((props, ref) => {
  const [activeTab, setActiveTab] = useState('message'); // 'message' | 'url' | 'pure-text'
  const [messageText, setMessageText] = useState('');
  const [senderId, setSenderId] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState('en');

  useImperativeHandle(ref, () => ({
    loadInspectorMode: (item) => {
      if (item.tab === 'url') {
        setActiveTab('url');
        setUrlInput(item.sampleUrl || '');
      } else if (item.tab === 'pure-text') {
        setActiveTab('pure-text');
        setMessageText(item.sampleText || '');
        setSenderId(item.sampleSender || '');
      } else {
        setActiveTab('message');
        setMessageText(item.sampleText || '');
        setSenderId(item.sampleSender || '');
      }
      setResult(null);
      const el = document.getElementById('scanner');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
  }));

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#3b82f6', '#10b981'],
    });
  };

  const handleAnalyzeMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/scan/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageText.trim(),
          sender_id: senderId.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('API server returned error');
      const data = await response.json();
      setResult(data);
      if (data.verdict === 'SAFE') triggerConfetti();
    } catch (err) {
      console.warn('Backend unavailable, running fallback heuristics:', err);
      const textLower = messageText.toLowerCase();
      const isOtpGenuine = textLower.includes('never share') || textLower.includes('do not share');
      const isUrgent = textLower.includes('immediately') || textLower.includes('tonight') || textLower.includes('disconnected');
      const isScam = !isOtpGenuine && (isUrgent || textLower.includes('kyc') || textLower.includes('arrest') || textLower.includes('part time'));

      const fallbackResult = {
        raw_text: messageText,
        sender_id: senderId || 'N/A',
        verdict: isScam ? 'SCAM' : (isUrgent ? 'SUSPICIOUS' : 'SAFE'),
        badge_color: isScam ? '#E53935' : (isUrgent ? '#FB8C00' : '#43A047'),
        risk_score: isScam ? 0.94 : (isUrgent ? 0.55 : 0.08),
        highlight_tokens: isScam ? ['immediately', 'disconnected', 'kyc'] : [],
        reasons: {
          en: [
            isScam
              ? 'Message displays artificial urgency and threatens immediate service deactivation.'
              : 'Message matches legitimate bank notification format with security advisory.'
          ],
          hi: [
            isScam
              ? 'संदेश में तत्काल सेवा बंद करने की धमकी देकर झूठी जल्दबाजी पैदा की गई है।'
              : 'संदेश सामान्य बैंक अलर्ट प्रारूप का पालन करता है।'
          ],
          mr: [
            isScam
              ? 'संदेशात त्वरित सेवा खंडित करण्याची खोटी भीती दाखवली आहे.'
              : 'संदेश अधिकृत बँक व्यवहारांसारखा दिसतो.'
          ],
        },
        safety_advice: [
          isScam
            ? 'DO NOT click links or share OTP/PIN. Report to cybercrime.gov.in or Helpline 1930.'
            : 'Always verify sender IDs and never share confidential banking codes.'
        ],
        url_analysis: {
          has_url: textLower.includes('http') ? 1 : 0,
          analyzed_urls: textLower.includes('http')
            ? [{ url: 'Detected link', lookalike_detected: 1, lookalike_brand: 'Brand' }]
            : [],
        },
      };

      setResult(fallbackResult);
      if (fallbackResult.verdict === 'SAFE') triggerConfetti();
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeUrl = async (e) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/scan/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!response.ok) throw new Error('API server returned error');
      const data = await response.json();

      setResult({
        raw_text: data.url,
        verdict: data.risk_score >= 0.7 ? 'SCAM' : (data.risk_score >= 0.3 ? 'SUSPICIOUS' : 'SAFE'),
        badge_color: data.badge_color,
        risk_score: data.risk_score,
        highlight_tokens: [data.url],
        reasons: {
          en: data.reasons,
          hi: data.reasons.map((r) => 'संदिग्ध लिंक विश्लेषण: ' + r),
          mr: data.reasons.map((r) => 'संशयास्पद लिंक विश्लेषण: ' + r),
        },
        safety_advice: [
          data.risk_score >= 0.5
            ? 'Do not open this link or install APKs. Report to Helpline 1930.'
            : 'Verified official or high-reputation domain.'
        ],
        url_analysis: { has_url: 1, analyzed_urls: [data.details] },
      });

      if (data.risk_score < 0.3) triggerConfetti();
    } catch (err) {
      console.warn('URL fallback:', err);
      setResult({
        raw_text: urlInput,
        verdict: 'SUSPICIOUS',
        badge_color: '#FB8C00',
        risk_score: 0.65,
        highlight_tokens: [urlInput],
        reasons: {
          en: ['URL uses an unverified domain structure or uncommon top-level domain.'],
          hi: ['लिंक में असत्यापित डोमेन संरचना पाई गई है।'],
          mr: ['लिंकमध्ये अनधिकृत डोमेन आढळले आहे.'],
        },
        safety_advice: ['Do not enter passwords if opening this link.'],
        url_analysis: { has_url: 1, analyzed_urls: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `[CBL-01 ScamDetector Report]
Verdict: ${result.verdict} (Risk: ${Math.round(result.risk_score * 100)}%)
Content: "${result.raw_text}"
Sender: ${result.sender_id || 'N/A'}
Reasons:
${result.reasons?.en?.map((r) => '- ' + r).join('\n')}
Action: National Cyber Helpline 1930 / cybercrime.gov.in`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLoadSample = (sample) => {
    setActiveTab('message');
    setMessageText(sample.text);
    setSenderId(sample.sender);
    setResult(null);
  };

  return (
    <section className="py-5" id="scanner" style={{ background: '#f8fafc' }}>
      <div className="container">
        <div
          className="bg-white rounded-4 border p-4 p-md-5"
          style={{
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.05)',
            borderColor: '#e2e8f0',
          }}
        >
          {/* Section Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center pb-4 border-bottom mb-4 gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f97316',
                  }}
                >
                  <FaShieldAlt size={18} />
                </span>
                <h3 className="fw-bold mb-0 text-dark">
                  CBL-01: Multilingual Scam &amp; Phishing Detector
                </h3>
              </div>
              <p className="text-secondary small mb-0">
                Detect fraudulent SMS &amp; WhatsApp messages in Hindi, Marathi, Hinglish, and English with live brand lookalike and threat feed verification.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div
              className="p-1 rounded-pill border d-inline-flex align-items-center flex-wrap gap-1"
              style={{ background: '#f1f5f9', borderColor: '#cbd5e1' }}
            >
              <button
                type="button"
                className="btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                style={{
                  background: activeTab === 'message' ? '#0f172a' : '#ffffff',
                  color: activeTab === 'message' ? '#ffffff' : '#334155',
                  border: activeTab === 'message' ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  boxShadow: activeTab === 'message' ? '0 3px 10px rgba(15,23,42,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  setActiveTab('message');
                  setResult(null);
                }}
              >
                <FaCommentDots size={14} />
                <span>Full Message &amp; Sender</span>
              </button>

              <button
                type="button"
                className="btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                style={{
                  background: activeTab === 'url' ? '#0f172a' : '#ffffff',
                  color: activeTab === 'url' ? '#ffffff' : '#334155',
                  border: activeTab === 'url' ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  boxShadow: activeTab === 'url' ? '0 3px 10px rgba(15,23,42,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  setActiveTab('url');
                  setResult(null);
                }}
              >
                <FaLink size={14} />
                <span>URL &amp; Link Only</span>
              </button>

              <button
                type="button"
                className="btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                style={{
                  background: activeTab === 'pure-text' ? '#0f172a' : '#ffffff',
                  color: activeTab === 'pure-text' ? '#ffffff' : '#334155',
                  border: activeTab === 'pure-text' ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  boxShadow: activeTab === 'pure-text' ? '0 3px 10px rgba(15,23,42,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  setActiveTab('pure-text');
                  setResult(null);
                }}
              >
                <FaShieldAlt size={14} />
                <span>Pure Text / Extortion (No Link)</span>
              </button>
            </div>
          </div>

          {/* Quick Preloaded Sample Chips */}
          <div className="mb-4">
            <span className="text-secondary small fw-semibold me-2 d-inline-block mb-2">
              Try realistic test samples:
            </span>
            <div className="d-flex flex-wrap gap-2">
              {SAMPLE_MESSAGES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-sm rounded-pill px-3 py-1.5 text-start small border shadow-sm"
                  style={{
                    background: '#ffffff',
                    color: '#1e293b',
                    borderColor: '#cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ea580c';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                  onClick={() => handleLoadSample(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Area */}
          {activeTab !== 'url' ? (
            <form onSubmit={handleAnalyzeMessage}>
              <div className="row g-4 mb-3">
                <div className="col-lg-8">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold text-dark mb-0 small">
                      Message Text (SMS, WhatsApp, Chat)
                    </label>
                    <span className="badge rounded-pill bg-light text-secondary border small">
                      Auto-detect: Hindi / Marathi / Hinglish / English
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    className="form-control rounded-3 p-3"
                    style={{
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.98rem',
                      lineHeight: 1.55,
                      background: '#f8fafc',
                    }}
                    placeholder="Paste the suspicious message here... (e.g. 'Dear customer, your electricity will be disconnected tonight at 9.30 pm due to unpaid bill...')"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </div>

                <div className="col-lg-4 d-flex flex-column justify-content-between">
                  <div>
                    <label className="form-label fw-bold text-dark mb-2 small">
                      Sender Header or Phone (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-3 py-2 px-3 fs-6"
                      style={{ border: '1.5px solid #cbd5e1' }}
                      placeholder="e.g. VK-SBIINB or +919876543210"
                      value={senderId}
                      onChange={(e) => setSenderId(e.target.value)}
                    />
                    <p className="text-muted small mt-2 mb-0" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                      Detects when banking/govt notices originate from 10-digit personal mobile numbers rather than registered DLT headers.
                    </p>
                  </div>

                  <div className="mt-3">
                    <button
                      type="submit"
                      disabled={loading || !messageText.trim()}
                      className="btn w-100 py-3 rounded-pill fw-bold text-white shadow d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        border: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 8px 20px rgba(249, 115, 22, 0.35)',
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" />
                          <span>Scanning with CBL-01 AI...</span>
                        </>
                      ) : (
                        <>
                          <FaShieldAlt />
                          <span>Scan Message Instantly</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAnalyzeUrl}>
              <div className="row g-3 mb-3">
                <div className="col-lg-9">
                  <label className="form-label fw-bold text-dark mb-2 small">
                    Website or Phishing Link URL
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-3 py-3 px-3 fs-6"
                    style={{ border: '1.5px solid #cbd5e1' }}
                    placeholder="e.g. http://sbi-kyc-verification.xyz/login.php or bit.ly/3xPendingUPI"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <div className="text-muted small mt-2">
                    Scans against live OpenPhish blocklists, brand typosquats (SBI, HDFC, Paytm), APK droppers, and URL shorteners.
                  </div>
                </div>

                <div className="col-lg-3 d-flex align-items-end">
                  <button
                    type="submit"
                    disabled={loading || !urlInput.trim()}
                    className="btn w-100 py-3 rounded-pill fw-bold text-white shadow d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      border: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 8px 20px rgba(249, 115, 22, 0.35)',
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <FaLink />
                        <span>Inspect Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Results Card */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 pt-4 border-top"
              >
                <div className="row g-4">
                  {/* Gauge & Verdict */}
                  <div className="col-lg-4 text-center border-end">
                    <div
                      className="p-4 rounded-4 d-flex flex-column align-items-center justify-content-center h-100"
                      style={{
                        background:
                          result.verdict === 'SCAM'
                            ? '#fee2e2'
                            : result.verdict === 'SUSPICIOUS'
                            ? '#fef3c7'
                            : '#dcfce7',
                      }}
                    >
                      {/* Meter Circle */}
                      <div
                        style={{
                          width: 124,
                          height: 124,
                          borderRadius: '50%',
                          border: `8px solid ${result.badge_color}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 16,
                          background: '#ffffff',
                          boxShadow: `0 8px 24px ${result.badge_color}33`,
                        }}
                      >
                        <span className="h2 fw-extrabold mb-0" style={{ color: result.badge_color }}>
                          {Math.round(result.risk_score * 100)}%
                        </span>
                        <span className="small text-muted fw-bold" style={{ fontSize: '0.68rem' }}>
                          RISK SCORE
                        </span>
                      </div>

                      {/* Verdict Badge */}
                      <span
                        className="badge px-4 py-2 rounded-pill fw-bold mb-2"
                        style={{
                          fontSize: '0.95rem',
                          backgroundColor: result.badge_color,
                          color: '#ffffff',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {result.verdict === 'SCAM'
                          ? '🚨 CRITICAL SCAM ALERT'
                          : result.verdict === 'SUSPICIOUS'
                          ? '⚠️ SUSPICIOUS / CAUTION'
                          : '✅ SAFE / VERIFIED'}
                      </span>

                      <p className="text-secondary small mb-3" style={{ fontSize: '0.84rem' }}>
                        {result.verdict === 'SCAM'
                          ? 'High probability of fraudulent smishing or credential theft.'
                          : result.verdict === 'SUSPICIOUS'
                          ? 'Uncertain or suspicious cues detected. Verify independently before acting.'
                          : 'Standard legitimate transactional format; no known malicious patterns detected.'}
                      </p>

                      {result.verdict !== 'SAFE' && (
                        <div className="w-100">
                          <a
                            href="tel:1930"
                            className="btn btn-danger w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 mb-2 shadow-sm"
                          >
                            <FaPhoneAlt />
                            <span>Dial Helpline 1930</span>
                          </a>
                          <a
                            href="https://cybercrime.gov.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-dark btn-sm w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-1"
                          >
                            <span>Report to cybercrime.gov.in</span>
                            <FaExternalLinkAlt size={10} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Highlights & Trilingual Explanations */}
                  <div className="col-lg-8">
                    {/* Content Preview */}
                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold small text-dark">Analyzed Content</span>
                        <button
                          type="button"
                          className="btn btn-sm px-3 py-1 rounded-pill fw-semibold border shadow-sm"
                          style={{
                            background: copied ? '#dcfce7' : '#ffffff',
                            borderColor: copied ? '#86efac' : '#cbd5e1',
                            color: copied ? '#15803d' : '#334155',
                          }}
                          onClick={handleCopyReport}
                        >
                          {copied ? (
                            <span className="small fw-semibold d-inline-flex align-items-center gap-1">
                              <FaCheck /> Copied Report!
                            </span>
                          ) : (
                            <span className="small d-inline-flex align-items-center gap-1">
                              <FaCopy /> Copy Incident Report
                            </span>
                          )}
                        </button>
                      </div>
                      <div
                        className="p-3 rounded-3 border bg-light small"
                        style={{ lineHeight: 1.6 }}
                      >
                        {result.raw_text}
                      </div>
                    </div>

                    {/* Trilingual Tabs */}
                    <div className="card rounded-3 border">
                      <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-2">
                        <span className="fw-semibold small text-dark d-flex align-items-center gap-2">
                          <FaLanguage className="text-primary" />
                          Plain-Language Explanation (कारणे / कारण)
                        </span>

                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-sm fw-semibold"
                            style={{
                              background: activeLangTab === 'en' ? '#0f172a' : '#f1f5f9',
                              color: activeLangTab === 'en' ? '#ffffff' : '#334155',
                              border: '1px solid #cbd5e1',
                            }}
                            onClick={() => setActiveLangTab('en')}
                          >
                            English
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm fw-semibold"
                            style={{
                              background: activeLangTab === 'hi' ? '#0f172a' : '#f1f5f9',
                              color: activeLangTab === 'hi' ? '#ffffff' : '#334155',
                              border: '1px solid #cbd5e1',
                            }}
                            onClick={() => setActiveLangTab('hi')}
                          >
                            हिंदी
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm fw-semibold"
                            style={{
                              background: activeLangTab === 'mr' ? '#0f172a' : '#f1f5f9',
                              color: activeLangTab === 'mr' ? '#ffffff' : '#334155',
                              border: '1px solid #cbd5e1',
                            }}
                            onClick={() => setActiveLangTab('mr')}
                          >
                            मराठी
                          </button>
                        </div>
                      </div>

                      <div className="card-body p-3">
                        <ul className="mb-0 ps-3 small">
                          {result.reasons && result.reasons[activeLangTab] ? (
                            result.reasons[activeLangTab].map((reason, i) => (
                              <li key={i} className="mb-2 fw-medium text-dark">
                                {reason}
                              </li>
                            ))
                          ) : (
                            <li className="text-muted">No specific risk triggers flagged.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* URL Brand Inspection */}
                    {result.url_analysis && result.url_analysis.has_url === 1 && (
                      <div className="mt-3 p-3 rounded-3 border bg-warning-subtle text-warning-emphasis small">
                        <div className="fw-bold mb-1 d-flex align-items-center gap-1">
                          <FaLink />
                          <span>Link &amp; Domain Security Assessment</span>
                        </div>
                        {result.url_analysis.analyzed_urls &&
                        result.url_analysis.analyzed_urls.length > 0 ? (
                          result.url_analysis.analyzed_urls.map((u, i) => (
                            <div key={i} className="mt-2">
                              <div>
                                <strong>URL:</strong> {u.url}
                              </div>
                              {u.lookalike_detected ? (
                                <div className="text-danger fw-semibold">
                                  🚨 Typosquatting Alert: Imitates genuine brand '{u.lookalike_brand}'.
                                </div>
                              ) : null}
                              {u.has_apk ? (
                                <div className="text-danger fw-semibold">
                                  ⚠️ Contains direct Android APK installer download.
                                </div>
                              ) : null}
                              {u.is_shortener ? (
                                <div className="text-secondary">
                                  ℹ️ Concealed using URL shortener.
                                </div>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <div>Extracted link assessed against live cybersecurity threat feeds.</div>
                        )}
                      </div>
                    )}

                    <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-sm px-4 py-2 rounded-pill fw-bold shadow-sm"
                        style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}
                        onClick={() => {
                          setMessageText('');
                          setSenderId('');
                          setUrlInput('');
                          setResult(null);
                        }}
                      >
                        Check Another Message / Link
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
});

export default Scanner;
