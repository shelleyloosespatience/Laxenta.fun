const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "kill",
  description: "Sends a random anime kill GIF.",
  usage: "!kill [@user]",
  async execute(message, args) {
    try {
      const target = args[0] ? args[0] : "someone";

      // Array of API endpoints, including NSFW API
      const apis = [
        "https://api.giphy.com/v1/gifs/search?api_key=fjPEBxiyz0qGebbJDs5hdS1SNjCQEYme&q=anime+kill&limit=1", // Giphy API 1
        "https://api.giphy.com/v1/gifs/search?api_key=QtC12MQ1wP6TvozfVoRfEwpXdw6oJc7P&q=anime+kill&limit=1", // Giphy API 2
        "https://api.giphy.com/v1/gifs/search?api_key=NeZIbSIk3w6JMKbNfOqbLqH0DUKIuLV2&q=anime+kill&limit=1", // Giphy API 3
        "https://api.jikan.moe/v4/anime/1"  // Jikan API (example anime ID)
      ];

      // Choose a random API
      const apiUrl = apis[Math.floor(Math.random() * apis.length)];

      // Fetch the GIF from the chosen API
      const response = await axios.get(apiUrl);
      let gifUrl;

      // Determine the URL structure based on the API
      if (apiUrl.includes("waifu.pics")) {
        gifUrl = response.data.url;
      } else if (apiUrl.includes("giphy.com")) {
        gifUrl = response.data.data[0].images.original.url;
      } else if (apiUrl.includes("jikan.moe")) {
        gifUrl = response.data.data.images[0].large_image_url;
      }

      const embed = new EmbedBuilder()
        .setColor("#FFFFFF") // Red color
        .setTitle("Kill!")
        .setDescription(`${message.author} kills ${target}!`)
        .setImage(gifUrl)
        .setFooter({
          text: `${message.client.user.username} just for fun!`,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching kill GIF:", error);
      message.reply(
        "There was an error trying to fetch a kill GIF. Please try again later.",
      );
    }
  },
};
