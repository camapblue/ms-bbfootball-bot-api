const MatchResult = {
  win: 'W',
  draw: 'D',
  lose: 'L'
};

const getMatchResult = (ourGoals, componentGoals) => {
  return ourGoals > componentGoals ? MatchResult.win : (ourGoals === componentGoals ? MatchResult.draw : MatchResult.lose);
}

module.exports = { 
  MatchResult,
  getMatchResult
};
