const Chat = require('../models/chat');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'DELETE',
  path: '/chat/start',
  config: {
    tags: ['api'],
    description: 'This api for removing start button action in chat bot',
    notes: 'Start chatting to facebook user',
    validate: {
      options: { allowUnknown: true }
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
        
        return await chat.removeStartButton();
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

