const Leaderboard = require('../models/leaderboard');
const Joi = require('joi');

module.exports = {
  method: 'DELETE',
  path: '/leaderboard/{leagueId}',
  config: {
    tags: ['api'],
    description: 'This api for reset all data of a league',
    notes: 'Reset leaderboard by league id',
    validate: {
      options: { allowUnknown: true },
      params: {
        leagueId: Joi.string().required()
        .description('League Id')
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
    handler: function (req, reply) {
      const { server: { logger, dbCon } } = req;

      const leaderboard = new Leaderboard({ logger, dbCon });
      const { leagueId } = req.params;

      return leaderboard.reset(leagueId)
        .then(res => reply(res));
    }
  }
};

