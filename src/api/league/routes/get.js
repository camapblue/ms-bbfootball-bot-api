const League = require('../models/league');

module.exports = {
  method: 'GET',
  path: '/league',
  config: {
    tags: ['api'],
    description: 'This api for get all leagues from bbfootball',
    notes: 'Get all leagues',
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
      const { server: { logger, host, version } } = req;

      const league = new League({ logger, host, version });
      
      return league.get()
        .then(res => reply(res));
    }
  }
};

