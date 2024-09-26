require("dotenv").config();

module.exports = {
  token: process.env.TOKEN || '', 
  prefix: process.env.PREFIX || '!', 
  clientId: process.env.CLIENT_ID || '1237728403336204329', 
  guildId: process.env.GUILD_ID || '1146443187016179842',
  dbUri: process.env.MONGO_URI || '',
  embedColor: process.env.COlOR || '#6a8bf2',
  targetRoleID: process.env.TARGET_ROLE_ID || '1274322860592336979',
  allowedRoleIds: process.env.ALLOWED_ROLE_IDS?.split(',') || [
    '997074542629507153', 
    '997155520752390174', 
    '997908438476652624', 
    '1164230979699880064', 
    '1018873244494856252',
    '1146461791598153748'
  ],
  excludedRoleIDs: process.env.EXCLUDED_ROLE_IDS?.split(',') || [
    '997074542629507153', 
    '997155520752390174', 
    '997908438476652624', 
    '1164230979699880064', 
    '1018873244494856252',
    '1146461791598153748'
  ],
  excludedChannelIds: process.env.EXCLUDED_CHANNEL_IDS?.split(',') || [
    '1159004419413774436', 
    '997157992501891172', 
    '997494503910940692', 
    '1152945745226375289'
  ],
};
