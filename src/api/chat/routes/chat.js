const Chat = require('../models/chat');
const Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/chat',
  config: {
    tags: ['api'],
    description: 'This api for sending a message to facebook user',
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
    handler: function (req, reply) {
      const { services: { logger } } = this.options;

      const chat = new Chat({ logger });
      const { appFbId, message } = req.payload;

      return chat.chatTo({ appFbId, message })
        .then(res => reply(res));
    }
  }
};

