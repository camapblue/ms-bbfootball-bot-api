// @flow

const moment = require('moment');

function nowInTimeStamp(now = new Date()) {
  return moment(now).unix();
}

function isExpired(last, duration = 300, now = new Date()) {
  return moment(now).unix() - last > duration;
}

module.exports = {
  nowInTimeStamp,
  isExpired
};
