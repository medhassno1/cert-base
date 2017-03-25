# cert-base

Certification management tool using openssl wrapper **pem** to create and sign certifications

To install `npm install cert-base`

## Usage

Here we're going to create a CA certification, and then use it to sign a certification

```js
/**
 * First we create a CA cert
 */

const cb = new CertBase({
  path: 'path/to/a/folder'
})

cb.createCACert('commonName_for_ca')
  .then(result => {
    // path to generated files
    console.log(result.key, result.cert)
  })

/**
 * Then we sign a cert using the CA cert
 */

cg.getCertByHost('commonName_for_hostname')
  .then(result => {
    // path to generated files
    console.log(result.key, result.cert)
  })
```

## API Documentations

### Constructor options

```js
const cb = new CertBase({
  path: 'path/to/a/folder',
  subject: {
    country: 'CN',
    organization: 'CertBase',
    organizationUnit: 'CertBase Certification'
  }
})
```
where

- **path** is the folder path you want to store your certs and keys in, regard it as a cert base
- **subject** is the subject object used when creating CA cert or signing cert by hostname. It has a default settings

```js
{
  country: 'CN',
  organization: 'CertBase',
  organizationUnit: 'CertBase Certification'
}
```

For more subject options and documentations, check [here](https://github.com/Dexus/pem#create-a-certificate-signing-request). This is because **pem** is used inside this package to do all openssl works

### Create a CA cert

```js
cb.createCACert(commonName)
  .then(result => {
    // result object has 2 fields:
    //
    // key : the generated key file path
    // cert: the generated cert file path

    // do what you want with result
  })
```
where
- **commonName** is the commonName for the CA cert, give it whatever you want

This method returns a promise

For more subject options, check [here](https://github.com/Dexus/pem#create-a-certificate-signing-request), because inside this package we use **pem** to do all those openssl work

### Check if CA cert exist

```js
cb.isCAExist()
```
returns `true` or `false`

### Sign a cert by hostname

Before you call this method, you must have a ca cert generated, or it will throw an error

```js
cb.getCertByHost(hostname)
  .then(result => {
    // same as above
  })
```
where
- **subject** is the same as the above method, give your hostname to `commonName` field

This method returns a promise

### Remove all certs

```js
cb.removeAllCerts()
  .then(() => {

  })
```
This method returns a promise

### Remove cert by hostname

```js
cb.removeCert(hostname)
  .then(() => {

  })
```
This method returns a promise
