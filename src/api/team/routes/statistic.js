const Team = require('../models/team');
const Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/team/{season}/statistic',
  config: {
    tags: ['api'],
    description: 'This api for get statistic of all teams',
    notes: 'Performance of team',
    validate: {
      options: { allowUnknown: true },
      params: {
        season: Joi.string().required()
          .description('Season')
          .example('2018 - 2019')
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
      const { server: { logger, host, version, dbCon } } = req;

      const team = new Team({ logger, host, version, dbCon });
      const { season } = req.params;
      
      return team.statistic(season)
        .then(res => reply(res));
    }
  }
};

