const BotUser = require('../models/botUser');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

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
    handler: async (req, h) => {
      const { server: { logger }, payload: { username, code, botFbId } } = req;
      try {
        const botUser = new BotUser({ logger });
        
        return await botUser.storeBotFbId({ username, code, botFbId });
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

