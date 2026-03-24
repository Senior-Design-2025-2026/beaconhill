import React from 'react';
import { buildPoints, getThresholdGuides, createYScale } from './trendChartUtils';

/**
 * AnalyticsTrendLineChart — SVG sparkline with threshold bands, axes, and polyline.
 *
 * @param {{
 *  values: number[],
 *  threshold?: object|null,
 *  width?: number,
 *  height?: number,
 *  padding?: number,
 *  xStartLabel?: string,
 *  xEndLabel?: string,
 *  ariaLabel?: string,
 * }} props
 */
export default function AnalyticsTrendLineChart({
  values = [],
  threshold = null,
  width = 220,
  height = 92,
  padding = 16,
  xStartLabel,
  xEndLabel,
  ariaLabel,
}) {
  const thresholdGuides = getThresholdGuides(threshold);
  const thresholdValues = thresholdGuides.map((g) => g.value);
  const guideMin = thresholdValues.length ? Math.min(...thresholdValues) : null;
  const guideMax = thresholdValues.length ? Math.max(...thresholdValues) : null;
  const { yScale, low, high } = createYScale(values, guideMin ?? 0, guideMax ?? 1, height, padding);
  const { points } = buildPoints(values, width, height, padding);
  const yTicks = [low, (low + high) / 2, high];

  return (
    <div className="analytics-trend-wrap" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} className="analytics-trend-svg">
        {/* Axes */}
        <g className="analytics-trend-axes">
          <line x1={padding} x2={padding} y1={padding} y2={height - padding} className="analytics-trend-axis-line" />
          <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} className="analytics-trend-axis-line" />
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={padding - 3} x2={padding} y1={yScale(tick)} y2={yScale(tick)} className="analytics-trend-tick" />
              <text x={padding - 6} y={yScale(tick) + 3} textAnchor="end" className="analytics-trend-tick-label">
                {tick.toFixed(0)}
              </text>
            </g>
          ))}
        </g>
        {/* Threshold guide lines */}
        {thresholdGuides.map((guide) => (
          <g key={guide.key}>
            <line
              x1={padding}
              x2={width - padding}
              y1={yScale(guide.value)}
              y2={yScale(guide.value)}
              className={`analytics-trend-threshold analytics-trend-threshold--${guide.state}`}
            />
            <text x={padding + 2} y={yScale(guide.value) - 2} className="analytics-trend-threshold-label">
              {guide.label}
            </text>
          </g>
        ))}
        {/* Data polyline */}
        {points ? <polyline points={points} className="analytics-trend-line" /> : null}
      </svg>
      {(xStartLabel || xEndLabel) && (
        <div className="analytics-trend-axis">
          <span>{xStartLabel || ''}</span>
          <span>{xEndLabel || ''}</span>
        </div>
      )}
    </div>
  );
}
