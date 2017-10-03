const mongoose = require('mongoose');
const LeaderboardSchema = require('../db/schemas/leaderboard-schema');

const promiseLibrary = global.Promise;
mongoose.Promise = promiseLibrary;

/**
 * Class that wrap db adapter
 *
 * @class DBConnector
 */
class DBConnector {

  constructor(opts) {
    const {
      hostname, port, database, username, password
    } = opts;

    mongoose.set('debug', opts.debug);
    this.db = mongoose;
    this.user = username;
    this.pass = password;
    this.hostname = hostname;
    this.port = port;
    this.database = database;
    return this;
  }

  connect() {
    const connectionURI = `mongodb://${this.hostname}:${this.port}/${this.database}`;
    const options = {
      user: this.user,
      pass: this.pass,
      useMongoClient: true,
      promiseLibrary
    };

    if (this.db.connection.readyState !== 0) {
      return Promise.resolve();
    }

    return this.db.connect(connectionURI, options, () => {})
    .then(() => {
      return Promise.resolve();
    })
    .catch(() => {
      return Promise.reject(new InvalidOperationError(`ERROR connecting to database: ${connectionURI}`));
    });
  }

  createSchemas() {
    this.dbSchema = {};
    this.dbSchema.leaderboard = new LeaderboardSchema(mongoose);
  }
}

module.exports = DBConnector;
