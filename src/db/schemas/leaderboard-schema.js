/**
 * Class that wrap db leader board schema
 *
 * @class LeaderboardSchema
 */
class LeaderboardSchema {

  constructor(db) {

    const Schema = db.Schema;
    return new Schema({
      leagueId: String,
      leagueName: String,
      season: String,
      teamId: String,
      teamName: String,
      standing: Number,
      round: Number,
      scored: Number,
      achievedGoals: Number,
      concededGoals: Number,
      numberHomeWin: Number,
      numberHomeDraw: Number,
      numberHomeLose: Number,
      numberAwayWin: Number,
      numberAwayDraw: Number,
      numberAwayLose: Number,
      points: Number
    });
  }
}

module.exports = LeaderboardSchema;
