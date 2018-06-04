// import { process } from 'joi/lib/errors';
require('dotenv').config();

const Confidence = require('confidence');
const pkg = require('../package.json');

const config = {
  name: pkg.name,
  description: pkg.description,
  host: process.env.SERVICE_HOST || '0.0.0.0',
  port: process.env.SERVICE_PORT || 3000,
  api: {
    version: pkg.version
  },
  docs: {
    path: '/docs'
  },
  resources: {
    bbfootballConnector: {
      host: process.env.BBFOOTBALL_HOST || 'https://bb-football-dev.appspot.com/service.php?nav=',
      version: process.env.APP_VERSION || ''
    },
    docker: {
      username: process.env.DOCKER_USERNAME || 'camapblue'
    },
    redis: {
      hostname: process.env.REDIS_HOSTNAME || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      redis_url: process.env.REDIS_URL
    },
    db: {
      hostname: process.env.DB_HOSTNAME || '127.0.0.1',
      port: process.env.DB_PORT || 27017,
      database: process.env.DB_NAME || 'bbfootball',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      debug: process.env.DB_DEBUG || false,
      db_uri: process.env.MONGODB_URI
    },
    bot: {
      settingsHost: process.env.SETTINGS_HOST || 'https://graph.facebook.com/v2.6/me/messenger_profile',
      pageAccessToken: process.env.PAGE_ACCESS_TOKEN || 'EAASTRYFJ6pMBADdDnovcHX6D85ABYjBwrQkxgqKceHcltGqLvuh7uW4wvNQXARaxPNwowsNbjCbYzZBp2wmjghFkNsZBtUDBFxDyvGiqeC7lTC03mtMHmeJjdpZBSAAqUYtGAt857tQaumUSZA5tGKQ8FgOItcoHYJxcN2TIJQZDZD'
    }
  }
};

const store = new Confidence.Store(config);

exports.get = key => store.get(key);
