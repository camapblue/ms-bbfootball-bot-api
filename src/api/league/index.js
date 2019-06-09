const Routes = require('./routes');
const { createLogger, format, transports } = require('winston');

const internals = {};

internals.applyRoutes = (server) => {
  server.route(Routes);
};

exports.plugin = {
  name: 'league',
  register: async function(server, opts) {
    const { config } = opts;
    const { bbfootballConnector: { host, version } } = config.resources;
  
    const logger = createLogger({
      format: format.combine(
        format.splat(),
        format.simple()
      ),
      transports: [new transports.Console()]
    });

    server.ext('onPreHandler', async (request, h) => {
      request.server.logger = logger;
      request.server.host = host;
      request.server.version = version;
      Object.assign(request.server);
      return h.continue;
    });
  
    server.dependency([
      'swagger'
    ], internals.applyRoutes);
  }
};