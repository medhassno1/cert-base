const fs = require('fs')
const path = require('path')
const { emp } = require('emp')
const Pem = require('./pem.js')
const { writeFile, readFile, readDir } = require('./utils.js')
const { CA_EXIST, CA_NOT_EXIST } = require('./errors.js')

/**
 * Constants
 */

const CA_ROOT_NAME = '##ca##'
const defaultSubject = {
  country: 'CN',
  organization: 'CertBase',
  organizationUnit: 'CertBase Certification'
}
const caSSLCnfPath = path.join(__dirname, '../configs/ca.ext')
const userSSLCnfPath = path.join(__dirname, '../configs/user.ext')

/**
 * Certs location:
 *
 * CA cert also known as 'root cert' is stored with CA key under:
 * ${this.path}/##ca##
 *
 * User certs are stored along with keys under:
 * ${this.path}/${hostname}
 */

class CertBase {
  constructor(options) {
    this.path = options.path
    this.defaultSubject = {
      ...defaultSubject,
      ...options.subject
    }
    this.pem = new Pem(options.opensslPath)
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

    const csrData = await this.pem.createCSR(subject)
    const options = {
      csr: csrData.csr,
      clientKey: csrData.clientKey,
      selfSigned: true,
      extFile: caSSLCnfPath
    }
    const certData = await this.pem.createCertificate(options)

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
      const key = await readFile(this._makePath(hostname, 'key'))
      const cert = await readFile(this._makePath(hostname, 'cert'))

      return {
        key: key,
        cert: cert
      }
    }
    
    // if not, create one
    const subject = {
      ...this.defaultSubject,
      commonName: hostname
    }
    
    const caPair = await this.getCACert()
    const csrData = await this.pem.createCSR(subject)

    const options = {
      csr: csrData.csr,
      clientKey: csrData.clientKey,
      serviceKey: caPair.key,
      serviceCertificate: caPair.cert,
      extFile: userSSLCnfPath
    }
    const certData = await this.pem.createCertificate(options)
    
    return this._save(certData, hostname)
  }

  async removeAllCerts() {
    await emp(this.path)
    return true
  }

  async removeCert(hostname) {
    await emp(this._makeFolderPath(hostname), true)
    return true
  }

  async listCerts() {
    let files, certs = {}

    try {
      files = await readDir(this.path)

      if (files.length >= 1) {
        certs = {
          ca: CA_ROOT_NAME,
          certs: []
        }
        
        certs.certs = files.filter(name => name !== CA_ROOT_NAME)
      }
    } catch (e) {}

    return certs
  }

  isCAExist() {
    return this._isExist()
  }

  // utils

  async _save(certData, name=CA_ROOT_NAME) {
    const keyFileData = {
      content: certData.clientKey,
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
    return path.join(this._makeFolderPath(name), `${name}.${ext}`)
  }
  _makeFolderPath(name) {
    return path.join(this.path, `${name}`)
  }
}

module.exports = CertBase
