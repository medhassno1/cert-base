var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const pem = require('pem');
const fsPath = require('fs-path');
const fs = require('fs');
const rimraf = require('rimraf');

/**
 * Pem operation wrapper
 */

exports.createCSR = function (subject) {
  return new Promise((resolve, reject) => {
    pem.createCSR(subject, (err, result) => {
      if (!err) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
};

exports.createCertificate = function (options) {
  const _options = _extends({
    days: 36500
  }, options);

  return new Promise((resolve, reject) => {
    pem.createCertificate(_options, (err, result) => {
      if (!err) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
};

/**
 * Utils
 */

exports.writeFile = function (data) {
  return new Promise((resolve, reject) => {
    fsPath.writeFile(data.path, data.content, err => {
      if (!err) {
        resolve(data.path);
      } else {
        reject(err);
      }
    });
  });
};

exports.readFile = function (filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
};

exports.rimraf = function (path) {
  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (!err) {
        resolve(true);
      } else {
        reject(err);
      }
    });
  });
};