const {
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a member from the guild ;c',
  usage: '!ban <@user> [reason]',
  async execute(message, args) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return message.reply('You do not have permission to ban members <a:BlackHeart:1138688928216522832>');
      }

      if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return message.reply('<:Moderator:978311631018807376> I do not have permission to ban members.');
      }

      const userToBan = message.mentions.users.first();

      if (!userToBan) {
        return message.reply('You need to mention the member you want to ban <a:BlackHeart:1138688928216522832>!');
      }

      const reason = args.slice(1).join(' ') || 'No reason provided <a:BlackHeart:1138688928216522832>';

      const confirmationEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Ban Confirmation')
        .setDescription(`Are you sure you want to ban ${userToBan.tag}? They will be banned permanently <a:Banned:1140133494199173121>.`)
        .addFields({ name: 'Reason', value: reason })
        .setFooter({ text: 'You have 30 seconds to respond.' });

      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('confirmBan')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancelBan')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)
        );

      const confirmationMessage = await message.reply({
        embeds: [confirmationEmbed],
        components: [buttonRow]
      });

      // Filter for button interactions from the command issuer
      const filter = (interaction) => interaction.user.id === message.author.id &&
        ['confirmBan', 'cancelBan'].includes(interaction.customId);

      const collector = confirmationMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 30000 });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'confirmBan') {
          try {
            await message.guild.members.ban(userToBan.id, { reason });
            await interaction.update({ content: `${userToBan.tag} has been banned.`, embeds: [], components: [] });
            await confirmationMessage.delete();
          } catch (error) {
            console.error(error);
            await interaction.update({ content: '<:Moderator:978311631018807376> There was an error trying to ban the user.', embeds: [], components: [] });
          }
        } else if (interaction.customId === 'cancelBan') {
          await interaction.update({ content: 'Ban action cancelled.', embeds: [], components: [] });
          await confirmationMessage.delete();
        }
      });

      collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          await confirmationMessage.delete();
          message.reply({ content: 'Ban action timed out.', ephemeral: true });
        }
      });

    } catch (error) {
      console.error(error);
      message.reply('<:Moderator:978311631018807376> There was an error trying to execute that command!');
    }
  }
};
