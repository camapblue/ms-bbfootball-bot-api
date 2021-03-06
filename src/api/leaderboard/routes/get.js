const Leaderboard = require('../models/leaderboard');
const Joi = require('joi');

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
    handler: function (req, reply) {
      const { server: { logger, dbCon } } = req;

      const leaderboard = new Leaderboard({ logger, dbCon });
      const { leagueId, season } = req.params;

      return leaderboard.get(leagueId, season)
        .then(res => reply(res));
    }
  }
};

