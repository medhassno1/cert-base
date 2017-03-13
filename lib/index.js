const fs = require('fs');
const fsPath = require('fs-path');
const pem = require('pem');
const {
  createCSR,
  createCertificate,
  readCertificateInfo
} = require('./utils.js');

class CertGenerator {
  constructor(config) {
    this.path = config.path;
    this.rootCertPath = `${config.path}/certgen-root-cert.crt`;
    this.signedCertsPath = `${this.path}/signed-certs`;
  }

  genRootCert(userSubject) {
    return createCSR(userSubject).then(csrData => {
      const options = {
        csr: csrData.csr,
        clientKey: csrData.clientKey,
        selfSigned: true
      };
      return createCertificate(options);
    }).then(certData => this._saveRootCert(certData.certificate)).catch(e => {
      if (e) {
        throw e;
      }
    });
  }
  genCertByHost(userSubject) {
    // get hostname for the final file name
    const _hostname = userSubject.commonName;

    fs.readFile(this.rootCertPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      console.log(data);
      // createCSR(userSubject)
      //   .then(csrData => {
      //     const options = {
      //       csr: csrData.csr
      //       serviceKey: 
      //     }
      //     return createCertificate(options)
      //   })
      //   .then(certData => this._saveUserCert(certData.certificate, _hostname))
    });
  }
  getCertPathByHost(hostname) {
    return `${this.signedCertsPath}/${hostname}.crt`;
  }

  _saveRootCert(content) {
    return new Promise((resolve, reject) => {
      fsPath.writeFile(this.rootCertPath, content, err => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  }
  _saveUserCert(content, hostname) {
    const _path = `${this.signedCertsPath}/${hostname}`;

    fsPath.writeFile(_path, content, err => {
      if (err) {
        throw err;
      }
    });
  }
}

module.exports = CertGenerator;