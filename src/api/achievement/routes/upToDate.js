const Achievement = require('../models/achievement');
const Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/achievement/upToDate',
  config: {
    tags: ['api'],
    description: 'This api for up to date all achievement of particular user',
    notes: 'Up to date achievement of particular user',
    plugins: {
      'hapi-swagger': {
        responses: {
          200: { description: 'Success' },
          400: { description: 'Bad Request' },
          500: { description: 'Internal Error' }
        }
      }
    },
    handler: function (req, reply) {
      const { server: { logger, host, version } } = req;

      const achievement = new Achievement({ logger, host, version });

      return achievement.upToDate()
        .then(res => reply(res));
    }
  }
};