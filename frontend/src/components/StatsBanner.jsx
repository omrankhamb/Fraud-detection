import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatsBanner() {
  const [stats, setStats] = useState({
    daily_crimes: '7,000+',
    total_crimes: '22.68 lakh',
    lost_amount: '₹22,846 cr',
  });

  useEffect(() => {
    // Fetch live figures if backend is running
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats({
            daily_crimes: data.daily_crimes,
            total_crimes: data.total_crimes,
            lost_amount: data.lost_amount,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-5" id="stats">
      <div className="container">
        <div className="scale-banner-card">
          {/* Header Row */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
            <span
              style={{
                letterSpacing: '0.12em',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
              }}
            >
              THE SCALE OF CYBER FRAUD — INDIA (2024)
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#60a5fa',
              }}
            >
              Indian Cyber Crime Coordination Centre (I4C) &amp; MHA
            </span>
          </div>

          {/* 3 Metric Counters matching Screenshot 1 */}
          <div className="row g-4 text-start">
            {/* Metric 1 */}
            <motion.div
              className="col-md-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="stat-item-number">{stats.daily_crimes}</div>
              <h5 className="fw-bold mb-1 text-white">Cyber Crimes Reported Daily</h5>
              <p className="text-secondary small mb-0" style={{ maxWidth: 280 }}>
                Average complaints filed every day on the national portal.
              </p>
            </motion.div>

            {/* Metric 2 */}
            <motion.div
              className="col-md-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="stat-item-number">{stats.total_crimes}</div>
              <h5 className="fw-bold mb-1 text-white">Total Cyber Crimes</h5>
              <p className="text-secondary small mb-0" style={{ maxWidth: 280 }}>
                Complaints filed across India in 2024.
              </p>
            </motion.div>

            {/* Metric 3 */}
            <motion.div
              className="col-md-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="stat-item-number orange">{stats.lost_amount}</div>
              <h5 className="fw-bold mb-1 text-white">Lost to Cyber Fraud</h5>
              <p className="text-secondary small mb-0" style={{ maxWidth: 280 }}>
                Money reported lost across India in 2024.
              </p>
            </motion.div>
          </div>

          {/* Footnote matching Screenshot 1 */}
          <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-secondary small">
            2024 figures reported by the Indian Cyber Crime Coordination Centre (I4C) and the Ministry of Home Affairs. Daily complaint volume as stated by I4C.
          </div>
        </div>
      </div>
    </section>
  );
}
