const {
  setAppFbId,
  checkCodeNumber,
  getAppFbId,
  setBotFbId
} = require('../../../utils/redis');

/**
 * @class
 * @name BotUser
 */
class BotUser {

  constructor(opts) {
    Object.assign(this, opts);
  }

  /**
   ** @param {String} appFbId
   ** @param {String} username
   */
  generateCode({ appFbId, username }) {
    return setAppFbId(appFbId, username)
      .then((success) => {
        this.logger.info('Generate code success =', success);
        return { success: true };
      });
  }

  /**
   ** @param {String} username
   ** @param {String} code
   */
  checkCode({ username, code }) {
    return checkCodeNumber(username, code)
      .then((result) => {
        this.logger.info('Check code success =', result);
        return { success: result };
      });
  }

  /**
   ** @param {String} username
   ** @param {String} code
   ** @param {String} botFbId
   */
  storeBotFbId({ username, code, botFbId }) {
    return getAppFbId(username, code)
      .then(({ appFbId }) => {
        this.logger.info('Get AppFbId =', appFbId);
        return setBotFbId(appFbId, botFbId)
          .then((success) => {
            this.logger.info('Store botFbId =', success);
            return { success: true };
          });
      });
  }
}

module.exports = BotUser;
