const axios = require('axios');
const {
  setTeam,
  getTeamById
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
    return axios.get(`${this.host}team&info=all`, { headers: { version: '1.5.8' } })
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
        for (let i = 0; i < results; i += 1) {
          if (results[i] === false) {
            console.log('Update Team FAILED !!!');
          }
        }
        return true;
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
}

module.exports = Team;
