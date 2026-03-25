import React from 'react';

/**
 * AnalyticsSection — titled section wrapper with inline subtitle and rule line.
 *
 * @param {{
 *  title: string,
 *  subtitle?: string,
 *  children: React.ReactNode,
 * }} props
 */
export default function AnalyticsSection({ title, subtitle, children }) {
  return (
    <section className="analytics-section">
      <div className="analytics-section-header">
        <span className="analytics-section-title">{title}</span>
        {subtitle && <span className="analytics-section-subtitle">{subtitle}</span>}
        <span className="analytics-section-rule" />
      </div>
      {children}
    </section>
  );
}
