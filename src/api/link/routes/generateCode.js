const BotUser = require('../models/botUser');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

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
    handler: async (req, h) => {
      const { server: { logger }, payload: { appFbId, username } } = req;
      try {
        const botUser = new BotUser({ logger });
        
        return await botUser.generateCode({ appFbId, username });
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

