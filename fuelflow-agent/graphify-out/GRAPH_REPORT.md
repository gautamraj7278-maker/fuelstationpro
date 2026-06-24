# Graph Report - fuelflow-agent  (2026-06-24)

## Corpus Check
- 7 files · ~2,189 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 75 nodes · 77 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4ae62a74`
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
- [[_COMMUNITY_Community 11|Community 11]]

## God Nodes (most connected - your core abstractions)
1. `FuelFlow Agent` - 15 edges
2. `FuelFlow AI Agent` - 8 edges
3. `FuelFlow Agent - AI Development Assistant` - 7 edges
4. `FuelFlow Agent Demonstration` - 6 edges
5. `Responsibilities` - 6 edges
6. `Usage` - 4 edges
7. `FuelFlow-Specific Knowledge` - 3 edges
8. `Behavioral Guidelines` - 3 edges
9. `scripts` - 2 edges
10. `Overview` - 2 edges

## Surprising Connections (you probably didn't know these)
- `FuelFlow Agent` --references--> `Supabase`  [EXTRACTED]
  DEMO.md → README.md
- `FuelFlow Agent` --references--> `Vercel`  [EXTRACTED]
  DEMO.md → README.md

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.29
Nodes (8): Anthropic API, api/index.js, awesome-openclaw-agents, FuelFlow Agent, api/stock-validate.js, Integration with graphify, Supabase, Vercel

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (10): dependencies, @anthropic-ai/sdk, dotenv, node-telegram-bot-api, description, main, name, scripts (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (11): Behavioral Guidelines, Core Architecture, Core Identity, Do:, Don't:, Example Interactions, FuelFlow Agent - AI Development Assistant, FuelFlow-Specific Knowledge (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (6): Anthropic, bot, conversations, fs, soulMd, TelegramBot

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (4): Anthropic, conversations, fs, soulMd

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (6): Files Created, FuelFlow Agent Demonstration, How It Would Work (With API Key), Integration with FuelFlow Workflow, Next Steps, What We've Built

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (6): 1. Code Review & Quality Assurance, 2. Database Schema Assistance, 3. API Endpoint Development & Testing, 4. Component Development Guidance, 5. Documentation & Knowledge Sharing, Responsibilities

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): Direct Interaction, Integration with Development Workflow, Usage

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (3): FuelFlow Agent Identity, Graphify Knowledge Graph, Validation Constants

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (6): Agent Capabilities, Customization, FuelFlow AI Agent, License, Overview, Setup

## Knowledge Gaps
- **47 isolated node(s):** `fs`, `TelegramBot`, `Anthropic`, `soulMd`, `bot` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FuelFlow Agent` connect `Community 0` to `Community 8`, `Community 11`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._
- **Why does `FuelFlow Agent - AI Development Assistant` connect `Community 2` to `Community 6`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **Why does `Responsibilities` connect `Community 6` to `Community 2`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **What connects `fs`, `TelegramBot`, `Anthropic` to the rest of the system?**
  _47 weakly-connected nodes found - possible documentation gaps or missing edges._