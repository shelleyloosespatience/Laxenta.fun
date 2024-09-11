const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "channels",
  description: "sends info of all channels in the server. (Restricted)",
  usage: "!channels",
  async execute(message) {
    const ownerId = "953527567808356404"; // Replace with your own user ID

    // Check if the user is the server owner or has a specific admin role
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
      message.author.id !== message.guild.ownerId &&
      message.author.id !== ownerId
    ) {
      return message
        .reply("You do not have permission to use this command.")
        .then((reply) => {
          setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
          }, 3000);
        });
    }

    // Confirm the action
    const confirmationMessage = await message.reply(
      "Are you sure you want to delete all channels? Reply with `yes` to confirm.",
    );
    setTimeout(() => message.delete().catch(() => {}), 5000);

    const filter = (response) =>
      response.author.id === message.author.id &&
      response.content.toLowerCase() === "yes";
    const collector = message.channel.createMessageCollector({
      filter,
      time: 5000,
      max: 1,
    });

    collector.on("collect", async (collectedMessage) => {
      collector.stop();
      collectedMessage.delete().catch(() => {});
      confirmationMessage.delete().catch(() => {});

      try {
        const channels = message.guild.channels.cache;

        for (const channel of channels.values()) {
          if (channel.deletable) {
            await channel.delete("Mass delete channels command issued");
            console.log(`Deleted channel ${channel.name}`);
          }
        }

        const completionMessage = await message.channel.send(
          "All deletable channels have been deleted.",
        );
        setTimeout(() => completionMessage.delete().catch(() => {}), 3000);
      } catch (error) {
        console.error("Error deleting channels:", error);
        const errorMessage = await message.channel.send(
          "There was an error trying to delete the channels. Please try again later.",
        );
        setTimeout(() => errorMessage.delete().catch(() => {}), 3000);
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        confirmationMessage.delete().catch(() => {});
        message.channel
          .send("Mass delete channels command cancelled.")
          .then((cancelMessage) => {
            setTimeout(() => cancelMessage.delete().catch(() => {}), 3000);
          });
      }
    });
  },
};
