const Crypto = require('crypto');

function generateCodeNumber(number = 4) {
  const hex = Crypto.randomBytes(number).toString('hex');
  return parseInt(hex, 16).toString();
}

module.exports = {
  generateCodeNumber
};
