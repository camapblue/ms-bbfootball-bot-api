const mongoose = require('mongoose');
const LeaderboardSchema = require('../db/schemas/leaderboard-schema');
const MatchSchema = require('../db/schemas/match-schema');

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
      hostname, port, database, username, password, db_uri
    } = opts;
    console.log('DB URI =', db_uri);

    mongoose.set('debug', opts.debug);
    this.db = mongoose;
    this.user = username;
    this.pass = password;
    this.hostname = hostname;
    this.port = port;
    this.database = database;
    this.dbURI = db_uri;
    return this;
  }

  connect() {
    let connectionURI = this.dbURI;
    if (connectionURI === undefined) {
      console.log('CONNECTION DB =', this.hostname, ' PORT =', this.port, ' DATABASE =', this.database);
      connectionURI = `mongodb://${this.hostname}:${this.port}/${this.database}`;
    };
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
    this.dbSchema.match = new MatchSchema(mongoose);
  }
}

module.exports = DBConnector;
