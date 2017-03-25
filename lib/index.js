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

      let certData = '';
      const subject = _extends({}, _this.defaultSubject, {
        commonName: commonName
      });

      try {
        const csrData = yield createCSR(subject);
        const options = {
          csr: csrData.csr,
          clientKey: csrData.clientKey,
          selfSigned: true
        };

        certData = yield createCertificate(options);
      } catch (e) {
        throw e;
      }

      return _this._save(certData);
    })();
  }

  getCACert() {
    if (this.isCAExist()) {
      return {
        key: this._makePath(CA_ROOT_NAME, 'key'),
        cert: this._makePath(CA_ROOT_NAME, 'cert')
      };
    } else {
      throw CA_NOT_EXIST;
    }
  }

  getCertByHost(hostname) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const caKeyPath = _this2.getCACert().key;

      // if exist, return current cert and key
      if (_this2._isExist(hostname)) {
        return {
          key: _this2._makePath(hostname, 'key'),
          cert: _this2._makePath(hostname, 'cert')
        };
      }

      // if not, create one
      let certData = '';
      const subject = _extends({}, _this2.defaultSubject, {
        commonName: hostname
      });

      try {
        const keyContent = yield readFile(caKeyPath);
        const csrData = yield createCSR(subject);

        const options = {
          csr: csrData.csr,
          serviceKey: keyContent
        };

        certData = yield createCertificate(options);
      } catch (e) {
        throw e;
      }

      return _this2._save(certData, hostname);
    })();
  }

  removeAllCerts() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let result = false;

      try {
        result = yield rimraf(_this3.path);
      } catch (e) {
        throw e;
      }

      return result;
    })();
  }

  removeCert(hostname) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      let result = false;

      try {
        result = yield rimraf(_this4._makeFolderPath(hostname));
      } catch (e) {
        throw e;
      }

      return result;
    })();
  }

  isCAExist() {
    return this._isExist();
  }

  // utils

  _save(certData, name = CA_ROOT_NAME) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      let keyPath, certPath;

      const keyFileData = {
        content: certData.serviceKey,
        path: _this5._makePath(name, 'key')
      };
      const certFileData = {
        content: certData.certificate,
        path: _this5._makePath(name, 'cert')
      };

      try {
        keyPath = yield writeFile(keyFileData);
        certPath = yield writeFile(certFileData);
      } catch (e) {
        throw e;
      }

      return {
        key: keyPath,
        cert: certPath
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