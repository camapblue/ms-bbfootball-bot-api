const Team = require('../models/team');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'GET',
  path: '/team/{teamId}/performance',
  config: {
    tags: ['api'],
    description: 'This api for get match results of specific team',
    notes: 'Performance of team',
    validate: {
      options: { allowUnknown: true },
      params: {
        teamId: Joi.number().required()
          .description('Team id')
          .example('14')
      }
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
      const { server: { logger, host, version, dbCon }, params: { teamId }, query: { number } } = req;
      try {
        const team = new Team({ logger, host, version, dbCon });
        
        return await team.performance({ teamId, numberMatches: number !== undefined ? parseInt(number) : 5 });
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

