const { Player } = require("discord-player");
const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const {
  SpotifyExtractor,
  SoundCloudExtractor,
  YTDLExtractor,
} = require("@discord-player/extractor");

module.exports = async function (client) {
  const player = new Player(client, {
    ytdlOptions: {
      quality: "highestaudio",
      filter: "audioonly",
      highWaterMark: 1 << 25,
    },
  });

  // Register all needed extractors
  await player.extractors.loadDefault((ext) => ext !== "YouTubeExtractor");

  // Handle connection and error events with detailed logging
  player.on("error", (queue, error) =>
    console.log(
      `[${queue.guild.name}] Error emitted from the queue: ${error.message}`,
    ),
  );
  player.on("connectionError", (queue, error) =>
    console.log(
      `[${queue.guild.name}] Error emitted from the connection: ${error.message}`,
    ),
  );
  player.on("trackStart", (queue, track) => {
    queue.metadata.send(`🎶 | Now playing **${track.title}**!`);
    client.logger.info(`Started playing: ${track.title}`);
  });
  player.on("trackEnd", (queue) => {
    client.logger.info(`Finished playing`);
  });

  // Log connection to the voice channel
  client.on("voiceStateUpdate", (oldState, newState) => {
    if (newState.channelId) {
      console.log(`Bot connected to voice channel: ${newState.channelId}`);
    } else {
      console.log(`Bot disconnected from voice channel.`);
    }
  });

  client.player = player;
};
