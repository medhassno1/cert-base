const pem = require('pem')
const {
  createCSR, 
  createCertificate,
  readCertificateInfo,
  writeFiles,
  readFile
} = require('./utils.js')

/**
 * Constants
 */

const CA_ROOT_NAME = '##ca##'

/**
 * Certs storing location:
 *
 * CA cert also known as 'root cert' is stored along with CA key under:
 * ${this.path}/ca-pkg
 *
 * User certs are stored along with keys under:
 * ${this.path}/${hostname}-pkg
 */

class CertGenerator {
  constructor(config) {
    this.path = config.path
  }

  async makeCACert(userSubject) {
    let certData = ''

    try {
      const csrData = await createCSR(userSubject)
      const options = {
        csr: csrData.csr,
        clientKey: csrData.clientKey,
        selfSigned: true
      }

      certData = await createCertificate(options)
    } catch (e) {
      throw e
    }

    return this._save({
      key: certData.serviceKey,
      cert: certData.certificate
    })
  }
  async makeUserCert(userSubject) {
    let certData = ''
    // get hostname for the final file name
    const _hostname = userSubject.commonName
    const caKeyPath = this.getCert().key
    
    try {
      const keyContent = await readFile(caKeyPath)
      const csrData = await createCSR(userSubject)

      const options = {
        csr: csrData.csr,
        serviceKey: keyContent
      }

      certData = await createCertificate(options)
    } catch (e) {
      throw e
    }

    return this._save({
      key: certData.clientKey,
      cert: certData.certificate
    }, _hostname)
  }

  // cert access
  getCert(name=CA_ROOT_NAME) {
    return {
      key: this._makePath(name, 'key'),
      cert: this._makePath(name, 'cert')
    }
  }
  // just an alias for getCert() when no param
  getRootCert() {
    return this.getCert()
  }

  _save(data, name=CA_ROOT_NAME) {
    const fileDataList = [{
      content: data.key,
      path: this._makePath(name, 'key')
    }, {
      content: data.cert,
      path: this._makePath(name, 'cert')
    }]
     
    return writeFiles(fileDataList)
  }
  _makePath(name, type) {
    const ext = type === 'cert' ? 'crt' : 'key'
    return `${this.path}/${name}-pkg/${name}-${type}.${ext}`
  }
}

module.exports = CertGenerator
