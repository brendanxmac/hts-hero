import { McpServer } from "@modelcontextprotocol/server";
import { registerTools } from "./tools";
import { requestInfo } from "./track";
import { SITE_URL } from "./links";
import { WIDGET_MIME_TYPE, WIDGET_URI, widgetHtml } from "./widget";

// HTS Hero's MCP server: the Tariff Calculator for AI clients (Claude, ChatGPT and others).
// A fresh instance per HTTP request; the server keeps no state between requests.

const INSTRUCTIONS = [
  "HTS Hero calculates US import duties from an HTS code, a country of origin and a shipment, using HTS Hero's verified tariff engine (base rates plus every Chapter 99 measure in force on the entry date: Section 301, Section 232 and other additional duties, plus MPF/HMF).",
  "The tools need a known HTS code; they don't classify products. If the user doesn't have a code, ask for it.",
  "When a result has open questions with a non-zero change_if_yes_usd, ask the user those questions and call again with answers.",
  "Quote the as_of date and say results are estimates; mention a result's warnings, especially unverified dates.",
  "Results include links to the full breakdown on HTS Hero; share them when the user wants more detail.",
].join(" ");

export const createMcpServer = (request?: Request) => {
  const server = new McpServer(
    {
      name: "hts-hero",
      title: "HTS Hero",
      version: "0.1.0",
      websiteUrl: SITE_URL,
      icons: [{ src: `${SITE_URL}/icon.svg`, mimeType: "image/svg+xml" }],
    },
    { instructions: INSTRUCTIONS }
  );

  server.registerResource(
    "duty-card",
    WIDGET_URI,
    {
      title: "HTS Hero duty card",
      description: "Draws a duty breakdown or an origin comparison.",
      mimeType: WIDGET_MIME_TYPE,
    },
    async () => ({
      contents: [
        {
          uri: WIDGET_URI,
          mimeType: WIDGET_MIME_TYPE,
          text: widgetHtml,
          // Self-contained: no outside requests, so the strictest CSP is fine
          _meta: { ui: { csp: { connectDomains: [], resourceDomains: [] }, prefersBorder: false } },
        },
      ],
    })
  );

  registerTools(server, requestInfo(request));
  return server;
};
