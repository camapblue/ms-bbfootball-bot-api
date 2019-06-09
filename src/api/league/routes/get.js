const League = require('../models/league');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'GET',
  path: '/league',
  config: {
    tags: ['api'],
    description: 'This api for get all leagues from bbfootball',
    notes: 'Get all leagues',
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
      const { server: { logger, host, version } } = req;
      try {
        const league = new League({ logger, host, version });
        
        return await league.get();
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

