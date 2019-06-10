const Match = require('../models/match');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'GET',
  path: '/match/groupByLeague',
  config: {
    tags: ['api'],
    description: 'This api for get all matches is running that group by league',
    notes: 'Get all matches group by league',
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
      const { server: { logger } } = req;
      try {
        const match = new Match({ logger });
        
        return await match.groupByLeague();
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

