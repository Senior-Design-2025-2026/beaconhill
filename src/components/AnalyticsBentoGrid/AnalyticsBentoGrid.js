import React from 'react';

/**
 * AnalyticsBentoGrid — grid container for metric trend cards.
 *
 * @param {{
 *  variant?: 'farm'|'ambient',
 *  className?: string,
 *  children: React.ReactNode,
 * }} props
 */
export default function AnalyticsBentoGrid({ variant, className, children }) {
  const classes = [
    'analytics-bento',
    variant ? `analytics-bento--${variant}` : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
