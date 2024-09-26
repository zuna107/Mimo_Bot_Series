require("dotenv").config();

module.exports = {
  token: process.env.TOKEN || '', 
  prefix: process.env.PREFIX || '!', 
  clientId: process.env.CLIENT_ID || 'CLIENT_ID', 
  guildId: process.env.GUILD_ID || 'GUILD_ID',
  dbUri: process.env.MONGO_URI || '',
  embedColor: process.env.COlOR || '#6a8bf2',
  targetRoleID: process.env.TARGET_ROLE_ID || 'TARGET_ROLE_MUTE',
  allowedRoleIds: process.env.ALLOWED_ROLE_IDS?.split(',') || [
    'ALLOWED_ROLE_ID', 
    'ALLOWED_ROLE_ID'
  ],
  excludedRoleIDs: process.env.EXCLUDED_ROLE_IDS?.split(',') || [
    'EXCLUDED_ROLE_ID', 
    'EXCLUDED_ROLE_ID' 
  ],
  excludedChannelIds: process.env.EXCLUDED_CHANNEL_IDS?.split(',') || [
    'EXCLUDED_CHANNEL_ID', 
    'EXCLUDED_CHANNEL_ID'
  ],
};
