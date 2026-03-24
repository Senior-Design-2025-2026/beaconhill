import React from 'react';

/**
 * AnalyticsTopControlsLayout — two-column layout for analytics controls.
 *
 * @param {{
 *  left: React.ReactNode,
 *  right?: React.ReactNode,
 * }} props
 */
export default function AnalyticsTopControlsLayout({ left, right }) {
  return (
    <section className="analytics-day-toprow">
      <div className="analytics-day-toprow-left">{left}</div>
      {right && <div className="analytics-day-toprow-right">{right}</div>}
    </section>
  );
}
