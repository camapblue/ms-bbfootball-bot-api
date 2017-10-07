const Config = require('./index');
const Redis = require('redis');
const Bluebird = require('bluebird');

Bluebird.promisifyAll(Redis.RedisClient.prototype);
Bluebird.promisifyAll(Redis.Multi.prototype);

const { hostname, port, redis_url } = Config.get('/resources/redis');
console.log('REDIS URL =', redis_url);

let client;
if (redis_url !== undefined) {
 client = Redis.createClient(redis_url);
} else {
  console.log('CONNECT REDIS =', port, ' HOST =', hostname);
  client = Redis.createClient(port, hostname);
}

client.on('error', (err) => {
  console.error(`Couldn't connect to redis ${err}`);
});

module.exports = client;
