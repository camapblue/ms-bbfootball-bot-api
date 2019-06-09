const inert = require('inert');
const vision = require('vision');
const swagger = require('hapi-swagger');

exports.plugin = {
  name: 'swagger',
  register: async function(server, opts) {
    const { config } = opts;

    const plugins = [
      {
        plugin: inert,
        select: ['docs']
      },
      {
        plugin: vision,
        select: ['docs']
      },
      {
        plugin: swagger,
        select: ['docs'],
        cache: { expiresIn: 24 * 60 * 60 * 1000 },
        options: {
          info: {
            title: config.description,
            version: config.api.version
          },
          securityDefinitions: {
            Bearer: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header'
            }
          },
          documentationPath: config.docs.path,
        }
      },
    ];

    await server.register(plugins);
  }
};