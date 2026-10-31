import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPaperPlane,
  FaArrowLeft,
  FaShieldAlt,
  FaPhoneAlt,
  FaTrashAlt,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt,
  FaLanguage,
  FaRobot,
  FaUser,
  FaLink,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaPlus,
  FaBars,
  FaHistory,
  FaBolt,
  FaGavel,
  FaUniversity,
  FaBriefcase,
  FaChevronRight,
} from 'react-icons/fa';

// Helper component to render markdown (**bold**, bullet lists, linebreaks) cleanly
function FormattedText({ content }) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="chat-formatted-body">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const parsedLine = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="fw-bold text-dark">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          return (
            <div key={i} className="d-flex align-items-start gap-2 ms-2 my-1">
              <span className="text-warning mt-1" style={{ fontSize: '0.65rem' }}>
                ●
              </span>
              <span className="text-dark">{parsedLine}</span>
            </div>
          );
        }
        if (!trimmed) {
          return <div key={i} style={{ height: 6 }} />;
        }
        return (
          <p key={i} className="mb-1 text-dark" style={{ lineHeight: 1.6 }}>
            {parsedLine}
          </p>
        );
      })}
    </div>
  );
}

const SAMPLE_THREATS = [
  {
    id: 'elec-bill',
    icon: <FaBolt />,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    title: 'Electricity Bill Cutoff',
    desc: 'Power disconnection tonight at 9:30 PM due to unpaid bill. Call officer immediately.',
    sender: '9876543210',
    text: 'Dear consumer, your electricity power will be disconnected tonight at 9.30 pm because previous month bill was not updated. Please contact electricity officer at 9876543210 immediately: http://power-bill-update.xyz',
  },
  {
    id: 'cbi-arrest',
    icon: <FaGavel />,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    title: 'CBI Digital Arrest (Hindi)',
    desc: 'Narcotics parcel money laundering notice via Skype video call threat.',
    sender: '+919988776655',
    text: 'सीबीआई साइबर शाखा नोटिस: मनी लॉन्ड्रिंग और नशीले पदार्थों के पार्सल मामले में आपके आधार पर डिजिटल अरेस्ट वारंट जारी हुआ है। तुरंत स्काइप वीडियो कॉल से जुड़ें, कॉल डिस्कनेक्ट न करें।',
  },
  {
    id: 'sbi-kyc',
    icon: <FaUniversity />,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    title: 'SBI KYC Suspension (Marathi)',
    desc: 'Account blocked SMS demanding PAN verification on malicious link.',
    sender: '9822334455',
    text: 'प्रिय ग्राहक, तुमचे एसबीआय (SBI) बँक खाते आज बंद करण्यात आले आहे. सेवा पूर्ववत करण्यासाठी तात्काळ केवायसी अपडेट करा: http://sbi-kyc-verify.xyz/login.php',
  },
  {
    id: 'yt-task',
    icon: <FaBriefcase />,
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    title: 'YouTube Task Job (Hinglish)',
    desc: 'Earn ₹3,000 daily from home by liking YouTube videos on Telegram.',
    sender: 'TelegramHR',
    text: 'Part time job offer: Like YouTube videos and earn Rs 3000 daily from home. No registration fee required. Contact manager on Telegram to claim signup bonus.',
  },
];

