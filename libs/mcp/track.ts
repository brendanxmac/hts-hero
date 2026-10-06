import { createHash } from "crypto";
import { CLIENT_INFO_META_KEY, ServerContext } from "@modelcontextprotocol/server";
import { MixpanelEvent } from "../mixpanel";
import { trackEventServerAsync } from "../mixpanel-server";

// Which AI client a request came from, and recording tool calls in Mixpanel. Anonymous callers
// get a distinct id hashed from their IP and user agent (never stored raw); signed-in callers
// (v1) will use their Supabase user id, the same id the web app identifies them by.

export interface RequestInfo {
  request?: Request;
  clientFor: (ctx: ServerContext) => string;
}

// "claude", "chatgpt", "cursor", "copilot", or "other"
const clientSlug = (name: string) => {
  const n = name.toLowerCase();
  if (/claude|anthropic/.test(n)) return "claude";
  if (/openai|chatgpt/.test(n)) return "chatgpt";
  if (/cursor/.test(n)) return "cursor";
  if (/copilot|vscode|visual studio/.test(n)) return "copilot";
  if (/gemini|google/.test(n)) return "gemini";
  if (/inspector|mcpjam|postman/.test(n)) return "dev-tool";
  return "other";
};

// The client's name: from the request envelope (2026-07-28 clients send it on every request),
// else the user agent (older clients only send it once, at initialize)
const clientName = (ctx: ServerContext, request?: Request) => {
  const req = ctx.mcpReq as { envelope?: { clientInfo?: { name?: string } }; _meta?: Record<string, unknown> };
  const fromMeta = (req._meta?.[CLIENT_INFO_META_KEY] as { name?: string } | undefined)?.name;
  return req.envelope?.clientInfo?.name ?? fromMeta ?? request?.headers.get("user-agent") ?? "";
};

export const requestInfo = (request?: Request): RequestInfo => ({
  request,
  clientFor: (ctx) => clientSlug(clientName(ctx, request)),
});

const anonymousId = (request?: Request) => {
  const ip = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const agent = request?.headers.get("user-agent") ?? "";
  return `mcp-anon-${createHash("sha256").update(`${ip}|${agent}`).digest("hex").slice(0, 16)}`;
};

// Arguments worth reporting: codes, origins and options, not free text
const argProperties = (args: unknown) => {
  const a = (args ?? {}) as Record<string, unknown>;
  return {
    hts_code: typeof a.hts_code === "string" ? a.hts_code : undefined,
    country_of_origin: typeof a.country_of_origin === "string" ? a.country_of_origin : undefined,
    countries: Array.isArray(a.countries) ? a.countries.length : undefined,
    lines: Array.isArray(a.lines) ? a.lines.length : undefined,
    has_answers: a.answers ? Object.keys(a.answers as object).length > 0 : undefined,
    entry_date: typeof a.entry_date === "string" ? a.entry_date : undefined,
  };
};

export const trackToolCall = (
  info: RequestInfo,
  ctx: ServerContext,
  props: { tool: string; client: string; status: "ok" | "error"; duration_ms: number; args: unknown }
) =>
  trackEventServerAsync(MixpanelEvent.MCP_TOOL_CALLED, anonymousId(info.request), {
    tool: props.tool,
    client: props.client,
    client_name: clientName(ctx, info.request).slice(0, 100),
    status: props.status,
    duration_ms: props.duration_ms,
    signed_in: false,
    ...argProperties(props.args),
  }).catch((): void => undefined);
