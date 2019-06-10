const { nowInTimeStamp } = require('./src/utils/time');

const syncMatches = () => {
  console.log('Sync matches at ', nowInTimeStamp());
}

module.exports = syncMatches;