const fs = require('fs')
const {
  createCSR, 
  createCertificate,
  writeFile,
  readFile,
  rimraf
} = require('./utils.js')
const { 
  CA_EXIST,
  CA_NOT_EXIST 
} = require('./errors.js')

/**
 * Constants
 */

const CA_ROOT_NAME = '##ca##'
const defaultSubject = {
  country: 'CN',
  organization: 'CertBase',
  organizationUnit: 'CertBase Certification'
}

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
    this.path = options.path
    this.defaultSubject = {
      ...defaultSubject,
      ...options.subject
    }
  }

  async createCACert(commonName) {
    // if ca cert exist, error
    if (this.isCAExist()) {
      throw CA_EXIST
    }
    
    let certData = ''
    const subject = {
      ...this.defaultSubject,
      commonName: commonName
    }

    try {
      const csrData = await createCSR(subject)
      const options = {
        csr: csrData.csr,
        clientKey: csrData.clientKey,
        selfSigned: true
      }

      certData = await createCertificate(options)
    } catch (e) {
      throw e
    }

    return this._save(certData)
  }

  getCACert() {
    if (this.isCAExist()) {
      return {
        key: this._makePath(CA_ROOT_NAME, 'key'),
        cert: this._makePath(CA_ROOT_NAME, 'cert')
      }
    } else {
      throw CA_NOT_EXIST
    }
  }

  async getCertByHost(hostname) {
    const caKeyPath = this.getCACert().key

    // if exist, return current cert and key
    if (this._isExist(hostname)) {
      return {
        key: this._makePath(hostname, 'key'),
        cert: this._makePath(hostname, 'cert')
      }
    }
    
    // if not, create one
    let certData = ''
    const subject = {
      ...this.defaultSubject,
      commonName: hostname
    }

    try {
      const keyContent = await readFile(caKeyPath)
      const csrData = await createCSR(subject)

      const options = {
        csr: csrData.csr,
        serviceKey: keyContent
      }

      certData = await createCertificate(options)
    } catch (e) {
      throw e
    }

    return this._save(certData, hostname)
  }

  async removeAllCerts() {
    let result = false

    try {
      result = await rimraf(this.path)
    } catch (e) {
      throw e
    }

    return result
  }

  async removeCert(hostname) {
    let result = false
    
    try {
      result = await rimraf(this._makeFolderPath(hostname))
    } catch (e) {
      throw e
    }

    return result
  }

  isCAExist() {
    return this._isExist()
  }

  // utils

  async _save(certData, name=CA_ROOT_NAME) {
    let keyPath, certPath

    const keyFileData = {
      content: certData.serviceKey,
      path: this._makePath(name, 'key')
    }
    const certFileData = {
      content: certData.certificate,
      path: this._makePath(name, 'cert')
    }
    
    try {
      keyPath = await writeFile(keyFileData)
      certPath = await writeFile(certFileData)
    } catch (e) {
      throw e
    }
    
    return {
      key: keyPath,
      cert: certPath
    }
  }
  _isExist(name=CA_ROOT_NAME) {
    const keyPath = this._makePath(name, 'key')
    const certPath = this._makePath(name, 'cert')
    return fs.existsSync(keyPath) && fs.existsSync(certPath)
  }
  _makePath(name, type) {
    const ext = type === 'cert' ? 'crt' : 'key'
    return `${this._makeFolderPath(name)}/${name}-${type}.${ext}`
  }
  _makeFolderPath(name) {
    return `${this.path}/${name}-pkg`
  }
}

module.exports = CertBase
