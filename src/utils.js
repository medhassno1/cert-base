const fs = require('fs')
const fsPath = require('fs-path')

/**
 * Utils function
 */

exports.writeFile = function(data) {
  return new Promise((resolve, reject) => {
    fsPath.writeFile(data.path, data.content, err => {
      if (!err) {
        resolve(data.content)
      } else {
        reject(err)
      }
    })
  })
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

exports.readDir = function(dirpath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirpath, (err, files) => {
      if (!err) {
        resolve(files)
      } else {
        reject(err)
      }
    })
  })
}
