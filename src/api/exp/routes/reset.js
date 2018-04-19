const Exp = require('../models/exp');
const Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/exp/reset',
  config: {
    tags: ['api'],
    description: 'This api for reset all exp data of all user',
    notes: 'Reset all exp data for all user',
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
      const { server: { logger, host } } = req;

      const exp = new Exp({ logger, host });

      return exp.reset()
        .then(res => reply(res));
    }
  }
};