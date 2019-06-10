const hapi = require('hapi');

const Config = require('../config');

const server = new hapi.Server(
  {
    host: Config.get('/host'),
    port: Config.get('/port'),
    routes: { cors: true }
  }
);

const plugins = [
  {
    plugin: require('./api/swagger'),
    select: ['api', 'docs'],
    options: {
      config: Config.get('/')
    }
  },
  {
    plugin: require('./api/chat'),
    select: ['api', 'docs', 'chat'],
    options: {
      config: Config.get('/')
    }
  },
  {
    plugin: require('./api/link'),
    select: ['api', 'docs', 'link'],
    options: {
      config: Config.get('/')
    }
  },
  {
    plugin: require('./api/leaderboard'),
    select: ['api', 'docs', 'leaderboard'],
    options: {
      config: Config.get('/')
    }
  },
  {
    plugin: require('./api/league'),
    select: ['api', 'docs', 'league'],
    options: {
      config: Config.get('/')
    }
  },
  {
    plugin: require('./api/team'),
    select: ['api', 'docs', 'team'],
    options: {
      config: Config.get('/')
    }
  },
  {
    plugin: require('./api/match'),
    select: ['api', 'docs', 'match'],
    options: {
      config: Config.get('/')
    }
  }
];

// Export the server. If you are running unit tests, just require it and
// call 'inject'. If you are running integration tests or want to start the
// server, you'll need to call 'start'. See index.js.
module.exports = { server, plugins };