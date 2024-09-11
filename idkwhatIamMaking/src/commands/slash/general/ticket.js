const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ChannelType, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');
// const { MongoClient } = require('mongodb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a ticket for support.'),
  
  async execute(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;
    try {
      // const client = new MongoClient(process.env.MONGODB_URI);
      // await client.connect();
      // const db = client.db('Aster');
      // const ticketsCollection = db.collection('tickets');

      const category = await getOrCreateTicketCategory(guild);
      const existingTicket = await checkForExistingTicket(guild, user, category);

      if (existingTicket) {
        return interaction.reply({
          content: `You already have an open ticket: ${existingTicket}`,
          ephemeral: true,
        });
      }

      const ticketChannel = await createTicketChannel(guild, user, category);
      await setupTicketChannel(ticketChannel, user);

      await interaction.reply({
        content: `Your ticket has been created: ${ticketChannel}`,
        ephemeral: true,
      });

      // await client.close();

    } catch (error) {
      console.error('Error handling ticket command:', error);
      return replyWithError(interaction, 'An error occurred while processing your ticket. Please try again later.');
    }
  },
};
async function getOrCreateTicketCategory(guild) {
  const categoryName = 'Tickets';
  let category = guild.channels.cache.find(c => c.name.toLowerCase() === categoryName.toLowerCase() && c.type === ChannelType.GuildCategory);
  if (!category) {
    category = await guild.channels.create({
      name: categoryName,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });
  }
  return category;
}

async function checkForExistingTicket(guild, user, category) {
  // const existingTicket = await ticketsCollection.findOne({
  //   guildId: guild.id,
  //   userId: user.id,
  //   channelId: { $ne: null },
  // });
  // if (existingTicket) {
  //   return guild.channels.cache.get(existingTicket.channelId);
  // }
  // return null;
  return null;
}

async function createTicketChannel(guild, user, category) {
  return await guild.channels.create({
    name: `ticket-${user.username}`,
    type: ChannelType.GuildText,
    parent: category,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: user.id,
        allow: [PermissionFlagsBits.ViewChannel],
      },
    ],
  });
}

async function setupTicketChannel(ticketChannel, user) {
  const staffMembers = ticketChannel.guild.members.cache.filter(member => member.permissions.has(PermissionFlagsBits.Administrator));

  const ticketEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Ticket for ${ticketChannel.guild.name} <a:BlackHeart:1138688928216522832>`)
    .setThumbnail(ticketChannel.guild.iconURL())
    .setDescription(
      `Thank you for creating a ticket, <a:Checkmark:1140133502164160594> ${user.username}!\n` +
      'Please describe your issue, and a staff member will be with you shortly.'
    )
    .setFooter({ text: `Created by ${user.tag}, do "!ticketclose" to close, If button does not button!!` });

  const closeButton = new ButtonBuilder()
    .setCustomId('close-ticket')
    .setLabel('Close Ticket')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(closeButton);

  const message = await ticketChannel.send({
    embeds: [ticketEmbed],
    components: [row],
  });

  const collector = message.createMessageComponentCollector({ time: 15000 });

  collector.on('collect', async (interaction) => {
    if (interaction.customId === 'close-ticket') {
      if (interaction.user.id === user.id) {
        await interaction.reply({ content: 'Closing ticket...', ephemeral: true });
        await ticketChannel.delete();
        // await ticketsCollection.updateOne(
        //   { guildId: guild.id, userId: user.id },
        //   { $set: { channelId: null } }
        // );
      } else {
        await interaction.reply({ content: 'You are not authorized to close this ticket.', ephemeral: true });
      }
    }
  });
}

async function replyWithError(interaction, message) {
  await interaction.reply({ content: message, ephemeral: true });
}
