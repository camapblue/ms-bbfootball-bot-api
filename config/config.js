const dotenv = require('dotenv');

dotenv.config();

console.log('BB FOOTBALL HOST = ', process.env.BBFOOTBALL_HOST);
console.log('APP VERSION = ', process.env.APP_VERSION);
console.log('REDIS URL = ', process.env.REDIS_URL);
console.log('MONGODB URL = ', process.env.MONGODB_URI);

module.exports = {
  bbfMatchServiceHost: process.env.BBFOOTBALL_HOST,
  bbfMatchServiceApiVersion: process.env.APP_VERSION
}
