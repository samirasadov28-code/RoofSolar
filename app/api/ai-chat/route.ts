import { NextRequest } from 'next/server';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
// Configurable so we can switch models without a redeploy. Default to a
// widely-available Grok model. Set XAI_MODEL on Netlify to override.
const MODEL = process.env.XAI_MODEL || 'grok-3';

function buildSystemPrompt(results: any, inputs: any): string {
  if (!results || !inputs) {
    return `You are an expert solar energy financial advisor for RoofSolar.
Answer questions about solar panels, battery storage, export tariffs, financing options,
and ROI calculations. Be concise, helpful, and UK/Ireland focused.`;
  }

  const symbol = inputs.countryCode === 'ie' ? '€' : inputs.countryCode === 'gb' ? '£' : '';
  const paybackYrs = isNaN(results.paybackMonths) ? 'N/A' : `${(results.paybackMonths / 12).toFixed(1)} years`;

  return `You are an expert solar energy financial advisor for RoofSolar.
The user has just completed a solar investment analysis for their home. Here is their analysis:

LOCATION: ${inputs.displayName || 'Unknown'}
SYSTEM: ${inputs.systemKwp?.toFixed(1)} kWp (${inputs.panelCount} × 400W panels)
BATTERY: ${inputs.hasBattery ? `${inputs.batteryKwh} kWh` : 'None'}
EV: ${inputs.hasEv ? `Yes (${inputs.annualMileageKm?.toLocaleString()} km/yr)` : 'No'}

FINANCIAL RESULTS:
- Annual production: ${Math.round(results.annualProductionKwh ?? 0).toLocaleString()} kWh
- Self-consumed: ${Math.round(results.selfConsumedKwh ?? 0).toLocaleString()} kWh/yr
- Exported: ${Math.round(results.exportedKwh ?? 0).toLocaleString()} kWh/yr
- Year 1 solar savings: ${symbol}${Math.round(results.solarSavingsYear1 ?? 0).toLocaleString()}
- Year 1 export income: ${symbol}${Math.round(results.exportIncomeYear1 ?? 0).toLocaleString()}
- Payback period: ${paybackYrs}
- IRR: ${results.irr ? `${(results.irr * 100).toFixed(1)}%` : 'N/A'}
- NPV (8% discount): ${symbol}${Math.round(results.npv ?? 0).toLocaleString()}
- 10-year gross savings: ${symbol}${Math.round(results.lifetimeSavings ?? 0).toLocaleString()}
- CO₂ saved/year: ${Math.round(results.annualCo2Saved ?? 0).toLocaleString()} kg

TARIFFS:
- Import: ${symbol}${inputs.importPricePerKwh}/kWh
- Export (${inputs.countryCode === 'ie' ? 'MSS' : 'SEG'}): ${symbol}${inputs.exportPricePerKwh}/kWh
- Grant: ${symbol}${(results.grant ?? 0).toLocaleString()}
- Net cost: ${symbol}${(results.netCapex ?? 0).toLocaleString()}

FINANCING: ${inputs.financingMode} — ${inputs.financingMode !== 'outright' ? `${Math.round((inputs.loanCoveragePct ?? 1) * 100)}% financed at ${((inputs.annualRatePct ?? 0.065) * 100).toFixed(2)}% over ${inputs.tenorYears} years` : 'paid in full'}

DATA SOURCE: ${results.dataSource} (solar irradiance)

Answer the user's questions about their specific analysis. Be concise, financially precise,
and proactive about explaining what the numbers mean for them.
Focus on actionable insights. Use ${symbol} for currency. Be friendly but professional.`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI advisor not configured — XAI_API_KEY missing' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { messages, results, inputs } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'messages array required' }), { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(results, inputs);

  const grokResponse = await fetch(XAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10), // keep last 10 turns to stay within context
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  if (!grokResponse.ok) {
    const errText = await grokResponse.text();
    // Surface the upstream message so the client can show something useful
    // (e.g. "model not found", "invalid API key").
    let detail = errText;
    try {
      const parsed = JSON.parse(errText);
      detail = parsed?.error?.message || parsed?.error || errText;
    } catch {}
    return new Response(
      JSON.stringify({
        error: `Grok API error (HTTP ${grokResponse.status})`,
        detail,
        model: MODEL,
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Stream the SSE response straight through to the client
  return new Response(grokResponse.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
