# Graph Report - fuelflow-agent  (2026-06-24)

## Corpus Check
- 7 files · ~2,189 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 63 nodes · 56 edges · 8 communities (7 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
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

## God Nodes (most connected - your core abstractions)
1. `FuelFlow AI Agent` - 8 edges
2. `FuelFlow Agent - AI Development Assistant` - 7 edges
3. `FuelFlow Agent Demonstration` - 6 edges
4. `Responsibilities` - 6 edges
5. `Usage` - 3 edges
6. `FuelFlow-Specific Knowledge` - 3 edges
7. `Behavioral Guidelines` - 3 edges
8. `scripts` - 2 edges
9. `fs` - 1 edges
10. `TelegramBot` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (8 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (10): dependencies, @anthropic-ai/sdk, dotenv, node-telegram-bot-api, description, main, name, scripts (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (10): Agent Capabilities, Customization, Direct Interaction, FuelFlow AI Agent, Integration with Development Workflow, Integration with graphify, License, Overview (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (10): Behavioral Guidelines, Core Architecture, Core Identity, Do:, Don't:, Example Interactions, FuelFlow Agent - AI Development Assistant, FuelFlow-Specific Knowledge (+2 more)

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

## Knowledge Gaps
- **45 isolated node(s):** `fs`, `TelegramBot`, `Anthropic`, `soulMd`, `bot` (+40 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FuelFlow Agent - AI Development Assistant` connect `Community 2` to `Community 6`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `Responsibilities` connect `Community 6` to `Community 2`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `fs`, `TelegramBot`, `Anthropic` to the rest of the system?**
  _45 weakly-connected nodes found - possible documentation gaps or missing edges._