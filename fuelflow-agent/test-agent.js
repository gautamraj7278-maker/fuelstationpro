// Test script to demonstrate the FuelFlow agent capabilities
const fs = require("fs");
require("dotenv").config();

// Read the SOUL file paths
const fuel = fs.readFileSync file to use as system prompt
const soulMd = fs.readFileSync("./SOUL.md", "utf-8");

console.log("FuelFlow Agent Test");
console.log("===================\n");
console.log("Agent Identity:");
console.log(soulMd.split("##")[0].trim()); // Just the header part
console.log("\nThis agent is ready to assist with FuelFlow development tasks.");
console.log("To use it in conversation mode, run: node bot.js\n");

module.exports = { soulMd };
