module.exports = {
  name: "say",
  description: "Repeats the input message",
  async execute(message, args) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("You do not have permission to use this command!");
    }
    const echoMessage = args.join(" ");
    await message.delete();

    message.channel.send(echoMessage);
  },
};
