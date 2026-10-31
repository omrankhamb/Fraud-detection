import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ActionCards from './components/ActionCards';
import Scanner from './components/Scanner';
import StatsBanner from './components/StatsBanner';
import ServiceCards from './components/ServiceCards';
import ThreatMap from './components/ThreatMap';
import Footer from './components/Footer';
import ChatScanner from './components/ChatScanner';

export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'chat'
  const scannerRef = useRef(null);

  // Sync state with URL hash (#chat vs #home / #scanner)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#chat') {
        setView('chat');
      } else {
        setView('dashboard');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (newView) => {
    setView(newView);
    window.location.hash = newView === 'chat' ? '#chat' : '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToScanner = () => {
    if (view !== 'dashboard') {
      setView('dashboard');
      setTimeout(() => {
        const el = document.getElementById('scanner');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById('scanner');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCard = (item) => {
    if (view !== 'dashboard') {
      setView('dashboard');
    }
    setTimeout(() => {
      if (scannerRef.current && scannerRef.current.loadInspectorMode) {
        scannerRef.current.loadInspectorMode(item);
      } else {
        scrollToScanner();
      }
    }, 100);
  };

  const handleQuickUrlSearch = (url) => {
    if (view !== 'dashboard') {
      setView('dashboard');
    }
    setTimeout(() => {
      if (scannerRef.current && scannerRef.current.loadInspectorMode) {
        scannerRef.current.loadInspectorMode({ tab: 'url', sampleUrl: url });
      } else {
        scrollToScanner();
      }
    }, 100);
  };

  const handleReportClick = () => {
    window.open('https://cybercrime.gov.in', '_blank');
  };

  // If user is on the dedicated Chat Page
  if (view === 'chat') {
    return (
      <ChatScanner
        onBackToDashboard={() => navigateTo('dashboard')}
      />
    );
  }

  // Dashboard Page
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: '#ffffff' }}>
      {/* Floating Navbar with Scam Detector Logo & AI Chat Link */}
      <Navbar
        currentView={view}
        onNavigate={navigateTo}
        onQuickUrlSearch={handleQuickUrlSearch}
        onReportClick={handleReportClick}
      />

      {/* Main Content */}
      <main className="flex-grow-1">
        {/* Hero Section */}
        <Hero
          onStartScanning={scrollToScanner}
          onOpenChat={() => navigateTo('chat')}
        />

        {/* Interactive Threat Inspector Cards */}
        <ActionCards onSelectCard={handleSelectCard} />

        {/* Live Multilingual Scanner Tool */}
        <Scanner ref={scannerRef} />

        {/* "The Scale of It - India, 2024" Section */}
        <StatsBanner />

        {/* Service Checkers Section */}
        <ServiceCards onSelectService={scrollToScanner} />

        {/* 3D Earth Globe & Live Threat Radar */}
        <ThreatMap />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
