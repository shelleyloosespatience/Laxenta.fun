const logger = require("../utils/logger");
const { moderateMessage } = require("../utils/automod");
const { checkForSpam } = require("../utils/antiSpam");
const { handleAccessChannelMessage } = require('../utils/verification');
const {
    handleMessageCreate: handleVerification,
} = require("../utils/verification");
const { PREFIX } = process.env;

/**
 * Check if the message is a command and execute it.
 * @param {Message} message - The Discord message object.
 * @param {Client} client - The Discord client object.
 */
async function checkAndExecuteCommand(message, client) {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.prefixCommands.get(commandName);

    if (!command) {
        logger.warn(`Command ${commandName} not found`);
        const replyMessage = await message.reply(
            `Unknown command: **${commandName}**. Try using <a:marker:1140133458606309386> \`${PREFIX}help\` or the slash command \`/help\` to see the list of all commands.`,
        );

        // Auto-delete the reply message after 6 seconds
        setTimeout(() => {
            replyMessage.delete().catch(console.error);
        }, 6000);

        return;
    }

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply(
                "You do not have permission to use this command <a:SparklingStar:1178721811211485235>\nError: ${error}",
            );
        }
    }

    try {
        await command.execute(message, args);
        logger.info(`Executed command ${commandName} by ${message.author.tag}`);
    } catch (error) {
        logger.error(
            `Error executing command ${commandName} by ${message.author.tag}:`,
            error,
        );
        return message.reply(
            `There was an error executing that command! <a:SparklingStar:1178721811211485235>\nError: ${error}`,
        );
    }
}

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        try {
            // Handle automatic moderation and spam detection
            await moderateMessage(message);
            await checkForSpam(message);
            // Handle messages in the access-server channel
            await handleAccessChannelMessage(message);
            // Execute the command if applicable
            await checkAndExecuteCommand(message, client);
        } catch (error) {
            logger.error("Error processing message:", error);
        }
    },
};
//works with almost any type of bot, but not all of them, copy if you see this repl before i delete it from replit lmao.