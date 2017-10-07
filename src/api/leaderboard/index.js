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
  // mongodb://heroku_dfmcskv4:3a8o3aufdivbakm6p8uv6h84hl@ds111535.mlab.com:11535/heroku_dfmcskv4
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
      console.log('Couldn\'t connect to MongoDB. Error: ', err);
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
