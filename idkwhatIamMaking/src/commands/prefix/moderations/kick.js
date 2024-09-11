const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kick a member from the guild.',
  usage: '!kick <@user> [reason]',
  async execute(message, args) {
    try {
      // Check if the user has Kick permissions
      if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return message.reply('You do not have permission to use this command <a:BlackHeart:1138688928216522832>');
      }

      // Check if the bot has the necessary permissions
      if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return message.reply('I do not have permission to kick members <a:BlackHeart:1138688928216522832>');
      }

      // Get the member to kick
      const member = message.mentions.members.first();
      if (!member) {
        return message.reply('Please mention a valid member to kick O.O');
      }

      if (!member.kickable) {
        return message.reply('Command Execution Terminated! ./../.. The user you mentioned might possess an higher or equal role hierarchy compared to me <a:BlackHeart:1138688928216522832>');
      }

      const reason = args.slice(1).join(' ') || 'No reason provided';
      await member.kick(reason);

      //kick confirmation embed :D
      const embed = new EmbedBuilder()
        .setTitle('Member Kicked')
        .setColor('RED')
        .addFields(
          { name: 'Member', value: `${member.user.tag} (${member.id})` },
          { name: 'Kicked by', value: `${message.author.tag} (${message.author.id})` },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

      //logging ofc
      console.log(`[${new Date().toISOString()}] Member ${member.user.tag} (${member.id}) was kicked by ${message.author.tag} (${message.author.id}) for reason: ${reason}`);

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error executing kick command by ${message.author.tag}:`, error);
      message.reply('There was an error executing the kick command.');
    }
  },
};
