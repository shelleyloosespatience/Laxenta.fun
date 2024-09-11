const { SlashCommandBuilder } = require("@discordjs/builders");
const { useMainPlayer } = require("discord-player");
const { EmbedBuilder, Colors } = require("discord.js");
const logger = require("../../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube or Spotify")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The URL or name of the song")
        .setRequired(true),
    ),
  async execute(interaction) {
    const query = interaction.options.getString("query", true);
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply({
        content: "You are not connected to a voice channel!",
        ephemeral: true,
      });
    }

    // Log initial steps
    logger.info(
      `User in a voice channel. Query: ${query}, Channel: ${channel.id}`,
    );

    await interaction.deferReply({ ephemeral: true });

    const player = useMainPlayer();

    try {
      logger.info("Attempting to play the track.");
      const result = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: "youtube",
      });

      if (!result.tracks.length) {
        logger.error("No results found");
        return interaction.followUp({
          content: "No results found for your query!",
          ephemeral: true,
        });
      }

      const track = result.tracks[0];
      const queue = player.createQueue(interaction.guild, {
        metadata: {
          channel: interaction.channel,
        },
      });

      try {
        if (!queue.connection) await queue.connect(channel);
      } catch {
        player.deleteQueue(interaction.guild.id);
        logger.error("Could not join the voice channel");
        return interaction.followUp({
          content: "Could not join your voice channel!",
          ephemeral: true,
        });
      }

      queue.addTrack(track);
      if (!queue.playing) await queue.play();

      logger.info(
        `Track enqueued: ${track.title} in guild ${interaction.guild.id}`,
      );

      const embed = new EmbedBuilder()
        .setTitle("Now Playing")
        .setDescription(`[${track.title}](${track.url})`)
        .setThumbnail(track.thumbnail.url)
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setColor(Colors.Green);

      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } catch (e) {
      logger.error(`Error in play command: ${e.message}`, { stack: e.stack });
      await interaction.followUp({
        content: `Something went wrong: ${e.message}`,
        ephemeral: true,
      });
    }
  },
};
