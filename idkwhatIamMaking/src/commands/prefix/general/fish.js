const { EmbedBuilder } = require("discord.js");

const fishImages = [
  {
    url: "https://tenor.com/view/wahoo-fish-fish-spin-realfishguy-gif-7133228637650880735",
    description: "When a fish has too much coffee! ☕🐟",
  },
  {
    url: "https://tenor.com/view/wahoo-fish-fish-spin-realfishguy-gif-7133228637650880735",
    description: "Fishy breakdancing skills on display! 🕺🐠",
  },
  {
    url: "https://tenor.com/view/wahoo-fish-fish-spin-realfishguy-gif-7133228637650880735",
    description: "Caught in the act of being fishhyy! 🌟🐡",
  },
  {
    url: "https://tenor.com/view/wahoo-fish-fish-spin-realfishguy-gif-7133228637650880735",
    description: "The fish that never stops spinning! 🤪🐟",
  },
  {
    url: "https://tenor.com/view/wahoo-fish-fish-spin-realfishguy-gif-7133228637650880735",
    description: "Proof fish can have a wild side too! 🎉🐠",
  },
];


module.exports = {
  name: "fish",
  description: "Sends a random image of a bish.",
  usage: "!fish",
  async execute(message) {
    try {
      const randomFish =
        fishImages[Math.floor(Math.random() * fishImages.length)];

      const embed = new EmbedBuilder()
        .setColor("#00ff00") // Green color
        .setTitle("Here's a Fish 🐟 uwu")
        .setImage(randomFish.url)
        .setDescription(randomFish.description)
        .setFooter({
          text: `${message.client.user.username} just for fun!`,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching fish image:", error);
      message.reply(
        "There was an error trying to fetch a fish image. Please try again later.",
      );
    }
  },
};
