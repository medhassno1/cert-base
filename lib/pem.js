var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const pem = require('pem');

/**
 * Pem operation wrapper
 */

class Pem {
  constructor(opensslPath) {
    this.pem = pem;

    // if given, config user defined path
    if (opensslPath) {
      this.pem.config({
        pathOpenSSL: opensslPath
      });
    }
  }

  createCSR(subject) {
    return new Promise((resolve, reject) => {
      this.pem.createCSR(subject, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }

  createCertificate(options) {
    const _options = _extends({
      days: 36500
    }, options);

    return new Promise((resolve, reject) => {
      this.pem.createCertificate(_options, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }
}

module.exports = Pem;