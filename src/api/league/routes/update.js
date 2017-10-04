const League = require('../models/league');

module.exports = {
  method: 'POST',
  path: '/league',
  config: {
    tags: ['api'],
    description: 'This api for update all leagues from bbfootball',
    notes: 'Update all leagues',
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
      const { server: { logger, host } } = req;

      const league = new League({ logger, host });
      
      return league.update()
        .then(res => reply(res));
    }
  }
};

