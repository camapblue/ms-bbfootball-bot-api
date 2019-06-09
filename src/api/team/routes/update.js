const Team = require('../models/team');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'POST',
  path: '/team',
  config: {
    tags: ['api'],
    description: 'This api for update all teams from bbfootball',
    notes: 'Update all teams',
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
      const { server: { logger, host, version, dbCon } } = req;
      try {
        const team = new Team({ logger, host, version, dbCon });
        
        return await team.update();
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

