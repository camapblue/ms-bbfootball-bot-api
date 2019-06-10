const axios = require('axios');
const {
  setLeague,
  deleteLeagues,
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

  /**
   * @end-point POST /league
   */
  async update() {
    console.log('Start UPDATE LEAGUES');
    const allLeagues = await getLeagues();
    const result = await deleteLeagues(Object.keys(allLeagues));
    let requestUrl = `${this.host}league&info=all`;
    const res = await axios.get(requestUrl, { headers: { version: this.version } });
    const { data: { leagues } } = res;

    const results = await Promise.all(
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
    );
    for (let i = 0; i < results; i += 1) {
      if (results[i] === false) {
        console.log('Update League FAILED !!!');
      }
    }
    return { result: true };
  }

  /**
   * @end-point GET /league
   */
  async get() {
    console.log('Start GET ALL LEAGUES');
    const leagues = await getLeagues()
    let result = [];
    Object.keys(leagues).forEach(leagueId => {
      result.push({
        leagueId,
        ...JSON.parse(leagues[leagueId])
      })
    });
    return result;
  }
}

module.exports = League;
