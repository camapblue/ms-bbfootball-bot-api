const BotUser = require('../models/bot-user');
const Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/link/check',
  config: {
    tags: ['api'],
    description: 'This api for check number code for linking account',
    notes: 'Check linking account for chatting Facebook',
    validate: {
      options: { allowUnknown: true },
      payload: Joi.object().keys({
        username: Joi.string().required()
          .description('Username for linking account')
          .example('lequangdao_itm@yahoo.com'),
        code: Joi.string().required()
          .description('Code')
          .example('4325')
      }).label('Check code payload')
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
      const { services: { logger } } = this.options;

      const botUser = new BotUser({ logger });
      const { username, code } = req.payload;

      return botUser.checkCode({ username, code })
        .then(res => reply(res));
    }
  }
};

