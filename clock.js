const schedule = require('node-schedule');
const syncMatches = require('./syncMatchesJob');

const job = schedule.scheduleJob('0 * * * * *', syncMatches);

console.log('START CLOCK NOW');
