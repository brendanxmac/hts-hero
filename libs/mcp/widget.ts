// The duty card: an MCP App view (the `io.modelcontextprotocol/ui` extension) that AI clients
// render inline under calculate_import_duty and compare_origins results. One self-contained HTML
// page, no external requests. It speaks the MCP Apps postMessage protocol directly (ui/initialize,
// then ui/notifications/tool-result) rather than bundling the SDK's app library.
//
// Host limits it designs for: Claude allows at most two actions on an inline card and requires
// dark mode and reflow from 320px; links open only through ui/open-link.

export const WIDGET_URI = "ui://hts-hero/duty-card.html";
export const WIDGET_MIME_TYPE = "text/html;profile=mcp-app";

export const widgetHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>HTS Hero duty card</title>
<style>
  :root {
    --bg: var(--color-background-primary, #ffffff);
    --bg-2: var(--color-background-secondary, #f5f6f8);
    --text: var(--color-text-primary, #14161a);
    --text-2: var(--color-text-secondary, #5b6170);
    --border: var(--color-border-primary, #e3e5ea);
    --accent: #2f6fde;
    --font: var(--font-sans, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif);
    --mono: var(--font-mono, ui-monospace, "SF Mono", Menlo, monospace);
    --radius: var(--border-radius-lg, 12px);
    color-scheme: light;
  }
  :root[data-theme="dark"] {
    --bg: var(--color-background-primary, #17181c);
    --bg-2: var(--color-background-secondary, #202228);
    --text: var(--color-text-primary, #eceef2);
    --text-2: var(--color-text-secondary, #9aa0ad);
    --border: var(--color-border-primary, #2e3139);
    --accent: #6c9cff;
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--bg); color: var(--text); font: 14px/1.45 var(--font); }
  .card { padding: 16px; border: 1px solid var(--border); border-radius: var(--radius); }
  .eyebrow { font-size: 12px; color: var(--text-2); display: flex; gap: 6px; flex-wrap: wrap; }
  .code { font-family: var(--mono); }
  .desc { margin: 2px 0 12px; font-weight: 600; overflow-wrap: anywhere; }
  .totals { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 12px; }
  .big { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
  .label { font-size: 12px; color: var(--text-2); }
  .bar { display: flex; height: 10px; border-radius: 999px; overflow: hidden; background: var(--bg-2); margin-bottom: 10px; }
  .bar span { display: block; height: 100%; }
  table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  td { padding: 5px 0; border-top: 1px solid var(--border); vertical-align: top; }
  td.num { text-align: right; white-space: nowrap; padding-left: 12px; }
  .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: 1px; }
  .muted { color: var(--text-2); }
  .note { margin-top: 10px; font-size: 12px; color: var(--text-2); }
  .chip { display: inline-block; padding: 2px 8px; border-radius: 999px; background: var(--bg-2); font-size: 12px; margin-top: 10px; }
  .row-bar { height: 6px; border-radius: 999px; background: var(--accent); opacity: .85; margin-top: 3px; }
  tr.mine td { font-weight: 600; }
  .actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  button { font: inherit; font-size: 13px; padding: 7px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); cursor: pointer; }
  button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  .empty { color: var(--text-2); padding: 8px 0; }
</style>
</head>
<body>
<div id="root" class="card"><div class="empty">Calculating duty…</div></div>
<script>
(function () {
  var COLORS = ["#2f6fde", "#e8833a", "#2fa37a", "#c94f7c", "#8a63d2", "#d4a72c", "#3aa7c9", "#7b8794"];
  var root = document.getElementById("root");
  var nextId = 1, pending = {};

  function post(msg) { window.parent.postMessage(msg, "*"); }
  function request(method, params) {
    var id = nextId++;
    post({ jsonrpc: "2.0", id: id, method: method, params: params });
    return new Promise(function (resolve) { pending[id] = resolve; });
  }
  function notify(method, params) { post({ jsonrpc: "2.0", method: method, params: params || {} }); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(n) { return (Math.round(Number(n || 0) * 100) / 100) + "%"; }

  function openLink(url) {
    if (!url) return;
    if (window.openai && window.openai.openExternal) return window.openai.openExternal({ href: url });
    request("ui/open-link", { url: url });
  }

  function applyContext(ctx) {
    if (!ctx) return;
    if (ctx.theme) document.documentElement.setAttribute("data-theme", ctx.theme);
    var vars = ctx.styles && ctx.styles.variables;
    if (vars) Object.keys(vars).forEach(function (k) { if (vars[k]) document.documentElement.style.setProperty(k, vars[k]); });
  }

  function actions(buttons) {
    return '<div class="actions">' + buttons.filter(function (b) { return b.url; }).slice(0, 2).map(function (b, i) {
      return '<button class="' + (i === 0 ? "primary" : "") + '" data-url="' + esc(b.url) + '">' + esc(b.label) + "</button>";
    }).join("") + "</div>";
  }

  function renderDuty(d) {
    var applied = (d.layers || []).filter(function (l) { return l.status === "applies" && l.amount_usd > 0; });
    var parts = [{ name: "Base duty (" + d.base.rate + ")", code: "", amount: d.base.amount_usd, rate: null }]
      .concat(applied.map(function (l) { return { name: l.program || l.name, code: l.code, amount: l.amount_usd, rate: l.rate_pct }; }))
      .filter(function (p) { return p.amount > 0; });
    var total = d.totals.duty_usd || 1;
    var bar = parts.map(function (p, i) {
      return '<span title="' + esc(p.name) + '" style="width:' + (p.amount / total * 100) + "%;background:" + COLORS[i % COLORS.length] + '"></span>';
    }).join("");
    var rows = parts.map(function (p, i) {
      return "<tr><td><span class=\\"dot\\" style=\\"background:" + COLORS[i % COLORS.length] + '"></span>' + esc(p.name) +
        (p.code ? ' <span class="muted code">' + esc(p.code) + "</span>" : "") + "</td>" +
        '<td class="num muted">' + (p.rate != null ? pct(p.rate) : "") + '</td><td class="num">' + money(p.amount) + "</td></tr>";
    }).join("") + (d.fees || []).map(function (f) {
      return '<tr><td class="muted">' + esc(f.name) + '</td><td class="num muted">' + pct(f.rate_pct) + '</td><td class="num muted">' + money(f.amount_usd) + "</td></tr>";
    }).join("");
    var open = (d.questions || []).filter(function (q) { return !q.answered && q.change_if_yes_usd !== 0; }).length;
    root.innerHTML =
      '<div class="eyebrow"><span class="code">HTS ' + esc(d.product.hts_code) + "</span><span>·</span><span>from " + esc(d.product.country_of_origin.name) +
      "</span><span>·</span><span>" + esc(d.as_of) + "</span><span>·</span><span>" + money(d.product.customs_value_usd) + " value</span></div>" +
      '<div class="desc">' + esc(d.product.description) + "</div>" +
      '<div class="totals"><div><div class="big">' + money(d.totals.duty_usd) + '</div><div class="label">Total duty</div></div>' +
      '<div><div class="big">' + pct(d.totals.effective_duty_rate_pct) + '</div><div class="label">Effective rate</div></div>' +
      '<div><div class="big">' + money(d.totals.fees_usd) + '</div><div class="label">Fees (MPF/HMF)</div></div></div>' +
      '<div class="bar">' + bar + "</div><table>" + rows + "</table>" +
      (open ? '<span class="chip">' + open + " open question" + (open > 1 ? "s" : "") + " could change this</span>" : "") +
      (d.verified === false ? '<div class="note">Unverified date: HTS Hero hasn\\'t verified the tariff rules for this entry date.</div>' : "") +
      actions([{ label: "Open full breakdown", url: d.links && d.links.full_breakdown_url }, { label: "Compare all origins", url: d.links && d.links.analysis_url }]) +
      '<div class="note">' + esc(d.disclaimer) + "</div>";
  }

  function renderComparison(c) {
    var max = Math.max.apply(null, c.origins.map(function (o) { return o.effective_duty_rate_pct; }).concat([0.01]));
    var rows = c.origins.map(function (o) {
      var p = o.best_trade_program;
      var agreement = !p ? "" : '<div class="muted" style="font-size:12px">' + (o.effective_duty_rate_pct !== o.standard_rate_pct
        ? "With " + esc(p.symbol) + " claimed · " + pct(o.standard_rate_pct) + " standard"
        : pct(p.effective_duty_rate_pct) + " with " + esc(p.symbol)) + "</div>";
      return '<tr class="' + (o.is_requested_origin ? "mine" : "") + '"><td class="muted" style="width:32px">#' + o.rank + "</td><td>" + esc(o.country.flag || "") + " " + esc(o.country.name) +
        '<div class="row-bar" style="width:' + Math.max(2, o.effective_duty_rate_pct / max * 100) + '%"></div>' + agreement + '</td><td class="num">' + pct(o.effective_duty_rate_pct) + "</td></tr>";
    }).join("");
    var s = c.summary;
    root.innerHTML =
      '<div class="eyebrow"><span class="code">HTS ' + esc(c.product.hts_code) + "</span><span>·</span><span>" + esc(c.as_of) + "</span><span>·</span><span>" + s.origins_compared + " origins</span></div>" +
      '<div class="desc">' + esc(c.product.description) + "</div>" +
      '<div class="totals"><div><div class="big">' + pct(s.lowest_rate_pct) + '</div><div class="label">Lowest (' + s.origins_at_lowest_rate + " origins)</div></div>" +
      '<div><div class="big">' + pct(s.highest_rate_pct) + '</div><div class="label">Highest</div></div>' +
      (s.requested_origin ? '<div><div class="big">' + pct(s.requested_origin.effective_duty_rate_pct) + '</div><div class="label">' + esc(s.requested_origin.country.name) + "</div></div>" : "") +
      "</div><table>" + rows + "</table>" +
      actions([{ label: "Open origin analysis", url: c.links && c.links.analysis_url }, { label: "HTS code page", url: c.links && c.links.hts_page_url }]) +
      '<div class="note">' + esc(c.note) + " " + esc(c.disclaimer) + "</div>";
  }

  function render(data) {
    if (!data || !data.kind) return;
    try {
      if (data.kind === "duty") renderDuty(data);
      else if (data.kind === "comparison") renderComparison(data);
      else return;
    } catch (e) {
      root.innerHTML = '<div class="empty">Couldn\\'t draw this result.</div>';
    }
    reportSize();
  }

  function reportSize() {
    notify("ui/notifications/size-changed", { height: Math.ceil(document.documentElement.scrollHeight) });
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button[data-url]");
    if (b) openLink(b.getAttribute("data-url"));
  });

  window.addEventListener("message", function (event) {
    var m = event.data;
    if (!m || m.jsonrpc !== "2.0") return;
    if (m.id != null && !m.method) {
      var resolve = pending[m.id];
      if (resolve) { delete pending[m.id]; resolve(m.result); }
      return;
    }
    if (m.method === "ui/notifications/tool-result") render(m.params && m.params.structuredContent);
    else if (m.method === "ui/notifications/host-context-changed") applyContext(m.params);
    else if (m.id != null) post({ jsonrpc: "2.0", id: m.id, result: {} });
  });

  if (window.ResizeObserver) new ResizeObserver(reportSize).observe(document.body);

  request("ui/initialize", {
    appInfo: { name: "hts-hero-duty-card", version: "1.0.0" },
    appCapabilities: {},
    protocolVersion: "2026-01-26"
  }).then(function (result) {
    applyContext(result && result.hostContext);
    notify("ui/notifications/initialized", {});
  });

  // ChatGPT also hands the result over directly
  if (window.openai && window.openai.toolOutput) render(window.openai.toolOutput);
  if (!document.documentElement.getAttribute("data-theme") && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
</script>
</body>
</html>`;
