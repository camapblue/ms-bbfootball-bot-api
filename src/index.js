// index.js
//

// Application entrypoint. Actually starts the server.
const server = require('./server');

// Start the server, detail out what's going on.
server.start((startError) => {
  if (startError) {
    console.log(`An error occurred starting the server: ${startError}`);
    throw startError;
  }

  server.connections.forEach((conn) => {
    const label = conn.settings.labels[0];
    const { protocol, host, port } = conn.info;

    console.log(`${label} running at: ${protocol}://${host}:${port}`);
  });
});
