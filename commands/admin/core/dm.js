const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const { checkPermission } = require('../../../handlers/permissionsHandler');
const { getHelpEmbed } = require('../../../handlers/helpHandler');

const dmRecords = new Map();

module.exports = {
  name: 'dm',
  description: 'Mengirim pesan DM ke pengguna tertentu.',
  async execute(message, args, client, attachments = []) {
    if (!checkPermission(message)) {
      return;
    }

    if (!message.member) {
      return sendErrorAndHelp(message, "Messages can only be sent to server members.", getHelpEmbed('helpDM'));
    }

    const subCommand = args[0];
    args.shift();

    if (subCommand === 'edit') {
      const messageLink = args.shift();
      const newMessage = args.join(' ');

      if (!messageLink || !newMessage) {
        return sendErrorAndHelp(message, "Format: m!dm edit [message link] [new message]", getHelpEmbed('helpDmEdit'));
      }

      try {
        const dmInfo = dmRecords.get(messageLink);
        if (!dmInfo) {
          return sendErrorAndHelp(message, "No DM record found for the provided message link.", getHelpEmbed('helpDmEdit'));
        }

        const { userId, userName, userAvatar, contentBeforeEdit } = dmInfo;

        const channel = client.channels.cache.get(dmInfo.channelId);
        if (!channel) {
          return sendErrorAndHelp(message, "DM's Channel not found.", getHelpEmbed('helpDmEdit'));
        }

        const fetchedMessage = await channel.messages.fetch(dmInfo.messageId);

        const confirmEmbed = new MessageEmbed()
          .setTitle("Are you sure you want to edit this message?")
          .setDescription(`${newMessage}\n\n**User:** <@${userId}>`)
          .setColor(null)
          .setThumbnail(userAvatar)
          .setTimestamp()

        const confirmButtons = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId('done')
            .setLabel('Done')
            .setStyle('SUCCESS'),
          new MessageButton()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle('DANGER')
        );

        const confirmMessage = await message.channel.send({ embeds: [confirmEmbed], components: [confirmButtons] });

        const filter = i => ['done', 'cancel'].includes(i.customId) && i.user.id === message.author.id;
        const collector = confirmMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
          if (interaction.customId === 'done') {
            await fetchedMessage.edit(newMessage);
            message.react('✅');

            const channelLink = `\`https://discord.com/channels/@me/${channelId}/${messageId}\``;
            const content = `${channelLink}`;
            const logEmbed = new MessageEmbed()
              .setTitle(`DM for ${userName} has been edited`)
              .setDescription(`**Before:**\n${contentBeforeEdit}\n\n\n**After:**\n${newMessage}\n\n<@${message.author.id}> edited a message in <@${userId}>'s DM`)
              .setColor('RED')
              .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
              .setThumbnail(userAvatar)
              .setFooter({ text: `User ID: ${userId}` })
              .setTimestamp();

            const logChannel = client.channels.cache.get('1147531648976564334');
            logChannel.send({ content, embeds: [logEmbed] });

          } else if (interaction.customId === 'cancel') {
            message.reply("Editing DM canceled.");
          }
          collector.stop();
          interaction.deferUpdate();
        });

        collector.on('end', () => {
          confirmMessage.edit({ components: [] });
        });
      } catch (error) {
        console.error("Error editing message:", error);
        return sendErrorAndHelp(message, "An error occurred while trying to edit the message.", getHelpEmbed('helpDmEdit'));
      }

    } else if (subCommand === 'del') {
      const messageLink = args.shift();

      if (!messageLink) {
        return sendErrorAndHelp(message, "Format: m!dm del [message DM link]", getHelpEmbed('helpDmDelete'));
      }

      try {
        const dmInfo = dmRecords.get(messageLink);
        if (!dmInfo) {
          return sendErrorAndHelp(message, "No DM record found for the provided message link.", getHelpEmbed('helpDmDelete'));
        }

        const { channelId, messageId } = dmInfo;

        const channel = client.channels.cache.get(channelId);
        if (!channel) {
          return sendErrorAndHelp(message, "DM's Channel not found.", getHelpEmbed('helpDmDelete'));
        }

        await channel.messages.delete(messageId);
        message.react('✅');
        dmRecords.delete(messageLink);
        message.reply("DM message deleted successfully.");
      } catch (error) {
        console.error("Error deleting message:", error);
        return sendErrorAndHelp(message, "An error occurred while trying to delete the DM message.", getHelpEmbed('helpDmDelete'));
      }

    } else {
      const userId = subCommand;
      const dmMessage = args.join(" ");

      if (!userId) {
        return sendErrorAndHelp(message, "Please enter User ID you want to DM.", getHelpEmbed('helpDM'));
      }
      if (!userId.match(/^\d+$/)) {
        return sendErrorAndHelp(message, "Invalid user ID. Please enter a valid numeric user ID.", getHelpEmbed('helpDM'));
      }
      if (!dmMessage) {
        return sendErrorAndHelp(message, "Please enter a message to send as a DM.", getHelpEmbed('helpDM'));
      }

      let targetUser;
      try {
        targetUser = await client.users.fetch(userId);
      } catch (error) {
        console.error("Error fetching user:", error);
        return sendErrorAndHelp(message, "User with the provided ID not found.", getHelpEmbed('helpDM'));
      }

      const guildMember = message.guild.members.cache.get(userId);
      if (!guildMember) {
        return message.reply("Cannot send message to this user - (user not on server).");
      }

      const confirmEmbed = new MessageEmbed()
        .setTitle("Are you sure you want to send this message?")
        .setDescription(`${dmMessage}\n\n**User:** <@${userId}>\n${attachmentsList(message.attachments)}`)
        .setColor(null)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, format: 'png', size: 256 }))
        .setTimestamp()
      const confirmButtons = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('done')
          .setLabel('Done')
          .setStyle('SUCCESS'),
        new MessageButton()
          .setCustomId('cancel')
          .setLabel('Cancel')
          .setStyle('DANGER')
      );

      const confirmMessage = await message.reply({ embeds: [confirmEmbed], components: [confirmButtons] });

      function attachmentsList(attachments) {
        if (attachments.size === 0) return "**Attachments:** None";
        const attachmentUrls = attachments.map(attachment => `- ${attachment.url}`).join("\n");
        return `**Attachments:**\n${attachmentUrls}`;
      }

      const filter = i => ['done', 'cancel'].includes(i.customId) && i.user.id === message.author.id;
      const collector = confirmMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'done') {
          const options = {
            content: dmMessage,
            files: message.attachments.map(attachment => new MessageAttachment(attachment.url))
          };

          try {
            const sentMessage = await targetUser.send(options);
            const messageId = sentMessage.id;
            message.react('✅');
            const channelLinkContent = `\`https://discord.com/channels/@me/${targetUser.dmChannel.id}/${messageId}\``;
            const content = `${channelLinkContent}`;
            const channelLink = `https://discord.com/channels/@me/${targetUser.dmChannel.id}/${messageId}`;

            dmRecords.set(channelLink, {
              userId: targetUser.id,
              userName: targetUser.username,
              userAvatar: targetUser.displayAvatarURL(),
              contentBeforeEdit: dmMessage,
              channelId: targetUser.dmChannel.id,
              messageId: messageId
            });            

            const logEmbed = new MessageEmbed()
              .setTitle(`DM sent to ${targetUser.username} as ${client.user.username}`)
              .setDescription(`${dmMessage}\n\n\n<@${message.author.id}> sent a DM to <@${targetUser.id}>`)
              .setColor('RED')
              .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
              .setThumbnail(targetUser.displayAvatarURL())
              .setFooter({ text: `User ID: ${targetUser.id}` })
              .setTimestamp();

            const logChannel = client.channels.cache.get('1147531648976564334');

            if (message.attachments.size > 0) {
              const attachments = message.attachments.map(attachment => attachment.url);
              logChannel.send({ content, embeds: [logEmbed], files: attachments });
            } else {
              logChannel.send({ content, embeds: [logEmbed] });
            }
          } catch (error) {
            if (error.code === 50007) {
              return message.reply(`Cannot send a DM to <@${targetUser.id}> - their DMs are closed.`);
            } else {
              console.error("Error sending DM:", error);
              message.reply("An error occurred while sending DM.");
            }
          }

        } else if (interaction.customId === 'cancel') {
          message.reply("Sending DM canceled.");
        }
        collector.stop();
        interaction.deferUpdate();
      });

      collector.on('end', () => {
        confirmMessage.edit({ components: [] });
      });
    }
  },
};


function createErrorEmbed(description) {
  return {
    title: "Command error!",
    description: "```elixir\n" + description + "\n```",
    color: 16711680
  };
}


function sendErrorAndHelp(message, errorText, helpEmbed) {
  const errorEmbed = createErrorEmbed(errorText);
  return message.reply({ embeds: [errorEmbed, helpEmbed] });
}
