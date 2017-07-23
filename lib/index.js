var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');
const path = require('path');
const { emp } = require('emp');
const Pem = require('./pem.js');
const { writeFile, readFile, readDir } = require('./utils.js');
const { CA_EXIST, CA_NOT_EXIST } = require('./errors.js');

/**
 * Constants
 */

const defaultSubject = {
  country: 'CN',
  organization: 'CertBase',
  organizationUnit: 'CertBase Certification'
};
const caSSLCnfPath = path.join(__dirname, '../configs/ca.ext');
const userSSLCnfPath = path.join(__dirname, '../configs/user.ext');

/**
 * Certs location:
 *
 * CA cert also known as 'root cert' is stored with CA key under:
 * ${this.path}/ca/
 *
 * User certs are stored along with keys under:
 * ${this.path}/certs/${hostname}/
 */

class CertBase {
  constructor(options) {
    this.defaultSubject = _extends({}, defaultSubject, options.subject);
    this.pem = new Pem(options.opensslPath);

    this.path = options.path;
    this.caDirPath = path.join(options.path, 'ca');
    this.caCertPath = path.join(this.caDirPath, 'ca.crt');
    this.caKeyPath = path.join(this.caDirPath, 'ca.key');
    this.certsDirPath = path.join(options.path, 'certs');
  }

  /**
   * Create a CA cert, if exists, throw error
   */

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

      const csrData = yield _this.pem.createCSR(subject);
      const options = {
        csr: csrData.csr,
        clientKey: csrData.clientKey,
        selfSigned: true,
        extFile: caSSLCnfPath
      };
      const certData = yield _this.pem.createCertificate(options);

      return _this._save(certData);
    })();
  }

  /**
   * Get CA cert data, if not exist, throws an error
   */

  getCACert() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let key, cert;

      if (_this2.isCAExist()) {
        key = yield readFile(_this2.caKeyPath);
        cert = yield readFile(_this2.caCertPath);
      } else {
        throw CA_NOT_EXIST;
      }

      return {
        key: key,
        cert: cert
      };
    })();
  }

  /**
   * Get cert data for the given hostname, if not exist, create one
   */

  getCertByHost(hostname) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      // if exist, return current cert and key
      if (_this3._isExist(hostname)) {
        const key = yield readFile(_this3._makePath(hostname, 'key'));
        const cert = yield readFile(_this3._makePath(hostname, 'cert'));

        return {
          key: key,
          cert: cert
        };
      }

      // if not, create one
      const subject = _extends({}, _this3.defaultSubject, {
        commonName: hostname
      });

      const caPair = yield _this3.getCACert();
      const csrData = yield _this3.pem.createCSR(subject);

      const options = {
        csr: csrData.csr,
        clientKey: csrData.clientKey,
        serviceKey: caPair.key,
        serviceCertificate: caPair.cert,
        extFile: userSSLCnfPath
      };
      const certData = yield _this3.pem.createCertificate(options);

      return _this3._save(certData, hostname);
    })();
  }

  /**
   * Removes all certs including ca cert
   */

  removeAllCerts() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield emp(_this4.path);
    })();
  }

  /**
   * Remove a signed cert according to the given hostname
   */

  removeCert(hostname) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const folderPath = path.join(_this5.certsDirPath, hostname);
      yield emp(folderPath, true);
    })();
  }

  /**
   * Remove all self signed certs
   */

  removeAllSignedCerts() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield emp(_this6.certsDirPath);
    })();
  }

  /**
   * Check if CA is already exist, return Boolean
   */

  isCAExist() {
    return fs.existsSync(this.caKeyPath) && fs.existsSync(this.caCertPath);
  }

  /**
   * Util private methods
   */

  _save(certData, name) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      let key = '';
      let cert = '';

      // ca save
      if (!name) {
        const keyFileData = {
          content: certData.clientKey,
          path: _this7.caKeyPath
        };
        const certFileData = {
          content: certData.certificate,
          path: _this7.caCertPath
        };

        key = yield writeFile(keyFileData);
        cert = yield writeFile(certFileData);
      } else {
        const keyFileData = {
          content: certData.clientKey,
          path: _this7._makePath(name, 'key')
        };
        const certFileData = {
          content: certData.certificate,
          path: _this7._makePath(name, 'cert')
        };

        key = yield writeFile(keyFileData);
        cert = yield writeFile(certFileData);
      }

      return {
        key: key,
        cert: cert
      };
    })();
  }
  _isExist(name) {
    const keyPath = this._makePath(name, 'key');
    const certPath = this._makePath(name, 'cert');
    return fs.existsSync(keyPath) && fs.existsSync(certPath);
  }
  _makePath(hostname, type) {
    const ext = type === 'cert' ? 'crt' : 'key';
    return path.join(this.certsDirPath, hostname, `${hostname}.${ext}`);
  }
}

module.exports = CertBase;