const Leaderboard = require('../models/leaderboard');
const Joi = require('joi');

// leagueId, homeId, homeGoals, awayId, awayGoals

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
          .example('123'),
        matches: Joi.array().items(
          Joi.object({
            homeId: Joi.number().required()
            .description('Home team id')
            .example('4325'),
          homeGoals: Joi.number().required()
            .description('Total goals home team achieved')
            .example('2'),
          awayId: Joi.number().required()
            .description('Away team id')
            .example('3325'),
          awayGoals: Joi.number().required()
            .description('Total goals away team achieved')
            .example('3')
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
    handler: function (req, reply) {
      const { server: { logger, dbCon } } = req;

      const leaderboard = new Leaderboard({ logger, dbCon });
      const { leagueId, matches } = req.payload;

      return leaderboard.updateMatches(leagueId, matches)
        .then(res => reply(res));
    }
  }
};

