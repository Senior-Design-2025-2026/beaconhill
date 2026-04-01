import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { marked } from 'marked';
import { generateAnalyticsReport } from '../../api/analyticsReportApi';
import './GenerateReportButton.css';

const REPORT_CSS = `
  body { font-family: Arial, Helvetica, sans-serif; padding: 22px; color: #111827; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { border: 1px solid #e5e7eb; padding: 7px 9px; font-size: 12px; vertical-align: top; }
  th { background: #f9fafb; font-weight: 700; text-align: left; }
  h2 { margin-top: 22px; }
  h3 { margin-top: 18px; }
  img { max-width: 200px; height: auto; }
  blockquote { margin: 10px 0; padding: 10px 14px; border-left: 4px solid #e5e7eb; color: #374151; background: #fafafa; }
  @media print { body { padding: 0; } }
`;

/**
 * Opens a new window with the rendered report HTML and triggers print (Save as PDF).
 * @param {string} markdownReport - raw markdown/HTML from Gemini
 */
function openReportForPrint(markdownReport) {
  marked.use({ gfm: true, breaks: true });
  const htmlBody = marked.parse(markdownReport);

  const fullHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>BeaconHill Analytics Report</title>
    <style>${REPORT_CSS}</style>
  </head>
  <body>${htmlBody}</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to view the report.');
    return;
  }
  printWindow.document.write(fullHtml);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 400);
}

/**
 * Gold-styled button that generates an AI report from the current analytics
 * view and opens it in a print-ready window (Save as PDF).
 *
 * @param {{ getPayload: () => Object }} props
 */
export default function GenerateReportButton({ getPayload }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = getPayload();
      const result = await generateAnalyticsReport(payload);
      openReportForPrint(result.report);
    } catch (err) {
      console.error('Report generation failed:', err);
      setError(err?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
        onClick={handleClick}
        disabled={loading}
        className="generate-report-button"
        disableElevation
      >
        {loading ? 'Generating Report…' : 'Generate AI Report'}
      </Button>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
