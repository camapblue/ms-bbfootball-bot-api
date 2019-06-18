const axios = require('axios');
const {
  getLiveMatches,
  getLeagues,
  getTeams
} = require('../../../utils/redis');
const { groupBy } = require('../../../utils/array');

/**
 * @class
 * @name Match
 */
class Match {

  constructor(opts) {
    Object.assign(this, opts);
  }

  /**
   * @end-point GET /match
   */
  async get() {
    const matches = await getLiveMatches();

    return { result: true, matches };
  }

  /**
   * @end-point GET /match/groupByLeague
   */
  async groupByLeague() {
    const matches = await getLiveMatches();

    const grouped = await groupBy(matches, 'league_id');

    const allLeagues = await getLeagues();
    const allTeams = await getTeams();

    let leagues = [];
    Object.keys(grouped).forEach(leagueId => {
      const leagueName = JSON.parse(allLeagues[leagueId]).name
      const matches = grouped[leagueId].map(match => {
        const homeTeam = JSON.parse(allTeams[match.home_team_id]);
        const awayTeam = JSON.parse(allTeams[match.away_team_id]);
        
        return {
          'home_team_name': homeTeam.name,
          'away_team_name': awayTeam.name,
          'home_team_logo_url': homeTeam.logo_url,
          'away_team_logo_url': awayTeam.logo_url,
          ...match
        }
      });

      leagues.push({
        'league_id': leagueId,
        'league_name': leagueName,
        matches
      });
    });

    return { result: true, leagues };
  }
}

module.exports = Match;
