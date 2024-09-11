const {
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const { getGuildData, setGuildData } = require("./Storage");

// Function to create or get the "Verified Member" role in the guild
async function createVerifiedRole(guild) {
  try {
    let verifiedRole = guild.roles.cache.find(
      (role) => role.name === "Verified Member"
    );
    if (!verifiedRole) {
      verifiedRole = await guild.roles.create({
        name: "Verified Member",
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.Connect,
        ],
        reason: "Role for verified members.",
      });
    }
    return verifiedRole;
  } catch (error) {
    console.error(`[createVerifiedRole] Error: ${error.message}`);
  }
}

// Function to create or get the "access-server" channel in the guild
async function createAccessChannel(guild) {
  try {
    const guildData = await getGuildData(guild.id);
    let accessChannel =
      guild.channels.cache.get(guildData.accessChannelId) ||
      guild.channels.cache.find(
        (channel) => channel.name === "access-server"
      );
    const verifiedRole = await createVerifiedRole(guild);

    if (!accessChannel) {
      accessChannel = await guild.channels.create({
        name: "access-server",
        type: ChannelType.GuildText,
        rateLimitPerUser: 10, //10s f or spam protection
        permissionOverwrites: [
          { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: verifiedRole.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        ],
      });
      await setGuildData(guild.id, { accessChannelId: accessChannel.id });
      setTimeout(async () => {
        await sendVerificationEmbed(accessChannel);
      }, 10000);
    } else {
      await accessChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
        ViewChannel: true,
        SendMessages: true,
      });
      await accessChannel.permissionOverwrites.edit(verifiedRole.id, {
        ViewChannel: true,
        SendMessages: true,
      });
    }
    return accessChannel;
  } catch (error) {
    console.error(`[createAccessChannel] Error: ${error.message}`);
  }
}

// Function to lock all channels except the access-server
async function lockAllChannels(guild) {
  try {
    const guildData = await getGuildData(guild.id);
    const accessChannelId = guildData.accessChannelId;
    for (const channel of guild.channels.cache.values()) {
      if ((channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) && channel.id !== accessChannelId) {
        await channel.permissionOverwrites.edit(guild.roles.everyone.id, {
          ViewChannel: false,
          SendMessages: false,
        });
      }
    }
  } catch (error) {
    console.error(`[lockAllChannels] Error: ${error.message}`);
  }
}

// Function to unlock all channels for a specific member
async function unlockAllChannelsForMember(guild, member) {
  const verifiedRole = await createVerifiedRole(guild);
  for (const channel of guild.channels.cache.values()) {
    if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
      await channel.permissionOverwrites.edit(member.id, {
        ViewChannel: true,
        SendMessages: true,
      });
    }
  }
  console.log(`Unlocked all channels in guild ${guild.id} for verified member ${member.id}`);
}

// Function to adjust permissions of "access-server" after locking other channels
async function adjustAccessChannelPermissions(guild) {
  try {
    const guildData = await getGuildData(guild.id);
    const accessChannel = guild.channels.cache.get(guildData.accessChannelId);
    const verifiedRole = await createVerifiedRole(guild);

    await accessChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
      ViewChannel: true,
      SendMessages: true,
    });
    await accessChannel.permissionOverwrites.edit(verifiedRole.id, {
      ViewChannel: false,
      SendMessages: false,
    });
  } catch (error) {
    console.error(`[adjustAccessChannelPermissions] Error: ${error.message}`);
  }
}

