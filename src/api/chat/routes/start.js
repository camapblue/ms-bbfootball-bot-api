const Chat = require('../models/chat');
const Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/start',
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
    handler: function (req, reply) {
      const { server: { logger, bot } } = req;

      const chat = new Chat({ logger, bot });
      const { payload } = req.payload;

      return chat.updateStartButton({ payload })
        .then(res => reply(res));
    }
  }
};

