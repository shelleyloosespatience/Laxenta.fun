const axios = require("axios");

const getMeme = async () => {
  try {
    const response = await axios.get("https://api.horrorapi.com/");
    const memeUrl = response.data.url;
    return memeUrl;
  } catch (error) {
    console.error("Error fetching:", error);
    return "Failed to fetch yr shit :(";
  }
};

module.exports = {
  name: "test",
  description: "Sends a random meme.",
  async execute(message, args) {
    try {
      const memeUrl = await getMeme();

      if (memeUrl.startsWith("http")) {
        await message.channel.send(memeUrl); // Send the raw image URL
        console.log("Meme command executed successfully.");
      } else {
        message.reply(memeUrl); // Handle the case where fetching failed
      }
    } catch (error) {
      console.error("Error executing the meme command:", error);
      message.reply("There was an error executing that command.");
    }
  },
};
