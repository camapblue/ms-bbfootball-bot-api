const League = require('../models/league');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'POST',
  path: '/league',
  config: {
    tags: ['api'],
    description: 'This api for update all leagues from bbfootball',
    notes: 'Update all leagues',
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
        
        return await league.update();
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

