import React from 'react';

/**
 * AnalyticsViewShell — outer wrapper for analytics tab content.
 *
 * @param {{
 *  variant?: string,
 *  className?: string,
 *  children: React.ReactNode,
 * }} props
 */
export default function AnalyticsViewShell({ variant, className, children }) {
  const classes = [
    'analytics-rows',
    'analytics-rows--week',
    variant ? `analytics-${variant}-view` : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
