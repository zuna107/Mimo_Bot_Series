const { checkPermission } = require('../../../handlers/permissionsHandler');
const { getHelpEmbed } = require('../../../handlers/helpHandler')
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'say',
    description: 'Mengirim, mengedit, atau menghapus pesan.',
    async execute(message, args) {
        // Check permission using handler
        if (!checkPermission(message)) {
            return; // If user doesn't have permission, stop execution
        }
    
        // Jika tidak ada argumen yang diberikan
        if (!args.length) {
            return sendEmbedErrorAndHelp(message, 'Argument [channel] and [message] is missing', getHelpEmbed('helpSay'));
        }

        // Jika subcommand adalah "del"
        if (args[0] === 'del') {
            args.shift(); // Menghapus subcommand dari args

            // Ambil link pesan dari argumen pertama
            const messageLink = args.shift();

            if (!messageLink) {
                return sendEmbedErrorAndHelp(message,'Enter the message link you want to delete.', getHelpEmbed('helpSayDelete'));
            }

            // Ekstrak channel ID dan message ID dari link pesan
            const match = messageLink.match(/\/channels\/(\d+)\/(\d+)\/(\d+)/);
            const channelID = match ? match[2] : null;
            const messageID = match ? match[3] : null;

            if (!channelID || !messageID) {
                console.error("Error: Invalid message link");
                return sendEmbedErrorAndHelp(message,"Invalid message link.", getHelpEmbed('helpSayDelete'));
            }

            // Cari channel berdasarkan ID
            const channel = message.guild.channels.cache.get(channelID);

            if (!channel) {
                console.error(`Error: Channel not found with ID ${channelID}`);
                return sendEmbedErrorAndHelp(message,'Channel with ID not found.', getHelpEmbed('helpSayDelete'));
            }

            // Hapus pesan dengan message ID
            channel.messages.fetch(messageID)
                .then(msg => {
                    msg.delete()
                        .then(() => {
                            message.react('✅').catch(err => {
                                console.error(err);
                            });
                        })
                        .catch(err => {
                            console.error(err);
                            message.channel.send("An error occurred while deleting a message.");
                        });
                })
                .catch(err => {
                    console.error(err);
                    return sendEmbedErrorAndHelp(message,'An error occurred while fetching a message.', getHelpEmbed('helpSayDelete'));
                });

        } else if (args[0] === 'edit') {
            args.shift(); // Menghapus subcommand dari args
        
            // Cek apakah command memiliki argumen yang cukup
            if (args.length < 2) {
                return sendEmbedErrorAndHelp(message,'Format: m!say edit [bot message link] [new message]', getHelpEmbed('helpSayEdit'));
            }
        
            const messageLink = args.shift(); // Ambil link pesan dari argumen pertama
            const newMessage = args.join(' '); // Gabungkan sisa argumen menjadi pesan baru
        
            try {
                // Ambil ID pesan dari link yang diberikan
                const match = messageLink.match(/\/(\d+)\/(\d+)$/);
        
                if (!match) {
                    console.error("Error: Invalid message link");
                    return sendEmbedErrorAndHelp(message,'Invalid message link.', getHelpEmbed('helpSayEdit'));
                }
        
                const [_, channelID, messageId] = match;
        
                try {
                    // Ambil pesan dari channel berdasarkan ID pesan
                    const editedMessage = await message.channel.messages.fetch(messageId);
        
                    // Edit pesan
                    await editedMessage.edit(newMessage);
        
                    // Dapatkan permalink untuk pesan yang diedit
                    const permalink = editedMessage.url;
        
                    // Kirim pesan dengan link ke pesan yang telah diedit
                    message.reply(`Message edited ${permalink}`);
                } catch (error) {
                    if (error.code === 10008) {
                        // Pesan tidak ditemukan
                        return sendEmbedErrorAndHelp(message,'Invalid message link or message not found.', getHelpEmbed('helpSayEdit'));
                    } else if (error.code === 50005) {
                        // Tidak dapat mengedit pesan dari pengguna lain
                        return sendEmbedErrorAndHelp(message,'Incorrect or invalid bot message link.', getHelpEmbed('helpSayEdit'));
                    } else {
                        // Kesalahan lain yang tidak diharapkan
                        console.error("Error:", error);
                        return message.channel.send("An error occurred while trying to edit a message.");
                    }
                }
            } catch (error) {
                console.error("Error:", error);
                message.channel.send('An error occurred while trying to edit a message.');
            }
        } else {
            //kembali ke perintah utama "say"
            // Ambil channel ID dari argumen pertama
            const channelArg = args.shift();
        
            // Cari channel berdasarkan ID atau mention channel
            const channel = message.guild.channels.cache.get(channelArg.replace(/\D/g, '')) || message.mentions.channels.first();
        
            if (!channel) return sendEmbedErrorAndHelp(message,'Channel with ID or mention invalid or not found.', getHelpEmbed('helpSay'));
        
            const text = args.join(" ");
            const hasText = text && text.trim().length > 0;
            const hasAttachments = message.attachments.size > 0;
        
            if (!hasText && !hasAttachments) {
                return sendEmbedErrorAndHelp(message,'Please enter a message or upload a picture.', getHelpEmbed('helpSay'));
            }
        
            // Kirim pesan bersama dengan semua lampiran jika ada
            channel.send({
                content: hasText ? text : null, // Gunakan null jika teks tidak ditemukan
                files: hasAttachments ? message.attachments.map(attachment => attachment) : null
            })
            .then(sentMessage => {
                // Jika pesan berhasil dikirim, buat pesan yang berisi link pesan tersebut
                const messageLink = `${sentMessage.url}`;
                // Balas pesan dengan link pesan yang terkirim
                message.reply(messageLink)
                    .catch(err => {
                        console.error(err);
                    });
            })
            .catch(err => {
                console.error(err);
                message.channel.send("An error occurred while sending a message.");
            });
        }
        
    },
};



// Fungsi untuk membuat pesan embed error
function createEmbedErrorEmbed(description) {
    return new MessageEmbed({
        title: "Command error!",
        description: "```elixir\n" + description + "\n```",
        color: 16711680
    });
  }
  
  
  function sendEmbedErrorAndHelp(message, errorText, helpEmbed) {
    const errorEmbed = createEmbedErrorEmbed(errorText);
    return message.reply({ embeds: [errorEmbed, helpEmbed] });
  }
  