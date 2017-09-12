const inert = require('inert');
const vision = require('vision');
const swagger = require('hapi-swagger');

module.exports.register = (server, opts, next) => {
  const { config } = opts;

  const plugins = [
    {
      register: inert,
      select: ['docs']
    },
    {
      register: vision,
      select: ['docs']
    },
    {
      register: swagger,
      select: ['docs'],
      cache: { expiresIn: 24 * 60 * 60 * 1000 },
      options: {
        info: {
          title: config.description,
          version: config.api.version
        },
        documentationPath: config.docs.path,
      }
    },
  ];

  server.register(plugins, (err) => {
    if (err) {
      console.error('error loading plugin ', err);
    }
  });

  return next();
};

module.exports.register.attributes = {
  name: 'swagger'
};
