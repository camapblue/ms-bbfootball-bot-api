const Chat = require('./models/chat');
const Routes = require('./routes');

const internals = {};

internals.applyRoutes = (server, next) => {
  server.route(Routes);
  next();
};

exports.register = (server, opts, next) => {
  const chat = new Chat();

  server.ext('onPreHandler', (request, reply) => {
    Object.assign(request.server, { chat });
    reply.continue();
  });

  server.dependency([
    'swagger'
  ], internals.applyRoutes);

  return next();
};

exports.register.attributes = {
  name: 'chat'
};
