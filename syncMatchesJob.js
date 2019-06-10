const axios = require('axios');
const { bbfMatchServiceHost, bbfMatchServiceApiVersion } = require('./config/config');
const { setLiveMatches } = require('./src/utils/redis');

const syncMatches = async () => {
  let requestUrl = `${bbfMatchServiceHost}match&info=all`;
  const res = await axios.get(requestUrl, { headers: { version: bbfMatchServiceApiVersion } });
  const { data: { matches } } = res;

  await setLiveMatches(matches);
  console.log('SET MATCHES FINISHED =', matches.length);
}

// syncMatches();

module.exports = syncMatches;