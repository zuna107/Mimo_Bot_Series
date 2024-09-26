// editcommandsHandler.js

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.author.bot) return;

        // Periksa apakah pesan sebelumnya dan sesudahnya memiliki prefix yang sama
        const prefix = require('../config').prefix;
        if (!oldMessage.content.startsWith(prefix) || !newMessage.content.startsWith(prefix)) return;

        const newArgs = newMessage.content.slice(prefix.length).trim().split(/ +/);

        const commandName = newArgs.shift().toLowerCase();

        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            // Jalankan perintah dengan pesan yang diperbarui dan argumen yang diperbarui
            await command.execute(newMessage, newArgs, client);
        } catch (error) {
            console.error(error);
            await newMessage.reply('Terjadi kesalahan saat menjalankan perintah.');
        }
    },
};

