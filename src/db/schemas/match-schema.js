/**
 * Class that wrap db leader board schema
 *
 * @class LeaderboardSchema
 */
class MatchSchema {
    constructor(db) {
      const Schema = db.Schema;
      return new Schema({
        leagueId: String,
        leagueName: String,
        season: String,
        homeId: String,
        homeName: String,
        awayId: String,
        awayName: String,
        homeGoals: Number,
        awayGoals: Number,
        startTime: Number,
        result: String
      });
    }
  }
  
  module.exports = MatchSchema;
  