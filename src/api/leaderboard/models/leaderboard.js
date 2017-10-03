/**
 * @class
 * @name Leaderboard
 */
class Leaderboard {

  constructor(opts) {
    Object.assign(this, opts);

    // create db model
    this.Leaderboard = this.dbCon.db.model('leaderboard', this.dbCon.dbSchema.leaderboard);
  }

  createNewLeaderboard({ leagueId, homeId, homeGoals, awayId, awayGoals}) {
    const homeEntity = new this.Leaderboard({
      leagueId: leagueId,
      leagueName: 'Premier League',
      teamId: homeId,
      teamName: 'MU',
      standing: 1,  // ???
      round: 1,
      achievedGoals: homeGoals,
      concededGoals: awayGoals,
      numberHomeWin: homeGoals > awayGoals ? 1 : 0,
      numberHomeDraw: homeGoals === awayGoals,
      numberHomeLose: homeGoals < awayGoals ? 1 : 0,
      numberAwayWin: 0,
      numberAwayDraw: 0,
      numberAwayLose: 0,
      points: homeGoals > awayGoals ? 3 : (homeGoals === awayGoals ? 1 : 0)
    });

    homeEntity.save((err) => {
      if (err) {
        this.logger.error('Something wrong when creating leaderboard entity', err);
      }
    });

    const awayEntity = new this.Leaderboard({
      leagueId: leagueId,
      leagueName: 'Premier League',
      teamId: awayId,
      teamName: 'Liverpool',
      standing: 1,  // ???
      round: 1,
      achievedGoals: awayGoals,
      concededGoals: homeGoals,
      numberHomeWin: 0,
      numberHomeDraw: 0,
      numberHomeLose: 0,
      numberAwayWin: homeGoals < awayGoals ? 1 : 0,
      numberAwayDraw: homeGoals === awayGoals,
      numberAwayLose: homeGoals > awayGoals ? 1 : 0,
      points: homeGoals < awayGoals ? 3 : (homeGoals === awayGoals ? 1 : 0)
    });

    awayEntity.save((err) => {
      if (err) {
        this.logger.error('Something wrong when creating leaderboard entity', err);
      }
    });
  }

  /**
   ** @param {Number} leagueId
   ** @param {Number} homeId
   ** @param {Number} homeGoals
   ** @param {Number} awayId
   ** @param {Number} awayGoals
   */
  update({ leagueId, homeId, homeGoals, awayId, awayGoals }) {
    return this.Leaderboard.find({ 'leagueId': leagueId, $or: [{ 'teamId': homeId }, { 'teamId': awayId }] },
      (err, items) => {
        if (err) {
          this.logger.error('Something wrong when finding item!', err);
          return Promise.resolve('ERROR NOW');  // add new item
        }
        return items;
      })
    .then((items) => {
      console.log('ITEMS =', items.length);
      if (items.length === 0) {
        this.createNewLeaderboard({ leagueId, homeId, homeGoals, awayId, awayGoals });
        return Promise.resolve('success');
      }
      return Promise.resolve('Should UPDATE');
    });
  }

  /**
   ** @param {Number} leagueId
   */
  get(leagueId) {
    return Promise.resolve('GET LEAGUE');
  }
}

module.exports = Leaderboard;
