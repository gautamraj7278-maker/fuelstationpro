# FuelFlow Agent Demonstration

This document demonstrates how the FuelFlow AI Assistant would work when integrated with an actual Anthropic API key.

## What We've Built

1. **Specialized Agent**: Created a FuelFlow-specific AI assistant using the awesome-openclaw-agents framework
2. **Domain Knowledge**: The agent has specific knowledge of:
   - FuelFlow's tech stack (React 19, TypeScript, Vite, Tailwind CSS)
   - Supabase database structure and relationships
   - Vercel serverless functions in `/api`
   - Custom validation system in `api/index.js`
   - Project organization and conventions
3. **CLI Interface**: Built a command-line interface for interacting with the agent
4. **Integration Ready**: Designed to work alongside the existing graphify knowledge graph

## How It Would Work (With API Key)

When you have a valid Anthropic API key in your `.env` file:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
AGENT_NAME=FuelFlow Assistant
MODEL=claude-sonnet-4-20250514
```

You could interact with the agent like this:

```
$ npm run start

FuelFlow Assistant CLI
Type 'exit' to quit

You: How do I add a new validation rule for stock movements?

Assistant: To add a new validation rule for stock movements in FuelFlow, you would typically modify the validation logic in `api/stock-validate.js` and potentially update the constants in `api/index.js`.

Looking at the existing validation patterns:

1. **For simple field validations**: Add to `FIELD_VALIDATIONS` in `api/index.js`
   ```javascript
   FIELD_VALIDATIONS: {
     // ... existing validations
     stock_movement_volume: (value) => {
       if (typeof value !== 'number' || isNaN(value)) {
         throw new Error('Volume must be a valid number');
       }
       if (value <= 0) {
         throw new Error('Volume must be greater than zero');
       }
       return true;
     }
   }
   ```

2. **For complex validations involving multiple fields**: Modify the validation function in `api/stock-validate.js`
   ```javascript
   async function validateStockMovement(data) {
     // Existing validations...
     
     // New validation: Ensure temperature is within valid range for fuel type
     if (data.temperature !== undefined && data.product_id) {
       const product = await getProductById(data.product_id);
       if (product.requires_refrigeration && data.temperature > 8) {
         throw new Error('Refrigerated fuel must be kept below 8°C');
       }
     }
     
     // ... rest of validation
   }
   ```

3. **Don't forget to**: 
   - Add unit tests for your new validation in `tests/`
   - Update any relevant documentation
   - Consider if this validation should be applied to other transaction types

Would you like me to look at the current stock validation code to give more specific guidance?
```

## Files in the Agent Directory

```
fuelflow-agent/
├── SOUL.md              # Agent's identity and knowledge
├── package.json         # Dependencies and scripts
├── cli.js              # Command-line interface
├── README.md           # Agent documentation
└── DEMO.md             # This demonstration file
```

## Integration with FuelFlow Workflow

To use this agent effectively in your FuelFlow development process:

1. **Code Reviews**: Before submitting pull requests, run your changes by the agent for feedback
2. **Design Assistance**: When planning new features, consult the agent for architectural guidance
3. **Learning Tool**: New team members can ask questions about the codebase and get contextual answers
4. **Debugging Help**: When stuck on an issue, describe the problem to get suggestions

## Complementing Existing Tools

This agent works alongside your existing `graphify` setup:

- Use `graphify query` to explore codebase structure and relationships
- Use the FuelFlow Agent to get development advice and code review on what you discover
- Use `graphify update .` after making changes to keep the knowledge graph current
- Consult the agent again if needed for further guidance

## Next Steps

1. Get an Anthropic API key from https://console.anthropic.com/
2. Add it to `.env` in the fuelflow-agent directory
3. Run `npm install` if you haven't already
4. Start using the agent with `npm run start`

The agent is ready to assist with your FuelFlow development tasks once you have a valid API key configured.
