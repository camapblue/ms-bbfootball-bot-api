const BotUser = require('../models/bot-user');
const Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/link/generate',
  config: {
    tags: ['api'],
    description: 'This api for generate code from start linking account',
    notes: 'Start linking account for chatting Facebook',
    validate: {
      options: { allowUnknown: true },
      payload: Joi.object().keys({
        appFbId: Joi.string().required()
          .description('App fb id')
          .example('9001DJI000020'),
        username: Joi.string().required()
          .description('Username')
          .example('lequangdao_itm@yahoo.com')
      }).label('Generate code payload')
    },
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
      const { server: { logger } } = req;

      const botUser = new BotUser({ logger });
      const { appFbId, username } = req.payload;

      return botUser.generateCode({ appFbId, username })
        .then(res => reply(res));
    }
  }
};

