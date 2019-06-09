const _ = require('lodash');
const moment = require('moment');

const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

async function doJobsInParallel(jobs) {
  const done = jobs.flat().map(async (job) => await job);
  let results = [];
  for(const result of done) {
    results.push(await result);
  };
  return results;
}

const sortByDate = function(array, sortBy, accending = 'desc') {
  return _.orderBy(array, function(o) {
    return moment(o[sortBy]);
  }, [accending]);
}

module.exports = {
  groupBy,
  doJobsInParallel,
  sortByDate
};
