const Routes = require('./routes');
const DBConnector = require('../../connector/db');
const { createLogger, format, transports } = require('winston');

const internals = {};

internals.applyRoutes = (server, next) => {
  server.route(Routes);
  next();
};

exports.register = (server, opts, next) => {
  const { config } = opts;
  const dbCon = new DBConnector(config.resources.db);
  dbCon.createSchemas();

  const logger = createLogger({
    format: format.combine(
      format.splat(),
      format.simple()
    ),
    transports: [new transports.Console()]
  });

  server.ext('onPreHandler', (request, reply) => {
    request.server.logger = logger;
    request.server.dbCon = dbCon;
    Object.assign(request.server);
    reply.continue();
  });

  server.on('start', () => {
    dbCon.connect()
    .then(() => {
      console.log('Start DB Connection SUCCESSFUL');
    })
    .catch((err) => {
      throw err;
    });
  });

  server.dependency([
    'swagger'
  ], internals.applyRoutes);

  return next();
};

exports.register.attributes = {
  name: 'leaderboard'
};
