import React, { useState, useMemo } from 'react';
import { IconButton, Dialog, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import RemoveIcon from '@mui/icons-material/Remove';
import { Link } from 'react-router-dom';
import AnalyticsTrendLineChart from '../AnalyticsTrendLineChart/AnalyticsTrendLineChart';
import { average } from '../AnalyticsTrendLineChart/trendChartUtils';
import { getThreshold, getMetricIndicator } from '../../utils/analyticsThresholds';

/** Convert "HH:00" to compact AM/PM; pass through anything else. */
function formatXLabel(label) {
  const match = label.match(/^(\d{2}):00$/);
  if (!match) return label;
  const hour = parseInt(match[1], 10);
  if (hour === 0) return '12a';
  if (hour < 12) return `${hour}a`;
  if (hour === 12) return '12p';
  return `${hour - 12}p`;
}

const CLASSIFICATION_COLORS = {
  excellent: '#1b5e20',
  good: '#558b2f',
  fair: '#ef6c00',
  poor: '#c62828',
};

/**
 * AnalyticsMetricTrendCard — card displaying a metric's average, status indicator,
 * embedded sparkline, and an expand button that opens a fullscreen detail dialog.
 *
 * @param {{
 *  metric: { key: string, label: string, unit: string },
 *  trend: Array<{ x: string, y: number|null }>,
 *  nodeTrends?: Array<{ nodeId: string, nodeName: string, trend: Array<{x:string,y:number|null}> }>,
 *  cropType?: string,
 *  source?: 'farm'|'ambient',
 * }} props
 */
export default function AnalyticsMetricTrendCard({
  metric,
  trend = [],
  nodeTrends = [],
  cropType,
  source,
}) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState('average');

  const isFarm = source === 'farm';
  const hasNodes = isFarm && nodeTrends.length > 0;

  const nodeSeries = useMemo(() => {
    if (!hasNodes) return null;
    return nodeTrends.map((nt) => ({
      name: nt.nodeName,
      values: nt.trend.map((p) => p.y),
    }));
  }, [hasNodes, nodeTrends]);

  const values = trend.map((p) => p.y);
  const value = average(values);
  const display = value != null ? value : '—';
  const threshold = getThreshold(metric.key, cropType, source);
  const indicator = getMetricIndicator(value, threshold);
  const xLabels = trend.map((p) => formatXLabel(p.x));

  const cropLabel = cropType
    ? cropType.charAt(0).toUpperCase() + cropType.slice(1)
    : 'Crop';

  const bands = [];
  if (threshold) {
    if (threshold.excellent) bands.push({ key: 'excellent', label: 'Excellent', ...threshold.excellent });
    if (threshold.good) bands.push({ key: 'good', label: 'Good', ...threshold.good });
    if (threshold.fair) bands.push({ key: 'fair', label: 'Fair', ...threshold.fair });
    const poorLow = threshold.fair?.min != null ? `< ${threshold.fair.min}` : '';
    const poorHigh = threshold.excellent?.max != null ? `> ${threshold.excellent.max}` : '';
    const poorRange = [poorLow, poorHigh].filter(Boolean).join(' or ');
    bands.push({ key: 'poor', label: 'Poor', range: poorRange });
  }

  return (
    <>
      {/* Compact card */}
      <div className={`analytics-card analytics-card--${indicator.state}`}>
        <div className="analytics-card-header">
          <span className="analytics-card-label">{metric.label}</span>
          <IconButton
            size="small"
            className="analytics-card-expand-btn"
            onClick={() => setOpen(true)}
            aria-label="Expand"
          >
            <OpenInFullIcon fontSize="small" />
          </IconButton>
        </div>
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
          xLabels={xLabels}
          ariaLabel={`${metric.label} trend`}
        />
      </div>

      {/* Fullscreen detail dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ className: 'analytics-dialog-paper' }}
      >
        <div className="analytics-dialog">
          <div className="analytics-dialog-header">
            <div className="analytics-dialog-title-row">
              <h2 className="analytics-dialog-title">{metric.label}</h2>
              <span className="analytics-dialog-value">
                {display}
                {value != null && <span className="analytics-dialog-unit">{metric.unit}</span>}
              </span>
              <span className={`analytics-card-status analytics-card-status--${indicator.state}`}>
                {indicator.label}
              </span>
            </div>
            <IconButton
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="analytics-dialog-close-btn"
            >
              <RemoveIcon />
            </IconButton>
          </div>

          <div className="analytics-dialog-body">
            <div className="analytics-dialog-chart">
              <AnalyticsTrendLineChart
                values={viewMode === 'average' ? values : []}
                series={viewMode === 'byNode' ? nodeSeries : null}
                threshold={threshold}
                xLabels={xLabels}
                width={700}
                height={280}
                ariaLabel={`${metric.label} trend (expanded)`}
                interactive={viewMode === 'average'}
                unit={metric.unit}
              />
            </div>

            <div className="analytics-dialog-sidebar">
              {hasNodes && (
                <div className="analytics-dialog-view-toggle">
                  <RadioGroup
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                  >
                    <FormControlLabel
                      value="average"
                      control={<Radio size="small" />}
                      label="Farm Average"
                      className="analytics-dialog-radio-label"
                    />
                    <FormControlLabel
                      value="byNode"
                      control={<Radio size="small" />}
                      label="By Node"
                      className="analytics-dialog-radio-label"
                    />
                  </RadioGroup>
                </div>
              )}

              {threshold && (
                <div className="analytics-dialog-detail">
                  <span className="analytics-dialog-detail-title">
                    {cropLabel} {metric.label} Classification
                  </span>
                  <table className="analytics-dialog-detail-table">
                    <tbody>
                      {bands.map((band) => (
                        <tr key={band.key}>
                          <td
                            className="analytics-dialog-detail-label"
                            style={{ color: CLASSIFICATION_COLORS[band.key] }}
                          >
                            {band.label}
                          </td>
                          <td className="analytics-dialog-detail-range">
                            {band.range ?? `${band.min} – ${band.max}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Link
                    to="/classification-info"
                    className="analytics-dialog-detail-link"
                    onClick={() => setOpen(false)}
                  >
                    classification info →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