//function to send a verification embed in the access-server channel
async function sendVerificationEmbed(accessChannel) {
  try {
    //delete existing verification messages
    const messages = await accessChannel.messages.fetch({ limit: 100 });
    for (const message of messages.values()) {
      if (message.embeds.length > 0 && message.embeds[0].title === 'Server Verification') {
        await message.delete();
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Server Verification')
      .setDescription('<a:birb:1084349795340124240> please type \`!verify\` **default prefix is [ ! ]** in this channel to gain access to the server!! <a:flameblue:1140133622716841984>\nIf the command is not working right now, please wait a few minutes or contact a server administrator. ')
      .setThumbnail(accessChannel.guild.iconURL())
      .setFooter({ text: ': ) \`!toggleverify\` to disable verification system!', iconURL: accessChannel.client.user.displayAvatarURL() });

    await accessChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`[sendVerificationEmbed] Error: ${error.message}`);
  }
}

//function to handle new guild member addition
async function handleGuildMemberAdd(member) {
  try {
    const guildData = await getGuildData(member.guild.id);
    if (!guildData.verificationEnabled) return;

    const accessChannel = await createAccessChannel(member.guild);
    await sendVerificationEmbed(accessChannel);
  } catch (error) {
    console.error(`[handleGuildMemberAdd] Error: ${error.message}`);
  }
}

// Function to handle the !verify command submitted by a user
async function handleVerifyCommand(message) {
  try {
    const guild = message.guild;
    const member = message.member;
    const verifiedRole = await createVerifiedRole(guild);

    // Add the verified role to the member
    await member.roles.add(verifiedRole.id);

    // Unlock all channels for the member
    await unlockAllChannelsForMember(guild, member);

    // Confirm verification
    await message.reply(`You have been verified, ${member}! You now have access to the server <a:SparklingStar:1178721811211485235>`);
  } catch (error) {
    console.error(`[handleVerifyCommand] Error: ${error.message}`);
  }
}

// Function to handle deletion of the access channel
async function handleChannelDelete(channel) {
  try {
    const guildData = await getGuildData(channel.guild.id);
    if (channel.id === guildData.accessChannelId && guildData.verificationEnabled) {
      const guild = channel.guild;
      const accessChannel = await createAccessChannel(guild);
      await sendVerificationEmbed(accessChannel);
    }
  } catch (error) {
    console.error(`[handleChannelDelete] Error: ${error.message}`);
  }
}

// Function to handle messages in the access-server channel, delete after 3 seconds if not the verification embed, and ensure a single embed exists
async function handleAccessChannelMessage(message) {
  try {
    if (message.channel.name !== 'access-server') return;

    const guildData = await getGuildData(message.guild.id);
    const accessChannel = message.channel;

// Check if the message is the verification embed
const isVerificationEmbed = message.embeds.length > 0 && message.embeds[0].title === 'Server Verification';

// If the message is not the verification embed, delete it after 3 seconds
if (!isVerificationEmbed) {
  setTimeout(async () => {
    if (!message.deleted) await message.delete();
  }, 3000);
}

// Check if an existing verification embed is present
const messages = await accessChannel.messages.fetch({ limit: 50 });
const verificationExists = messages.some(msg => msg.embeds.length > 0 && msg.embeds[0].title === 'Server Verification');

// If no existing verification embed is found, create a new one
if (!verificationExists) {
  await sendVerificationEmbed(accessChannel);
}
} catch (error) {
console.error(`[handleAccessChannelMessage] Error: ${error.message}`);
}
}

// Function to disable the verification system and unlock all channels
async function disableVerificationSystem(guild) {
  try {
    const guildData = await getGuildData(guild.id);
    if (guildData.verificationEnabled) {
      // Unlock all channels for everyone
      for (const channel of guild.channels.cache.values()) {
        if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
          await channel.permissionOverwrites.edit(guild.roles.everyone.id, {
            ViewChannel: true,
            SendMessages: true,
          });
        }
      }
      const accessChannel = guild.channels.cache.find(
        (channel) => channel.name === "access-server"
      );
      if (accessChannel) {
        await accessChannel.delete();
      }

      await setGuildData(guild.id, { verificationEnabled: false });
      console.log(`Disabled verification system in guild ${guild.id}`);
    }
  } catch (error) {
    console.error(`[disableVerificationSystem] Error: ${error.message}`);
  }
}

module.exports = {
  handleGuildMemberAdd,
  handleVerifyCommand,
  handleChannelDelete,
  disableVerificationSystem,
  createAccessChannel,
  sendVerificationEmbed,
  lockAllChannels,
  adjustAccessChannelPermissions,
  createVerifiedRole,
  handleAccessChannelMessage,
};
