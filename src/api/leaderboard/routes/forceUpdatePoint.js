const Leaderboard = require('../models/leaderboard');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'POST',
  path: '/leaderboard/{leagueId}/{season}/{teamId}/point',
  config: {
    tags: ['api'],
    description: 'This api for update team point',
    notes: 'Update team point as soon as a match finished',
    validate: {
      options: { allowUnknown: true },
      params: {
        leagueId: Joi.number().required()
          .description('Number Id')
          .example('14'),
        season: Joi.string().required()
          .description('Season of the league')
          .example('2017-2018'),
        teamId: Joi.number().required()
          .description('Team Id')
          .example('232')
      },
      payload: Joi.object().keys({
        point: Joi.number().required()
          .description('League id')
          .example('34')
      }).label('Update team points')
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
      const { server: { logger, dbCon }, params: { leagueId, season, teamId }, payload: { point } } = req;
      try {
        const leaderboard = new Leaderboard({ logger, dbCon });
        
        return await leaderboard.forceToUpdateTeamPoint(leagueId, season, teamId, point);
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

