const Leaderboard = require('../models/leaderboard');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'GET',
  path: '/leaderboard/{leagueId}/{season}',
  config: {
    tags: ['api'],
    description: 'This api for get leaderboard by league id',
    notes: 'Get leaderboard by league id',
    validate: {
      options: { allowUnknown: true },
      params: {
        leagueId: Joi.number().required()
          .description('Number Id')
          .example('14'),
        season: Joi.string().required()
          .description('Season of the league')
          .example('2017-2018')
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
      const { server: { logger, dbCon }, params: { leagueId, season } } = req;
      try {
        const leaderboard = new Leaderboard({ logger, dbCon });
        
        return await leaderboard.get(leagueId, season);
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

