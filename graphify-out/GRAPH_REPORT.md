# Graph Report - FuelFlow  (2026-06-24)

## Corpus Check
- 99 files · ~54,761 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 512 nodes · 1053 edges · 28 communities (23 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c5058f74`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `handler()` - 36 edges
2. `fmtNum()` - 25 edges
3. `Card()` - 22 edges
4. `Badge()` - 20 edges
5. `apiGet()` - 18 edges
6. `fmtMoney()` - 18 edges
7. `fmtDate()` - 18 edges
8. `compilerOptions` - 18 edges
9. `compilerOptions` - 16 edges
10. `Loading()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `FuelFlow README` --references--> `RLS Baseline SQL`  [EXTRACTED]
  README.md → handoff/supabase/01_rls_baseline.sql
- `Index HTML` --calls--> `Main Entry Point`  [EXTRACTED]
  index.html → src/main.tsx
- `FuelFlow Handoff Pack` --references--> `Optional App Role Policies SQL`  [EXTRACTED]
  handoff/README.md → handoff/supabase/02_optional_app_role_policies.sql
- `Debug Session: login-failed-to-fetch` --references--> `Supabase Auth`  [INFERRED]
  debug-login-failed-to-fetch.md → README.md
- `FuelFlow Handoff Pack` --references--> `RLS Baseline SQL`  [EXTRACTED]
  handoff/README.md → handoff/supabase/01_rls_baseline.sql

## Import Cycles
- None detected.

## Communities (28 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (55): BarChart(), DonutChart(), LineChart(), CodeBlock(), ColumnDef, Props, ProductPrice, tables (+47 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (38): CalibrationUpload(), CreditSalesUpload(), DailySalesUpload(), DipReadingsUpload(), InventoryUpload(), PriceHistoryUpload(), TankDataUpload(), TankerUnloadingUpload() (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (33): dependencies, framer-motion, lucide-react, react, react-dom, react-router-dom, @supabase/supabase-js, tailwindcss (+25 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (75): authenticateRequest(), validateChart(), supabase, adjustBufferVolumeByProduct(), adjustTankCurrentVolumeForSalesDelta(), beforeDeleteCheck(), checkCrossReferences(), checkDuplicateFields() (+67 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (22): 1. Analyzed Available AI Resources, 2. Selected Optimal Solution, 3. Created FuelFlow-Specific AI Agent, 4. Created Integration Documentation, Agent Capabilities, 🔌 API Development Guidance, Benefits, 🔍 Code Review (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (20): Backend Notes, Canonical Tables, Current Status, Deployment Notes, Environment And Deployment Validation, Frontend, FuelFlow, Handoff Pack (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (5): Evidence Plan, Expected, Hypotheses (falsifiable), Status, Symptom

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (16): 1. Interactive Chat Mode, 2. Code Review Integration, 3. Schema Design Assistance, 4. Learning & Onboarding, Best Practices, Code Review Request, Customization, Example Interactions (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, allowJs, jsx, lib, module, moduleDetection, moduleResolution (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (4): Cost Guidance, FuelFlow Graphify Workflow, Recommended Commands, Rules

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (16): 1. Code Review & Quality Assurance, 2. Database Schema Assistance, 3. API Endpoint Development & Testing, 4. Component Development Guidance, 5. Documentation & Knowledge Sharing, Behavioral Guidelines, Core Architecture, Core Identity (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (19): Debug Session: login-failed-to-fetch, Vercel Serverless API, Contents, Current Architecture Assumption, Environment Templates, FuelFlow Handoff Pack, 1. Environment Readiness, 2. Supabase Readiness (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (10): dependencies, @anthropic-ai/sdk, dotenv, node-telegram-bot-api, description, main, name, scripts (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (10): Agent Capabilities, Customization, Direct Interaction, FuelFlow AI Agent, Integration with Development Workflow, Integration with graphify, License, Overview (+2 more)

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (7): Complementing Existing Tools, Files in the Agent Directory, FuelFlow Agent Demonstration, How It Would Work (With API Key), Integration with FuelFlow Workflow, Next Steps, What We've Built

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (6): Anthropic, bot, conversations, fs, soulMd, TelegramBot

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (4): Anthropic, conversations, fs, soulMd

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (6): Files Created, FuelFlow Agent Demonstration, How It Would Work (With API Key), Integration with FuelFlow Workflow, Next Steps, What We've Built

## Knowledge Gaps
- **221 isolated node(s):** `TXN_TABLES`, `REFERENCE_MAP`, `UNIQUE_FIELDS`, `FIELD_VALIDATIONS`, `CROSS_REFERENCE_TABLES` (+216 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Card()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `fmtNum()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `TXN_TABLES`, `REFERENCE_MAP`, `UNIQUE_FIELDS` to the rest of the system?**
  _221 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08297029702970297 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.053075396825396824 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05307017543859649 - nodes in this community are weakly interconnected._