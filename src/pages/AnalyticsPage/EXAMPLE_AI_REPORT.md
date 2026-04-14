<!--
TEMPLATE PURPOSE
Use this file as the “required output structure” for Gemini.
When generating a report, the assistant must produce PDF-ready content (do not output a standalone markdown document).
Keep the same headings and table formats shown in this file.
Replace placeholders like {{reportDateTime}} and {{farm.name}} with real values.

The app will convert the assistant output into a PDF, so output should be compatible with an HTML/renderer pipeline (no markdown code fences, no surrounding wrapper text).
-->


<div style="display: flex; align-items: flex-start; gap: 2rem;">
  <img src="/img/BeaconHill.png" alt="Farm Analytics Visualization" width="200"/>
  <div style="display: flex; flex-direction: column; justify-content: center; gap: 0.5rem;">
    <div>
      <strong>Farm Name:</strong> {{farm.name}}
    </div>
    <div>
      <strong>Report Time:</strong> {{reportDateTime}}
    </div>
    <div>
      <strong>Model Used:</strong> {{modelUsed}}
    </div>
  </div>
</div>

## {{Farm Name}} Metadata

| Field | Value |
|---|---|
| Farm Name | {{farm.name}} |
| Farm ID | {{farm.id}} |
| Location / Region | {{farm.location}} |
| Reporting Period | {{reportingPeriod}} |
| Nodes | {{farm.notes}} |

## Soil Health 

> Plain-language summary via Gemini API: {{farmHealthPlainSummary}}

## Metrics

| Category | Classification | Confidence / Evidence |
|---|---|---|
| Health Status | {{farmHealth.overallClassification}} | {{farmHealth.overallEvidence}} |

| Soil Metric | Latest Reading | Condition Classification | Why this matters (farmer-friendly) | Concern Level | What to do / monitor |
|---|---:|---|---|---|---|
| {{metric1.name}} | {{metric1.latestValue}} {{metric1.unit}} | {{metric1.condition}} | {{metric1.whyItMatters}} | {{metric1.concernLevel}} | {{metric1.action}} |
| {{metric2.name}} | {{metric2.latestValue}} {{metric2.unit}} | {{metric2.condition}} | {{metric2.whyItMatters}} | {{metric2.concernLevel}} | {{metric2.action}} |
| {{metric3.name}} | {{metric3.latestValue}} {{metric3.unit}} | {{metric3.condition}} | {{metric3.whyItMatters}} | {{metric3.concernLevel}} | {{metric3.action}} |
| {{metric4.name}} | {{metric4.latestValue}} {{metric4.unit}} | {{metric4.condition}} | {{metric4.whyItMatters}} | {{metric4.concernLevel}} | {{metric4.action}} |
| {{metric5.name}} | {{metric5.latestValue}} {{metric5.unit}} | {{metric5.condition}} | {{metric5.whyItMatters}} | {{metric5.concernLevel}} | {{metric5.action}} |

| Ambient Metric |  Condition Classification | Why this matters (farmer-friendly) | Concern Level | What to do / monitor |
|---|---:|---|---|---|
| {{metric1.name}} | {{metric1.condition}} | {{metric1.whyItMatters}} | {{metric1.concernLevel}} | {{metric1.action}} |
| {{metric2.name}} | {{metric2.condition}} | {{metric2.whyItMatters}} | {{metric2.concernLevel}} | {{metric2.action}} |
| {{metric3.name}} | {{metric3.condition}} | {{metric3.whyItMatters}} | {{metric3.concernLevel}} | {{metric3.action}} |
| {{metric4.name}} | {{metric4.condition}} | {{metric4.whyItMatters}} | {{metric4.concernLevel}} | {{metric4.action}} |
| {{metric5.name}} | {{metric5.condition}} | {{metric5.whyItMatters}} | {{metric5.concernLevel}} | {{metric5.action}} |

### What’s Going Well (If applicable)

| Positive Signal | Evidence (from readings) | Simple explanation |
|---|---|---|
| {{positive1.signal}} | {{positive1.evidence}} | {{positive1.explanation}} |
| {{positive2.signal}} | {{positive2.evidence}} | {{positive2.explanation}} |

### What Needs Attention (If applicable)

| Concern | Evidence (from readings) | Why it’s a problem | Suggested next steps |
|---|---|---|---|
| {{concern1.issue}} | {{concern1.evidence}} | {{concern1.whyProblem}} | {{concern1.nextSteps}} |
| {{concern2.issue}} | {{concern2.evidence}} | {{concern2.whyProblem}} | {{concern2.nextSteps}} |

### Weekly Forecast

| Ambient Metric | Latest Value | Next Week's Projection | Potential Farm impact (plain language) |
|---|---:|---|---|
| {{ambient1.name}} | {{ambient1.latestValue}} {{ambient1.unit}} | {{ambient1.trendNote}} | {{ambient1.impact}} |
| {{ambient2.name}} | {{ambient2.latestValue}} {{ambient2.unit}} | {{ambient2.trendNote}} | {{ambient2.impact}} |
| {{ambient3.name}} | {{ambient3.latestValue}} {{ambient3.unit}} | {{ambient3.trendNote}} | {{ambient3.impact}} |

## 4. Concerns & Plan of Action

### Top Concerns (Ranked)

1. **{{topConcern1.title}}**  
   - Why it matters: {{topConcern1.whyItMatters}}  
   - Evidence: {{topConcern1.evidence}}  
   - Immediate action (today/this week): {{topConcern1.immediateAction}}  
   - Ongoing monitoring: {{topConcern1.monitoring}}
2. **{{topConcern2.title}}**  
   - Why it matters: {{topConcern2.whyItMatters}}  
   - Evidence: {{topConcern2.evidence}}  
   - Immediate action (today/this week): {{topConcern2.immediateAction}}  
   - Ongoing monitoring: {{topConcern2.monitoring}}

### Recommended Monitoring Checklist

| Item | Frequency | Target | What “good” looks like |
|---|---|---|---|
| {{checklist1.item}} | {{checklist1.frequency}} | {{checklist1.target}} | {{checklist1.goodLooksLike}} |
| {{checklist2.item}} | {{checklist2.frequency}} | {{checklist2.target}} | {{checklist2.goodLooksLike}} |
| {{checklist3.item}} | {{checklist3.frequency}} | {{checklist3.target}} | {{checklist3.goodLooksLike}} |

### Final Farmer-Friendly Recommendation

{{finalRecommendation}}

---
*Report generated by BeaconHill Analytics. Not a substitute for professional agronomy advice.*