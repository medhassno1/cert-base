const fs = require('fs')
const path = require('path')
const test = require('tape')
const { emp } = require('emp')
const CertBase = require('../lib/index.js')

/**
 * Constants
 */

const testCertPath = path.join(__dirname, '../certs')
const TEST_CA_NAME = 'CertBase CA Test'
const TEST_HOSTNAME = 'www.baidu.com'

/**
 * Init cert generator with storing path
 */

const cb = new CertBase({
  path: testCertPath,
  // opensslPath: 
})

/**
 * Remove all certs and prepare to test
 */

test('removeAllCerts: prepare test environment', function(t) {
  t.plan(1)

  cb.removeAllCerts()
    .then(() => {
      t.pass('All removed')
    })
    .catch(e => {
      throw e
    })
})

/**
 * CA methods
 */

test('isCAExist: no CA exists', function(t) {
  t.plan(1)

  t.equal(cb.isCAExist(), false)
})
test('getCACert: no CA exists', function(t) {
  t.plan(1)
  cb.getCACert()
    .catch(e => t.ok(e))
})

// create CA
test('createCAcert', function(t) {
  t.plan(2)

  cb.createCACert(TEST_CA_NAME)
    .then(result => {
      // both key and cert file should exist
      t.equal(result.key.length > 0, true)
      t.equal(result.cert.length > 0, true)
    })
    .catch(e => {
      throw e
    })
})

test('isCAExist: CA exists', function(t) {
  t.plan(1)

  t.equal(cb.isCAExist(), true)
})
test('getCACert: CA exists', function(t) {
  t.plan(2)

  cb.getCACert()
    .then(result => {
      t.equal(result.key.length > 0, true)
      t.equal(result.cert.length > 0, true)
    })
    .catch(e => {
      throw e
    })
})

/**
 * Cert signing methods
 */

test('getCertByHost', function(t) {
  t.plan(2)

  cb.getCertByHost(TEST_HOSTNAME)
    .then(result => {
      t.equal(result.key.length > 0, true)
      t.equal(result.cert.length > 0, true)
    })
    .catch(e => {
      throw e
    })
})

test('removeCert', function(t) {
  cb.removeCert(TEST_HOSTNAME)
    .catch(e => {
      throw e
    })
  
  t.end()
})

/**
 * Clean up all certs
 */

test('removeAllCerts: clean up test certs', function(t) {
  emp(testCertPath, true)
  t.end()
})
