require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const soulMd = fs.readFileSync("./SOUL.md", "utf-8");

const conversations = new Map();

async function getResponse(message, userId = "cli-user") {
  // Get or create conversation history for this user
  if (!conversations.has(userId)) {
    conversations.set(userId, []);
  }
  const history = conversations.get(userId);
  
  // Add user message to history
  history.push({ role: "user", content: message });
  
  // Keep last 20 messages to stay within context limits
  if (history.length > 20) {
    history.splice(0, history.length - 20);
  }
  
  try {
    const response = await anthropic.messages.create({
      model: process.env.MODEL || "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: soulMd,
      messages: history,
    });
    
    const reply = response.content[0].text;
    history.push({ role: "assistant", content: reply });
    return reply;
  } catch (err) {
    console.error("Error:", err.message);
    return `Sorry, I encountered an error: ${err.message}`;
  }
}

// Simple CLI interface
if (require.main === module) {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  console.log("FuelFlow Assistant CLI");
  console.log("Type 'exit' to quit\n");
  
  function askQuestion() {
    readline.question("You: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("Goodbye!");
        readline.close();
        return;
      }
      
      const response = await getResponse(input);
      console.log(`\nAssistant: ${response}\n`);
      askQuestion();
    });
  }
  
  askQuestion();
}

// Export for use in other modules
module.exports = { getResponse };
