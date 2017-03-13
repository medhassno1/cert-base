var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const pem = require('pem');

const defaultSubject = {
  country: 'CN',
  organization: 'Transfer',
  organizationUnit: 'Transfer Proxy Certification'
};

exports.createCSR = function (subject) {
  const _subject = _extends({}, defaultSubject, subject);

  return new Promise((resolve, reject) => {
    pem.createCSR(_subject, (err, result) => {
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

exports.readCertificateInfo = function (certContent) {
  return new Promise((resolve, reject) => {
    pem.readCertificateInfo(certContent, (err, result) => {
      if (!err) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
};