const fs = require('fs')
const path = require('path')
const test = require('tape')
const CertGenerator = require('../lib/index.js')

const certPath = path.join(__dirname, './certs')

/**
 * Init cert generator with storing path
 */

const cg = new CertGenerator({
  path: certPath
})

const subject = {
  commonName: 'my-test-ca-common-name'
}

/**
 * Test cases
 */

test('generate CA root cert', function(t) {
  t.plan(1)

  const subject = {
    commonName: 'my-test-ca-common-name'
  }

  cg.makeCACert(subject)
    .then(result => {
      // both key and cert saving operation must be true
      t.deepEqual(result, [true, true])
    })
    .catch(e => {
      if (e) throw e
    })
})

test('generate user cert by hostname', function(t) {
  t.plan(1)

  const subject = {
    commonName: 'ohmyxm.xyz'
  }

  cg.makeUserCert(subject)
    .then(result => {
      t.deepEqual(result, [true, true])
    })
})

test('`qq')