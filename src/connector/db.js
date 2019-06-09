const mongoose = require('mongoose');
const MatchSchema = require('../db/schemas/match-schema');
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
      hostname, port, database, username, password, db_uri
    } = opts;
    // console.log('DB URI =', db_uri);

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
      connectionURI = `mongodb://${this.hostname}:${this.port}/${this.database}`;
    };
    const options = {
      user: this.user,
      pass: this.pass,
      useNewUrlParser: true,
      promiseLibrary
    };

    if (this.db.connection.readyState !== 0) {
      return Promise.resolve();
    }

    console.log('CONNECTION URI =', connectionURI);
    return this.db.connect(connectionURI, options, (e) => {
      if (e !== null) {
        console.log('CONNECT TO DB GET ERROR =', e);
        return Promise.reject(new InvalidOperationError(`ERROR connecting to database: ${connectionURI}`));
      } else {
        console.log('START CONNECT TO DB SUCCESSFUL');
      }
    })
    .catch(() => {
      return Promise.reject(new InvalidOperationError(`ERROR connecting to database: ${connectionURI}`));
    });
  }

  createSchemas() {
    this.dbSchema = {};
    this.dbSchema.match = new MatchSchema(this.db);
    this.dbSchema.leaderboard = new LeaderboardSchema(this.db);
  }

  getModel(key, schema = null) {
    let model = null;
    try {
      model = this.db.model(key);
    } catch (e) {
      if (schema !== null) {
        model = this.db.model(key, schema);
      } else {
        model = this.db.model(key, this.dbSchema[`${key}`]);
      }
    } finally {
      return model;
    }
  }
}

module.exports = DBConnector;
