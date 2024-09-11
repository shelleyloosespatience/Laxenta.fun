const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  description: "Lists all available commands by category with buttons for navigation.",
  async execute(message, args) {
    try {
      // Load command categories
      const commandFolders = fs.readdirSync(path.join(__dirname, '../../prefix')).filter(file => fs.statSync(path.join(__dirname, '../../prefix', file)).isDirectory());
      commandFolders.push('music', 'moderations'); // Add any other fixed categories here

      // Load commands for each category
      const categories = {};
      for (const folder of commandFolders) {
        const commands = fs.readdirSync(path.join(__dirname, '../../prefix', folder)).filter(file => file.endsWith('.js'));
        categories[folder] = commands.map(file => {
          const command = require(path.join(__dirname, '../../prefix', folder, file));
          return { name: command.name, description: command.description };
        });
      }

      // Get the server icon URL
      const serverIconURL = message.guild.iconURL({ size: 1024 }); // Adjust size if needed

      // Create an embed for each category
      const embeds = Object.keys(categories).map(category => {
        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle(`Help - ${category} Commands`)
          .setDescription(`Here are the commands for the ${category} category:`)
          .setTimestamp()
          .setThumbnail(serverIconURL) // Set server's logo as thumbnail
          .setFooter({
            text: "Help command",
            iconURL: message.client.user.displayAvatarURL(), // Bot's avatar as footer icon
          });

        categories[category].forEach(cmd => {
          embed.addFields({
            name: `**${cmd.name}**`,
            value: `${cmd.description}`,
            inline: false,
          });
        });

        return embed;
      });

      if (embeds.length === 0) {
        return message.reply("No commands available.");
      }

      // Send the first embed
      const reply = await message.channel.send({
        embeds: [embeds[0]],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('Previous')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next')
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });

      // Create a collector to handle button interactions
      const filter = (interaction) => interaction.isButton() && interaction.user.id === message.author.id;
      const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

      let currentPage = 0;

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'next') {
          currentPage++;
        } else if (interaction.customId === 'prev') {
          currentPage--;
        }

        // Update the buttons
        const buttons = [
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === embeds.length - 1),
        ];

        // Edit the message with the new page
        await interaction.update({
          embeds: [embeds[currentPage]],
          components: [new ActionRowBuilder().addComponents(buttons)],
        });
      });

      collector.on('end', () => {
        // Disable buttons after the collector ends
        reply.edit({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            ),
          ],
        });
      });

      console.log("Help command executed successfully.");
    } catch (error) {
      console.error("Error executing the help command:", error);
      message.reply("There was an error executing that command.");
    }
  },
};
