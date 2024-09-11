const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "slap",
  description: "Sends a random anime slap GIF.",
  usage: "!slap @user",
  async execute(message, args) {
    try {
      const targetUser = message.mentions.users.first();
      const target = targetUser ? targetUser.toString() : "someone";
      const response = await axios.get("https://nekos.life/api/v2/img/slap");
      const gifUrl = response.data.url;
      const embed = new EmbedBuilder()
        .setColor("#ff9900") // you mama's breast colour jk jk
        .setTitle("Slap!")
        .setDescription(`${message.author} slaps ${target}!`)
        .setImage(gifUrl)
        .setFooter({
          text: `${message.author.username} slaps YOU, can't be me getting slapped fr`,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching slap GIF:", error);
      message.reply(
        "There was an error trying to fetch GIF. Please try again later.",
      );
    }
  },
};
