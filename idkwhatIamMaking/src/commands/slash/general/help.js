const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a categorized list of bot commands.'),
  async execute(interaction) {
    const commandCategories = {};

    // dynamically load categories
    const commandFolders = fs.readdirSync(path.join(__dirname, '../../prefix')).filter(file => fs.statSync(path.join(__dirname, '../../prefix', file)).isDirectory());
    commandFolders.push('music', 'moderations');

    //command categories are initialized :>
    commandFolders.forEach(folder => {
      if (!(folder in commandCategories)) {
        commandCategories[folder] = [];
      }
    });

    // load commands into categories
    commandFolders.forEach(folder => {
      const filePath = path.join(__dirname, `../../prefix/${folder}`);
      if (fs.existsSync(filePath)) {
        const commandFiles = fs.readdirSync(filePath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
          try {
            const command = require(path.join(filePath, file));
            if (command.name && command.description) {
              commandCategories[folder].push({ name: command.name, description: command.description });
            }
          } catch (error) {
            console.error(`Error loading command ${file} from folder ${folder}:`, error);
          }
        }
      }
    });

    // helper function to create an embed for a category............................
    const createCategoryEmbed = (category, cmdArr, botAvatar) => {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`<a:Nitro:1140133516940693545> help : ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
        .setDescription(`List of ${category} commands <a:Checkmark:1140133502164160594>`)
        .setTimestamp()
        .setFooter({
          text: 'Help command',
          iconURL: botAvatar
        });

      cmdArr.forEach(cmd => {
        embed.addFields({ name: `${cmd.name}`, value: cmd.description, inline: true });
      });

      return embed;
    };

    // buttons
    const createNavButtons = () => {
      const buttons = new ActionRowBuilder();
      for (const category in commandCategories) {
        buttons.addComponents(
          new ButtonBuilder()
            .setCustomId(category)
            .setLabel(category.charAt(0).toUpperCase() + category.slice(1))
            .setStyle(ButtonStyle.Primary)
        );
      }
      return buttons;
    };

    // starting embed with button navigation..uwu
    const botAvatar = interaction.client.user.displayAvatarURL();
    const initialEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Help Menu')
      .setDescription('Use the buttons below to navigate through different categories of commands <a:Checkmark:1140133502164160594>.')
      .setTimestamp()
      .setFooter({
        text: 'uh..its a  help command..xd',
        iconURL: botAvatar
      });

    // send the initial embed
    await interaction.reply({ embeds: [initialEmbed], components: [createNavButtons()] });

    // listen for button interactions
    const filter = i => i.user.id === interaction.user.id;
    let collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      // get the category from the button's custom ID
      const category = i.customId;
      // create the embed for the selected category
      const categoryEmbed = createCategoryEmbed(category, commandCategories[category], botAvatar);
      // update the message with the new embed
      await i.update({ embeds: [categoryEmbed], components: [createNavButtons()] });
      // reset the collector
      collector.stop();
      // create a new collector with the same filter but with a new timeout
      collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
    });

    collector.on('end', collected => {
      console.log(`Collected ${collected.size} interactions.`);
    });
  }
};
//took me fucking 4 hours to make this single file, i will be pissed if someone copied this project from replit, cz bitch if u did , fuck u , like really fuck u 
//btw 8=========> :D