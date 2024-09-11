require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const loadPlayer = require("./src/utils/playerSetup");
const playerSetup = require('./src/utils/playerSetup');
const { loadAllCommands } = require("./src/handlers/commandHandler");
const path = require("path");
const fs = require("fs");
const logger = require("./src/utils/logger");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.GuildIntegrations,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.GuildInvites,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildScheduledEvents,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.DirectMessageTyping,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

// Initialize command collections
client.prefixCommands = new Map();
client.slashCommands = new Map();

// Load Player
loadPlayer(client);

// Load Commands
loadAllCommands(client);

// Load events dynamically
const eventFiles = fs
  .readdirSync(path.join(__dirname, "src/events"))
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(__dirname, "src/events", file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client
  .login(process.env.DISCORD_TOKEN)
  .then(() => console.log("Bot logged in successfully"))
  .catch((error) => console.error(`Login failed: ${error.message}`));
