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
    
    const subject = {
      ...this.defaultSubject,
      commonName: commonName
    }

    const csrData = await createCSR(subject)
    const options = {
      csr: csrData.csr,
      clientKey: csrData.clientKey,
      selfSigned: true
    }
    const certData = await createCertificate(options)

    return this._save(certData)
  }

  async getCACert() {
    let key, cert

    if (this.isCAExist()) {
      key = await readFile(this._makePath(CA_ROOT_NAME, 'key'))
      cert = await readFile(this._makePath(CA_ROOT_NAME, 'cert'))
    } else {
      throw CA_NOT_EXIST
    }

    return {
      key: key,
      cert: cert
    }
  }

  async getCertByHost(hostname) {
    // if exist, return current cert and key
    if (this._isExist(hostname)) {
      return {
        key: this._makePath(hostname, 'key'),
        cert: this._makePath(hostname, 'cert')
      }
    }
    
    // if not, create one
    const subject = {
      ...this.defaultSubject,
      commonName: hostname
    }
    
    const caKey = this.getCACert().key
    const csrData = await createCSR(subject)

    const options = {
      csr: csrData.csr,
      serviceKey: caKey
    }
    const certData = await createCertificate(options)
    
    return this._save(certData, hostname)
  }

  async removeAllCerts() {
    const result = await rimraf(this.path)
    return result
  }

  async removeCert(hostname) {
    const result = await rimraf(this._makeFolderPath(hostname))
    return result
  }

  isCAExist() {
    return this._isExist()
  }

  // utils

  async _save(certData, name=CA_ROOT_NAME) {
    const keyFileData = {
      content: certData.serviceKey,
      path: this._makePath(name, 'key')
    }
    const certFileData = {
      content: certData.certificate,
      path: this._makePath(name, 'cert')
    }
    
    const key = await writeFile(keyFileData)
    const cert = await writeFile(certFileData)
    
    return {
      key: key,
      cert: cert
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
