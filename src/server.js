const hapi = require('hapi');

const Config = require('../config');

const swagger = require('./api/swagger');
const chat = require('./api/chat');
const link = require('./api/link');
const leaderboard = require('./api/leaderboard');
const league = require('./api/league');
const team = require('./api/team');

const server = new hapi.Server();

server.connection([
  {
    host: Config.get('/host'),
    port: Config.get('/port'),
    routes: { cors: true },
    labels: ['api', 'docs', 'link']
  }
]);

const plugins = [
  {
    register: swagger,
    select: ['api', 'docs'],
    options: {
      config: Config.get('/')
    }
  },
  {
    register: link,
    select: ['api', 'docs', 'link'],
    options: {
      config: Config.get('/')
    }
  },
  {
    register: chat,
    select: ['api', 'docs', 'chat'],
    options: {
      config: Config.get('/')
    }
  },
  {
    register: leaderboard,
    select: ['api', 'docs', 'chat'],
    options: {
      config: Config.get('/')
    }
  },
  {
    register: league,
    select: ['api', 'docs', 'chat'],
    options: {
      config: Config.get('/')
    }
  },
  {
    register: team,
    select: ['api', 'docs', 'chat'],
    options: {
      config: Config.get('/')
    }
  }
];

server.register(plugins, (err) => {
  if (err) {
    console.error('error loading plugin ', err);
  }
});

// Export the server. If you are running unit tests, just require it and
// call 'inject'. If you are running integration tests or want to start the
// server, you'll need to call 'start'. See index.js.
module.exports = server;
