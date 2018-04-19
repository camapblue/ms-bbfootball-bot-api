const axios = require('axios');

/**
 * @class
 * @name Exp
 */
class Exp {

  constructor(opts) {
    Object.assign(this, opts);
  }

  /**
   * 
   */
  getAllUserIds() {
    return axios.get(`${this.host}user&info=listIds`, { headers: { version: '1.5.3' } })
    .then((res) => {
      const { users } = res.data;
      return users;
    });
  }
  
  /**
   * 
   */
  reset() {
    return this.getAllUserIds()
    .then(users => {
      const userIds = users.map(user => user.user_id);
      return this.resetUserExp(userIds, 0);
    });
  }

  /**
   * 
   */
  resetUserExp(userIds, index) {
    if (index === userIds.length) return Promise.resolve({ total: userIds.length });

    const userId = userIds[index];
    console.log('RESETING INDEX =', index, 'USER ID = ', userId);
    return axios.get(`${this.host}user&action=resetData&user_id=${userId}`, { headers: { version: '1.5.3' } })
    .then((res) => {
      console.log('RES = ', res.data);
      return this.resetUserExp(userIds, index + 1);
    });
  }

}

module.exports = Exp;
