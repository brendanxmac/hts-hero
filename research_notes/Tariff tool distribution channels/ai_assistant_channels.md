# AI Assistant and Agent Distribution Channels for HTS Hero (duty calculator, Tariff Tracker alerts, tariff audits)

Research date: 2026-10-26. About 18 tool calls. Many 2026 details come from third-party blogs because OpenAI's own pages returned 403. Each finding notes when it rests on a secondary source.

## Which channels have real user reach in late 2026, and how do apps get discovered?

### Takeaway
ChatGPT's plugin directory (renamed from "apps" in July 2026) and Anthropic's Connectors Directory are the two consumer channels with large reach. Both run on a standard remote MCP server, and both suggest tools inside the chat automatically, so one MCP endpoint covers both. The enterprise marketplaces (Microsoft Agent Store, Google Cloud Marketplace/Gemini Enterprise, AWS Marketplace, Salesforce AgentExchange) sit behind admin approval and procurement. They don't fit a self-serve product for SMB importers well. The public MCP registries are cheap to list on but drive little traffic.

### Cited Findings
**ChatGPT (OpenAI)**
- OpenAI opened app submissions to third-party developers in December 2025 (most sources say Dec 17), alongside an in-ChatGPT App Directory at chatgpt.com/apps. Launch partners included Booking.com, Canva, Figma, Spotify and Zillow. — [VentureBeat](https://venturebeat.com/technology/openai-now-accepting-chatgpt-app-submissions-from-third-party-devs-launches); [OpenAI](https://openai.com/index/developers-can-now-submit-apps-to-chatgpt/)
- The Apps SDK was announced in October 2025 and is built on MCP. In December 2025 "connectors" were renamed to apps. — [OpenAI](https://openai.com/index/introducing-apps-in-chatgpt/); [Taskade blog](https://www.taskade.com/blog/chatgpt-plugins)
- July 2026 rebrand, from secondary sources only: OpenAI moved to "plugins" branding around July 9, 2026. The Plugin Directory at chatgpt.com/plugins replaced the App Directory and bundles apps, skills and templates. The live listing URLs use chatgpt.com/plugins/plugin_asdk_app_..., which supports this. — [Taskade](https://www.taskade.com/blog/chatgpt-plugins); [Skybridge PR](https://github.com/alpic-ai/skybridge/pull/1092); [Gateway listing](https://chatgpt.com/plugins/plugin_asdk_app_6a754e3ed8b48191aa0e6761af6cd872)
- Submission happens through the OpenAI Developer Platform. You provide MCP connection details, test instructions, directory metadata and country availability, and only one version can be under review at a time. — [VentureBeat](https://venturebeat.com/technology/openai-now-accepting-chatgpt-app-submissions-from-third-party-devs-launches)
- Discovery: plugins with strong utility and high satisfaction "may be eligible for enhanced distribution opportunities, such as directory placement or proactive suggestions." Model-readable fields must not steer the model toward one plugin or ask for overly broad triggering. Screenshots are no longer shown, so listings use example prompts instead. — [OpenAI submission guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines)
- Gateway Lines reports its tariff plugin is found three ways: by searching the Plugins Directory, by direct link, and by ChatGPT surfacing it automatically for duty, HTS or trade-action questions. — [Gateway Lines](https://gatewaylines.com/news/gateway-tariff-calculator-chatgpt-plugin)
- Reach: OpenAI reported 900M weekly users in February 2026. Later figures of 1B+ (Aug 2026) and 1.2B (DevDay, Sept 29 2026) come from secondary stat sites and are unverified. — [DemandSage](https://www.demandsage.com/chatgpt-statistics/); [TechnologyChecker](https://technologychecker.io/blog/chatgpt-statistics)
- A September 2026 guide describes the directory as still sparse in most categories. — [umesh-malik.com](https://umesh-malik.com/blog/chatgpt-apps-sdk-super-app-guide)

**Claude (Anthropic)**
- One Connectors Directory serves claude.ai, Desktop, mobile, Claude Code and Cowork. Every directory entry is automatically eligible for "Suggested Connectors," which are in-chat recommendations shown when relevant. Ranking is usage-based. No DNS or .well-known domain proof is needed (that applies only to the open MCP Registry). — [Claude docs](https://claude.com/docs/connectors/directory)
- Submission goes through the developer portal at claude.ai/directory/manage. Anyone on a paid Claude plan can submit, and the dashboard shows health and usage after publication. — [Claude docs](https://claude.com/docs/connectors/directory). The older FAQ describes a review form open to any plan, so sources conflict on plan gating. — [Support FAQ](https://support.claude.com/en/articles/11596036-anthropic-mcp-directory-faq)
- Requirements: tool annotations (title plus readOnlyHint/destructiveHint), OAuth 2.0 for authenticated services, a privacy policy (missing or incomplete means immediate rejection), and a test account if login is needed. — [Claude submission docs](https://claude.com/docs/connectors/building/submission)
- Anthropic says the directory lists more than 950 MCP servers. — [Claude blog: MCP 2026-07-28](https://claude.com/fr/blog/bringing-mcp-2026-07-28-to-claude)
- Plugins bundle an MCP connector, skills and an optional MCP App (interactive UI) and are listed in Anthropic's directory. Anthropic advises submitting the MCP server as a connector even when a plugin references it. — [Claude build overview](https://claude.com/docs/build/overview)
- MCP Apps (SEP-1865) went production-ready on January 26, 2026, with interactive UI in Claude; ChatGPT supports it as well. — [Alpic](https://alpic.ai/blog/mcp-apps-goes-official-claude-chatgpt-support)
- On a Team plan, members can press "Request" on a directory connector, which notifies Owners. This creates a bottom-up path into businesses. — [Claude docs](https://claude.com/docs/connectors/directory)

**Microsoft**
- The Agent Store launched in May 2025 as a curated marketplace of agents from Microsoft, partners and customers inside Microsoft 365 Copilot, open to licensed and unlicensed users. — [Microsoft 365 Dev Blog](https://devblogs.microsoft.com/microsoft365dev/introducing-the-agent-store-build-publish-and-discover-agents-in-microsoft-365-copilot/)
- Copilot Studio can publish to M365 Copilot and Teams (GA). Publishing needs admin approval in the Teams/M365 admin center before an agent appears in the store. — [Microsoft Copilot blog](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/publish-your-microsoft-copilot-studio-agents-to-microsoft-365-copilot/)
- Publishing Foundry agents to M365 Copilot and Teams went GA in 2026 (Azure update AZ571816, Sept 18 2026), with no separate bot registration or manifest needed. — [mc.merill.net](https://mc.merill.net/message/AZ571816)
- Flexport says its MCP server works with Claude, ChatGPT and Microsoft 365 Copilot. — [Flexport MCP](https://www.flexport.com/technology/flexport-mcp/)

**Google**
- Google Cloud Marketplace lists partner agents validated for A2A and Gemini Enterprise. Buyers find them through Gemini-powered search and pay through their Google Cloud account. Admins register purchased agents into the Gemini Enterprise Agent Gallery, which has a request-and-approval gateway. — [Google Cloud blog](https://cloud.google.com/blog/topics/partners/google-cloud-ai-agent-marketplace); [Gemini Enterprise docs](https://docs.cloud.google.com/gemini/enterprise/docs/register-and-manage-marketplace-agents)
- Vendors must implement A2A with an Agent Card (JSON describing skills, auth and endpoints), create a listing in the Producer Portal, and submit it for review. — [GCP Marketplace partner docs](https://docs.cloud.google.com/marketplace/docs/partners/ai-agents)

**AWS**
- AWS Marketplace "AI agents and tools" listings are classified as an AI Agent or as a tool type (MCP server, knowledge base, guardrail). AgentCore integration is opt-in. An MCP server with two-legged OAuth needs only its endpoint; anything else needs an OpenAPI spec. — [AWS docs: SaaS AI agents](https://docs.aws.amazon.com/marketplace/latest/userguide/listing-saas-ai-agents.html); [AgentCore runtime](https://docs.aws.amazon.com/marketplace/latest/userguide/bedrock-agentcore-runtime.html)

**Salesforce**
- An AgentExchange listing requires the ISV Partner Program, a Partner Business Org, and a passed security review. Paid listings that don't use Checkout need a PADA signed with an account manager. — [Salesforce ISVforce guide](https://developer.salesforce.com/docs/platform/isvforce/guide/appexchange-listing-approvals.html)

**Perplexity**
- Perplexity supports remote MCP servers as custom connectors (Settings → Connectors → + Custom connector → Remote, OAuth or API key) on Pro and above. I found no public third-party directory in Perplexity, and these sources are secondary. Comet supports MCP for custom and local connectors. — [hjarni.com guide](https://hjarni.com/docs/connect-perplexity-mcp.md); [StackOne](https://www.stackone.com/platform/mcp/ai-agent/comet/)

**Public MCP registries**
- The official MCP Registry is a metadata feed, not a browsable directory. It sits under the Linux Foundation's Agentic AI Foundation (since Dec 9, 2025) and is still "preview" as of Aug 2026. — [TrueFoundry](https://www.truefoundry.com/blog/best-mcp-registries); [ThinkNEO](https://thinkneo.ai/blog/mcp-registries-compared-20260714)
- Server counts disagree widely between sources. Glama ranges from about 31.6k to 77k (77,220 as of Aug 24 2026 per one source). Smithery ranges from about 7k to 17k. PulseMCP ranges from about 11.8k to 16.8k. — [Unyly](https://unyly.org/mcp-directories); [Innvesti](https://www.innvesti.com/reports/best-mcp-server-directories-2026/); [automationswitch](https://automationswitch.com/ai-workflows/where-to-find-mcp-servers-2026)
- The MCP roadmap prioritizes Server Cards / .well-known discovery. — [Innvesti](https://innvesti.com/reports/mcp-server-cards-roadmap-discovery-tools-2026/)

### Inferences
- The best effort-to-reach ratio is one remote MCP server (Streamable HTTP, OAuth 2.1, tool annotations) submitted to both the ChatGPT Plugin Directory and the Claude Connectors Directory. The same endpoint also covers Perplexity custom connectors, Copilot (via MCP), Cursor and the open registries.
- The discovery feature that matters is automatic in-chat suggestion: ChatGPT's "proactive suggestions" and Claude's "Suggested Connectors." Users asking "what's the duty on X from Vietnam" can be shown the tool without searching for it. Clear, accurate tool descriptions are the main lever, since both platforms forbid manipulative ones.
- Microsoft, Google Cloud, AWS and Salesforce reach large companies through IT procurement. They only make sense later for an enterprise/broker tier.
- The registries (Smithery, Glama, PulseMCP, mcp.so, the official registry) are worth about an hour for credibility and backlinks. Expect few end users from them.

### Gaps
- I found no official current figure for Claude users, Copilot agent store usage, or Gemini consumer extensions/Gems distribution. I couldn't confirm whether consumer Gemini accepts third-party extensions. As far as I know, Gems can't be published to a public store.
- I couldn't fetch OpenAI's own July 2026 "plugins" announcement (403). The rename rests on third-party sources plus the live URL pattern.
- I didn't research GPT Store (custom GPT) status in 2026. Older GPT-Store tariff GPTs likely exist but were not verified.
- No install or usage metrics are public for any directory listing.

## Are tariff/HTS/duty tools already listed, and what traction do they have?

### Takeaway
Yes. A crowded field of small HTS/duty MCP servers already exists, and at least one free tariff plugin (Gateway Lines) is approved in the ChatGPT directory. Avalara and Flexport ship MCP servers for their own customers. I found nothing yet that offers ongoing monitoring of a user's imports with alerts, or audits for possible refunds. That is HTS Hero's differentiator. No competitor discloses traction.

### Cited Findings
- **Gateway Lines "US import duty and HTS codes"** is in the ChatGPT Plugins Directory (announced Aug 19 2026). It has three tools: `classify_hts` (candidate codes plus base rates), `landed_cost` (HTS code + origin + value → base duty, Section 301/232/AD/CVD trade actions, fees, total), and `policy_changes_since`. It's free with no sign-in, the endpoint is https://tariff.gatewaylines.com/mcp, and it also works in Claude as a custom connector. It refuses to price a plain-text description. The upsell is freight quotes and their web calculator. No traction numbers are disclosed. — [Gateway Lines](https://gatewaylines.com/news/gateway-tariff-calculator-chatgpt-plugin); [ChatGPT listing](https://chatgpt.com/plugins/plugin_asdk_app_6a754e3ed8b48191aa0e6761af6cd872)
- **Avalara Cross-Border MCP server** gives duty rates and compliance data from the Avalara Trade and Tariff Library, with lookups by HS code and date range. It requires OAuth 2.1 and an active Avalara subscription. — [Avalara developer](https://developer.avalara.com/mcp-servers/cross-border/); [Avalara blog, May 2026](https://www.avalara.com/blog/en/north-america/2026/05/avalara-mcp-servers.html)
- **Flexport MCP** acts inside a customer's account within existing permissions and works with Claude, ChatGPT and M365 Copilot. Freight booking from assistants reportedly started Sept 29 (secondary source). — [Flexport](https://www.flexport.com/technology/flexport-mcp/); [Wikifarmer](https://wikifarmer.com/library/en/article/ai-assistants-book-freight-mcp)
- **Zonos:** I found no MCP server. — (search negative)
- **tariff-resolver (opsloft)** is an MIT open-source MCP server (npm) covering HTS candidates, Chapter 99 (301/IEEPA), MPF/HMF, landed cost, and changes between HTS revisions. It excludes AD/CVD. — [GitHub](https://github.com/opsloft/tariff-resolver); [Socket](https://socket.dev/npm/package/tariff-resolver/overview/1.0.3)
- **US Tariff Lookup (ProfitPather)** is a remote MCP server with search, rate lookup and duty estimate. Rates come live from USITC and are cached for 12 hours. — [mcpservers.org](https://mcpservers.org/servers/tools-profitpather-com-duty)
- **TariffsTool** is a free landed-cost MCP server that stacks MFN plus 232/301/338 and adds import bans and refund estimates. — [mcpservers.org](https://mcpservers.org/servers/www-tariffstool-com-developers)
- **OpenKrill Tariff & HS Code Duty Finder** (UK + US, no key). Glama also lists "Customs Tariff Lookup (UK + US HTS)" and "TariffsChart", both marked "Not tested". — [mcpservers.org](https://mcpservers.org/servers/tools-openkrill-app-integrations-tariffs-claude); [Glama hs-tariff](https://glama.ai/mcp/connectors/io.github.pcp183/hs-tariff); [Glama TariffsChart](https://glama.ai/mcp/connectors/com.tariffschart/tariffschart)
- **USTariffRates** offers HTS lookup, duty rates, landed cost, alerts on watched HTS codes, a REST API and a hosted MCP server. It is the closest to HTS Hero's alert feature. — [ustariffrates.com llms.txt](https://ustariffrates.com/llms.txt)
- **Apify actors** offer pay-per-use HTS scrapers with MCP endpoints (several). — [Apify dami_studio](https://apify.com/dami_studio/hts-customs-duty-scraper/api/mcp); [Apify pink_comic](https://apify.com/pink_comic/us-tariff-hts-lookup/api/mcp)
- A search of the Anthropic connector registry this session for "tariff / customs / HTS / import duty / trade compliance" returned no tariff-specific connectors, only unrelated results. — (mcp-registry search, 2026-10-26)

### Inferences
- Simple duty lookup is close to a commodity in MCP-land, and Gateway already holds the free ChatGPT slot. HTS Hero has to stand out on accuracy (full Ch. 99 stacking, AD/CVD, renumbered codes), on the ongoing Tracker and alerts, and on audit/refund findings.
- The Claude directory appears to have no verified tariff connector, so there may be a first-mover opening there.

### Gaps
- None of the competitors publish installs, usage or revenue.
- I didn't check whether Gateway or the others are also in the Claude directory beyond the registry search above.
- I didn't verify any of their accuracy.

## Monetization: can you charge, require OAuth to tie usage to an account, and upsell to the web app?

### Takeaway
ChatGPT strictly bans selling digital goods or subscriptions in a plugin and bans promoting upgrades. Signing in to an existing paid account is allowed, so the model is a free calculator in-chat plus OAuth sign-in to unlock Tracker and audit features the user already pays for on the web. Claude expects OAuth for authenticated services and has no in-directory payment system. The enterprise marketplaces (AWS, Google Cloud, Salesforce) offer real billing, but behind heavy procurement and paperwork.

### Cited Findings
- ChatGPT bans "Selling digital products or services—including subscriptions, digital content, tokens, or credits." Users can sign in to an existing paid account, but plugins can't show plans, start subscriptions or promote upgrades. They may link to informational plan pages but not to checkout pages, and may say a feature needs a different plan. Parity rule: "must not provide a worse version through your plugin" than on your site. No ChatGPT-specific fees and no ads. Submissions must come from verified individuals or organizations. "Trial or demo plugins will not be accepted." Plugins must suit ages 13+. Auth flows must be transparent and permissions minimal. — [OpenAI submission guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines)
- Instant Checkout / Agentic Commerce Protocol is in beta for select marketplace partners selling physical goods, so it doesn't apply to SaaS. — [OpenAI guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines); [Fantasy playbook](https://fantasy.co/latest/the-apps-inside-chatgpt-playbook-how-brands-are-preparing-for-openai-app-sdk)
- Claude directory: OAuth 2.0 is required for authenticated services, a test account must be supplied, and the usage dashboard is available after listing. I found no payment mechanism. — [Claude submission docs](https://claude.com/docs/connectors/building/submission); [Claude directory docs](https://claude.com/docs/connectors/directory)
- Avalara's MCP server is gated on an active subscription via OAuth 2.1, a precedent for tying MCP access to a paid account. — [Avalara blog](https://www.avalara.com/blog/en/north-america/2026/05/avalara-mcp-servers.html)
- AWS Marketplace supports SaaS/API agent listings with Marketplace billing. Container listings that use AgentCore don't support Hourly or long-term-contract pricing. — [AWS docs](https://docs.aws.amazon.com/marketplace/latest/userguide/listing-saas-ai-agents.html); [AWS container docs](https://docs.aws.amazon.com/marketplace/latest/userguide/listing-container-ai-agents.html)
- Google Cloud Marketplace bills through the buyer's GCP account. — [Google Cloud blog](https://cloud.google.com/blog/topics/partners/google-cloud-ai-agent-marketplace)
- Salesforce paid listings go through Checkout or a PADA, plus a security review. — [Salesforce](https://developer.salesforce.com/docs/platform/isvforce/guide/appexchange-listing-approvals.html)

### Inferences
- ChatGPT is a top-of-funnel channel, not a paywall. The calculator (already free and unlimited per PRICING.md) should be fully usable without auth. Tracker and audit tools can require OAuth sign-in to an HTS Hero account. The plugin may say "this needs a Tracker plan" but can't show pricing CTAs, so the upgrade happens on the site. This fits the memory rule that calculator CTAs push free sign-up.
- The ChatGPT parity rule means in-chat duty results must be as good as the web calculator's.
- The "no trial/demo plugins" rule means the plugin has to deliver real value without sign-in. A sign-in-only shell would likely be rejected.
- Audit/refund tools must keep the "could save / may qualify" framing. Directory policies on regulated financial services aren't directly triggered, but the wording should stay conservative.

### Gaps
- I didn't find Claude's policy on upsell links inside tool responses. It appears not to be restricted, but this is unverified.
- I didn't research Microsoft Agent Store monetization (Partner Center / commercial marketplace terms).

## Effort and requirements for a solo founder with an existing Next.js app and API

### Takeaway
A remote MCP server added to the existing Next.js app (one route on Vercel), with three to five tools, OAuth for account features and tool annotations, takes days, not weeks. That one endpoint unlocks ChatGPT, Claude, Perplexity, Copilot-via-MCP, Cursor and every registry. A2A/Agentforce/AWS listings each add a protocol or partner program and are not worth it now.

### Cited Findings
- ChatGPT plugins are MCP servers. A listing needs org/individual verification, a privacy policy, support contact, example prompts and test instructions. — [OpenAI guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines); [VentureBeat](https://venturebeat.com/technology/openai-now-accepting-chatgpt-app-submissions-from-third-party-devs-launches)
- A Claude listing needs annotations, OAuth 2.0 if authenticated, a privacy policy and a test account. The latest MCP spec is 2026-07-28. — [Claude submission docs](https://claude.com/docs/connectors/building/submission); [Claude blog](https://claude.com/fr/blog/bringing-mcp-2026-07-28-to-claude)
- Gateway exposes the same MCP endpoint to ChatGPT and Claude, showing one server serves both. — [Gateway Lines](https://gatewaylines.com/news/gateway-tariff-calculator-chatgpt-plugin)
- An AWS Marketplace listing with an MCP server plus two-legged OAuth needs only the endpoint for AgentCore. — [AWS docs](https://docs.aws.amazon.com/marketplace/latest/userguide/listing-saas-ai-agents.html)
- Google Cloud Marketplace requires A2A plus an Agent Card plus the Producer Portal. — [GCP docs](https://docs.cloud.google.com/marketplace/docs/partners/ai-agents)
- Salesforce requires the ISV program, a Partner Business Org and a security review. — [Salesforce](https://developer.salesforce.com/docs/platform/isvforce/guide/appexchange-listing-approvals.html)
- Perplexity has user-added custom connectors (Pro+) with no listing step. — [hjarni.com](https://hjarni.com/docs/connect-perplexity-mcp.md)
- Interactive UI (MCP Apps) works in both Claude and ChatGPT, for example a duty breakdown card. — [Alpic](https://alpic.ai/blog/mcp-apps-goes-official-claude-chatgpt-support)
- API/tool hubs: my search found no tariff/HTS listings on RapidAPI, Zapier or Composio. I didn't verify their listing processes. — (search negative)

### Inferences
- Suggested order: (1) a remote MCP server in Next.js with `calculate_duty(hts, country, value)`, `search_hts`, `tariff_changes_since`, and auth-gated `list_my_imports_alerts` / `audit_summary`, all read-only annotated; (2) submit to Claude and ChatGPT; (3) publish to the official MCP Registry (needs .well-known/DNS proof), Smithery, Glama, PulseMCP and mcp.so; (4) optional MCP App UI card; (5) revisit Microsoft/AWS/Google/Salesforce only if an enterprise or broker tier appears.
- GEO angle: being the tool that's actually called means ChatGPT/Claude answers to duty questions show HTS Hero's numbers and branded links (for example, "full breakdown on htshero.com"). This is a direct user path separate from search citations. Tool output should include a canonical link to the code or country page on the site. That is allowed on ChatGPT as long as it's informational, not checkout.

### Gaps
- Review turnaround times for ChatGPT and Claude are not published in the sources found.
- I don't have conversion data from in-chat tool use to sign-ups for any comparable product.
