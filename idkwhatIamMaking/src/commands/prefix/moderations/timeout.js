const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'timeout',
  description: 'Temporarily time out a user in the server for a specified duration.',
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  async execute(message, args) {
    try {
  
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return message.reply('You do not have permission to use this command.');
      }
    
      const targetUser = message.mentions.members.first();
      if (!targetUser) {
        return message.reply('Please mention a valid member of this server.');
      }

      // Prevent timing out administrators
      if (targetUser.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('You cannot timeout an administrator ;-;');
      }

      // Parse the duration input
      const durationInput = args[1];
      const durationMs = parseDuration(durationInput);
      if (!durationMs || durationMs > 28 * 24 * 60 * 60 * 1000) { // Max 28 days
        return message.reply('Please specify a valid duration up to 28d (e.g., 10s, 1m, 1h, or 1d) <a:SparklingStar:1178721811211485235>');
      }

      // Set the reason for the timeout
      const reason = args.slice(2).join(' ') || 'No reason provided <a:FaceSlap:1140133589078524005>';

      // Execute the timeout cmd ;;-;;
      await targetUser.timeout(durationMs, reason);
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('AWWW, You have been timed out! <a:SadPepe:1107155830274523136>')
          .setDescription(`You have been timed out in **${message.guild.name}** for ${durationInput}.`)
          .addFields({ name: 'Reason', value: reason })
          .setTimestamp()
          .setFooter({ text: 'Notifying Timeout Execution', iconURL: 'https://cdn.discordapp.com/avatars/1107155830274523136/ff8bdda31a853716b8bbb6b9ab436774.webp?size=1024' });

        await targetUser.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        console.error('Error sending DM to user:', dmError);
      }

      // notify the channel about the timeout
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('User Timeout <a:Checkmark:1140133502164160594>')
        .setDescription(`${targetUser.user.tag} has been timed out for ${durationInput}.`)
        .addFields({ name: 'Reason', value: reason })
        .setTimestamp()
        .setFooter({ text: 'Timeout command', iconURL: 'https://cdn.discordapp.com/avatars/1107155830274523136/ff8bdda31a853716b8bbb6b9ab436774.webp?size=1024' });

      await message.channel.send({ embeds: [embed] });
      console.log(`Timed out ${targetUser.user.tag} for ${durationInput}.`);

      //notify when the timeout expires
      if (durationMs <= 24 * 60 * 60 * 1000) { // Less than or equal to 24 hours
        setTimeout(async () => {
          const removeTimeoutEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('User Timeout Expired <a:SparklingStar:1178721811211485235>')
            .setDescription(`${targetUser.user.tag}'s timeout has expired.`)
            .setTimestamp()
            .setFooter({ text: 'Timeout command', iconURL: 'https://cdn.discordapp.com/avatars/1107155830274523136/ff8bdda31a853716b8bbb6b9ab436774.webp?size=1024' });

          await message.channel.send({ embeds: [removeTimeoutEmbed] });
          console.log(`Timeout expired for ${targetUser.user.tag} after ${durationInput}.`);
        }, durationMs);
      }

    } catch (error) {
      console.error('Error executing the timeout command:', error);
      message.reply('There was an error executing the timeout command. Please try again.');
    }
  },
};

// parsing duration input, normal stuff
function parseDuration(duration) {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000; // seconds
    case 'm': return value * 60 * 1000; // minutes
    case 'h': return value * 60 * 60 * 1000; // hours
    case 'd': return value * 24 * 60 * 60 * 1000; // days
    default: return null;
  }
}
