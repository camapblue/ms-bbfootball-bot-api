const Team = require('../models/team');

module.exports = {
  method: 'POST',
  path: '/team',
  config: {
    tags: ['api'],
    description: 'This api for update all teams from bbfootball',
    notes: 'Update all teams',
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
      
      return team.update()
        .then(res => reply(res));
    }
  }
};

