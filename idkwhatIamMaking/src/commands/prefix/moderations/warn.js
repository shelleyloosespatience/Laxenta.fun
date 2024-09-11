const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const warnFilePath = path.resolve(__dirname, "warnings.json");

if (!fs.existsSync(warnFilePath)) {
  fs.writeFileSync(warnFilePath, JSON.stringify({}));
}

module.exports = {
  name: "warn",
  description: "Issues a warning to a user.",
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  async execute(message, args) {
    try {
      if (
        !message.member.permissions.has(
          PermissionsBitField.Flags.ModerateMembers,
        )
      ) {
        const reply = await message.reply(
          "You do not have permission to use this command.",
        );
        setTimeout(() => reply.delete().catch(console.error), 5000);
        return;
      }

      const targetUser = message.mentions.members.first();
      if (!targetUser) {
        const reply = await message.reply(
          "Please mention a valid member of this server.",
        );
        setTimeout(() => reply.delete().catch(console.error), 5000);
        return;
      }

      // no bots '='
      if (targetUser.user.bot) {
        const reply = await message.reply("You cannot warn bots.");
        setTimeout(() => reply.delete().catch(console.error), 5000);
        return;
      }

      const reason =
        args.slice(1).join(" ") ||
        "<a:Checkmark:1140133502164160594> ...No reason provided";

      // Log the warning t.t
      const warnings = JSON.parse(fs.readFileSync(warnFilePath, "utf-8"));
      if (!warnings[targetUser.id]) warnings[targetUser.id] = [];
      warnings[targetUser.id].push({ reason, date: new Date().toISOString() });
      fs.writeFileSync(warnFilePath, JSON.stringify(warnings, null, 2));

      // Count the number of warnings
      const warningCount = warnings[targetUser.id].length;

      //prepare and send DM to the user being warned
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("#ffcc00")
          .setTitle("You have been warned!")
          .setDescription(
            `You have received a warning in <a:marker:1140133458606309386> **${message.guild.name}**.`,
          )
          .addFields(
            { name: "Reason", value: reason },
            { name: "Warnings", value: `${warningCount}` },
          )
          .setTimestamp()
          .setFooter({
            text: "Warning notification",
            iconURL:
              "https://cdn.discordapp.com/avatars/1107155830274523136/ff8bdda31a853716b8bbb6b9ab436774.webp?size=1024",
          });

        await targetUser.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        console.error("Error sending DM to user:", dmError);
      }
      const embed = new EmbedBuilder()
        .setColor("#ffcc00")
        .setTitle("User Warned")
        .setDescription(
          `<a:marker:1140133458606309386> ${targetUser.user.tag} has been warned.`,
        )
        .addFields(
          { name: "Reason", value: reason },
          { name: "Warnings", value: `${warningCount}` },
        )
        .setTimestamp()
        .setFooter({
          text: "Warn command",
          iconURL:
            "https://cdn.discordapp.com/avatars/1107155830274523136/ff8bdda31a853716b8bbb6b9ab436774.webp?size=1024",
        });

      await message.channel.send({ embeds: [embed] });

      console.log(`Warned ${targetUser.user.tag}.`);
    } catch (error) {
      console.error("Error executing the warn command:", error);
      const reply = await message.reply(
        "There was an error executing the warn command. Please try again.",
      );
      setTimeout(() => reply.delete().catch(console.error), 5000);
    }
  },
};
