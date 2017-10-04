const axios = require('axios');
const {
  setLeague,
  getLeagueById
} = require('../../../utils/redis');

/**
 * @class
 * @name League
 */
class League {

  constructor(opts) {
    Object.assign(this, opts);
  }

  update() {
    return axios.get(`${this.host}league&info=all`, { headers: { version: '1.5.3' } })
    .then((res) => {
      console.log(res.data);
      const { leagues } = res.data;
      return Promise.all(
        leagues.map((league) => {
          const {
            league_id,
            name,
            short_name
          } = league;
          const data = JSON.stringify({
            name,
            shortName: short_name
          });
          return setLeague(league_id, data);
        })
      )
      .then((results) => {
        for (let i = 0; i < results; i += 1) {
          if (results[i] === false) {
            console.log('Update League FAILED !!!');
          }
        }
        return true;
      })
    });
  }
}

module.exports = League;