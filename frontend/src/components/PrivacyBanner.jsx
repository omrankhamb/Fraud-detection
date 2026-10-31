import React, { useState } from 'react';

export default function PrivacyBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="cookie-banner-container">
      <div className="container-fluid px-lg-5">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div style={{ maxWidth: 880 }}>
            <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '0.95rem' }}>
              We value your privacy
            </h6>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
              We use cookies to enhance your browsing experience, serve personalised ads or content, and
              analyse our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              className="btn-cookie-customise"
              onClick={() => setVisible(false)}
            >
              Customise
            </button>
            <button
              type="button"
              className="btn-cookie-reject"
              onClick={() => setVisible(false)}
            >
              Reject All
            </button>
            <button
              type="button"
              className="btn-cookie-accept"
              onClick={() => setVisible(false)}
            >
              Accept All
            </button>
          </div>
        </div>

        <div className="text-end mt-1 text-muted small" style={{ fontSize: '0.7rem' }}>
          Powered by <strong>CookieYes</strong>
        </div>
      </div>
    </div>
  );
}
