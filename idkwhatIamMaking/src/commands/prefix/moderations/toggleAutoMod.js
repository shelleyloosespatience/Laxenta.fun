const { PermissionsBitField } = require("discord.js");
const {
  getGuildSettings,
  setGuildSettings,
} = require("../../../utils/antiSpam");

module.exports = {
  name: "automod",
  description:
    "Toggle both automatic moderation and anti-spam features in the server.",
  usage: "!automod",
  async execute(message) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply("You do not have permission to use this command.");
    }

    const guildId = message.guild.id;

    // Retrieve current settings
    const settings = getGuildSettings(guildId);

    // Toggle both settings to the same state
    const newStatus = !settings.autoModEnabled;
    settings.autoModEnabled = newStatus;
    settings.antiSpamEnabled = newStatus;
    setGuildSettings(guildId, settings);

    // Send confirmation message
    const responseText = newStatus
      ? "<a:marker:1140133458606309386> Automatic moderation and anti-spam are now enabled."
      : "<a:marker:1140133458606309386> Automatic moderation and anti-spam are now disabled.";

    message.reply(responseText);

    console.log(
      `Auto-moderation and anti-spam have been ${newStatus ? "enabled" : "disabled"} by ${message.author.tag}`,
    );
  },
};
