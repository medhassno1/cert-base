const fs = require('fs')
const path = require('path')
const { emp } = require('emp')
const Pem = require('./pem.js')
const { writeFile, readFile, readDir } = require('./utils.js')
const { CA_EXIST, CA_NOT_EXIST } = require('./errors.js')

/**
 * Constants
 */

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
 * ${this.path}/ca/
 *
 * User certs are stored along with keys under:
 * ${this.path}/certs/${hostname}/
 */

class CertBase {
  constructor(options) {
    this.defaultSubject = {
      ...defaultSubject,
      ...options.subject
    }
    this.pem = new Pem(options.opensslPath)
    
    this.path = options.path
    this.caDirPath = path.join(options.path, 'ca')
    this.caCertPath = path.join(this.caDirPath, 'ca.crt')
    this.caKeyPath = path.join(this.caDirPath, 'ca.key')
    this.certsDirPath = path.join(options.path, 'certs')
  }

  /**
   * Create a CA cert, if exists, throw error
   */

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

  /**
   * Get CA cert data, if not exist, throws an error
   */

  async getCACert() {
    let key, cert

    if (this.isCAExist()) {
      key = await readFile(this.caKeyPath)
      cert = await readFile(this.caCertPath)
    } else {
      throw CA_NOT_EXIST
    }

    return {
      key: key,
      cert: cert
    }
  }

  /**
   * Get cert data for the given hostname, if not exist, create one
   */

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

  /**
   * List all signed certs using its common name
   */

  async listSignedCerts() {
    let certs = []
    const files = await readDir(this.certsDirPath)

    if (files.length > 0) {
      certs = files.filter(name => name[0] === '.' ? false : true)
    }

    return certs
  }

  /**
   * Removes all certs including ca cert
   */

  async removeAllCerts() {
    await emp(this.path)
  }

  /**
   * Remove a signed cert according to the given hostname
   */

  async removeCert(hostname) {
    const folderPath = path.join(this.certsDirPath, hostname)
    await emp(folderPath, true)
  }

  /**
   * Remove all self signed certs
   */

  async removeAllSignedCerts() {
    await emp(this.certsDirPath)
  }

  /**
   * Check if CA is already exist, return Boolean
   */

  isCAExist() {
    return fs.existsSync(this.caKeyPath) && 
           fs.existsSync(this.caCertPath)
  }

  
  /**
   * Util private methods
   */

  async _save(certData, name) {
    let key = ''
    let cert = ''

    // ca save
    if (!name) {
      const keyFileData = {
        content: certData.clientKey,
        path: this.caKeyPath
      }
      const certFileData = {
        content: certData.certificate,
        path: this.caCertPath
      }

      key = await writeFile(keyFileData)
      cert = await writeFile(certFileData)
    } else {
      const keyFileData = {
        content: certData.clientKey,
        path: this._makePath(name, 'key')
      }
      const certFileData = {
        content: certData.certificate,
        path: this._makePath(name, 'cert')
      }
      
      key = await writeFile(keyFileData)
      cert = await writeFile(certFileData)
    }

    
    return {
      key: key,
      cert: cert
    }
  }
  _isExist(name) {
    const keyPath = this._makePath(name, 'key')
    const certPath = this._makePath(name, 'cert')
    return fs.existsSync(keyPath) && fs.existsSync(certPath)
  }
  _makePath(hostname, type) {
    const ext = type === 'cert' ? 'crt' : 'key'
    return path.join(this.certsDirPath, hostname, `${hostname}.${ext}`)
  }
}

module.exports = CertBase
