const fs = require('fs')
const path = require('path')
const test = require('tape')
const CertBase = require('../lib/index.js')

const testCertPath = path.join(__dirname, './certs')
const TEST_CA_NAME = 'test_ca'
const TEST_HOSTNAME = 'ohmyxm.xyz'

/**
 * Init cert generator with storing path
 */

const cg = new CertBase({
  path: testCertPath
})


/**
 * Remove all certs and prepare to test
 */

test('removeAllCerts: prepare test environment', function(t) {
  t.plan(1)

  cg.removeAllCerts()
    .then(result => {
      t.equal(result, true)
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

  t.equal(cg.isCAExist(), false)
})
test('getCACert: no CA exists', function(t) {
  t.plan(1)
  t.throws(cg.getCACert)
})

test('createCAcert', function(t) {
  t.plan(2)

  cg.createCACert(TEST_CA_NAME)
    .then(result => {
      // both key and cert file should exist
      t.equal(fs.existsSync(result.key), true)
      t.equal(fs.existsSync(result.cert), true)
    })
    .catch(e => {
      throw e
    })
})

test('isCAExist: CA exists', function(t) {
  t.plan(1)

  t.equal(cg.isCAExist(), true)
})
test('getCACert: CA exists', function(t) {
  t.plan(2)

  const ca = cg.getCACert()

  t.equal(fs.existsSync(ca.key), true)
  t.equal(fs.existsSync(ca.cert), true)
})

/**
 * Cert signing methods
 */

test('getCertByHost', function(t) {
  t.plan(2)

  cg.getCertByHost(TEST_HOSTNAME)
    .then(result => {
      t.equal(fs.existsSync(result.key), true)
      t.equal(fs.existsSync(result.cert), true)
    })
    .catch(e => {
      throw e
    })
})

test('removeCert', function(t) {
  t.plan(1)

  cg.removeCert(TEST_HOSTNAME)
    .then(result => {
      t.equal(result, true)
    })
    .catch(e => {
      throw e
    })
})

/**
 * Clean up all certs
 */

test('removeAllCerts: clean up test certs', function(t) {
  t.plan(1)
  
  cg.removeAllCerts()
    .then(result => {
      t.equal(result, true)
    })
    .catch(e => {
      throw e
    })
})
