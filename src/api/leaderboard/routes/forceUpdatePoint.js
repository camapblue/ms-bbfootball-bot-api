const Leaderboard = require('../models/leaderboard');
const Joi = require('joi');

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
    handler: function (req, reply) {
      const { server: { logger, dbCon } } = req;

      const leaderboard = new Leaderboard({ logger, dbCon });
      const { leagueId, season, teamId } = req.params;
      const { point } = req.payload;

      return leaderboard.forceToUpdateTeamPoint(leagueId, season, teamId, point)
        .then(res => reply(res));
    }
  }
};

