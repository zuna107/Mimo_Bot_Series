// handlers/permissionsHandler.js
const config = require('../config');

function checkPermission(message) {
  const { allowedRoleIds } = config;

  if (message.guild && message.guild.members) {
    const member = message.guild.members.cache.get(message.author.id);

    if (!member.roles.cache.some((role) => allowedRoleIds.includes(role.id))) {
      const replyMessage = message.reply('kamu tidak memiliki izin untuk menggunakan perintah ini.');

      setTimeout(() => {
        message.delete().catch(console.error);
        replyMessage.then((msg) => msg.delete()).catch(console.error);
      }, 3000);

      return false;
    }
  } else {
    console.error('Guild or members cache is not accessible.');
    return false;
  }

  return true;
}

module.exports = { checkPermission };
