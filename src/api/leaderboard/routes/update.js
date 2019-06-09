const Leaderboard = require('../models/leaderboard');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'POST',
  path: '/leaderboard',
  config: {
    tags: ['api'],
    description: 'This api for update leaderboard',
    notes: 'Update leaderboard as soon as a match finished',
    validate: {
      options: { allowUnknown: true },
      payload: Joi.object().keys({
        leagueId: Joi.number().required()
          .description('League id')
          .example('34'),
        season: Joi.string().required()
          .description('Season of a league')
          .example('2017-2018'),
        matches: Joi.array().items(
          Joi.object({
            homeId: Joi.number().required()
              .description('Home team id')
              .example('239'),
            homeGoals: Joi.number().required()
              .description('Total goals home team achieved')
              .example('2'),
            awayId: Joi.number().required()
              .description('Away team id')
              .example('240'),
            awayGoals: Joi.number().required()
              .description('Total goals away team achieved')
              .example('3'),
            startTime: Joi.number().required()
              .description('Timestamp of start time of the match')
              .example('1509524904'),
            round: Joi.number()
              .description('Round of match')
              .example('1')
          })
        ).min(1)
        .required()
      }).label('Update leaderboard payload')
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
      const { server: { logger, dbCon }, payload: { leagueId, season, matches } } = req;
      try {
        const leaderboard = new Leaderboard({ logger, dbCon });
        
        return await leaderboard.updateMatches(leagueId, season, matches);
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

