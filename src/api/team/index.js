const Routes = require('./routes');
const { createLogger, format, transports } = require('winston');

const internals = {};

internals.applyRoutes = (server, next) => {
  server.route(Routes);
  next();
};

exports.register = (server, opts, next) => {
  const { config } = opts;

  const { bbfootballConnector: { host } } = config.resources;
  
  const logger = createLogger({
    format: format.combine(
      format.splat(),
      format.simple()
    ),
    transports: [new transports.Console()]
  });

  server.ext('onPreHandler', (request, reply) => {
    request.server.logger = logger;
    request.server.host = host;
    Object.assign(request.server);
    reply.continue();
  });

  server.dependency([
    'swagger'
  ], internals.applyRoutes);

  return next();
};

exports.register.attributes = {
  name: 'team'
};
