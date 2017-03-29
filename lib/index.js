var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');
const {
  createCSR,
  createCertificate,
  writeFile,
  readFile,
  rimraf
} = require('./utils.js');
const {
  CA_EXIST,
  CA_NOT_EXIST
} = require('./errors.js');

/**
 * Constants
 */

const CA_ROOT_NAME = '##ca##';
const defaultSubject = {
  country: 'CN',
  organization: 'CertBase',
  organizationUnit: 'CertBase Certification'
};

/**
 * Certs storing location:
 *
 * CA cert also known as 'root cert' is stored along with CA key under:
 * ${this.path}/##ca##-pkg
 *
 * User certs are stored along with keys under:
 * ${this.path}/${hostname}-pkg
 */

class CertBase {
  constructor(options) {
    this.path = options.path;
    this.defaultSubject = _extends({}, defaultSubject, options.subject);
  }

  createCACert(commonName) {
    var _this = this;

    return _asyncToGenerator(function* () {
      // if ca cert exist, error
      if (_this.isCAExist()) {
        throw CA_EXIST;
      }

      const subject = _extends({}, _this.defaultSubject, {
        commonName: commonName
      });

      const csrData = yield createCSR(subject);
      const options = {
        csr: csrData.csr,
        clientKey: csrData.clientKey,
        selfSigned: true
      };
      const certData = yield createCertificate(options);

      return _this._save(certData);
    })();
  }

  getCACert() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let key, cert;

      if (_this2.isCAExist()) {
        key = yield readFile(_this2._makePath(CA_ROOT_NAME, 'key'));
        cert = yield readFile(_this2._makePath(CA_ROOT_NAME, 'cert'));
      } else {
        throw CA_NOT_EXIST;
      }

      return {
        key: key,
        cert: cert
      };
    })();
  }

  getCertByHost(hostname) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      // if exist, return current cert and key
      if (_this3._isExist(hostname)) {
        return {
          key: _this3._makePath(hostname, 'key'),
          cert: _this3._makePath(hostname, 'cert')
        };
      }

      // if not, create one
      const subject = _extends({}, _this3.defaultSubject, {
        commonName: hostname
      });

      const caKey = _this3.getCACert().key;
      const csrData = yield createCSR(subject);

      const options = {
        csr: csrData.csr,
        serviceKey: caKey
      };
      const certData = yield createCertificate(options);

      return _this3._save(certData, hostname);
    })();
  }

  removeAllCerts() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const result = yield rimraf(_this4.path);
      return result;
    })();
  }

  removeCert(hostname) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const result = yield rimraf(_this5._makeFolderPath(hostname));
      return result;
    })();
  }

  isCAExist() {
    return this._isExist();
  }

  // utils

  _save(certData, name = CA_ROOT_NAME) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const keyFileData = {
        content: certData.serviceKey,
        path: _this6._makePath(name, 'key')
      };
      const certFileData = {
        content: certData.certificate,
        path: _this6._makePath(name, 'cert')
      };

      const key = yield writeFile(keyFileData);
      const cert = yield writeFile(certFileData);

      return {
        key: key,
        cert: cert
      };
    })();
  }
  _isExist(name = CA_ROOT_NAME) {
    const keyPath = this._makePath(name, 'key');
    const certPath = this._makePath(name, 'cert');
    return fs.existsSync(keyPath) && fs.existsSync(certPath);
  }
  _makePath(name, type) {
    const ext = type === 'cert' ? 'crt' : 'key';
    return `${this._makeFolderPath(name)}/${name}-${type}.${ext}`;
  }
  _makeFolderPath(name) {
    return `${this.path}/${name}-pkg`;
  }
}

module.exports = CertBase;