const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

const getKissGif = async () => {
  try {
    const response = await axios.get('https://nekos.life/api/v2/img/kiss');
    return response.data.url;
  } catch (error) {
    console.error('Error fetching:', error);
    return null; 
  }
};

module.exports = {
  name: 'kiss',
  description: 'Sends a random kiss to the mentioned user.',
  async execute(message, args) {
    if (!message.mentions.users.size) {
      return message.reply('you can not kiss air, maybe people like you can..!');
    }

    const mentionedUser = message.mentions.users.first();

    // Check if the user is trying to kiss themselves xddddd
    if (mentionedUser.id === message.author.id) {
      return message.reply(" <:Hmmm:1249685279573409832>  w-wait.. you can't..! You might be lonely, but not that lonely..!");
    }

    try {
      const gifUrl = await getKissGif();
      if (!gifUrl) {
        return message.reply('Failed to fetch it :(');
      }

      const embed = new EmbedBuilder()
        .setColor('#ff69b4')
        .setTitle(`${message.author.username} kisses ${mentionedUser.username} <a:kiss:1266746838363668563>`)
        .setImage(gifUrl)
        .setTimestamp()
        .setFooter({ text: 'you def horny buddy', iconURL: 'https://cdn.discordapp.com/avatars/953527567808356404/64f103044c017fc09ff94ff8ed0faf0b.png?size=2048' });

      await message.channel.send({ embeds: [embed] });
      console.log('Kiss command executed successfully.');
    } catch (error) {
      console.error('Error executing the kiss command:', error);
      message.reply('There was an error executing that command.');
    }
  },
};
