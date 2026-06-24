# FuelFlow AI Agent

An AI agent specialized for the FuelFlow project, built using the awesome-openclaw-agents framework.

## Overview

This agent is designed to assist with FuelFlow development tasks including:
- Code review with focus on FuelFlow's validation architecture
- Database schema guidance for Supabase
- API development best practices
- Frontend component suggestions
- Debugging assistance

## Setup

1. Ensure you have Node.js v18+ installed
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your API keys:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   # Optional: for Telegram integration
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   AGENT_NAME=FuelFlow Agent
   MODEL=claude-sonnet-4-20250514
   ```

## Usage

### Direct Interaction

Run the agent directly:
```bash
node bot.js
```

Then interact with it through whatever interface you've configured (default is console-based interaction).

### Integration with Development Workflow

You can use this agent to:

1. **Review code changes**: Share code snippets or describe changes to get feedback
2. **Design database changes**: Get guidance on modifying the Supabase schema
3. **Understand validation logic**: Get explanations of the validation system in `api/index.js`
4. **Brainstorm features**: Get suggestions for implementing new FuelFlow features

## Agent Capabilities

This agent has been trained with specific knowledge of:
- FuelFlow's tech stack (React 19, TypeScript, Vite, Tailwind CSS, Supabase, Vercel)
- The validation architecture in `api/index.js` (TXN_TABLES, REFERENCE_MAP, UNIQUE_FIELDS, FIELD_VALIDATIONS, CROSS_REFERENCE_TABLES)
- Supabase database structure from the handoff files
- Common FuelFlow development patterns

## Customization

To customize the agent for specific tasks, modify the `SOUL.md` file. This file contains the agent's identity, personality, responsibilities, and behavioral guidelines.

## Integration with graphify

This agent is designed to work alongside the existing graphify knowledge graph in the FuelFlow project. Use graphql for broad codebase exploration, then consult this agent for specific development advice and code review.

## License

MIT
