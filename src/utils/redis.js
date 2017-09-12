const redis = require('../../config/redis');
const { generateCodeNumber } = require('./string');
const { nowInTimeStamp, isExpired } = require('./time');

// generate new code, create key value with code
const setAppFbId = (appFbId, username) => {
  const code = generateCodeNumber();
  const now = nowInTimeStamp();
  const codeNumber = `${username}|${code}`;
  return redis.hmset([
    'BOT_USER',
    codeNumber, `${appFbId}|${now}`
  ]);
};

// check code number with username and code
const checkCodeNumber = (username, code) => {
  const codeNumber = `${username}|${code}`;
  return new Promise((resolve) => {
    redis.hget('BOT_USER', codeNumber, (err, value) => {
      const comps = value.split('|');
      const expired = isExpired(comps[1]);
      resolve({ check: !expired });
    });
  });
};

// get app fb id based on username and code
const getAppFbId = (username, code) => {
  const codeNumber = `${username}|${code}`;
  return new Promise((resolve) => {
    redis.hget('BOT_USER', codeNumber, (err, value) => {
      const comps = value.split('|');
      resolve({ appFbId: comps[0] });
    });
  });
};

// store bot fb id base on app fb id
const setBotFbId = (appFbId, botFbId) => {
  return redis.hmset([
    `BOT_USER_${appFbId}`,
    'botFbId', botFbId
  ]);
};

// get bot fb id by app fb id
const getBotFbId = (appFbId) => {
  return new Promise((resolve) => {
    redis.hget(`BOT_USER_${appFbId}`, 'botFbId', (err, botFbId) => {
      resolve(botFbId);
    });
  });
};

module.exports = {
  setAppFbId,
  checkCodeNumber,
  getAppFbId,
  setBotFbId,
  getBotFbId
};