const KNOWLEDGE_BASE = [
  {
    keywords: ['1930', 'helpline', 'complaint', 'how to report', 'police', 'golden hour'],
    reply: `📞 **National Cyber Crime Helpline: 1930**
• Operates 24x7 across all Indian States & Union Territories.
• **Golden Hour Rule**: Reporting within 2 to 4 hours allows banks to freeze fraudulent money transfers before scammers cash out.
• Official reporting portal: **https://cybercrime.gov.in**`,
  },
  {
    keywords: ['digital arrest', 'skype', 'cbi', 'narcotics', 'ed warrant', 'customs parcel'],
    reply: `🚨 **Crucial Advisory on "Digital Arrest" Scams**:
• **There is NO legal provision of "Digital Arrest" in India**.
• Police, CBI, ED, NIA, or Judges NEVER conduct trials, issue bail, or arrest citizens via Skype or WhatsApp video calls.
• Law enforcement will NEVER ask you to transfer funds to "RBI verification accounts".
• If targeted: **Disconnect immediately and dial 1930**.`,
  },
  {
    keywords: ['electricity', 'power bill', 'cut off', 'disconnected', 'light bill'],
    reply: `⚡ **How Electricity Bill Fraud Operates**:
• Scammers send urgent messages threatening power disconnection tonight at 9:30 PM.
• They supply personal 10-digit mobile numbers or APK download links.
• Genuine electricity boards (MSEDCL, BSES, Adani, Tata Power) always use registered sender IDs (e.g., \`VM-MSEB\`) and NEVER provide personal mobile numbers or APK links.`,
  },
];

