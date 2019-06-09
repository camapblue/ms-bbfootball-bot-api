const {
  getBotFbId
} = require('../../../utils/redis');
const axios = require('axios');

/**
 * @class
 * @name Chat
 */
class Chat {

  constructor(opts) {
    Object.assign(this, opts);
  }

  /**
   * @end-point /chat/to
   * @param {String} appFbId
   * @param {String} username
   */
  async chatTo({ appFbId, message }) {
    const { botFbId } = await getBotFbId(appFbId);
    this.logger.info('Chat to BotFbId =', botFbId, ' and message: ', message);

    return { result: true };
  }

  /**
   * @end-point POST /chat/start
   * @param {String} payload
   */
  async updateStartButton({ payload }) {
    const options = { 
      headers: {
        'Content-Type': 'application/json'
      },
      'get_started': { 
        'payload': payload
      }
    };
    const res = await axios.post(`${this.bot.settingsHost}?access_token=${this.bot.pageAccessToken}`, options);
    console.log('RESPONSE NOW', res.data);
    
    return { result: true };
  }

  /**
   * @end-point DELETE /chat/start
   */
  async removeStartButton() {
    const options = { 
      headers: {
        'Content-Type': 'application/json'
      },
      'fields': ['get_started']
    };
    const res = await axios.delete(`${this.bot.settingsHost}?access_token=${this.bot.pageAccessToken}`, options);
    console.log('RESPONSE NOW', res.data);

    return { result: true };
  }
}

module.exports = Chat;
