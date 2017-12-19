const Chat = require('../models/chat');
const Joi = require('joi');

module.exports = {
  method: 'DELETE',
  path: '/start',
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
    handler: function (req, reply) {
      const { server: { logger, bot } } = req;

      const chat = new Chat({ logger, bot });

      return chat.removeStartButton()
        .then(res => reply(res));
    }
  }
};

