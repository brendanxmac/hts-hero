import { createMcpHandler } from "@modelcontextprotocol/server";
import { createMcpServer } from "@/libs/mcp/server";

// The MCP endpoint (Streamable HTTP, stateless): https://htshero.com/api/mcp
// Serves 2026-07-28 clients natively and older clients through the SDK's stateless fallback.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Comparing every origin runs the engine a few hundred times; the first call on a cold instance
// also loads the HTS
export const maxDuration = 60;

const handler = createMcpHandler(({ requestInfo }) => createMcpServer(requestInfo), {
  onerror: (error) => console.error("MCP handler error:", error),
});

// Browser-based clients (inspectors, web IDEs) call cross-origin; AI platforms call server-side
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version, WWW-Authenticate",
};

const withCors = (response: Response) => {
  const headers = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

const serve = async (request: Request) => withCors(await handler.fetch(request));

export const GET = serve;
export const POST = serve;
export const DELETE = serve;
export const OPTIONS = () => new Response(null, { status: 204, headers: CORS_HEADERS });
