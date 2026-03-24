import React, { useState, useCallback } from 'react';
import { getThresholdGuides, createYScale, classifyValue, getBulletColor } from './trendChartUtils';

const NODE_LINE_STYLES = [
  { dashArray: 'none',  label: 'solid' },
  { dashArray: '6,3',   label: 'dashed' },
  { dashArray: '2,2',   label: 'dotted' },
  { dashArray: '8,2,2,2', label: 'dash-dot' },
  { dashArray: '12,4',  label: 'long dash' },
  { dashArray: '2,4',   label: 'sparse dot' },
];

const NODE_LINE_COLOR = '#475569';

/**
 * AnalyticsTrendLineChart — SVG sparkline with threshold bands, labeled x-axis,
 * colored data-point bullets, and polyline. Supports multi-series via `series`.
 *
 * @param {{
 *  values: number[],
 *  threshold?: object|null,
 *  width?: number,
 *  height?: number,
 *  padding?: number,
 *  xLabels?: string[],
 *  xStartLabel?: string,
 *  xEndLabel?: string,
 *  ariaLabel?: string,
 *  interactive?: boolean,
 *  unit?: string,
 *  series?: Array<{ name: string, values: number[] }>|null,
 * }} props
 */
export default function AnalyticsTrendLineChart({
  values = [],
  threshold = null,
  width = 220,
  height = 92,
  padding = 16,
  xLabels,
  xStartLabel,
  xEndLabel,
  ariaLabel,
  interactive = false,
  unit = '',
  series = null,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const handleMouseEnter = useCallback((i) => setHoveredIdx(i), []);
  const handleMouseLeave = useCallback(() => setHoveredIdx(null), []);

  const isMulti = series && series.length > 0;
  const allValues = isMulti
    ? series.flatMap((s) => s.values).filter((v) => v != null)
    : values;

  const thresholdGuides = getThresholdGuides(threshold);
  const thresholdValues = thresholdGuides.map((g) => g.value);
  const guideMin = thresholdValues.length ? Math.min(...thresholdValues) : null;
  const guideMax = thresholdValues.length ? Math.max(...thresholdValues) : null;
  const { yScale, low, high } = createYScale(allValues, guideMin ?? 0, guideMax ?? 1, height, padding);
  const yTicks = [low, (low + high) / 2, high];

  const chartW = width - padding * 2;
  const pointCount = isMulti
    ? Math.max(...series.map((s) => s.values.length), 0)
    : values.length;
  const xStep = pointCount > 1 ? chartW / (pointCount - 1) : chartW;
  const xCoord = (idx) => padding + idx * xStep;

  const dataPoints = values.map((v, i) => ({
    x: xCoord(i),
    y: v != null ? yScale(v) : null,
    value: v,
    classification: classifyValue(v, threshold),
  }));

  const polylinePoints = dataPoints
    .filter((p) => p.y != null)
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  const hasXLabels = xLabels && xLabels.length > 0;
  const labelStep = hasXLabels && xLabels.length > 8
    ? Math.ceil(xLabels.length / 8)
    : 1;
  const showLabelAt = (i) => i % labelStep === 0 || i === xLabels.length - 1;

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

        {/* X-axis tick marks + labels */}
        {hasXLabels && xLabels.map((label, i) => {
          const cx = xCoord(i);
          const show = showLabelAt(i);
          return (
            <g key={i}>
              {show && (
                <line x1={cx} x2={cx} y1={height - padding} y2={height - padding + 3} className="analytics-trend-tick" />
              )}
              {show && (
                <text x={cx} y={height - padding + 10} textAnchor="middle" className="analytics-trend-x-label">
                  {label}
                </text>
              )}
            </g>
          );
        })}

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

        {/* === Single-series mode === */}
        {!isMulti && (
          <>
            {polylinePoints ? <polyline points={polylinePoints} className="analytics-trend-line" /> : null}

            {dataPoints.map((p, i) => {
              if (p.y == null) return null;
              const isHovered = interactive && hoveredIdx === i;
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 4.5 : 2.5}
                  fill={getBulletColor(p.classification)}
                  stroke="#fff"
                  strokeWidth={isHovered ? 1 : 0.5}
                  style={interactive ? { transition: 'r 0.12s ease, stroke-width 0.12s ease' } : undefined}
                />
              );
            })}

            {interactive && dataPoints.map((p, i) => {
              if (p.y == null) return null;
              return (
                <circle
                  key={`hit-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={10}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => handleMouseEnter(i)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}

            {interactive && hoveredIdx != null && dataPoints[hoveredIdx]?.y != null && (() => {
              const p = dataPoints[hoveredIdx];
              const label = xLabels?.[hoveredIdx] ?? '';
              const text = `${p.value}${unit ? ` ${unit}` : ''}`;
              const tooltipAbove = p.y > padding + 20;
              const ty = tooltipAbove ? p.y - 10 : p.y + 14;
              return (
                <g className="analytics-trend-tooltip" pointerEvents="none">
                  <rect
                    x={p.x - 28}
                    y={ty - 9}
                    width={56}
                    height={label ? 20 : 12}
                    rx={3}
                    fill="rgba(30,41,59,0.92)"
                  />
                  <text x={p.x} y={ty} textAnchor="middle" className="analytics-trend-tooltip-value">
                    {text}
                  </text>
                  {label && (
                    <text x={p.x} y={ty + 9} textAnchor="middle" className="analytics-trend-tooltip-label">
                      {label}
                    </text>
                  )}
                </g>
              );
            })()}
          </>
        )}

        {/* === Multi-series mode === */}
        {isMulti && series.map((s, si) => {
          const style = NODE_LINE_STYLES[si % NODE_LINE_STYLES.length];
          const pts = s.values
            .map((v, i) => v != null ? `${xCoord(i)},${yScale(v)}` : null)
            .filter(Boolean)
            .join(' ');
          return (
            <g key={si}>
              {pts && (
                <polyline
                  points={pts}
                  fill="none"
                  stroke={NODE_LINE_COLOR}
                  strokeWidth={1.5}
                  strokeDasharray={style.dashArray === 'none' ? undefined : style.dashArray}
                />
              )}
              {s.values.map((v, i) => {
                if (v == null) return null;
                return (
                  <circle
                    key={i}
                    cx={xCoord(i)}
                    cy={yScale(v)}
                    r={2}
                    fill={getBulletColor(classifyValue(v, threshold))}
                    stroke="#fff"
                    strokeWidth={0.4}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Fallback start/end labels when xLabels not provided */}
      {!hasXLabels && (xStartLabel || xEndLabel) && (
        <div className="analytics-trend-axis">
          <span>{xStartLabel || ''}</span>
          <span>{xEndLabel || ''}</span>
        </div>
      )}

      {/* Legend for multi-series */}
      {isMulti && (
        <div className="analytics-trend-legend">
          {series.map((s, si) => {
            const style = NODE_LINE_STYLES[si % NODE_LINE_STYLES.length];
            return (
              <div key={si} className="analytics-trend-legend-item">
                <svg width="24" height="10" className="analytics-trend-legend-swatch">
                  <line
                    x1={0} y1={5} x2={24} y2={5}
                    stroke={NODE_LINE_COLOR}
                    strokeWidth={2}
                    strokeDasharray={style.dashArray === 'none' ? undefined : style.dashArray}
                  />
                </svg>
                <span className="analytics-trend-legend-label">{s.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