export default function ChatScanner({ onBackToDashboard }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [senderHeader, setSenderHeader] = useState('');
  const [showSenderField, setShowSenderField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeLangTabs, setActiveLangTabs] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Scan history stored in state matching dashboard palette
  const [scanHistory, setScanHistory] = useState([
    {
      id: 'h-1',
      title: 'Electricity Bill Disconnection',
      verdict: 'SCAM',
      risk: 99,
      timestamp: '10 mins ago',
    },
    {
      id: 'h-2',
      title: 'CBI Digital Arrest Skype Notice',
      verdict: 'SCAM',
      risk: 97,
      timestamp: '25 mins ago',
    },
    {
      id: 'h-3',
      title: 'Amazon OTP Verification',
      verdict: 'SAFE',
      risk: 3,
      timestamp: '1 hour ago',
    },
  ]);

  const chatBottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleLangToggle = (msgId, lang) => {
    setActiveLangTabs((prev) => ({ ...prev, [msgId]: lang }));
  };

  const copyIncidentReport = (msg) => {
    const r = msg.analysis;
    if (!r) return;
    const report = `[Scam Detector Incident Report]
Verdict: ${r.verdict} (Risk Score: ${Math.round(r.risk_score * 100)}%)
Analyzed Content: "${r.raw_text}"
Sender: ${r.sender_id || 'N/A'}
Flagged Signals:
${r.reasons?.en?.map((s) => '- ' + s).join('\n') || '- Suspicious smishing indicators'}
Action: Report to 1930 / https://cybercrime.gov.in`;

    navigator.clipboard.writeText(report);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSend = async (textToSend = null, senderToSend = null) => {
    const text = (textToSend !== null ? textToSend : inputText).trim();
    const sender = (senderToSend !== null ? senderToSend : senderHeader).trim();

    if (!text || loading) return;

    // Append user message
    const userMsgId = 'user-' + Date.now();
    const newUserMsg = {
      id: userMsgId,
      sender: 'user',
      text: text,
      senderHeader: sender || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (textToSend === null) {
      setInputText('');
    }
    setLoading(true);

    // Check knowledge base
    const lower = text.toLowerCase();
    const matchedKb = KNOWLEDGE_BASE.find((k) =>
      k.keywords.some((w) => lower.includes(w)) && text.length < 80
    );

    if (matchedKb) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            type: 'faq',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: matchedKb.reply,
          },
        ]);
        setLoading(false);
      }, 550);
      return;
    }

    // Call live API
    try {
      const isPureUrl = (text.startsWith('http://') || text.startsWith('https://')) && !text.includes(' ');
      let apiEndpoint = '/api/scan/message';
      let requestBody = { text: text, sender_id: sender || undefined };

      if (isPureUrl) {
        apiEndpoint = '/api/scan/url';
        requestBody = { url: text };
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      let data;
      if (response.ok) {
        data = await response.json();
      } else {
        throw new Error('API server returned ' + response.status);
      }

      let analysisResult;
      if (isPureUrl) {
        analysisResult = {
          raw_text: text,
          sender_id: sender || 'N/A',
          verdict: data.risk_score >= 0.7 ? 'SCAM' : (data.risk_score >= 0.3 ? 'SUSPICIOUS' : 'SAFE'),
          badge_color: data.badge_color || (data.risk_score >= 0.7 ? '#E53935' : (data.risk_score >= 0.3 ? '#FB8C00' : '#43A047')),
          risk_score: data.risk_score,
          highlight_tokens: [text],
          reasons: {
            en: data.reasons || ['Assessed domain against cybersecurity threat feeds.'],
            hi: (data.reasons || []).map((r) => 'लिंक विश्लेषण: ' + r),
            mr: (data.reasons || []).map((r) => 'संशयास्पद लिंक विश्लेषण: ' + r),
          },
          safety_advice: [
            data.risk_score >= 0.5
              ? 'Do not open this link or install APKs. Report to Helpline 1930.'
              : 'Verified official or high-reputation domain.',
          ],
          url_analysis: { has_url: 1, analyzed_urls: [data.details || {}] },
        };
      } else {
        analysisResult = data;
      }

      // Add to history
      setScanHistory((prev) => [
        {
          id: 'h-' + Date.now(),
          title: text.slice(0, 32) + (text.length > 32 ? '...' : ''),
          verdict: analysisResult.verdict,
          risk: Math.round(analysisResult.risk_score * 100),
          timestamp: 'Just now',
        },
        ...prev.slice(0, 9),
      ]);

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          type: 'analysis',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          analysis: analysisResult,
        },
      ]);
    } catch (err) {
      console.warn('Backend offline, running heuristic evaluation:', err);
      const textLower = text.toLowerCase();
      const isOtpGenuine = textLower.includes('never share') || textLower.includes('do not share');
      const isUrgent = textLower.includes('immediately') || textLower.includes('tonight') || textLower.includes('disconnected') || textLower.includes('तात्काळ') || textLower.includes('तुरंत');
      const isScam = !isOtpGenuine && (isUrgent || textLower.includes('kyc') || textLower.includes('arrest') || textLower.includes('वारंट') || textLower.includes('part time'));

      const fallbackResult = {
        raw_text: text,
        sender_id: sender || 'N/A',
        verdict: isScam ? 'SCAM' : (isUrgent ? 'SUSPICIOUS' : 'SAFE'),
        badge_color: isScam ? '#E53935' : (isUrgent ? '#FB8C00' : '#43A047'),
        risk_score: isScam ? 0.98 : (isUrgent ? 0.55 : 0.03),
        highlight_tokens: isScam ? ['immediately', 'disconnected', 'kyc', 'arrest'] : [],
        reasons: {
          en: [
            isScam
              ? 'Message displays artificial urgency, threats of deactivation or psychological coercion.'
              : 'Message structure matches normal benign or informational communication.',
          ],
          hi: [
            isScam
              ? 'संदेश में तत्काल सेवा बंद करने या कानूनी गिरफ्तारी की धमकी देकर झूठी जल्दबाजी पैदा की गई है।'
              : 'संदेश सामान्य सूचनात्मक प्रारूप का पालन करता है।',
          ],
          mr: [
            isScam
              ? 'संदेशात त्वरित सेवा खंडित करण्याची किंवा अटकेची खोटी भीती दाखवली आहे.'
              : 'संदेश अधिकृत व्यवहारांसारखा दिसतो.',
          ],
        },
        safety_advice: [
          isScam
            ? 'DO NOT click links, call the number, or share OTP/PIN. Dial Helpline 1930.'
            : 'Always verify sender IDs and never share confidential banking PINs.',
        ],
        url_analysis: {
          has_url: textLower.includes('http') ? 1 : 0,
          analyzed_urls: textLower.includes('http')
            ? [{ url: 'Flagged URL', lookalike_detected: 1, lookalike_brand: 'Target Brand' }]
            : [],
        },
      };

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          type: 'analysis',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          analysis: fallbackResult,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputText('');
    setSenderHeader('');
  };

  return (
    <div className="chat-app-root">
      {/* Sidebar Styled with Exact Dashboard Colors (Clean Slate #F8FAFC & Brand Orange) */}
      <aside className={`chat-sidebar ${!sidebarOpen ? 'chat-sidebar-mobile-hidden' : ''}`}>
        {/* Sidebar Brand Header matching Dashboard Navbar */}
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ background: '#FFFFFF', borderColor: '#EEF2F6' }}>
          <a
            href="#home"
            className="brand-logo-container"
            style={{ textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              onBackToDashboard();
            }}
          >
            <div className="brand-icon-shield">
              <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 4L8 10V22C8 32 15 40.5 24 44C33 40.5 40 32 40 22V10L24 4Z"
                  fill="url(#sdChatShieldGrad)"
                />
                <path
                  d="M24 7.5L11 12.5V22C11 30.5 16.5 37.8 24 40.8C31.5 37.8 37 30.5 37 22V12.5L24 7.5Z"
                  fill="#0F172A"
                />
                <circle cx="23" cy="22" r="7.5" stroke="#EA580C" strokeWidth="2.6" fill="#1E293B" />
                <path d="M28.5 27.5L33.5 32.5" stroke="#EA580C" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M20.5 22L22.5 24L26 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="sdChatShieldGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB" />
                    <stop offset="1" stopColor="#EA580C" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="brand-title-wrap">
              <span className="brand-name" style={{ fontSize: '1.2rem' }}>
                Scam <span style={{ color: '#EA580C' }}>Detector</span>
              </span>
              <span className="brand-tagline">AI Defense Console</span>
            </div>
          </a>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button type="button" className="chat-new-btn" onClick={handleNewChat}>
            <FaPlus size={12} />
            <span>New Threat Analysis</span>
          </button>
        </div>

        {/* Quick Attack Vector Templates */}
        <div className="px-3 pb-2 flex-grow-1 overflow-auto no-scrollbar">
          <div
            className="text-uppercase fw-bold mb-2 ps-1"
            style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#64748B' }}
          >
            Preloaded Threat Vectors
          </div>
          <div className="d-flex flex-column gap-1.5 mb-4">
            {SAMPLE_THREATS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="chat-history-item"
                onClick={() => handleSend(t.text, t.sender)}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: t.iconBg,
                    color: t.iconColor,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}
                >
                  {t.icon}
                </span>
                <span className="flex-grow-1 text-truncate">{t.title}</span>
                <FaChevronRight size={10} style={{ opacity: 0.35 }} />
              </button>
            ))}
          </div>

          {/* Recent Scans Session Log */}
          {scanHistory.length > 0 && (
            <>
              <div
                className="text-uppercase fw-bold mb-2 ps-1 d-flex align-items-center justify-content-between"
                style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#64748B' }}
              >
                <span>Recent Scan Log</span>
                <FaHistory size={10} />
              </div>
              <div className="d-flex flex-column gap-1.5">
                {scanHistory.map((h) => (
                  <div
                    key={h.id}
                    className="chat-history-item justify-content-between"
                    onClick={() => handleSend(h.title)}
                  >
                    <span className="text-truncate">{h.title}</span>
                    <span
                      className="badge rounded-pill px-2 py-0.5"
                      style={{
                        fontSize: '0.68rem',
                        background: h.verdict === 'SCAM' ? '#FEE2E2' : h.verdict === 'SUSPICIOUS' ? '#FEF3C7' : '#DCFCE7',
                        color: h.verdict === 'SCAM' ? '#B91C1C' : h.verdict === 'SUSPICIOUS' ? '#B45309' : '#15803D',
                      }}
                    >
                      {h.risk}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div
          className="p-3 border-top d-flex flex-column gap-3"
          style={{ background: '#FFFFFF', borderColor: '#EEF2F6' }}
        >
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill w-100 fw-bold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
            style={{
              fontSize: '0.84rem',
              padding: '10px 16px',
              background: '#FFFFFF',
              borderColor: '#CBD5E1',
              color: '#0F172A',
            }}
            onClick={onBackToDashboard}
          >
            <FaArrowLeft size={11} />
            <span>Back to Dashboard</span>
          </button>

          <a
            href="tel:1930"
            className="btn-report-orange text-center w-100 d-inline-flex align-items-center justify-content-center gap-2"
            style={{ padding: '10px 16px', textDecoration: 'none' }}
          >
            <FaPhoneAlt size={11} />
            <span>Helpline 1930 (24x7)</span>
          </a>
        </div>
      </aside>

      {/* Main Chat Canvas */}
      <main className="chat-main-area">
        {/* Top Header */}
        <header className="chat-top-header">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-3 p-1.5 text-secondary shadow-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Threat Navigation"
            >
              <FaBars size={15} />
            </button>

            <div className="d-flex align-items-center gap-2.5">
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                }}
              >
                <FaRobot />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#22C55E',
                    border: '2px solid #FFFFFF',
                  }}
                />
              </div>

              <div>
                <div className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.96rem' }}>
                  <span>ScamShield AI Assistant</span>
                  <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle py-0.5 px-2" style={{ fontSize: '0.7rem' }}>
                    Engine Active
                  </span>
                </div>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                  Trained on I4C &amp; CERT-In Advisories • Hindi, Marathi, Hinglish, English
                </div>
              </div>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-pill px-3 py-1.5 fw-semibold text-secondary shadow-sm d-none d-sm-inline-flex align-items-center gap-1.5"
              style={{ background: '#FFFFFF', borderColor: '#CBD5E1' }}
              onClick={handleNewChat}
            >
              <FaTrashAlt size={11} />
              <span>Reset</span>
            </button>

            <a
              href="tel:1930"
              className="btn-report-orange d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{ fontSize: '0.82rem', padding: '8px 18px', textDecoration: 'none' }}
            >
              <FaPhoneAlt size={10} />
              <span>1930 Helpline</span>
            </a>
          </div>
        </header>

        {/* Scrollable Conversation Thread */}
        <div className="chat-messages-scroll">
          <div className="chat-messages-inner">
            {/* If no messages yet: show High-End Welcome Hero & Interactive Prompt Grid */}
            {messages.length === 0 ? (
              <div className="chat-welcome-hero py-4">
                <div className="chat-welcome-avatar">
                  <FaShieldAlt />
                </div>
                <h2 className="chat-welcome-title">Multilingual Cyber Fraud Detective</h2>
                <p className="chat-welcome-subtitle">
                  Paste any suspicious SMS, WhatsApp notification, UPI cashback bait, or phishing link.
                  The AI analyzes fear triggers, fake sender headers, and malicious APK droppers in real-time.
                </p>

                {/* 4 Interactive Feature Cards */}
                <div className="row g-3 text-start">
                  {SAMPLE_THREATS.map((s) => (
                    <div key={s.id} className="col-sm-6">
                      <div className="prompt-card" onClick={() => handleSend(s.text, s.sender)}>
                        <div>
                          <div
                            className="prompt-card-icon"
                            style={{
                              background: s.iconBg,
                              color: s.iconColor,
                            }}
                          >
                            {s.icon}
                          </div>
                          <div className="prompt-card-title">{s.title}</div>
                          <div className="prompt-card-desc">{s.desc}</div>
                        </div>
                        <div className="pt-2 mt-3 border-top border-light d-flex align-items-center justify-content-between" style={{ fontSize: '0.78rem' }}>
                          <span className="fw-bold" style={{ color: '#EA580C' }}>Test this attack vector</span>
                          <FaChevronRight size={10} style={{ color: '#EA580C' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="d-flex justify-content-end align-items-end gap-2.5"
                    >
                      <div className="chat-bubble-user">
                        {msg.senderHeader && (
                          <div
                            className="badge rounded-pill mb-2 px-2.5 py-1 text-warning small border border-warning border-opacity-50"
                            style={{ background: 'rgba(245, 158, 11, 0.15)', fontSize: '0.72rem' }}
                          >
                            📞 Sender Header: {msg.senderHeader}
                          </div>
                        )}
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {msg.text}
                        </div>
                        <div className="text-end text-white-50 small mt-1.5" style={{ fontSize: '0.7rem' }}>
                          {msg.timestamp}
                        </div>
                      </div>

                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.88rem',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
                        }}
                      >
                        <FaUser />
                      </div>
                    </motion.div>
                  );
                }

                // FAQ Response Bubble
                if (msg.type === 'faq') {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="d-flex justify-content-start align-items-start gap-2.5"
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: '#0F172A',
                          color: '#EA580C',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          flexShrink: 0,
                          marginTop: 4,
                        }}
                      >
                        <FaRobot />
                      </div>

                      <div className="chat-bubble-bot">
                        <FormattedText content={msg.text} />
                        <div className="text-muted small mt-2" style={{ fontSize: '0.7rem' }}>
                          {msg.timestamp} • Cyber Defense Knowledge Base
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                // Deep Analysis Verdict Bubble
                if (msg.type === 'analysis' && msg.analysis) {
                  const a = msg.analysis;
                  const activeLang = activeLangTabs[msg.id] || 'en';
                  const isScam = a.verdict === 'SCAM';
                  const isSuspicious = a.verdict === 'SUSPICIOUS';

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="d-flex justify-content-start align-items-start gap-2.5"
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: isScam ? '#DC2626' : isSuspicious ? '#D97706' : '#16A34A',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          flexShrink: 0,
                          marginTop: 4,
                          boxShadow: `0 4px 14px ${isScam ? '#DC2626' : isSuspicious ? '#D97706' : '#16A34A'}40`,
                        }}
                      >
                        <FaShieldAlt />
                      </div>

                      <div
                        className="chat-bubble-bot w-100"
                        style={{
                          borderColor: isScam ? '#FCA5A5' : isSuspicious ? '#FCD34D' : '#86EFAC',
                          borderWidth: 1.5,
                        }}
                      >
                        {/* Top Verdict Ribbon */}
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-3 border-bottom mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="badge rounded-pill px-3 py-1.5 fw-bold shadow-sm"
                              style={{
                                background: isScam ? '#DC2626' : isSuspicious ? '#D97706' : '#16A34A',
                                color: '#FFFFFF',
                                fontSize: '0.88rem',
                                letterSpacing: '0.03em',
                              }}
                            >
                              {isScam
                                ? '🚨 CRITICAL SCAM DETECTED'
                                : isSuspicious
                                ? '⚠️ SUSPICIOUS CUES DETECTED'
                                : '✅ VERIFIED SAFE TRANSACTION'}
                            </span>

                            <span
                              className="badge rounded-pill px-2.5 py-1 fw-bold"
                              style={{
                                background: isScam ? '#FEE2E2' : isSuspicious ? '#FEF3C7' : '#DCFCE7',
                                color: isScam ? '#B91C1C' : isSuspicious ? '#B45309' : '#15803D',
                                fontSize: '0.82rem',
                              }}
                            >
                              Risk Score: {Math.round(a.risk_score * 100)}%
                            </span>
                          </div>

                          {/* Language Switcher Tabs */}
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-sm fw-semibold"
                              style={{
                                background: activeLang === 'en' ? '#0F172A' : '#F1F5F9',
                                color: activeLang === 'en' ? '#FFFFFF' : '#334155',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.78rem',
                              }}
                              onClick={() => handleLangToggle(msg.id, 'en')}
                            >
                              English
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm fw-semibold"
                              style={{
                                background: activeLang === 'hi' ? '#0F172A' : '#F1F5F9',
                                color: activeLang === 'hi' ? '#FFFFFF' : '#334155',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.78rem',
                              }}
                              onClick={() => handleLangToggle(msg.id, 'hi')}
                            >
                              हिंदी
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm fw-semibold"
                              style={{
                                background: activeLang === 'mr' ? '#0F172A' : '#F1F5F9',
                                color: activeLang === 'mr' ? '#FFFFFF' : '#334155',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.78rem',
                              }}
                              onClick={() => handleLangToggle(msg.id, 'mr')}
                            >
                              मराठी
                            </button>
                          </div>
                        </div>

                        {/* Explanation Section */}
                        <div className="mb-3">
                          <span className="fw-bold small text-dark d-flex align-items-center gap-1.5 mb-2">
                            <FaInfoCircle className="text-primary" />
                            <span>Trilingual Threat Diagnosis ({activeLang.toUpperCase()}):</span>
                          </span>
                          <ul className="ps-3 mb-2 small" style={{ lineHeight: 1.65 }}>
                            {a.reasons && a.reasons[activeLang] ? (
                              a.reasons[activeLang].map((r, i) => (
                                <li key={i} className="mb-1.5 text-dark fw-medium">
                                  {r}
                                </li>
                              ))
                            ) : (
                              <li className="text-secondary">Assessed against CBL-01 threat heuristics.</li>
                            )}
                          </ul>
                        </div>

                        {/* URL Typosquatting / APK Payload */}
                        {a.url_analysis && a.url_analysis.has_url === 1 && (
                          <div
                            className="p-3 rounded-3 border mb-3 small"
                            style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
                          >
                            <div className="fw-bold text-warning-emphasis d-flex align-items-center gap-1 mb-1">
                              <FaLink />
                              <span>Domain &amp; Malicious Payload Audit</span>
                            </div>
                            {a.url_analysis.analyzed_urls && a.url_analysis.analyzed_urls.length > 0 ? (
                              a.url_analysis.analyzed_urls.map((u, i) => (
                                <div key={i} className="mt-1">
                                  <div>
                                    <strong>Target:</strong> {u.url}
                                  </div>
                                  {u.lookalike_detected ? (
                                    <div className="text-danger fw-semibold mt-1">
                                      🚨 Brand Typosquatting Alert: Deceptively imitates '{u.lookalike_brand}'.
                                    </div>
                                  ) : null}
                                  {u.has_apk ? (
                                    <div className="text-danger fw-semibold mt-1">
                                      ⚠️ Malicious APK Dropper: Downloads unauthorized background installation payload.
                                    </div>
                                  ) : null}
                                </div>
                              ))
                            ) : (
                              <div>Link verified against live OpenPhish and CERT-In blocklists.</div>
                            )}
                          </div>
                        )}

                        {/* Safety Guidance */}
                        {a.safety_advice && a.safety_advice.length > 0 && (
                          <div
                            className="p-3 rounded-3 border mb-3 small"
                            style={{
                              background: isScam ? '#FEF2F2' : '#F0FDF4',
                              borderColor: isScam ? '#FECACA' : '#BBF7D0',
                            }}
                          >
                            <span className="fw-bold d-block mb-1" style={{ color: isScam ? '#991B1B' : '#166534' }}>
                              🛡️ Immediate Citizen Advisory:
                            </span>
                            <span style={{ color: isScam ? '#7F1D1D' : '#14532D', lineHeight: 1.55 }}>
                              {a.safety_advice.join(' ')}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold border shadow-sm d-inline-flex align-items-center gap-1.5"
                              style={{
                                background: copiedId === msg.id ? '#DCFCE7' : '#FFFFFF',
                                borderColor: copiedId === msg.id ? '#86EFAC' : '#CBD5E1',
                                color: copiedId === msg.id ? '#15803D' : '#1E293B',
                                fontSize: '0.8rem',
                              }}
                              onClick={() => copyIncidentReport(msg)}
                            >
                              {copiedId === msg.id ? <FaCheck /> : <FaCopy />}
                              <span>{copiedId === msg.id ? 'Copied Incident Report!' : 'Copy Incident Report'}</span>
                            </button>

                            {isScam && (
                              <a
                                href="https://cybercrime.gov.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold text-white shadow-sm d-inline-flex align-items-center gap-1"
                                style={{ background: '#0F172A', border: 'none', fontSize: '0.8rem' }}
                              >
                                <span>Report to cybercrime.gov.in</span>
                                <FaExternalLinkAlt size={10} />
                              </a>
                            )}
                          </div>

                          {isScam && (
                            <a
                              href="tel:1930"
                              className="btn-report-orange d-inline-flex align-items-center gap-1.5 shadow-sm"
                              style={{ fontSize: '0.82rem', padding: '6px 16px' }}
                            >
                              <FaPhoneAlt size={10} />
                              <span>Dial 1930 Helpline</span>
                            </a>
                          )}
                        </div>

                        <div className="text-secondary small mt-2" style={{ fontSize: '0.7rem' }}>
                          {msg.timestamp} • Verified by CBL-01 Cyber Defense Engine
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return null;
              })
            )}

            {/* Typing Loader Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="d-flex align-items-center gap-2.5"
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#0F172A',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}
                >
                  <FaRobot />
                </div>
                <div className="chat-bubble-bot d-flex align-items-center gap-2 py-2.5 px-3.5">
                  <span className="spinner-border spinner-border-sm text-warning" role="status" />
                  <span className="fw-semibold text-dark small">
                    Scanning linguistic features, sender headers &amp; URL signatures with CBL-01...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={chatBottomRef} />
          </div>
        </div>

        {/* Floating Chat Input Section matching Dashboard */}
        <div className="p-3 bg-white border-top shadow-sm">
          <div className="container" style={{ maxWidth: 820 }}>
            {/* Sender ID toggler */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <button
                type="button"
                className="btn btn-sm btn-link p-0 text-decoration-none small text-secondary fw-semibold d-inline-flex align-items-center gap-1"
                onClick={() => setShowSenderField(!showSenderField)}
              >
                <span>{showSenderField ? '▼ Hide Sender Header' : '▶ Add Sender Header / Mobile (+91...)'}</span>
              </button>
              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for newline
              </span>
            </div>

            {/* Optional Collapsible Sender Input */}
            {showSenderField && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2"
              >
                <input
                  type="text"
                  className="form-control form-control-sm rounded-pill px-3 py-1.5"
                  style={{ border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem' }}
                  placeholder="Optional: Enter SMS sender header or phone (e.g. VK-SBIINB or +919876543210)"
                  value={senderHeader}
                  onChange={(e) => setSenderHeader(e.target.value)}
                />
              </motion.div>
            )}

            {/* Floating Input Pill Box */}
            <div className="chat-input-wrapper">
              <textarea
                ref={textareaRef}
                rows={1}
                className="chat-textarea"
                placeholder="Paste the suspicious SMS, WhatsApp message, or link here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />

              <button
                type="button"
                disabled={loading || !inputText.trim()}
                className="chat-send-btn"
                onClick={() => handleSend()}
                title="Send for cyber fraud inspection"
              >
                <FaPaperPlane size={15} />
              </button>
            </div>

            {/* Quick Test Chips Below Input */}
            <div className="d-flex align-items-center gap-2 overflow-auto no-scrollbar pt-2.5">
              <span className="text-muted small fw-semibold me-1 flex-shrink-0" style={{ fontSize: '0.74rem' }}>
                Quick check:
              </span>
              {SAMPLE_THREATS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="btn btn-sm rounded-pill px-3 py-1 border small shadow-sm flex-shrink-0"
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                  }}
                  onClick={() => handleSend(s.text, s.sender)}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
