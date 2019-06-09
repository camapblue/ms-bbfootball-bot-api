const Chat = require('../models/chat');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'POST',
  path: '/chat/start',
  config: {
    tags: ['api'],
    description: 'This api for update start button action in chat bot',
    notes: 'Start chatting to facebook user',
    validate: {
      options: { allowUnknown: true },
      payload: Joi.object().keys({
        payload: Joi.string().required()
          .description('Chat bot start payload')
          .example('hello world')
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
      const { server: { logger, bot } } = req;
      try {
        const chat = new Chat({ logger, bot });
        const { payload } = req.payload;
        
        return await chat.updateStartButton({ payload });
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

