const {
  getBotFbId
} = require('../../../utils/redis');

/**
 * @class
 * @name Chat
 */
class Chat {

  constructor(opts) {
    Object.assign(this, opts);
  }

  /**
   ** @param {String} appFbId
   ** @param {String} username
   */
  chatTo({ appFbId, message }) {
    return getBotFbId(appFbId)
      .then(({ botFbId }) => {
        // start chating with user
        this.logger.info('Chat to BotFbId =', botFbId, ' and message: ', message);
        return { success: true };
      });
  }
}

module.exports = Chat;
