import React, { useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Scanner from './components/Scanner';
import StatsBanner from './components/StatsBanner';
import ServiceCards from './components/ServiceCards';
import ThreatMap from './components/ThreatMap';
import Footer from './components/Footer';

export default function App() {
  const scannerRef = useRef(null);

  const scrollToScanner = () => {
    const el = document.getElementById('scanner');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickUrlSearch = (url) => {
    scrollToScanner();
  };

  const handleReportClick = () => {
    window.open('https://cybercrime.gov.in', '_blank');
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: '#ffffff' }}>
      {/* Navbar with Project Title: Scam Detector */}
      <Navbar
        onQuickUrlSearch={handleQuickUrlSearch}
        onReportClick={handleReportClick}
      />

      {/* Main Content */}
      <main className="flex-grow-1">
        {/* Hero Section */}
        <Hero onStartScanning={scrollToScanner} />

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
