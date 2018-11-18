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
   */
  update() {
    return axios.get(`${this.host}team&info=all`, { headers: { version: this.version } })
    .then((res) => {
      console.log(res.data);
      const { teams } = res.data;
      return Promise.all(
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
      )
      .then((results) => {
        console.log('SET TEAM RESULTS =', results.length);
        for (let i = 0; i < results; i += 1) {
          if (results[i] === false) {
            console.log('Update Team FAILED !!!');
          }
        }
        return true;
      })
      .catch(error => {
        console.log('UPDATE TEAM ERROR =', error);
      })
    });
  }

  /**
   ** @param {Number} teamId
   ** @param {Number} numberMatches
   */
  performance({ teamId, numberMatches }) {
    const MatchOfTeam = this.dbCon.db.model(`Team_${teamId}`, this.dbCon.dbSchema.match);

    // get number of latest matches
    return new Promise((resolve, reject) => {
      MatchOfTeam.find()
        .sort({ startTime: -1 })
        .limit(numberMatches)
        .then(items => {
          var performance = '';
          for (let i = 0 ; i < items.length ; i++) {
            const match = items[i];
            performance += match.result + ' ';   
          }
          resolve({ performance });
        });
    });
  }

  /**
   ** @param {String} season
   */
  statistic(season) {
    return getTeams()
    .then(teams => {
      let teamIds = [];
      Object.keys(teams).forEach(teamId => {
        teamIds.push({
          teamId,
          season
        })
      });
      
      return Promise.all(
        teamIds.map((teamId) => {
          return this.teamStatisticInSeason(teamId);
        })
      ).then((results) => {
        return { statistic: results.filter(team => team.totalMatch > 0)};
      })
    })
    .catch(error => {
      console.log('GET TEAMS ERROR =', error);
    });
  }

  teamStatisticInSeason({ teamId, season }) {
    const MatchOfTeam = this.dbCon.db.model(`Team_${teamId}`, this.dbCon.dbSchema.match);

    // get number of latest matches
    return new Promise((resolve, reject) => {
      MatchOfTeam.find({ season })
        .then(items => {
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
          resolve(
            {
              teamId: teamId,
              teamName,
              scored,
              conceded,
              totalMatch
            }
           );
        });
    });
  }
}

module.exports = Team;
