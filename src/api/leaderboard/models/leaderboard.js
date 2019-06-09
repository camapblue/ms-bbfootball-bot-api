const {
  getLeagueById,
  getTeamById,
} = require('../../../utils/redis');
const { getMatchResult } = require('../../../utils/match-result');
const { groupBy } = require('../../../utils/array');
const { doJobsInParallel } = require('../../../utils/array');

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

  /**
   * @function init home entity
   */
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

  /**
   * @function init away entity
   */
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

  /**
   * @function init match of home entity
   */
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

  /**
   * @function init match of away entity
   */
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

  /**
   * @function init create new leaderboard
   */
  async createNewLeaderboard(match) {
    const homeEntity = this.initNewHomeEntity(match);
    const awayEntity = this.initNewAwayEntity(match);
    const matchOfHomeEntity = this.initNewMatchOfHomeEntity(match);
    const matchOfAwayEntity = this.initNewMatchOfAwayEntity(match);

    const [home, away, matchHome, matchAway] = await Promise.all([
      homeEntity.save(),
      awayEntity.save(),
      matchOfHomeEntity.save(),
      matchOfAwayEntity.save()
    ])
    return home && away && matchHome && matchAway;
  }

  /**
   * @function refresh standing
   */
  async refreshStanding(leagueId, season) {
    let index = 0;
    const find = this.Leaderboard.find({ leagueId, season }).sort({ points: -1, achievedGoals: -1, scored: -1 }).lean();
    const items = await find.exec();
    let jobs = [];
    for (let i = 0 ; i < items.length ; i++) {
      const update = this.Leaderboard.updateOne({ _id: items[i]._id }, { $set: { standing: index }});
      jobs.push(update.exec());
    }
    const results = await doJobsInParallel(jobs);

    return true;
  }

  /**
   * @function update home team
   */
  async updateHomeTeam(leagueId, season, teamId, scored, conceded) {
    const find = this.Leaderboard.find({ leagueId, season, teamId }).lean();
    const items = await find.exec();
    
    if (items.length !== 1) return false;
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
    const updateLeaderboard = this.Leaderboard.updateOne({ _id: team._id }, { $set: update });
    const result = await updateLeaderboard.exec();

    return true;
  }

  /**
   * @function update away team
   */
  async updateAwayTeam(leagueId, season, teamId, scored, conceded) {
    const find = this.Leaderboard.find({ leagueId, season, teamId }).lean();
    const items = await find.exec();

    if (items.length !== 1) return false;
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
    const updateLeaderboard = this.Leaderboard.updateOne({ _id: team._id }, { $set: update });
    const result = await updateLeaderboard.exec();

    return true;
  }

  /**
   * @function check match is existed
   */
  async checkMatchExisted(homeId, awayId, startTime) {
    const MatchOfHome = this.dbCon.db.model(`Team_${homeId}`, this.dbCon.dbSchema.match);
    const find = MatchOfHome.find({ 'homeId': homeId, 'awayId': awayId, 'startTime': startTime }).lean();
    const items = await find.exec();

    return items.length > 0;
  }

  /**
   * @function remove league in season
   */
  async removeLeagueInSeason(leagueId, season) {
    const update = this.Leaderboard.remove({ leagueId, season });
    const result = await update.exec();

    return true;
  }

  /**
   * @function remove league in season
   */
  async removeMatchOfTeamInSeason(teamId, leagueId, season) {
    const MatchOfTeam = this.dbCon.db.model(`Team_${teamId}`, this.dbCon.dbSchema.match);
    const update = MatchOfTeam.remove({ leagueId, season });
    const result = await update.exec();

    return true;
  }

  /**
   * @function group by round
   */
  groupByRound(matches) {
    const groupByMatches = groupBy(matches, 'round');
    let groups = [];
    Object.keys(groupByMatches).forEach(function(key) {
      groups.push(groupByMatches[key])
    });
    return groups;
  }

  /**
   * @end-point DELETE /leaderboard/{leagueId}/{season}
   * @param {Number} leagueId
   * @param {String} season
   */
  async reset(leagueId, season) {
    const find = this.Leaderboard.find({ leagueId, season }).lean();
    const teams = await find.exec();
    const results = await Promise.all(
      teams.map(async (team) => {
        return await this.removeMatchOfTeamInSeason(team.teamId, leagueId, season);
      })
    );
    let shouldRemove = false;
    for (let i = 0 ; i < results.length ; i++) {
      if (results[i]) {
        shouldRemove = true;
        break;
      }
    }
    if (shouldRemove) {
      const update = await this.removeLeagueInSeason(leagueId, season);
      return update;
    }
    return false;
  }

  /**
   * @end-point POST /leaderboard
   * @param {Number} leagueId
   * @param {String} season
   * @param {Array} matches
   */
  async updateMatches(leagueId, season, matches) {
    const groups = this.groupByRound(matches);

    const result = await this.updateMatchesByGroup(groups, 0, leagueId, season);
    await this.refreshStanding(leagueId, season)

    const allMatches = await this.get(leagueId, season);
    return allMatches;
  }

  /**
   * @function update matches by group
   */
  async updateMatchesByGroup(groups, index, leagueId, season) {
    if (index === groups.length) return true;

    const matches = groups[index];

    const results = await Promise.all(
      matches.map((match) => {
        return this.update({
          leagueId,
          season,
          ...match
        });
      })
    );
    const result = await this.updateMatchesByGroup(groups, index + 1, leagueId, season);
    return result;
  }

  /**
   * @function update a lot of things
   * @param {Number} leagueId
   * @param {String} season
   * @param {Number} homeId
   * @param {Number} homeGoals
   * @param {Number} awayId
   * @param {Number} awayGoals
   * @param {Number} startTime
   */
  async update({ leagueId, season, homeId, homeGoals, awayId, awayGoals, startTime, round }) {
    const [leagueData, homeData, awayData, existed] = await Promise.all(
      [
        getLeagueById(leagueId),
        getTeamById(homeId),
        getTeamById(awayId),
        this.checkMatchExisted(homeId, awayId, startTime)
      ]
    );
    if (existed) return false;
    if (leagueData === undefined || leagueData === null) {
      console.log('CANNOT FIND LEAGUE =', leagueId);
      return false;
    }
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

    const [homeExisted, awayExisted] = await Promise.all(
      [
        this.isTeamExisted(leagueId, season, homeId),
        this.isTeamExisted(leagueId, season, awayId),
      ]
    );

    const match = { leagueId, leagueName, season, homeId, homeName, homeGoals, awayId, awayName, awayGoals, startTime };
    if (!homeExisted && !awayExisted) {
      return this.createNewLeaderboard(match);
    }
    const matchOfHomeEntity = this.initNewMatchOfHomeEntity(match);
    const matchOfAwayEntity = this.initNewMatchOfAwayEntity(match);

    const [home, away, matchHome, matchAway] = await Promise.all([
      homeExisted ? this.updateHomeTeam(leagueId, season, homeId, homeGoals, awayGoals) : this.initNewHomeEntity(match).save(),
      awayExisted ? this.updateAwayTeam(leagueId, season, awayId, awayGoals, homeGoals) : this.initNewAwayEntity(match).save(),
      matchOfHomeEntity.save(),
      matchOfAwayEntity.save()
    ]);

    return home && away && matchHome && matchAway;
  }

  /**
   * @function is team existed
   */
  async isTeamExisted(leagueId, season, teamId) {
    const find = this.Leaderboard.find({ leagueId, season, teamId }).lean();
    const items = await find.exec();
      
    return items.length > 0;
  }

  /**
   * @end-point GET /leaderboard/{leagueId}/{season}
   * @param {Number} leagueId
   * @param {String} season
   */
  async get(leagueId, season) {
    const find = this.Leaderboard.find({ leagueId, season }).sort({ 'standing': 1 }).lean();
    const items = await find.exec();
    let leaderboard = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      leaderboard.push(
        {
          standing: item.standing,
          teamId: item.teamId,
          teamName: item.teamName,
          goals: item.achievedGoals,
          points: item.points,
          round: item.round
        }
      )
    }
    return { result: true, leaderboard }
  }

  /**
   * @end-point POST /leaderboard/{leagueId}/{season}/{teamId}/point
   * @param {Number} leagueId
   * @param {String} season
   * @param {Number} teamId
   * @param {Number} point
   */
  async forceToUpdateTeamPoint(leagueId, season, teamId, point) {
    const find = this.Leaderboard.find({ leagueId, season, teamId }).lean();
    const items = await find.exec();
    if (items.length !== 1) {
      return { result: false };
    }

    const team = items[0];
    const update = {
      points: team.points + point
    };
    const updateLeaderboard = this.Leaderboard.updateOne({ _id: team._id }, { $set: update });
    const result = await updateLeaderboard.exec();

    const refresh = await this.refreshStanding(leagueId, season);

    const matches = await this.get(leagueId, season);
    return matches;
  }
}

module.exports = Leaderboard;
