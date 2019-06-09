const Routes = require('./routes');
const DBConnector = require('../../connector/db');
const { createLogger, format, transports } = require('winston');

const internals = {};

internals.applyRoutes = (server) => {
  server.route(Routes);
};

exports.plugin = {
  name: 'leaderboard',
  register: async function(server, opts) {
    const { config } = opts;
    const { bot } = config.resources;
  
    const dbCon = new DBConnector(config.resources.db);
    dbCon.createSchemas();

    const logger = createLogger({
      format: format.combine(
        format.splat(),
        format.simple()
      ),
      transports: [new transports.Console()]
    });

    server.ext('onPreHandler', async (request, h) => {
      request.server.logger = logger;
      request.server.dbCon = dbCon;
      Object.assign(request.server);
      return h.continue;
    });
  
    server.events.on('start', () => {
      dbCon.connect()
      .then(() => {})
      .catch((err) => {
        console.log('Couldn\'t connect to MongoDB. Error: ', err);
      });
    });
  
    server.dependency([
      'swagger'
    ], internals.applyRoutes);
  }
};