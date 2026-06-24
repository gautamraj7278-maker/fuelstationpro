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

## Files Created

1. `fuelflow-agent/SOUL.md` - The agent's identity, knowledge, and behavioral guidelines
2. `fuelflow-agent/package.json` - Dependencies and scripts
3. `fuelflow-agent/cli.js` - Command-line interface for interacting with the agent
4. `fuelflow-agent/README.md` - Documentation for the agent
5. `fuelflow-agent/DEMO.md` - This demonstration file
6. `AI-AGENT-USAGE-GUIDE.md` - Guide for integrating the agent into your workflow

## Integration with FuelFlow Workflow

To use this agent effectively in your FuelFlow development process:

1. **Keep it updated**: As you modify the FuelFlow codebase, update the agent's knowledge in `SOUL.md` if needed
2. **Use for code review**: Before submitting PRs, run your changes by the agent for feedback
3. **Leverage for learning**: New team members can ask the agent about FuelFlow-specific patterns
4. **Combine with graphify**: Use graphify for broad code exploration, then the agent for specific advice

## Next Steps

1. **Get an Anthropic API key** from console.anthropic.com
2. **Add it to your .env file** in the fuelflow-agent directory
3. **Run the agent**: `npm run start` in the fuelflow-agent directory
4. **Start asking questions** about FuelFlow development!

The agent is designed to be helpful, knowledgeable about FuelFlow specifics, and to provide actionable advice with code examples when appropriate.
