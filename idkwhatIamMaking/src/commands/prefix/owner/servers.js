const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'servers',
  description: 'Lists all servers the bot is in  (Owner only)',
  usage: '!servers',
  async execute(message) {
    const ownerId = '953527567808356404'; // Replace with your Discord user ID

    if (message.author.id !== ownerId) {
      return message.reply('You do not have permission to use this command.');
    }

    try {
      let currentPage = 0;
      const pageSize = 25;
      const allGuilds = Array.from(message.client.guilds.cache.values());
      const totalPages = Math.ceil(allGuilds.length / pageSize);

      while (currentPage < totalPages) {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const guildPage = allGuilds.slice(start, end);

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('Bot Servers')
          .setDescription(`Here are the servers that this bot is a part of - Page ${currentPage + 1}/${totalPages}:`)
          .setTimestamp();

        for (const guild of guildPage) {
          let invite;
          try {
            // Find a suitable text channel
            const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);
            const channel = guild.systemChannel || 
              textChannels.find(c => c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.CreateInstantInvite)) || 
              textChannels.first();

            if (!channel) {
              console.log(`No suitable text channel found for ${guild.name} (${guild.id})`);
              invite = '*No suitable text channel found*';
            } else if (!channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.CreateInstantInvite)) {
              console.log(`Missing permissions to create invite in ${guild.name} (${guild.id})`);
              invite = '*Missing permissions to create invite*';
            } else {
              invite = await channel.createInvite({
                maxAge: 0, // Permanent invite link
                maxUses: 1, // Limit to one use to avoid spam
                unique: true,
                reason: `Requested by ${message.author.tag}`,
              });
            }
          } catch (error) {
            console.error(`Error creating invite for guild ${guild.name} (${guild.id}):`, error);
            invite = 'Invite link creation failed';
          }

          embed.addFields(
            { name: guild.name, value: invite instanceof String ? invite : `[Invite Link](${invite.url})`, inline: false }
          );
        }

        await message.reply({ embeds: [embed] });

        currentPage++;
      }
    } catch (error) {
      console.error('Error fetching server invites:', error);
      message.reply('There was an error trying to fetch the servers and their invites. Please try again later.');
    }
  },
};
