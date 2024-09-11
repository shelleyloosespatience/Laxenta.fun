const { SlashCommandBuilder } = require("@discordjs/builders");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the currently playing song"),
  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({
        content: "There is no music playing to skip!",
        ephemeral: true,
      });
    }

    await queue.node.skip();

    return interaction.reply({ content: "Skipped the current song!" });
  },
};
