// editcommandsHandler.js

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        // Periksa apakah pesan tersebut dari bot atau tidak
        if (oldMessage.author.bot) return;

        // Periksa apakah pesan sebelumnya dan sesudahnya memiliki prefix yang sama
        const prefix = require('../config').prefix;
        if (!oldMessage.content.startsWith(prefix) || !newMessage.content.startsWith(prefix)) return;

        // Pisahkan argumen dari pesan yang diperbarui
        const newArgs = newMessage.content.slice(prefix.length).trim().split(/ +/);

        // Dapatkan nama perintah dari pesan
        const commandName = newArgs.shift().toLowerCase();

        // Temukan perintah yang sesuai dengan nama
        const command = client.commands.get(commandName);

        // Jika perintah tidak ditemukan, keluar
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

