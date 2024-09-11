const { EmbedBuilder } = require('discord.js');
const { r34_search } = require('r34-module');

const cooldowns = new Map(); 

module.exports = {
  name: 'r34search',
  description: 'Search NSFW images on Rule34.',
  async execute(message, args) {
    const now = Date.now();
    const cooldownAmount = 3000; 

    if (!message.channel.nsfw) {
      return message.reply('sorry horny lil guy, this command can only be used in NSFW channels.');
    }

    const query = args.join(' ');
    if (!query) {
      return message.reply('Please provide a search term <a:Checkmark:1140133502164160594>.');
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
      const urls = await r34_search({ search_tag: query, block_tags: ['male', 'trap', 'furry'] });
      if (urls.length === 0) {
        return message.reply('No results found for your search query.');
      }
      const randomIndex = Math.floor(Math.random() * urls.length);
      const url = urls[randomIndex];

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle(` r34 search :D <a:Excited:1178720955971928074> [Tag: ${query}]`)
        .setImage(url)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error searching Rule34 images:', error);
      message.reply('There was an error fetching the image. Please try again later.');
    }

    setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);
  }
};
