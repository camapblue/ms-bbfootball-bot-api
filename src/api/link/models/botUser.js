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
   * @end-point POST /link/generate
   * @param {String} appFbId
   * @param {String} username
   */
  async generateCode({ appFbId, username }) {
    const success = await setAppFbId(appFbId, username);
    this.logger.info('Generate code success =', success);
    return { result: success };
  }

  /**
   * @end-point POST /link/check
   * @param {String} username
   * @param {String} code
   */
  async checkCode({ username, code }) {
    const success = await checkCodeNumber(username, code);
    this.logger.info('Check code success =', success);
    return { result: success };
  }

  /**
   * @end-point POST /link/store
   * @param {String} username
   * @param {String} code
   * @param {String} botFbId
   */
  async storeBotFbId({ username, code, botFbId }) {
    const { appFbId} = await getAppFbId(username, code);
    this.logger.info('Get AppFbId =', appFbId);

    const success = await setBotFbId(appFbId, botFbId);
    this.logger.info('Store botFbId =', success);

    return { result: success };
  }
}

module.exports = BotUser;
