const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

const getAssImage = async () => {
  try {
    const response = await axios.get('https://meme-api.com/gimme/ass'); 
    const imageUrl = response.data.url;
    return imageUrl;
  } catch (error) {
    console.error('Error fetching NSFW ass image:', error);
    return null;
  }
};

module.exports = {
  name: 'ass',
  description: 'Sends a random NSFW ass image. Can only be used in NSFW channels.',
  async execute(message, args) {
    if (!message.channel.nsfw) {
      return message.reply('This command can only be used in NSFW channels.');
    }

    try {
      const imageUrl = await getAssImage();
      if (!imageUrl) {
        return message.reply('Failed to fetch an NSFW image.');
      }

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('NSFW Ass Image')
        .setImage(imageUrl)
        .setTimestamp()
        .setFooter({ text: 'Enjoy responsibly!', iconURL: 'https://cdn.discordapp.com/avatars/953527567808356404/64f103044c017fc09ff94ff8ed0faf0b.png?size=2048' });

      await message.channel.send({ embeds: [embed] });
      console.log('NSFW ass command executed successfully.');
    } catch (error) {
      console.error('Error executing the NSFW ass command:', error);
      message.reply('There was an error executing that command.');
    }
  },
};