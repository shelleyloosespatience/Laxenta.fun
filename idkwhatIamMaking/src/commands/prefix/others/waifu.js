const axios = require('axios');

const getNsfwGif = async () => {
  try {
    const response = await axios.get('https://api.waifu.pics/nsfw/neko');
    return response.data.url;
  } catch (error) {
    console.error('Error fetching NSFW:', error);
    return null; // Return null in case of error
  }
};

module.exports = {
  name: 'hentai',
  description: 'Sends a random NSFW anime image. Can only be used in NSFW channels.',
  async execute(message, args) {
    if (!message.channel.nsfw) {
      return message.reply('This command can only be used in NSFW channels!');
    }

    try {
      const nsfwImageUrl = await getNsfwGif();
      if (nsfwImageUrl) {
        await message.channel.send(nsfwImageUrl); // Send the raw image URL
        console.log('Anime NSFW command executed successfully.');
      } else {
        return message.reply('Failed to fetch NSFW content :(');
      }
    } catch (error) {
      console.error('Error executing the anime NSFW command:', error);
      message.reply('There was an error executing that command.');
    }
  },
};
