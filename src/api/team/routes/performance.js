const Team = require('../models/team');
const Joi = require('joi');

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
    handler: function (req, reply) {
      const { server: { logger, host, dbCon } } = req;

      const team = new Team({ logger, host, dbCon });
      const { teamId } = req.params;
      const { number } = req.query;
      
      return team.performance({ teamId, numberMatches: number !== undefined ? parseInt(number) : 5 })
        .then(res => reply(res));
    }
  }
};

