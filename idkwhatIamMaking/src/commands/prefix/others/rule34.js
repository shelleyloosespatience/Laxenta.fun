const { EmbedBuilder } = require('discord.js');
const { r34_random } = require('r34-module');

const cooldowns = new Map(); // Map to track user cooldowns

module.exports = {
  name: 'r34',
  description: 'Get random NSFW images from rule34.',
  async execute(message, args) {
    const now = Date.now();
    const cooldownAmount = 5000; // 5 seconds cooldown

    if (!message.channel.nsfw) {
      return message.reply('sorry horny lil guy, this command can only be used in NSFW channels.');
    }

    if (cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(`horny limiter  <a:lol:1138688961951301743>, wait for ${timeLeft.toFixed(1)} seconds.`);
      }
    }

    cooldowns.set(message.author.id, now);

    try {
      const urls = await r34_random({ gay_block: true });
      const randomIndex = Math.floor(Math.random() * urls.length);
      const url = urls[randomIndex];

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Random r34 Image <a:Excited:1178720955971928074>')
        .setImage(url)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching random Rule34 image:', error);
      message.reply('There was an error fetching the image. Please try again later.');
    }

    setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);
  }
};
