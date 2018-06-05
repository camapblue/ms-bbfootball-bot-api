const {
  getLeagueById,
  getTeamById,
} = require('../../../utils/redis');
const { getMatchResult } = require('../../../utils/match-result');
const { groupBy } = require('../../../utils/array');

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

  initNewHomeEntity({ leagueId, leagueName, season, homeId, homeName, homeGoals, awayId, awayName, awayGoals }) {
    return new this.Leaderboard({
      leagueId: leagueId,
      leagueName: leagueName,
      season: season,
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

  initNewAwayEntity({ leagueId, leagueName, season, homeId, homeName, homeGoals, awayId, awayName, awayGoals }) {
    return new this.Leaderboard({
      leagueId: leagueId,
      leagueName: leagueName,
      season: season,
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

  initNewMatchOfHomeEntity({ leagueId, leagueName, season, homeId, homeName, homeGoals, awayId, awayName, awayGoals, startTime }) {
    const MatchOfHome = this.dbCon.db.model(`Team_${homeId}`, this.dbCon.dbSchema.match);
    return new MatchOfHome({
      leagueId: leagueId,
      leagueName: leagueName,
      season: season,
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

  initNewMatchOfAwayEntity({ leagueId, leagueName, season, homeId, homeName, homeGoals, awayId, awayName, awayGoals, startTime }) {
    const MatchOfAway = this.dbCon.db.model(`Team_${awayId}`, this.dbCon.dbSchema.match);
    return new MatchOfAway({
      leagueId: leagueId,
      leagueName: leagueName,
      season: season,
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

  refreshStanding(leagueId, season) {
    let index = 0;
    return new Promise((resolve, reject) => {
      this.Leaderboard.find({ leagueId, season })
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

  updateHomeTeam(leagueId, season, teamId, scored, conceded) {
    return new Promise((resolve, reject) => {
      this.Leaderboard.find({ leagueId, season, teamId })
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

  updateAwayTeam(leagueId, season, teamId, scored, conceded) {
    return new Promise((resolve, reject) => {
      this.Leaderboard.find({ leagueId, season, teamId })
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
        return Promise.resolve(false);
      }
      return items;
    }).then(found => found.length > 0);
  }

  removeLeagueInSeason(leagueId, season) {
    return this.Leaderboard.remove({ leagueId, season }, (err, numAffected) => {
      return numAffected;
    }).then(numAffected => numAffected.result.ok > 0);
  }

  removeMatchOfTeamInSeason(teamId, leagueId, season) {
    const MatchOfTeam = this.dbCon.db.model(`Team_${teamId}`, this.dbCon.dbSchema.match);
    return MatchOfTeam.remove({ leagueId, season }, (err, numAffected) => {
      return numAffected;
    }).then(numAffected => numAffected.result.ok);
  }

  groupByRound(matches) {
    const groupByMatches = groupBy(matches, 'round');
    let groups = [];
    Object.keys(groupByMatches).forEach(function(key) {
      groups.push(groupByMatches[key])
    });
    return groups;
  }  

  /**
   ** @param {Number} leagueId
   ** @param {String} season
   */
  reset(leagueId, season) {
    return this.Leaderboard.find({ leagueId, season },
    (err, items) => {
      if (err) {
        this.logger.error('Something wrong when finding item!', err);
        return Promise.resolve('ERROR NOW');
      }
      return items;
    })
    .then(teams => {
      return Promise.all(
        teams.map((team) => {
          return this.removeMatchOfTeamInSeason(team.teamId, leagueId, season)  ;
        })
      ).then((results) => {
        let shouldRemove = false;
        for (let i = 0 ; i < results.length ; i++) {
          if (results[i]) {
            shouldRemove = true;
            break;
          }
        }
        if (shouldRemove) {
          return this.removeLeagueInSeason(leagueId, season);
        }
        return false;
      })
    });
  }

  /**
   ** @param {Number} leagueId
   ** @param {String} season
   ** @param {Array} matches
   */
  updateMatches(leagueId, season, matches) {
    const groups = this.groupByRound(matches);

    return this.updateMatchesByGroup(groups, 0, leagueId, season)
      .then((result) => 
        this.refreshStanding(leagueId, season)
        .then((result) => this.get(leagueId, season)));
  }

  updateMatchesByGroup(groups, index, leagueId, season) {
    if (index === groups.length) return Promise.resolve(true);

    const matches = groups[index];

    return Promise.all(
      matches.map((match) => {
        return this.update({
          leagueId,
          season,
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
      return this.updateMatchesByGroup(groups, index + 1, leagueId, season);
    });
  }

  /**
   ** @param {Number} leagueId
   ** @param {String} season
   ** @param {Number} homeId
   ** @param {Number} homeGoals
   ** @param {Number} awayId
   ** @param {Number} awayGoals
   ** @param {Number} startTime
   */
  update({ leagueId, season, homeId, homeGoals, awayId, awayGoals, startTime, round }) {
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
      if (homeData === undefined || homeData === null) {
        console.log('CANNOT FIND TEAM =', homeId);
        return false;
      }
      if (awayData === undefined || awayData === null) {
        console.log('CANNOT FIND TEAM =', awayId);
        return false;
      }

      const leagueName = JSON.parse(leagueData).name;
      const homeName = JSON.parse(homeData).name;
      const awayName = JSON.parse(awayData).name;

      return Promise.all(
        [
          this.isTeamExited(leagueId, season, homeId),
          this.isTeamExited(leagueId, season, awayId),
        ]
      )
      .then(([homeExisted, awayExisted]) => {
        const match = { leagueId, leagueName, season, homeId, homeName, homeGoals, awayId, awayName, awayGoals, startTime };
        if (!homeExisted && !awayExisted) {
          return this.createNewLeaderboard(match);
        }
        const matchOfHomeEntity = this.initNewMatchOfHomeEntity(match);
        const matchOfAwayEntity = this.initNewMatchOfAwayEntity(match);

        return Promise.all([
          homeExisted ? this.updateHomeTeam(leagueId, season, homeId, homeGoals, awayGoals) : this.initNewHomeEntity(match).save(),
          awayExisted ? this.updateAwayTeam(leagueId, season, awayId, awayGoals, homeGoals) : this.initNewAwayEntity(match).save(),
          matchOfHomeEntity.save(),
          matchOfAwayEntity.save()
        ]).then(([home, away, matchHome, matchAway]) => home && away && matchHome && matchAway);
      });
    });
  }

  isTeamExited(leagueId, season, teamId) {
    return this.Leaderboard.find({ leagueId, season, teamId },
      (err, items) => {
        if (err) {
          this.logger.error('Something wrong when finding item!', err);
          return Promise.resolve('ERROR NOW');
        }
        return items;
      })
      .then((items) => items.length > 0);
  }

  /**
   ** @param {Number} leagueId
   ** @param {String} season
   */
  get(leagueId, season) {
    return this.Leaderboard.find({ leagueId, season },
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
            teamId: item.teamId,
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
