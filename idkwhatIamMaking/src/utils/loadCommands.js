const fs = require("fs");
const path = require("path");
const { green, blue } = require("colorette");
const logger = require("./logger");

const loadCommands = async (dir, commandCollection) => {
  const directoryPath = path.resolve(__dirname, "..", dir);
  const commandFiles = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(directoryPath, file));
    const commandName = command.data ? command.data.name : command.name;

    if (!commandName) {
      logger.error(`Command name missing in file: ${dir}/${file}`);
      continue;
    }

    commandCollection.set(commandName, command);

    const commandType = command.data ? "slash" : "prefix";
    const logMessage = `Loaded ${commandType} command: ${commandName}.`;
    const coloredMessage =
      commandType === "slash" ? blue(logMessage) : green(logMessage);

    console.log(`${new Date().toISOString()} [info]: ${coloredMessage}`);
  }
};

module.exports = { loadCommands };
