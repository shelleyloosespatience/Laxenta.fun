require("dotenv").config();
const { loadCommands } = require("../utils/loadCommands");

async function loadAllCommands(client) {
  // Load prefix commands
  await loadCommands("commands/prefix/general", client.prefixCommands);
  await loadCommands("commands/prefix/moderations", client.prefixCommands);
  await loadCommands("commands/prefix/music", client.prefixCommands);
  await loadCommands("commands/prefix/others", client.prefixCommands);
  await loadCommands("commands/prefix/owner", client.prefixCommands);

  // Load all slash commands using environment variables
  await loadCommands("commands/slash/general", client.slashCommands);

  if (
    client.slashCommands.size > 0 &&
    process.env.CLIENT_ID &&
    process.env.GUILD_ID
  ) {
    await registerSlashCommands(
      client.slashCommands,
      process.env.CLIENT_ID,
      process.env.GUILD_ID,
    );
  }

  console.log("All commands loaded.");
}

const registerSlashCommands = async (slashCommands, clientId, guildId) => {
  const { REST } = require("@discordjs/rest");
  const { Routes } = require("discord-api-types/v9");

  const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log("Started refreshing slash commands.");

    await rest.put(
      guildId
        ? Routes.applicationGuildCommands(clientId, guildId)
        : Routes.applicationCommands(clientId),
      {
        body: Array.from(slashCommands.values()).map((command) =>
          command.data.toJSON(),
        ),
      },
    );

    console.log("Successfully reloaded slash commands.");
  } catch (error) {
    console.error(error);
  }
};

module.exports = { loadAllCommands };
