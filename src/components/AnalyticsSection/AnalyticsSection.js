import React from 'react';
import { Typography } from '@mui/material';

/**
 * AnalyticsSection — titled section wrapper for analytics content groups.
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
      <Typography className="analytics-section-title" variant="h6">{title}</Typography>
      {subtitle && <span className="analytics-ambient-subtitle">{subtitle}</span>}
      {children}
    </section>
  );
}
