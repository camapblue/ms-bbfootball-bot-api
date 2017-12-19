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

  /**
   ** @param {String} payload
   */
  updateStartButton({ payload }) {
    return axios.post(`${this.bot.settingsHost}?access_token=${this.bot.pageAccessToken}`,
      { 
        headers: {
          'Content-Type': 'application/json'
        },
        'get_started': { 
          'payload': payload
        }
      }
    )
    .then((res) => {
      console.log('RESPONSE NOW', res.data);

      return true;
    }, (err) => {
      console.log('ERROR: ', err);
    });
  }

  removeStartButton() {
    return axios.delete(`${this.bot.settingsHost}?access_token=${this.bot.pageAccessToken}`,
      { 
        headers: {
          'Content-Type': 'application/json'
        },
        'fields': ['get_started']
      }
    )
    .then((res) => {
      console.log('RESPONSE NOW', res.data);

      return true;
    }, (err) => {
      console.log('ERROR: ', err);
    });
  }
}

module.exports = Chat;
