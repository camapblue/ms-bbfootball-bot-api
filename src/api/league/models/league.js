const axios = require('axios');
const {
  setLeague,
  deleteLeagues,
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
    return getLeagues()
    .then(leagues => {
      console.log('Start UPDATE LEAGUES');
      return deleteLeagues(Object.keys(leagues))
      .then(result => {
        let requestUrl = `${this.host}league&info=all`;
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
      }).catch(error => {
        console.log('DELETE ERRORS =', error);
      });
    });
  }

  get() {
    console.log('Start GET ALL LEAGUES');
    return getLeagues()
    .then(leagues => {
      console.log('LEAGUES = ', leagues);
      let result = [];
      Object.keys(leagues).forEach(leagueId => {
        result.push({
          leagueId,
          ...JSON.parse(leagues[leagueId])
        })
      });
      return result;
    })
    .catch(error => {
      console.log('GET LEAGUES ERROR =', error);
    });
  }
}

module.exports = League;
