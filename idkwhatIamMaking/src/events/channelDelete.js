const { handleChannelDelete } = require("../utils/verification");

module.exports = {
  name: "channelDelete",
  once: false,
  async execute(channel) {
    await handleChannelDelete(channel);
  },
};
