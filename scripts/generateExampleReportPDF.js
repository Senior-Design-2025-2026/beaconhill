/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const { marked } = require('marked');
const puppeteer = require('puppeteer');

function fillTemplate(template, replacements) {
  let out = template;
  for (const [key, value] of Object.entries(replacements)) {
    // Replace placeholders like {{farm.name}} or {{Farm Name}}
    out = out.split(`{{${key}}}`).join(String(value));
  }
  return out;
}

async function main() {
  const repoRoot = process.cwd();
  const templatePath = path.join(repoRoot, 'src', 'pages', 'AnalyticsPage', 'EXAMPLE_AI_REPORT.md');
  const outPdfPath = path.join(repoRoot, 'example_report.pdf');

  const template = fs.readFileSync(templatePath, 'utf8');

  const replacements = {
    'farm.name': 'Beacon Hill Farm',
    'reportDateTime': '2026-03-26 10:30 AM',
    'modelUsed': 'Gemini (example)',
    'farm.id': 'BH-001',
    'farm.location': 'Iowa City, IA',
    'reportingPeriod': '2026-03-17 to 2026-03-23',
    'farm.notes': 'Node set: 5 (A-E)',
    'farmHealthPlainSummary': 'Overall soil health is fair. Moisture is mostly stable, but nitrogen-related indicators suggest moderate constraints for the next growth window.',
    'farmHealth.overallClassification': 'Fair',
    'farmHealth.overallEvidence': 'Evidence: moderate nutrient availability signal across multiple nodes; moisture consistency within a manageable band; no extreme outliers observed.',
    'Farm Name': 'Beacon Hill Farm',

    // Soil metrics
    'metric1.name': 'Soil Moisture (0-10cm)',
    'metric1.latestValue': '0.31',
    'metric1.unit': 'm3/m3',
    'metric1.condition': 'Stable; watch-afternoon drop',
    'metric1.whyItMatters': 'Moisture drives nutrient uptake and microbial activity.',
    'metric1.concernLevel': 'Low',
    'metric1.action': 'Keep irrigation intervals steady; check daily afternoon trend.',

    'metric2.name': 'Soil Temperature (0-10cm)',
    'metric2.latestValue': '16.8',
    'metric2.unit': '°C',
    'metric2.condition': 'In a good range',
    'metric2.whyItMatters': 'Temperature supports root function and nutrient cycling.',
    'metric2.concernLevel': 'Low',
    'metric2.action': 'No immediate action; re-check after any major weather swing.',

    'metric3.name': 'Soil pH',
    'metric3.latestValue': '6.4',
    'metric3.unit': 'pH',
    'metric3.condition': 'Slightly below target',
    'metric3.whyItMatters': 'pH affects nutrient availability (especially N and micronutrients).',
    'metric3.concernLevel': 'Medium',
    'metric3.action': 'Verify with lab/field test; consider buffering plan if trend continues.',

    'metric4.name': 'Available Nitrogen (proxy)',
    'metric4.latestValue': '28',
    'metric4.unit': 'ppm',
    'metric4.condition': 'Slightly low',
    'metric4.whyItMatters': 'Nitrogen supports vegetative growth and canopy development.',
    'metric4.concernLevel': 'Medium',
    'metric4.action': 'Align N timing with crop stage; re-check readings in 3-7 days.',

    'metric5.name': 'Organic Matter Proxy',
    'metric5.latestValue': '3.2',
    'metric5.unit': '%',
    'metric5.condition': 'Fair; maintain',
    'metric5.whyItMatters': 'Organic matter supports long-term water holding and resilience.',
    'metric5.concernLevel': 'Low',
    'metric5.action': 'Avoid practices that increase erosion; monitor over time.',

    // Ambient metrics
    'ambient1.name': 'Temperature (Ambient)',
    'ambient1.latestValue': '72.5',
    'ambient1.unit': '°F',
    'ambient1.trendNote': 'Slight decline; nights cooling',
    'ambient1.impact': 'Slightly lower water demand and steadier growth pace.',

    'ambient2.name': 'Humidity (Ambient)',
    'ambient2.latestValue': '55',
    'ambient2.unit': '%',
    'ambient2.trendNote': 'Gradually increasing',
    'ambient2.impact': 'Reduced evapotranspiration; easier moisture management.',

    'ambient3.name': 'Rainfall (Ambient)',
    'ambient3.latestValue': '0.1',
    'ambient3.unit': 'in',
    'ambient3.trendNote': 'Low rainfall probability',
    'ambient3.impact': 'Continued reliance on irrigation likely.',

    // Ambient metrics in the main metrics tables reuse metric1-5 keys there.
    // For simplicity, we fill what the template references.
    'concern1.issue': 'Moderate nitrogen availability dip',
    'concern1.evidence': 'Nitrogen proxy is lower on nodes B and D.',
    'concern1.whyProblem': 'Nitrogen limits leaf growth and can delay canopy development.',
    'concern1.nextSteps': 'Plan a targeted N adjustment (per agronomy guidance) and re-check within 3-7 days.',

    'concern2.issue': 'Potential pH drift lower than ideal',
    'concern2.evidence': 'pH readings are trending slightly below target.',
    'concern2.whyProblem': 'Suboptimal pH can reduce nutrient availability.',
    'concern2.nextSteps': 'Confirm with lab/field test and consider buffering if the trend continues.',

    'positive1.signal': 'Improving moisture consistency',
    'positive1.evidence': 'Soil moisture stays within ~0.28–0.33 m3/m3 over 7 days.',
    'positive1.explanation': 'Irrigation is supporting root-zone stability.',

    'positive2.signal': 'Temperature steadiness',
    'positive2.evidence': 'Soil temperature remained near 16–17 °C.',
    'positive2.explanation': 'Stable temperatures reduce shock and support steady cycling.',

    // Ranked top concerns
    'topConcern1.title': 'Soil nitrogen moderation',
    'topConcern1.whyItMatters': 'Nitrogen supports healthy leaf growth and helps prevent pale canopy.',
    'topConcern1.evidence': 'Consistent signals on nodes B and D.',
    'topConcern1.immediateAction': 'Plan a split N application aligned with your field strategy.',
    'topConcern1.monitoring': 'Re-check proxy readings in 3-5 days and after any amendment.',

    'topConcern2.title': 'Moisture variability risk',
    'topConcern2.whyItMatters': 'Moisture swings reduce nutrient uptake and increase stress.',
    'topConcern2.evidence': 'Afternoon moisture variance is widening slightly.',
    'topConcern2.immediateAction': 'Keep irrigation intervals steady; avoid midday over-correction.',
    'topConcern2.monitoring': 'Track moisture daily; adjust if the dry streak persists.',

    // Checklist
    'checklist1.item': 'Check root-zone moisture',
    'checklist1.frequency': 'Daily (next 5 days)',
    'checklist1.target': '0.30–0.34 m3/m3',
    'checklist1.goodLooksLike': 'Small day-to-day changes; no sustained drop below 0.28',

    'checklist2.item': 'Inspect crop canopy color',
    'checklist2.frequency': '3x/week',
    'checklist2.target': 'Uniform green canopy',
    'checklist2.goodLooksLike': 'No widespread paling; no rapid yellowing trend',

    'checklist3.item': 'Review nitrogen plan vs proxy',
    'checklist3.frequency': 'Once this week',
    'checklist3.target': 'N application matches crop stage plan',
    'checklist3.goodLooksLike': 'Readings stabilize or improve after the adjustment',

    // Final recommendation
    finalRecommendation:
      'Maintain steady irrigation and focus this week on stabilizing nitrogen availability. If pH remains slightly low at the next check, confirm with a more formal test and apply a buffering strategy per agronomy guidance.'
  };

  const filledMarkdown = fillTemplate(template, replacements);

  // Convert markdown -> HTML in-memory.
  marked.use({ gfm: true, breaks: true });
  const htmlBody = marked.parse(filledMarkdown);

  // Ensure the header image resolves inside the headless browser.
  // We map `/img/BeaconHill.*` URLs to local `file://` URLs because `page.setContent`
  // runs without the CRA dev server.
  const svgPath = path.join(repoRoot, 'public', 'img', 'BeaconHill.svg');
  const svgFileUrl = pathToFileURL(svgPath).href;

  const pngPath = path.join(repoRoot, 'public', 'img', 'BeaconHill.png');
  const pngFileUrl = pathToFileURL(pngPath).href;

  const fullHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, Helvetica, sans-serif; padding: 22px; color: #111827; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th, td { border: 1px solid #e5e7eb; padding: 7px 9px; font-size: 12px; vertical-align: top; }
      th { background: #f9fafb; font-weight: 700; text-align: left; }
      h2 { margin-top: 22px; }
      h3 { margin-top: 18px; }
      img { max-width: 200px; height: auto; }
      blockquote { margin: 10px 0; padding: 10px 14px; border-left: 4px solid #e5e7eb; color: #374151; background: #fafafa; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    </style>
  </head>
  <body>
    ${htmlBody}
  </body>
</html>`;

  const htmlWithAssets = fullHtml
    .replace(/\/img\/BeaconHill\.svg/g, svgFileUrl)
    .replace(/\/img\/BeaconHill\.png/g, pngFileUrl);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlWithAssets, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outPdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '18mm', right: '12mm', bottom: '18mm', left: '12mm' }
    });
  } finally {
    await browser.close();
  }

  console.log(`Wrote PDF: ${outPdfPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

