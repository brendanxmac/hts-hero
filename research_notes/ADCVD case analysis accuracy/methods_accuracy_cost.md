# Methods for the Highest Accuracy at the Lowest Cost in an AD/CVD Case-Analysis Pipeline

Scope: technical methods for (1) a case registry with correct status, (2) in-scope / also-may-enter / excluded HTS-10 codes mapped to the current HTS, (3) matching imports to cases with explanations. Stack: TypeScript/Next.js on Vercel, Supabase Postgres, Claude API. Researched 2026-10-26. Seventeen sources fetched or searched; where a primary paper could not be read in full, these notes say so.

## Extraction from legal/government text: deterministic vs LLM structured extraction, voting, citation grounding, reconciliation

### Takeaway
Published LLM accuracy on regulatory and legal extraction varies widely, from about 50% to the high 90s, depending on the field. Hallucination is the main failure, and "document identification" fields are the weakest. The recipe that holds up best combines four parts: deterministic parsing wherever the text is regular (HTS code lists, dates, case numbers); schema-constrained LLM extraction for prose; a check that each extracted value appears verbatim in the source; and a second pass or vote only on fields that disagree or fail the check.

### Cited Findings
- RegExtract (ICML 2026) is a PFAS regulatory-extraction benchmark with 976 human annotations from 20 US state documents and 46 regulations. Each annotation pairs a value with a source span. The authors report that document-identification fields were the main weakness of current LLMs and that field-specific few-shot examples helped. — [RegExtract, ICML 2026](https://icml.cc/virtual/2026/80598)
- An FDA antibiotic-review extraction study (medRxiv preprint, Dec 2025, not peer reviewed) found these accuracies: Gemini 2.5 Pro 66.7%, GPT-4o 51.9%, DeepSeek R1 37.0%. Hallucination was the most common error. General prompts beat detailed prompts, 59.3% vs 44.4%. — [medRxiv 2025.12.22.25342875](https://www.medrxiv.org/content/10.64898/2025.12.22.25342875v1)
- In an industry study of health-authority guidance documents, about 77% of answers were judged accurate or close enough. The authors concluded that accuracy alone was not enough. — [DIA Global Forum](https://globalforum.diaglobal.org/?p=22184)
- On CUAD contract-clause extraction, Claude 3.5 Sonnet (zero-shot, with output examples and reduced context) reached recall 0.77 and precision 0.66. Reducing context raised recall but lowered precision. — [UFPE study](https://repositorio.ufpe.br/handle/123456789/58332?mode=full)
- A metadata-extraction paper reported 0.80 F1 on CUAD with an 8k context and reranking, against a 0.75 baseline and an oracle ceiling of 0.94. — [Moonlight review of "Metadata Extraction Leveraging LLMs"](https://www.themoonlight.io/review/metadata-extraction-leveraging-large-language-models) (secondary summary)
- Self-consistency in product-attribute extraction: taking the most frequent answer across repeated runs cut errors from 0.5% to 0.2%, removed hallucinations on the test set, and raised specificity from 99.1% to 100%. The authors suggest sending low-agreement extractions to a human. — [AIMS ACI 2026](https://www.aimspress.com/article/doi/10.3934/aci.2026010)
- In a clinical study (SDOH event extraction with reasoning LLMs), a 3-run majority vote reduced variability and improved F1. The size of the gain was not given in the excerpt. — [arXiv 2604.13502](https://arxiv.org/pdf/2604.13502)
- Voting has limits. It works on single discrete values. For sets of spans, each field has to be aligned across runs before voting. — [arXiv 2609.07134](https://arxiv.org/pdf/2609.07134). The choice of prompt, model and schema is a separate source of variation that sampling-based voting does not remove. — [arXiv 2606.05970](https://arxiv.org/pdf/2606.05970)
- A multi-agent document-processing pipeline runs several LLM backends in parallel. Values they agree on get higher confidence, and disagreements are flagged automatically for human review. — [MADP, arXiv 2605.17159](https://arxiv.org/pdf/2605.17159)
- Claude structured outputs (`output_config.format` with `type: "json_schema"`, or `strict: true` on tools) use constrained decoding. The output is always valid JSON matching the schema, required fields and types are guaranteed, and no retries are needed for schema violations. It is GA on Haiku 4.5/5.5, Sonnet 4.5/4.6/5/5.5, Opus 4.5 to 5.5, and Fable/Mythos. — [Claude docs: Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- Structured-output limits:
  - Not supported: numeric min/max, string length limits, `minItems`/`maxItems` beyond 0 or 1, and recursive schemas.
  - Per-request caps: 20 strict tools, 24 optional parameters, and 16 union-type parameters.
  - Enum casing is not guaranteed, so compare case-insensitively.
  - A refusal (`stop_reason: "refusal"`) can break the schema. Asking for step-by-step reasoning inside a schema field can trigger a `reasoning_extraction` refusal, so ask for a short explanation instead.
  - Compiled grammars are cached for 24 hours. Changing the format invalidates the prompt cache.

  — [Claude docs: Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- The Claude Citations feature returns `char_location`, `page_location` or `content_block_location` pointers. Citations are guaranteed to be valid pointers into the provided documents. `cited_text` does not count as output tokens, or as input tokens when passed back. **Citations cannot be combined with structured outputs**: enabling both returns a 400. — [Claude docs: Citations](https://platform.claude.com/docs/en/build-with-claude/citations)

### Inferences
- Because Citations and structured outputs cannot be combined, citation grounding needs a workaround. The likely best approach is a `quote` field next to each value in the JSON schema (for example the excluded-HTS clause or the scope sentence), checked deterministically: normalise whitespace, then find the quote verbatim in the cached raw text and store its character offsets. A failed check means a hallucinated or paraphrased quote, so the field is re-run or flagged. This gives most of the benefit of RegExtract-style value plus span labels, with no second API call.
- The HTS code lists in AD/CVD scope language are highly regular. Text like "currently classifiable under subheadings 7306.19.1010, ..." is better pulled with regex than with an LLM. Use the LLM to label each code's role (in-scope, also-may-enter, excluded, "for convenience only"). Then require two-way agreement: every regex code must get an LLM role, and every LLM code must appear in the regex set.
- Run a vote (k=3 on Haiku, or a Sonnet/Opus second opinion) only where it is needed: when the regex and LLM sets disagree, when a quote check fails, or when a status-changing event is being extracted. Voting on everything costs about 3x and the evidence says the gains are small on fields that are already easy.
- Cross-source conflict rules should run in a fixed order. For example: ITA Federal Register notice text over the CBP ADCVD message, over the ITA scope listing, over third-party sources, with the newest dated document winning within a tier. Every conflict should be recorded rather than silently resolved. This matches the existing project rule that HTS notes win over the proclamation text, with the conflict always flagged.

### Gaps
- No published benchmark covers LLM extraction from AD/CVD Federal Register notices specifically. Accuracy has to be measured on our own golden set.
- No head-to-head study was found comparing self-consistency with single-pass extraction on standard document-extraction datasets.
- The full RegExtract and medRxiv numbers per field and per model were seen only in abstracts.

## Model and cost choices on Anthropic (late 2026)

### Takeaway
Haiku 5.5 costs $0.10 / $0.50 per MTok, or $0.05 / $0.25 in batch, for prompts up to 100k tokens. At that price, bulk first-pass extraction over every AD/CVD notice costs very little. Sonnet 5.5 ($2 / $10) and Opus 5.5 ($4 / $20) should be kept for escalation and adjudication. Batch (50% off) stacks with prompt caching, so reprocessing the whole corpus costs a few dollars.

### Cited Findings
- List prices per MTok (input / output), from [Claude docs: Pricing](https://platform.claude.com/docs/en/about-claude/pricing):
  - Opus 5.5: $4 / $20. Cache read $0.20, which is 0.05x input.
  - Sonnet 5.5: $2 / $10. Cache read $0.10, which is 0.05x input.
  - Sonnet 5: $2 / $10. This was introductory pricing and is now standard; the planned rise to $3 / $15 was cancelled.
  - Haiku 5.5 (prompts up to 100k tokens): $0.10 / $0.50. Cache read $0.01.
  - Haiku 5.5 (prompts over 100k tokens): $0.50 / $2.50.
  - Haiku 4.5: $1 / $5.
  - Fable 5.1: $10 / $50.
- Cache multipliers: a 5-minute cache write costs 1.25x input and a 1-hour write costs 2x. Reads cost 0.1x input on most models, 0.05x on Opus 5.5 and Sonnet 5.5, and 0.025x on Fable 5.1. These multipliers stack with the Batch discount and data residency. — [Claude docs: Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Batch API prices per MTok (input / output): Haiku 5.5 $0.05 / $0.25 (up to 100k prompts), Sonnet 5.5 $1 / $5, Opus 5.5 $2 / $10. — [Claude docs: Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Haiku 5.5 is priced per request by prompt length, cache reads and writes included. Any request whose prompt is over 100k tokens pays the higher rate. Claude 4.6 and later models, except Haiku 5.5, get the 1M context window at standard pricing. — [Claude docs: Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Claude 4.7 and later use a newer tokenizer that produces about 30% more tokens for the same text. — [Claude docs: Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- `inference_geo: "us"` applies a 1.1x multiplier. Fast mode on Opus 5.5 costs $8 / $40 and is not available in Batch. — [Claude docs: Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Batch API limits:
  - A batch holds at most 100,000 requests or 256 MB.
  - Most batches finish within 1 hour. Batches expire after 24 hours, and expired requests are not billed.
  - Results are available for 29 days.
  - `max_tokens: 0` cache pre-warming is not allowed in a batch.
  - The docs recommend the 1-hour cache for batches that share context.

  — [Claude docs: Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)

### Inferences
- **Worked cost example.** These figures are my own arithmetic from the prices above, not published numbers. Take about 15k notices at about 8k tokens each, so about 120M input tokens, plus about 1k output tokens each, so about 15M output. One full Haiku 5.5 batch pass then costs about 120 × $0.05 + 15 × $0.25 ≈ $9.75. The same pass on Sonnet 5.5 batch costs about $195, and on Opus 5.5 batch about $390. Add roughly 30% for the newer tokenizer if the 8k figure was measured with an older tokenizer.
- **Routing rule.** Use Haiku 5.5 for the first pass on everything. Escalate to Sonnet 5.5 (or Opus 5.5 for scope adjudication) when any of these happens:
  - the quote check fails;
  - the regex and LLM code sets disagree;
  - the extraction changes a case's status;
  - the notice is a scope ruling, a changed-circumstances notice, or a court remand.

  If about 10 to 20% escalates, the blended cost stays near Haiku cost while the hard cases get frontier-model accuracy.
- Keep each Haiku prompt under 100k tokens. For very long notices (some final determinations run long), chunk them or route to Sonnet; otherwise the 5x Haiku long-prompt price applies.
- Put the large stable prefix first and cache it: system prompt, schema description, HTS chapter context, few-shot examples. With Batch, use the 1-hour cache.

### Gaps
- No public, task-specific accuracy comparison of Haiku 5.5, Sonnet 5.5 and Opus 5.5 on legal extraction was found. Measure it on the golden set before fixing the routing thresholds.

## HTS code mapping over revisions: change records, concordances, lineage graph, never-existed codes

### Takeaway
No single official source gives a full HTS-10 lineage. Each USITC revision publishes a change record that is not cumulative. Census publishes yearly import concordance and "new-obsolete" files. Pierce and Schott's academic method, which links codes into time-invariant "families", has public files only up to 2007. Build a lineage graph from per-revision diffs of the USITC JSON exports, cross-checked against Census concordances. Treat never-existed codes as a separate fuzzy-matching problem whose candidates are limited to valid codes.

### Cited Findings
- Pierce and Schott's algorithm links revised ten-digit HS codes to synthetic, time-invariant identifiers for "families" of related products. Between 1989 and 2004, 7,503 of the 16,836 import codes active in 2004 were revised; those codes carried 59% of 2004 import value and 43% of export value. — [Pierce & Schott, FEDS 2012-16](https://www.federalreserve.gov/econres/feds/concording-us-harmonized-system-categories-over-time.htm)
- Code changes come from three places: WCO six-digit revisions, US legislation that changes eight-digit import codes, and the 484(f) Committee's changes to ten-digit statistical codes. Census publishes yearly "new-obsolete" files of retired codes and their replacements. Export changes take effect in January, but import changes can happen during the year. — [Pierce & Schott, NBER w14837](https://www.nber.org/papers/w14837.pdf) (via search summary; the PDF text could not be extracted)
- Schott's site lists an HS-over-time concordance for 1989 to 2007 (hs_concordance_20101020.zip), a file of HS codes used by year, and HS-to-SIC/SITC/NAICS concordances for 1989 to 2017 (v2018.10.15). The site was last updated 2018-10-15. — [Schott, International Trade Data](https://faculty.som.yale.edu/peterschott/international-trade-data/)
- The Census Foreign Trade reference page lists concordance files by year and was last revised 2026-02-23. The Census import history layouts include a CONCORD.TXT file with 10-digit HTS codes and descriptions. — [Census reference codes](https://www.census.gov/foreign-trade/reference/codes/index.html); [Census IMHDB layout](https://www.census.gov/foreign-trade/reference/products/layouts/imhdb.html)
- USITC publishes every HTS revision in HTML, CSV, XLS and JSON. The 2026 Revision 11 was released 2026-07-01. — [USITC HTS archive](https://www.usitc.gov/harmonized_tariff_information/hts/archive/list)
- Each revision's change record lists only that revision's changes and is not cumulative. In the change record, "added" and "deleted" refer to 8-digit legal lines or legal notes, not to statistical suffixes. — [Federal Register 2003-02-07](https://www.govinfo.gov/content/pkg/FR-2003-02-07/pdf/03-3056.pdf); [archived Change Record](https://webharvest.gov/congress115th/20190109092145/https://hts.usitc.gov/view/Change%20Record)
- No official REST API for change records was found. A third-party Apify actor offers revision diffs, but it is unofficial. — [Apify actor](https://apify.com/aether_studio/usitc-hts-revision-diff-monitor.md)
- Unconstrained LLMs often produce codes that do not exist or that break the hierarchy. HSGraphAgent (ACL 2026) limits outputs to valid codes using a knowledge graph. — [HSGraphAgent, ACL 2026](https://preview.aclanthology.org/ingest-acl/2026.acl-long.2072/). Trie-constrained decoding is another way to keep outputs valid. — [arXiv 2608.04464](https://arxiv.org/pdf/2608.04464)
- **HTS classification is hard even for fine-tuned LLMs.** On the ATLAS benchmark, built from CBP CROSS rulings, a fine-tuned LLaMA-3.3-70B got 40% of 10-digit codes and 57.5% of 6-digit codes fully correct. — [ATLAS, NeurIPS 2025](https://neurips.cc/virtual/2025/129845)

### Inferences
- **Lineage graph design.**
  - Nodes are (code, first revision, last revision).
  - Edges are typed: `renumber` (1:1), `split` (1:n), `merge` (n:1), or `reshuffle` (n:m).
  - Edges come from diffing consecutive USITC JSON exports, and each edge carries evidence: the change-record text, a description-similarity score, and a Census concordance hit.
  - Following Pierce and Schott, take the connected components of the graph as "families". An order code then maps to every current descendant in its family, with an edge-confidence label rather than a single forced answer.
- **Labelling each current code.** Label a current code "in scope" only when the lineage is 1:1 or the split was description-preserving. When a code split into several descendants, mark the descendants "possible" until the scope text or CBP messages say otherwise.
- **Never-existed codes (typos in orders).**
  1. Check whether the code ever existed in any revision, using the full code-history table.
  2. If not, generate candidates from valid codes within edit distance 1 or 2. Also cover transposed digits and dropped or added statistical suffixes, keeping the same 6- or 8-digit prefix.
  3. Rank the candidates by how well their description matches the order's product description (BM25 or embeddings), with an LLM tie-break that may choose only among the candidates.
  4. Always show the result as "order cites X (does not exist); likely intended Y".

  Constraining the candidates this way prevents the fabricated codes reported in the HS literature.

### Gaps
- The Pierce and Schott paper text could not be extracted (compressed PDF), so the exact rules of the algorithm are not recorded here. It is said to use Census concordances and the families described above.
- No maintained public HS-10 concordance after 2017 was found.
- The WCO HS correlation tables were not fetched in this session.
- No official HTS change-record API exists, as far as the search showed.

## Product-description matching to scope text: hybrid retrieval, rerank, abstention, calibration

### Takeaway
Hybrid retrieval with BM25, embeddings and a reranker cuts retrieval misses by about two-thirds compared with embeddings alone. LLM matchers reach 90 to 99% F1 on entity-matching benchmarks. However, LLM self-reported confidence is poorly calibrated and models rarely abstain on their own. Abstention therefore has to be engineered: thresholds on agreement or evidence, tuned on labelled data.

### Cited Findings
- Anthropic's Contextual Retrieval results, measured as the top-20 retrieval failure rate (baseline 5.7%), from [Anthropic: Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval):

  | Method | Failure rate | Reduction |
  |---|---|---|
  | Contextual embeddings | 3.7% | 35% |
  | + contextual BM25 | 2.9% | 49% |
  | + reranking (top 150 → top 20) | 1.9% | 67% |

- The same post puts the one-time cost of contextualising chunks at about $1.02 per million document tokens. It also advises that a knowledge base under 200k tokens can skip RAG and go entirely into a cached prompt. — [Anthropic: Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- GPT-4 with no task-specific training beat fully fine-tuned PLM matchers on 3 of 4 e-commerce entity-matching datasets and was more robust to unseen entities. — [Peeters, Steiner, Bizer, arXiv 2310.11244](https://arxiv.org/html/2310.11244v4)
- OpenSanctions Pairs (755,540 labelled pairs): off-the-shelf LLMs reached up to 98.95% F1 (GPT-4o), against 91.33% for the production rule-based system. — [arXiv 2603.11051](https://arxiv.org/pdf/2603.11051)
- One paper reports Abt-Buy precision 0.999 and recall 0.902 for a zero-shot LLM, against 0.994 and 0.910 for a Jaccard baseline. The search tool flagged this source as unverified. — [arXiv 2608.18158](https://arxiv.org/pdf/2608.18158)
- **Verbalized confidence is unreliable.**
  - Verbalized confidence is systematically overconfident, extremely so in RL-trained reasoning models. — [Challenge of Confidence Calibration in Reasoning LLMs](https://www.alphaxiv.org/overview/2604.19444)
  - Verbal confidence predicts whether a model commits to an answer better than whether the answer is correct. — [arXiv 2606.29490](https://arxiv.org/abs/2606.29490)
  - Models almost never abstain, even when abstaining is optimal. — [Are LLM Decisions Faithful to Verbal Confidence?](https://arxiv.org/html/2601.07767)
  - Verbal and calibrated confidence correlate only moderately (r = 0.32 to 0.43). — [arXiv 2603.22161](https://arxiv.org/pdf/2603.22161)
- In product-attribute extraction, routing low-consistency extractions to a human removed hallucinations from the test set. — [AIMS ACI 2026](https://www.aimspress.com/article/doi/10.3934/aci.2026010)

### Inferences
- **The scope corpus is small.** About 700 active orders at perhaps 300 to 1,500 tokens of scope text each gives roughly 0.5M to 1M tokens in total, so it is close to the 200k "skip RAG" line once the corpus is narrowed. In practice, candidate generation should be deterministic: HTS lineage plus country. That leaves only a handful of candidate cases per import, so an LLM can read every candidate's full scope text directly, with no vector retrieval at all. Hybrid retrieval is only needed for imports without an HTS match, for example when searching on a description alone.
- **Match tiers.**

  | Tier | Rule |
  |---|---|
  | likely | Current HTS is in the lineage-mapped in-scope set, and country matches, and the description is not contradicted by an exclusion |
  | possible | Code is on the also-may-enter list or descended from a split, or the description matches scope text without an HTS hit |
  | dropped | Explicit exclusion quote matched |

  Every tier carries the quoted scope or exclusion text as its explanation.
- **Calibration.** Do not use the model's stated confidence. Build confidence from observable signals: HTS-match type, country match, agreement across k samples or two models, and whether the quote check passed. Tune the thresholds on the golden set for a target precision; for alerts, precision of at least 95% on "likely" is a sensible target. An event that is borderline should show as "possible" rather than raise an alert.
- **Expected accuracy.** On the HTS-plus-country path, precision should be very high because it is deterministic. Description-only matching should be expected to be noticeably weaker; by analogy with ATLAS (40% at 10 digits), product-level classification remains hard. Description-only matches should therefore never produce "likely" on their own.

### Gaps
- No published precision/recall exists for matching products to AD/CVD scope text. The same goes for "also-may-enter" disambiguation. Both have to be measured on our own data.

## Status as a state machine with event sourcing

### Takeaway
No academic source on AD/CVD status modelling was found. The well-established approach is general data engineering: keep an append-only, immutable log of source documents and dated legal events (bronze/silver), and recompute status as a pure function, a fold over the events (gold). This makes status reproducible, auditable, and automatically recomputed when parsers change.

### Cited Findings
- In the medallion architecture, bronze holds raw source data with load metadata, used as an archive for lineage and audit. Silver holds the cleaned and conformed entities. Gold holds read-optimised business outputs with the final rules applied. The point of it is that you "can recreate your tables from raw data at any time." — [Databricks: Medallion architecture](https://www.databricks.com/glossary/medallion-architecture)
- ITA publishes a dataset, "Products Subject to Antidumping and Countervailing Duty Orders", whose mirrors show different "updated" dates. Its scope listings are updated quarterly. — [data.commerce.gov](https://data.commerce.gov/node/141401); [ITA scope information](https://legacy.trade.gov/enforcement/operations/scope/index.asp)
- CBP maintains a public database of many, but not all, AD/CVD instructions. ITA keeps a listing of the orders currently in effect. — [USITC FAQ](https://www.usitc.gov/faq/question/are_adcvd_duties_hts.htm)

### Inferences
- **Event types**, each tied to a dated source document and a quote:
  - `petition`, `initiation`
  - `prelim_affirmative` / `prelim_negative`
  - `final_affirmative` / `final_negative` (ITA)
  - `itc_final_affirmative` / `itc_final_negative`
  - `order_published`
  - `suspension_agreement`, `suspension_terminated`
  - `amended_order`, `scope_ruling`, `changed_circumstances`
  - `sunset_initiated`, `sunset_continued`, `sunset_revoked`, `revocation` (with an effective date, which may be retroactive)
  - `court_remand`, `court_final`
  - `ministerial_correction`
- **State transitions.** Status is a pure function `fold(events ordered by effective_date, then publication_date)`. The states are: `investigation` → `prelim` → `final` → `order` / `terminated_negative`, with `suspended`, `revoked` and `partially_revoked` (by product, company or code) as further states.
- **Rejecting impossible sequences.** Unit-test the transition table and reject impossible sequences such as `order` before `itc_final_affirmative`. A rejected sequence is a signal that an event was missed, so it should go to an admin queue.
- **Two dates per event.** Store both the effective date and the publication date. Revocations and court outcomes are often published after they take effect, and recomputing status "as of" any date needs both.
- **Daily reconciliation.** Compare the count of `order` status by country with ITA's current-orders listing every day. Any difference opens an admin item, which fits the existing /admin "Needs You" queue.

### Gaps
- No machine-readable official event feed for AD/CVD lifecycle events was found, and the current URL and format of ITA's "Listing of AD/CVD Orders" were not confirmed.
- federalregister.gov API docs redirected to a bot "unblock" page from this environment. This matches the project's own experience: commit 40eb0118 moved notice text to GovInfo because the Federal Register blocks requests. Rate limits could not be confirmed.

## Evaluation and monitoring

### Takeaway
Accuracy is only known when it is measured. That requires a golden set with source spans, labelled and adjudicated per field, a regression run on every parser, prompt or model change, and daily drift checks against authoritative counts. The benchmarks above use a value-plus-span label format (RegExtract) and measure precision and recall per field, and that is the template to copy.

### Cited Findings
- RegExtract labels each field with both a value and a source span and reports results per field type. Document-identification fields were the hardest. — [RegExtract](https://icml.cc/virtual/2026/80598)
- Prompt detail can hurt: general prompts beat detailed ones, 59.3% vs 44.4%. Prompt changes therefore need regression tests, not intuition. — [medRxiv preprint](https://www.medrxiv.org/content/10.64898/2025.12.22.25342875v1)
- Results for LLM structured extraction are sensitive to prompt, model and schema choices. — [arXiv 2606.05970](https://arxiv.org/pdf/2606.05970)
- Benchmark labels can themselves be wrong. An audit of HSCodeComp found that a non-trivial share of expert labels deviated from the HS General Rules. — [arXiv 2605.14857](https://arxiv.org/pdf/2605.14857)
- Anthropic's retrieval guidance recommends running evals and tuning chunking and prompts against them. — [Anthropic: Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)

### Inferences
- **Golden set.**
  - Size: about 150 to 300 cases, stratified by product family, country, era (pre- and post-HS 2022) and event type, plus all known renumbered or never-existed scope codes.
  - Labels: for each case, status, the in-scope / also-may-enter / excluded code sets with quotes, and the lineage-mapped current codes.
  - Process: two annotators, a broker or the founder plus an Opus 5.5 pass, then human adjudication.
  - Agreement: track it per field with Cohen's kappa. Since the HSCodeComp audit shows experts disagree, an adjudication log is needed.
- **Metrics.**
  - Code sets: set-level precision and recall per role.
  - Status: exact match.
  - Matching: precision at the "likely" tier.
  - Release gate: block any change that lowers a metric beyond a tolerance. This extends the existing "rate parser regression checks" practice (golden set over every HTS export plus an old-vs-new sweep) to AD/CVD.
- **Shadow mode and canary.** Run a new parser or prompt alongside the current one in production on all documents, writing to a shadow derived table. Diff the outputs, and review a sample of the diffs before promoting. Comparing dev data with prod data then becomes a SQL diff of the derived tables at the same raw-layer snapshot.

### Gaps
- No published inter-annotator agreement figures for trade-remedy scope labelling were found.

## Operational design: idempotent incremental pipelines, polite scraping, content-addressed raw cache, layered re-derivation

### Takeaway
Keep raw documents immutable and content-addressed in the bronze layer, with parsed output (silver) and derived output (gold) as recomputable layers keyed by parser version. Then a parser fix only needs a version bump: production re-derives from its own raw store with no dev→prod copy, and LLM results are cached by (document hash, prompt version, model), so unchanged inputs cost nothing to reprocess.

### Cited Findings
- Bronze keeps the untouched source copy, which lets teams rebuild downstream tables without re-extracting from the source. — [Databricks](https://www.databricks.com/glossary/medallion-architecture)
- Batch results are kept for only 29 days. Expired batch requests are not billed. The 1-hour cache is recommended for shared context in batches. — [Claude docs: Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
- Compiled structured-output grammars are cached for 24 hours. Changing the schema invalidates both the grammar and the prompt cache. — [Claude docs: Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- federalregister.gov served a bot-block redirect (unblock.federalregister.gov) to automated fetches during this research. — observed directly; see the project's GovInfo switch in commit 40eb0118.

### Inferences
- **Tables.**

  | Table | Contents |
  |---|---|
  | `raw_documents` | sha256, source_url, fetched_at, bytes in Supabase Storage, http metadata |
  | `extractions` | doc_sha, extractor_name, extractor_version, model, prompt_hash, output_json, quote_check results |
  | `events` | Derived from extractions |
  | `case_status`, `case_codes_current` | Materialised from events plus the HTS lineage graph |

- **Idempotency.** Every stage writes with an upsert keyed on its inputs: (doc_sha, extractor_version, model, prompt_hash). A cron that runs twice does nothing the second time.
- **Re-derivation without copying.** When `extractor_version` or the prompt hash changes, a backfill job reprocesses only the rows whose key is missing. Production does this itself from its own raw store. LLM outputs must be stored permanently in `extractions`, because Batch results expire after 29 days. This removes the need for dev→prod data copies.
- **Polite fetching.**
  - Use GovInfo for Federal Register text, as the project already does, since federalregister.gov blocks bots.
  - Use conditional GETs (ETag / If-Modified-Since) and per-host concurrency of 1 to 2.
  - Back off on 429 and 403 responses, and remember block states, as the cron already does.
- **Vercel and Batch.** Submit batches from a cron, poll in a later cron run, and finish the work in the deadline-respecting style the AD/CVD cron already uses. Do not hold a serverless function open for the whole batch.

### Gaps
- Specific GovInfo API rate limits were not checked in this session.
- No published case study of a medallion or event-sourced pipeline for trade-remedy data was found.
