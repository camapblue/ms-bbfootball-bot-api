const Config = require('./index');
const Redis = require('redis');
const Bluebird = require('bluebird');

Bluebird.promisifyAll(Redis.RedisClient.prototype);
Bluebird.promisifyAll(Redis.Multi.prototype);

const { hostname, port } = Config.get('/resources/redis');

const client = Redis.createClient(port, hostname);

client.on('error', (err) => {
  console.error(`Couldn't connect to redis ${err}`);
});

module.exports = client;
