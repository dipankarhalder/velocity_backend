const dotenv = require('dotenv');
dotenv.config();

const env = {
  PORT: process.env.PORT,
  MONGOURI: process.env.MONGOURI,
  PLATFORM: process.env.PLATFORM,
  JWTSECRET: process.env.JWTSECRET,
  JWTRSECRET: process.env.JWTRSECRET,
  ACCESSTOKENEXPIRY: process.env.ACCESSTOKENEXPIRY,
  REFRESHTOKENEXPIRY: process.env.REFRESHTOKENEXPIRY,
  NODEENV: process.env.NODEENV,
};

module.exports = env;
