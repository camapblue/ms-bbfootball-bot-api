/**
 * Class that wrap db leader board schema
 *
 * @class LeaderboardSchema
 */
class LeaderboardSchema {

  constructor(db) {

    const Schema = db.Schema;
    return new Schema({
      leaderboardId: {
        type: Schema.Types.ObjectId,
        default() { return new db.Types.ObjectId(); }
      },
      leagueId: String,
      leagueName: String,
      teamId: String,
      teamName: String,
      standing: Number,
      round: Number,
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
