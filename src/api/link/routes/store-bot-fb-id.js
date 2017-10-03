const BotUser = require('../models/bot-user');
const Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/link/store',
  config: {
    tags: ['api'],
    description: 'This api for storing bot fb id',
    notes: 'Store bot fb id for chatting Facebook',
    validate: {
      options: { allowUnknown: true },
      payload: Joi.object().keys({
        username: Joi.string().required()
          .description('Username for linking account')
          .example('lequangdao_itm@yahoo.com'),
        code: Joi.string().required()
          .description('Code')
          .example('4325'),
        botFbId: Joi.string().required()
          .description('Bot Facebook Id')
          .example('4325FND2343DD')
      }).label('Store bot fb id')
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
      const { username, code, botFbId } = req.payload;

      return botUser.storeBotFbId({ username, code, botFbId })
        .then(res => reply(res));
    }
  }
};

