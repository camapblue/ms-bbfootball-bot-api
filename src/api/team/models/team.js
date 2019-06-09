const axios = require('axios');
const {
  setTeam,
  getTeams
} = require('../../../utils/redis');

/**
 * @class
 * @name Team
 */
class Team {

  constructor(opts) {
    Object.assign(this, opts);
  }

  /**
   * @end-point POST /team/update
   */
  async update() {
    const res = await axios.get(`${this.host}team&info=all`, { headers: { version: this.version } })
    const { teams } = res.data;
    const results = await Promise.all(
      teams.map((team) => {
        const {
          team_id,
          name,
          short_name
        } = team;
        const data = JSON.stringify({
          name,
          shortName: short_name
        });
        return setTeam(team_id, data);
      })
    );
    for (let i = 0; i < results; i += 1) {
      if (results[i] === false) {
        console.log('Update Team FAILED !!!');
      }
    }
    return { result: true };
  }

  /**
   * @end-point POST /team/{teamId}/performance
   * @param {Number} teamId
   * @param {Number} numberMatches
   */
  async performance({ teamId, numberMatches }) {
    const MatchOfTeam = this.dbCon.db.model(`Team_${teamId}`, this.dbCon.dbSchema.match);

    const find = MatchOfTeam.find().sort({ startTime: -1 }).limit(numberMatches).lean();
    const items = await find.exec();
    let performance = '';
    for (let i = 0 ; i < items.length ; i++) {
      const match = items[i];
      performance += match.result + ' ';   
    }
    return { performance };
  }

  /**
   * @end-point POST /team/{teamId}/performance
   * @param {String} season
   */
  async statistic(season) {
    const teams = await getTeams();
    let teamIds = [];
    Object.keys(teams).forEach(teamId => {
      teamIds.push({
        teamId,
        season
      })
    });
    const results = await Promise.all(
      teamIds.map((teamId) => {
        return this.teamStatisticInSeason(teamId);
      })
    );
    return { statistic: results.filter(team => team.totalMatch > 0) };
  }

  /**
   * @function get team statistic of particular team in season
   */
  async teamStatisticInSeason({ teamId, season }) {
    const MatchOfTeam = this.dbCon.db.model(`Team_${teamId}`, this.dbCon.dbSchema.match);

    const find = MatchOfTeam.find({ season }).lean();
    const items = await find.exec();
    let scored = 0;
    let conceded = 0;
    let teamName = "";
    let totalMatch = items.length;
    
    for (let i = 0 ; i < totalMatch ; i++) {
      const match = items[i];
      if (match.homeId === teamId) {
        if (teamName.length === 0) {
          teamName = match.homeName;
        }
        scored += match.homeGoals;
        conceded += match.awayGoals;
      } else {
        if (teamName.length === 0) {
          teamName = match.awayName;
        }
        scored += match.awayGoals;
        conceded += match.homeGoals;
      }
    }
    return {
      teamId,
      teamName,
      scored,
      conceded,
      totalMatch
    };
  }
}

module.exports = Team;
