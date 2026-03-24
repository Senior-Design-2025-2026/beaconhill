import React from 'react';
import AnalyticsTrendLineChart from '../AnalyticsTrendLineChart/AnalyticsTrendLineChart';
import { average } from '../AnalyticsTrendLineChart/trendChartUtils';
import { getThreshold, getMetricIndicator } from '../../utils/analyticsThresholds';

/**
 * AnalyticsMetricTrendCard — card displaying a metric's average, status indicator,
 * and an embedded sparkline trend chart.
 *
 * @param {{
 *  metric: { key: string, label: string, unit: string },
 *  trend: Array<{ x: string, y: number|null }>,
 *  cropType?: string,
 *  source?: 'farm'|'ambient',
 *  axisLabels?: { start: string, end: string },
 * }} props
 */
export default function AnalyticsMetricTrendCard({
  metric,
  trend = [],
  cropType,
  source,
  axisLabels,
}) {
  const values = trend.map((p) => p.y);
  const value = average(values);
  const display = value != null ? value : '—';
  const threshold = getThreshold(metric.key, cropType, source);
  const indicator = getMetricIndicator(value, threshold);

  const startLabel = axisLabels?.start ?? trend[0]?.x ?? '';
  const endLabel = axisLabels?.end ?? trend[trend.length - 1]?.x ?? '';

  return (
    <div className={`analytics-card analytics-card--${indicator.state}`}>
      <span className="analytics-card-label">{metric.label}</span>
      <div className="analytics-card-main">
        <span className="analytics-card-value">
          {display}
          {value != null && <span className="analytics-card-unit">{metric.unit}</span>}
        </span>
        <span className={`analytics-card-status analytics-card-status--${indicator.state}`}>
          {indicator.label}
        </span>
      </div>
      <AnalyticsTrendLineChart
        values={values}
        threshold={threshold}
        xStartLabel={startLabel}
        xEndLabel={endLabel}
        ariaLabel={`${metric.label} trend`}
      />
    </div>
  );
}
