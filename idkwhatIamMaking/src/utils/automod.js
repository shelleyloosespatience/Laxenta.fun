const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const STORAGE_PATH = path.resolve(__dirname, '../storage.json');
const wordsFilePath = path.join(__dirname, '../../words.txt');
let vulgarWords = [];

const defaultSettings = {
  autoModEnabled: true,
  antiSpamEnabled: true
};

/**
 * Utility function to read storage data.
 */
function readStorage() {
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify({}), 'utf8');
  }
  return JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
}

/**
 * Utility function to write storage data.
 */
function writeStorage(data) {
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(data), 'utf8');
}

/**
 * Get settings for a specific guild
 * @param {string} guildId
 * @returns {object}
 */
function getGuildSettings(guildId) {
  const data = readStorage();
  if (!data[guildId]) {
    data[guildId] = { ...defaultSettings };
    writeStorage(data);
  }
  return data[guildId];
}

/**
 * Set settings for a specific guild
 * @param {string} guildId
 * @param {object} settings
 */
function setGuildSettings(guildId, settings) {
  const data = readStorage();
  data[guildId] = settings;
  writeStorage(data);
}

/**
 * Check if auto-moderation is enabled for a specific guild
 * @param {string} guildId
 * @returns {boolean}
 */
function isAutoModEnabled(guildId) {
  const settings = getGuildSettings(guildId);
  return settings.autoModEnabled;
}

function loadVulgarWords() {
  try {
    vulgarWords = fs.readFileSync(wordsFilePath, 'utf8')
      .split('\n')
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
  } catch (error) {
    console.error('Error loading vulgar words:', error);
  }
}

function spoiler(word) {
  return `||${word}||`;
}

/**
 * Check if message content contains vulgar words and handle moderation
 * @param {Message} message - The Discord message to moderate
 */
async function moderateMessage(message) {
  if (!isAutoModEnabled(message.guild.id) || !message.content || message.author.bot) return;

  const content = message.content.toLowerCase();
  const foundWords = vulgarWords.filter((word) => content.includes(word));
  if (foundWords.length > 0) {
    await message.delete();

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Profanity Detected <:AutoMod:978311027458441316>')
      .setDescription(`Your message contains sensitive words, <@${message.author.id}>.`)
      .addFields({ name: 'Vulgar Words ;c', value: foundWords.map((word) => spoiler(word)).join(', ') })
      .setTimestamp();

    const sentMessage = await message.channel.send({ embeds: [embed] });
    setTimeout(() => sentMessage.delete(), 10000);

    // Ensure the "warnings" channel exists
    let warningsChannel = message.guild.channels.cache.find((channel) => channel.name.toLowerCase() === 'warnings');
    if (!warningsChannel) {
      try {
        warningsChannel = await message.guild.channels.create({
          name: 'warnings',
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: message.guild.id,
              deny: [PermissionsBitField.Flags.SendMessages],
            },
          ],
        });
      } catch (error) {
        console.error('Error creating warnings channel:', error);
        return;
      }
    }

    const warningEmbed = new EmbedBuilder()
      .setColor('#ffff00')
      .setTitle('Profanity Warning :FaceSlap:')
      .setDescription(`User <@${message.author.id}> used profanity in <#${message.channel.id}>.`)
      .addFields({ name: 'Vulgar Words :AutoMod:', value: foundWords.map((word) => spoiler(word)).join(', ') })
      .setTimestamp()
      .setFooter({ text: 'Execute "!toggleautomod" to disable this.' });

    warningsChannel.send({ embeds: [warningEmbed] });
  }
}

function toggleAutoMod(guildId) {
  const settings = getGuildSettings(guildId);
  settings.autoModEnabled = !settings.autoModEnabled;
  setGuildSettings(guildId, settings);
  return settings.autoModEnabled;
}

loadVulgarWords();

module.exports = {
  moderateMessage,
  toggleAutoMod,
  isAutoModEnabled,
  getGuildSettings,
  setGuildSettings,
  readStorage,
  writeStorage
};
