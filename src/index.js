// index.js
//

// Application entrypoint. Actually starts the server.
const { server, plugins } = require('./server');

const init = async () => {
  await server.register(plugins);
  
  await server.start();
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();