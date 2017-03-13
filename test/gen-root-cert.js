const test = require('tape')
// const CertGenerator = require('../lib/index.js')

// const cg = new CertGenerator({
//   path: 'certs'
// })

// cg.genRootCert({
//   commonName: 'my-common-name'
// })

test('example test', function(t) {
  t.plan(1)

  t.equal(typeof Date.now, 'function')
  // const start = Date.now()
  // setTimeout(function () {
  //   t.equal(Date.now() - start, 104)
  // }, 100)
})