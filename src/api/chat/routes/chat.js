const Chat = require('../models/chat');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'POST',
  path: '/chat/to',
  config: {
    tags: ['api'],
    description: 'This api aim to send a message to facebook user',
    notes: 'Start chatting to facebook user',
    validate: {
      options: { allowUnknown: true },
      payload: Joi.object().keys({
        appFbId: Joi.string().required()
          .description('App fb id')
          .example('9001DJI000020'),
        message: Joi.string().required()
          .description('Message for chatting')
          .example('Hey, what\'s up?')
      }).label('Chat payload')
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
      const { server: { logger, bot }, payload: { appFbId, message } } = req;
      try {
        const chat = new Chat({ logger, bot });
        
        return await chat.chatTo({ appFbId, message });
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

