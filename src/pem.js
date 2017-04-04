const pem = require('pem')

/**
 * Pem operation wrapper
 */

class Pem {
  constructor(opensslPath) {
    this.pem = pem
    
    // if given, config user defined path
    if (opensslPath) {
      this.pem.config({
        pathOpenSSL: opensslPath
      })
    }
  }

  createCSR(subject) {
    return new Promise((resolve, reject) => {
      this.pem.createCSR(subject, (err, result) => {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  }

  createCertificate(options) {
    const _options = { 
      days: 36500, 
      ...options
    }

    return new Promise((resolve, reject) => {
      this.pem.createCertificate(_options, (err, result) => {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  }
}

module.exports = Pem
