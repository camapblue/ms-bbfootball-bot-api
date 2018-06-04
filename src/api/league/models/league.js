const axios = require('axios');
const {
  setLeague,
  getLeagueById,
  getLeagues
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
    let requestUrl = `${this.host}league&info=all`;
    console.log('START UPDATE LEAGUE = ', requestUrl);
    console.log('VERSION = ', this.version);
    return axios.get(requestUrl, { headers: { version: this.version } })
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

  get() {
    return getLeagues()
    .then(leagues => {
      let result = [];
      Object.keys(leagues).forEach(leagueId => {
        result.push({
          leagueId,
          ...JSON.parse(leagues[leagueId])
        })
      });
      return result;
    });
  }
}

module.exports = League;
