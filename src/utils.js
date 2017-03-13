const pem = require('pem')

const defaultSubject = {
  country: 'CN',
  organization: 'Transfer',
  organizationUnit: 'Transfer Proxy Certification',
  // state: 'Beijing',
  // emailAddress: 'transfer@gmail.com',
  // locality: 'Beijing',
}

exports.createCSR = function(subject) {
  const _subject = {
    ...defaultSubject,
    ...subject
  }

  return new Promise((resolve, reject) => {
    pem.createCSR(_subject, (err, result) => {
      if (!err) {
        resolve(result)
      } else {
        reject(err)
      }
    })
  })
}

exports.createCertificate = function(options) {
  const _options = { 
    days: 36500, 
    ...options
  }

  return new Promise((resolve, reject) => {
    pem.createCertificate(_options, (err, result) => {
      if (!err) {
        resolve(result)
      } else {
        reject(err)
      }
    })
  })
}

exports.readCertificateInfo = function(certContent) {
  return new Promise((resolve, reject) => {
    pem.readCertificateInfo(certContent, (err, result) => {
      if (!err) {
        resolve(result)
      } else {
        reject(err)
      }
    })
  })
}
