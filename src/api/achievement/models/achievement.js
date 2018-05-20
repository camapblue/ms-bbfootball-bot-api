const axios = require('axios');

/**
 * @class
 * @name Achievement
 */
class Achievement {

  constructor(opts) {
    Object.assign(this, opts);
  }

  /**
   * 
   */
  getAllUserIds() {
    return axios.get(`${this.host}user&info=listIds`, { headers: { version: '1.6' } })
    .then((res) => {
      const { users } = res.data;
      return users;
    });
  }
  
  /**
   * 
   */
  upToDate() {
    return this.getAllUserIds()
    .then(users => {
      const userIds = users.map(user => user.user_id);
      console.log('TOTAL USER = ', userIds.length);
      return this.upToDateUser(userIds, 0);
    });
  }

  /**
   * 
   */
  upToDateUser(userIds, index) {
    if (index === userIds.length) return Promise.resolve({ total: userIds.length });

    const userId = userIds[index];
    console.log('UP TO DATE INDEX =', index, 'USER ID = ', userId);
    return axios.get(`${this.host}user&action=upToDateAchievement&user_id=${userId}`, { headers: { version: '1.6' } })
    .then((res) => {
      console.log('RES = ', res.data);
      return this.upToDateUser(userIds, index + 1);
    });
  }

}

module.exports = Achievement;
