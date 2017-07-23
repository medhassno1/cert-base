# cert-base

Certification management tool using openssl wrapper **pem** to create and sign certifications

To install `npm install cert-base`

## Usage

Here we're going to create a CA cert, and then use it to sign a cert

```js
/**
 * First we create a CA cert
 */

const cb = new CertBase({
  path: 'path/to/a/folder'
})

cb.createCACert('commonName_for_ca')
  .then(result => {
    console.log(result.key, result.cert)
  })

/**
 * Then we sign a cert using the CA cert
 */

cg.getCertByHost('commonName_for_hostname')
  .then(result => {
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
  },
  opensslPath: '/path/to/your/openssl'
})
```
where

- **path** is the folder path you want to store your certs and keys in, regard it as a cert base
- **subject** is the subject object used when creating CA cert or signing cert by hostname. The default settings is listed below
- **opensslPath** is the location of the `openssl` executable. This is because you may want to use a custom openssl version instead of the system default `openssl` executable which is the default value of this field

```js
// subject default settings
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
    // key : the generated key content
    // cert: the generated cert content
  })
```
where

- **commonName** is the commonName field for the CA cert

### Check if CA cert exist

```js
cb.isCAExist()
```
returns `true` or `false`

### Sign a cert by hostname

Before you call this method, you must have a ca cert generated, or an error will be thrown

```js
cb.getCertByHost(hostname)
  .then(result => {})
```
where

- **hostname** is the commonName field for your cert

If you had the same hostname cert generated before, it will use that cert and won't generate a new one

### Remove all certs

```js
cb.removeAllCerts().then()
```
Removes everything inside the storage directory

### Remove cert by hostname

```js
cb.removeCert(hostname).then()
```
Removes a self signed cert with a given name

### Remove all signed certs

```js
cb.removeAllSignedCerts().then()
```
Removes all self signed certs(empty `certs` directory)

## About how certs are stored

The certs are stored under the folder path the user give when calling the constructor function.

Strorage structure:

```
cert-path/
  ca/
    ca.crt
    ca.key
  certs/
    domain1/
      domain1.crt
      domain1.key
    domain2/
      domain2.crt
      domain2.key
    ...
```
