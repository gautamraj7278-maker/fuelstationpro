# Using the FuelFlow AI Agent

This guide explains how to integrate and use the FuelFlow AI Agent in your development workflow.

## Overview

The FuelFlow AI Agent is a specialized AI assistant built using the awesome-openclaw-agents framework. It has specific knowledge of the FuelStack project's architecture, including:

- React 19/TypeScript/Vite/Tailwind frontend
- Supabase backend with specific schema patterns
- Vercel serverless functions
- Custom validation system in `api/index.js`
- Project structure and conventions

## Setup

1. **Clone or copy the agent files** to your FuelFlow project:
   ```
   # From your FuelFlow project root:
   cp -r /path/to/ai-models/awesome-openclaw-agents/quickstart ./fuelflow-agent
   # Copy our custom SOUL.md
   cp fuelflow-agent/SOUL.md fuelflow-agent/
   ```

2. **Install dependencies**:
   ```bash
   cd fuelflow-agent
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `fuelflow-agent` directory:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   AGENT_NAME=FuelFlow Assistant
   MODEL=claude-sonnet-4-20250514
   ```

## Usage Methods

### 1. Interactive Chat Mode

Run the agent and interact with it directly:
```bash
cd fuelflow-agent
node bot.js
```

You can then ask questions like:
- "Review this fuel price update function for potential issues"
- "How should I modify the schema to add a new fuel type?"
- "Explain how the TXN_TABLES validation works in api/index.js"
- "Review this React component for fuel card management"

### 2. Code Review Integration

Use the agent during your development process:

1. Write your code changes
2. Before committing, share relevant code snippets with the agent
3. Get feedback on:
   - Potential bugs
   - Security issues
   - Validation gaps
   - Code quality improvements
   - Adherence to FuelFlow patterns

### 3. Schema Design Assistance

When making database changes:
1. Describe your desired data model to the agent
2. Get suggestions for table structure, relationships, and constraints
3. Receive guidance on how to integrate with existing validation systems
4. Get help creating migration scripts

### 4. Learning & Onboarding

New team members can:
- Ask about specific parts of the codebase
- Get explanations of complex systems (like the validation constants)
- Request walkthroughs of common development tasks
- Learn about project-specific patterns and conventions

## Example Interactions

### Code Review Request
```
User: I've created a new function to validate fuel mixer transactions. Can you review it?

[Pastes code]

FuelFlow Agent:
Code Review - utils/fuel-mixer-validation.js

Overall: B- (good foundation, needs validation improvements)

CRITICAL (1):
Line 22: Missing validation for minimum mixing ratios. Fuel mixtures outside operational ranges could damage equipment.
```javascript
// Add validation:
if (ratio < 0.1 || ratio > 10.0) {
  throw new Error(`Mix ratio ${ratio} outside safe operating range (0.1-10.0)`);
}
```

WARNING (1):
Line 15: Function doesn't reference the FUEL_MIX_RATIOS constant in validation.js.
Consider using the centralized constant for consistency.

GOOD:
- Clear error messages with context
- Proper error types for upstream handling
- Follows existing validation patterns
```

### Schema Design Help
```
User: I need to add a new table for tracking fuel deliveries from suppliers.

FuelFlow Agent:
Here's a suggested schema for fuel deliveries:

```sql
CREATE TABLE fuel_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
  quantity_litres DECIMAL(10,3) NOT NULL CHECK (quantity_litres > 0),
  unit_price DECIMAL(8,2) NOT NULL CHECK (unit_price >= 0),
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity_litres * unit_price) STORED,
  delivery_note_number VARCHAR(50),
  received_by UUID REFERENCES users(id) ON DELETE SET NULL,
  received_at TIMESTAMP WITH TIME ZONE,
  is_reconciled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_fuel_deliveries_product_date ON fuel_deliveries(product_id, delivery_date);
CREATE INDEX idx_fuel_deliveries_supplier_date ON fuel_deliveries(supplier_id, delivery_date);
```

This design follows FuelFlow patterns:
- Uses UUID primary keys
- Includes created_at/updated_at timestamps
- Has appropriate foreign key constraints
- Includes check constraints for data validity
- Provides useful indexes for common query patterns

You'll need to:
1. Add this migration to your Supabase migrations
2. Update the REFERENCE_MAP in api/index.js if needed for validation
3. Consider adding to any existing dashboard or reporting views
```

## Best Practices

1. **Context is Key**: Provide as much relevant context as possible when asking questions
2. **Share Code Snippets**: For reviews, paste the actual code you want reviewed
3. **Be Specific**: Ask focused questions rather than vague requests for "feedback"
4. **Iterate**: Use the agent's feedback to improve your work, then ask for review again
5. **Combine with graphify**: Use the graphify knowledge graph for broad exploration, then use the agent for specific advice

## Integration with Existing Tools

This agent complements the existing `graphify` tool in your workflow:

- Use `graphify query` to explore codebase structure and relationships
- Use the FuelFlow Agent to get development advice and code review on what you find
- Use `graphify update .` after making changes to keep the knowledge graph current
- Then consult the agent again if needed for further guidance

## Customization

To tailor the agent further for your needs:
1. Edit the `SOUL.md` file to adjust the agent's personality, focus areas, or guidelines
2. Add specific FuelFlow project knowledge to the "Example Interactions" section
3. Adjust the integrations section based on your team's actual tool usage

## Troubleshooting

- **"API key not valid"**: Check your ANTHROPIC_API_KEY in the .env file
- **Module not found errors**: Run `npm install` again to ensure dependencies are installed
- **Agent seems generic**: Make sure you're using the custom SOUL.md file from the fuelflow-agent directory
- **Slow responses**: Consider using a faster model or checking your internet connection to the API provider

## License

This agent is adapted from the awesome-openclaw-agents project, which is available under the MIT License.
