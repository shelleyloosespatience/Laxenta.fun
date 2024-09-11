const logger = require("../../../utils/logger");

module.exports = {
  name: "clear",
  description: "Clear a specified number of messages from the channel",
  permissions: ["MANAGE_MESSAGES"],
  async execute(message, args) {
    if (!message.member.permissions.has(this.permissions)) {
      return message.reply("You do not have permission to use this command.");
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply(
        "Please enter a number between 1 and 100 for the amount of messages to clear.",
      );
    }

    try {
      const messages = await message.channel.bulkDelete(amount, true);
      logger.info(`Deleted ${messages.size} messages by ${message.author.tag}`);
      message.channel
        .send(`Successfully deleted ${messages.size} messages.`)
        .then((msg) => {
          setTimeout(() => msg.delete(), 1000); 
        });
    } catch (error) {
      logger.error(`Error executing scommand: ${error}`);
      message.reply(
        "There was an error trying to clear messages in this channel.",
      );
    }
  },
};
