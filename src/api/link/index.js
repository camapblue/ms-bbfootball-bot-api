const BotUser = require('./models/bot-user');
const Routes = require('./routes');

const internals = {};

internals.applyRoutes = (server, next) => {
  server.route(Routes);
  next();
};

exports.register = (server, opts, next) => {
  const botUser = new BotUser();

  server.ext('onPreHandler', (request, reply) => {
    Object.assign(request.server, { botUser });
    reply.continue();
  });

  server.dependency([
    'swagger'
  ], internals.applyRoutes);

  return next();
};

exports.register.attributes = {
  name: 'link'
};
