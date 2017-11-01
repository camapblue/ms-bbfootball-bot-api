const {
  getLeagueById,
  getTeamById,
} = require('../../../utils/redis');
const { getMatchResult } = require('../../../utils/match-result');

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

  initNewHomeEntity({ leagueId, leagueName, homeId, homeName, homeGoals, awayId, awayName, awayGoals }) {
    return new this.Leaderboard({
      leagueId: leagueId,
      leagueName: leagueName,
      teamId: homeId,
      teamName: homeName,
      standing: 0,
      round: 1,
      scored: homeGoals,
      achievedGoals: homeGoals - awayGoals,
      concededGoals: awayGoals,
      numberHomeWin: homeGoals > awayGoals ? 1 : 0,
      numberHomeDraw: homeGoals === awayGoals,
      numberHomeLose: homeGoals < awayGoals ? 1 : 0,
      numberAwayWin: 0,
      numberAwayDraw: 0,
      numberAwayLose: 0,
      points: homeGoals > awayGoals ? 3 : (homeGoals === awayGoals ? 1 : 0)
    });
  }

  initNewAwayEntity({ leagueId, leagueName, homeId, homeName, homeGoals, awayId, awayName, awayGoals }) {
    return new this.Leaderboard({
      leagueId: leagueId,
      leagueName: leagueName,
      teamId: awayId,
      teamName: awayName,
      standing: 0,
      round: 1,
      scored: awayGoals,
      achievedGoals: awayGoals - homeGoals,
      concededGoals: homeGoals,
      numberHomeWin: 0,
      numberHomeDraw: 0,
      numberHomeLose: 0,
      numberAwayWin: homeGoals < awayGoals ? 1 : 0,
      numberAwayDraw: homeGoals === awayGoals,
      numberAwayLose: homeGoals > awayGoals ? 1 : 0,
      points: homeGoals < awayGoals ? 3 : (homeGoals === awayGoals ? 1 : 0)
    });
  }

  initNewMatchOfHomeEntity({ leagueId, leagueName, homeId, homeName, homeGoals, awayId, awayName, awayGoals, startTime }) {
    const MatchOfHome = this.dbCon.db.model(`Team_${homeId}`, this.dbCon.dbSchema.match);
    return new MatchOfHome({
      leagueId: leagueId,
      leagueName: leagueName,
      homeId: homeId,
      homeName: homeName,
      homeGoals: homeGoals,
      awayId: awayId,
      awayName: awayName,
      awayGoals: awayGoals,
      startTime: startTime,
      result: getMatchResult(homeGoals, awayGoals)
    });
  }

  initNewMatchOfAwayEntity({ leagueId, leagueName, homeId, homeName, homeGoals, awayId, awayName, awayGoals, startTime }) {
    const MatchOfAway = this.dbCon.db.model(`Team_${awayId}`, this.dbCon.dbSchema.match);
    return new MatchOfAway({
      leagueId: leagueId,
      leagueName: leagueName,
      homeId: homeId,
      homeName: homeName,
      homeGoals: homeGoals,
      awayId: awayId,
      awayName: awayName,
      awayGoals: awayGoals,
      startTime: startTime,
      result: getMatchResult(awayGoals, homeGoals)
    });
  }

  createNewLeaderboard(match) {
    const homeEntity = this.initNewHomeEntity(match);
    const awayEntity = this.initNewAwayEntity(match);
    const matchOfHomeEntity = this.initNewMatchOfHomeEntity(match);
    const matchOfAwayEntity = this.initNewMatchOfAwayEntity(match);

    return Promise.all([
      homeEntity.save(),
      awayEntity.save(),
      matchOfHomeEntity.save(),
      matchOfAwayEntity.save()
    ])
    .then(([home, away, matchHome, matchAway]) => home && away && matchHome && matchAway);
  }

  refreshStanding(leagueId) {
    let index = 0;
    return new Promise((resolve, reject) => {
      this.Leaderboard.find({ leagueId })
      .sort({ points: -1, achievedGoals: -1, scored: -1 })
      .cursor()
      .on('data', (item) => {
        index += 1;
        return this.Leaderboard.update({ _id: item._id }, { $set: { standing: index } }, { multi: false }, (err, numAffected) => {
          console.log('NUMBER AFFECTED =', numAffected);
        });
      })
      .on('error', reject)
      .on('end', resolve)
    })
    .then(() => true);
  }

  updateHomeTeam(leagueId, teamId, scored, conceded) {
    return new Promise((resolve, reject) => {
      this.Leaderboard.find({ leagueId, teamId })
      .then((items) => {
        if (items.length !== 1) {
          reject();
        } else {
          const team = items[0];
          const update = { 
            round: team.round + 1,
            scored: team.scored + scored,
            achievedGoals: team.achievedGoals + (scored - conceded),
            concededGoals: team.concededGoals + conceded,
            numberHomeWin: team.numberHomeWin + (scored > conceded ? 1 : 0),
            numberHomeDraw: team.numberHomeDraw + (scored === conceded ? 1 : 0),
            numberHomeLose: team.numberHomeLose + (scored < conceded ? 1 : 0),
            points: team.points + (scored > conceded ? 3 : (scored === conceded ? 1 : 0))
          };
          this.Leaderboard.update({ _id: team._id }, { $set: update }, { multi: true }, (err, numAffected) => {
            resolve(true);
          });
        }
      })
    });
  }

  updateAwayTeam(leagueId, teamId, scored, conceded) {
    return new Promise((resolve, reject) => {
      this.Leaderboard.find({ leagueId, teamId })
      .then((items) => {
        if (items.length !== 1) {
          reject();
        } else {
          const team = items[0];
          const update = { 
            scored: team.scored + scored,
            achievedGoals: team.achievedGoals + (scored - conceded),
            concededGoals: team.concededGoals + conceded,
            numberAwayWin: team.numberAwayWin + (scored > conceded ? 1 : 0),
            numberAwayDraw: team.numberAwayDraw + (scored === conceded ? 1 : 0),
            numberAwayLose: team.numberAwayLose + (scored < conceded ? 1 : 0),
            points: team.points + (scored > conceded ? 3 : (scored === conceded ? 1 : 0))
          };
          this.Leaderboard.update({ _id: team._id }, { $set: update }, { multi: true }, (err, numAffected) => {
            resolve(true);
          });
        }
      })
    });
  }

  checkMatchExisted(homeId, awayId, startTime) {
    const MatchOfHome = this.dbCon.db.model(`Team_${homeId}`, this.dbCon.dbSchema.match);
    return MatchOfHome.find({ 'homeId': homeId, 'awayId': awayId, 'startTime': startTime },
    (err, items) => {
      if (err) {
        this.logger.error('Something wrong when finding item!', err);
        return Promise.resolve('ERROR NOW');
      }
      return items;
    }).then(found => found.length > 0);
  }

  /**
   ** @param {Number} leagueId
   */
  reset(leagueId) {
    return new Promise((resolve, reject) => {
      // find all team_id & season and remove all match data of leaderboard
      
      this.Leaderboard.remove({ leagueId }, (err, numAffected) => {
        console.log('Reset NUMBER AFFECTED: ', numAffected);
        resolve(true);
      });
    });
  }

  /**
   ** @param {Number} leagueId
   ** @param {Array} matches
   */
  updateMatches(leagueId, matches) {
    return Promise.all(
      matches.map((match) => {
        return this.update({
          leagueId,
          ...match
        });
      })
    )
    .then((results) => {
      for (let i = 0; i < results; i += 1) {
        if (results[i] === false) {
          console.log('Update Match FAILED !!!');
        }
      }
      return this.refreshStanding(leagueId);
    });
  }

  /**
   ** @param {Number} leagueId
   ** @param {Number} homeId
   ** @param {Number} homeGoals
   ** @param {Number} awayId
   ** @param {Number} awayGoals
   ** @param {Number} startTime
   */
  update({ leagueId, homeId, homeGoals, awayId, awayGoals, startTime }) {
    return Promise.all(
      [
        getLeagueById(leagueId),
        getTeamById(homeId),
        getTeamById(awayId),
        this.checkMatchExisted(homeId, awayId, startTime)
      ]
    )
    .then(([leagueData, homeData, awayData, existed]) => {
      if (existed) return false;

      const leagueName = JSON.parse(leagueData).name;
      const homeName = JSON.parse(homeData).name;
      const awayName = JSON.parse(awayData).name;

      return this.Leaderboard.find({ 'leagueId': leagueId, $or: [{ 'teamId': homeId }, { 'teamId': awayId }] },
        (err, items) => {
          if (err) {
            this.logger.error('Something wrong when finding item!', err);
            return Promise.resolve('ERROR NOW');
          }
          return items;
        })
      .then((items) => {
        const match = { leagueId, leagueName, homeId, homeName, homeGoals, awayId, awayName, awayGoals, startTime };
        if (items.length === 0) {
          return this.createNewLeaderboard(match);
        }
        const matchOfHomeEntity = this.initNewMatchOfHomeEntity(match);
        const matchOfAwayEntity = this.initNewMatchOfAwayEntity(match);

        return Promise.all([
          this.updateHomeTeam(leagueId, homeId, homeGoals, awayGoals),
          this.updateAwayTeam(leagueId, awayId, awayGoals, homeGoals),
          matchOfHomeEntity.save(),
          matchOfAwayEntity.save()
        ]).then(([home, away, matchHome, matchAway]) => home && away && matchHome && matchAway);
      });
    });
  }

  /**
   ** @param {Number} leagueId
   */
  get(leagueId) {
    return this.Leaderboard.find({ 'leagueId': leagueId },
      (err, items) => {
        if (err) {
          this.logger.error('Something wrong when finding item!', err);
          return Promise.resolve('ERROR NOW');
        }
        return items;
      })
    .sort({ 'standing': 1 })
    .then((items) => {
      let result = [];
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        result.push(
          {
            standing: item.standing,
            teamName: item.teamName,
            goals: item.achievedGoals,
            points: item.points,
            round: item.round,
            standing: item.standing
          }
        )
      }
      return Promise.resolve({ leaderboard: result });
    });
  }
}

module.exports = Leaderboard;
