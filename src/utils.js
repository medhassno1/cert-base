const pem = require('pem')
const fsPath = require('fs-path')
const fs = require('fs')

const defaultSubject = {
  country: 'CN',
  organization: 'Transfer',
  organizationUnit: 'Transfer Proxy Certification'
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

exports.writeFiles = function(fileDataList) {
  const _list = fileDataList.map(data => {
    return new Promise((resolve, reject) => {
      fsPath.writeFile(data.path, data.content, err => {
        if (!err) {
          resolve(true)
        } else {
          reject(err)
        }
      })
    })
  })

  return Promise.all(_list)
}
exports.readFile = function(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}