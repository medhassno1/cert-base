const test = require('tape')
const CertGenerator = require('../lib/index.js')

/*
 * Init cert generator with storing path
 */

const cg = new CertGenerator({
  path: 'certs'
})

/*
 * Test cases
 */

test('generate root cert', function(t) {
  t.plan(1)

  const subject = {
    commonName: 'my-test-common-name'
  }

  cg.genRootCert(subject)
    .then(result => {
      t.equal(result, true)
    })
})