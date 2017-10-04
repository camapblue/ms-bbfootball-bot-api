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

  update() {
    return axios.get(`${this.host}team&info=all`, { headers: { version: '1.5.3' } })
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
}

module.exports = Team;
