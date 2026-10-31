import React, { useState } from 'react';
import { FaSearch, FaArrowUp, FaPhoneAlt } from 'react-icons/fa';

export default function Navbar({ onQuickUrlSearch, onReportClick }) {
  const [urlInput, setUrlInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim() && onQuickUrlSearch) {
      onQuickUrlSearch(urlInput.trim());
    }
  };

  return (
    <div className="floating-navbar-container">
      <nav className="floating-navbar">
        {/* Project Title: Scam Detector */}
        <a href="#home" className="brand-logo-container">
          <div className="brand-icon-shield">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M24 4L8 10V22C8 32 15 40.5 24 44C33 40.5 40 32 40 22V10L24 4Z"
                fill="url(#shieldGrad)"
              />
              <path
                d="M24 7.5L11 12.5V22C11 30.5 16.5 37.8 24 40.8C31.5 37.8 37 30.5 37 22V12.5L24 7.5Z"
                fill="#0F172A"
              />
              <circle cx="24" cy="23" r="8" stroke="#F97316" strokeWidth="2.5" fill="#1E293B" />
              <path d="M21 23L23.5 25.5L27.5 20.5" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="shieldGrad" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563EB" />
                  <stop offset="1" stopColor="#F97316" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-title-wrap">
            <span className="brand-name">
              CBL-01 <span>ScamShield</span>
            </span>
            <span className="brand-tagline">Multilingual Scam SMS &amp; Link Detector</span>
          </div>
        </a>

        {/* Quick URL Search Bar */}
        <form className="nav-search-bar d-none d-lg-flex" onSubmit={handleSearchSubmit}>
          <FaSearch className="nav-search-icon-left" />
          <input
            type="text"
            className="nav-search-input"
            placeholder="Paste a URL or SMS to check..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button type="submit" className="nav-search-btn-round" title="Analyze Link">
            <FaArrowUp style={{ transform: 'rotate(45deg)' }} />
          </button>
        </form>

        {/* Nav Links */}
        <ul className="nav-links-list d-none d-md-flex">
          <li>
            <a href="#scanner">Scanner</a>
          </li>
          <li>
            <a href="#services">Services</a>
          </li>
          <li>
            <a href="#stats">Scale</a>
          </li>
          <li>
            <a href="#threat-map">Threat Radar</a>
          </li>
        </ul>

        {/* Action Button: Helpline 1930 */}
        <div className="ms-auto ms-md-0">
          <button
            type="button"
            className="btn-report-orange"
            onClick={onReportClick}
          >
            <FaPhoneAlt size={12} className="me-1" />
            <span>Report Scam (1930)</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
