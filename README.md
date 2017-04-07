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

Before you call this method, you must have a ca cert generated, or it will throw an error

```js
cb.getCertByHost(hostname)
  .then(result => {})
```
where
- **hostname** is the commonName field for your cert

### Remove all certs

```js
cb.removeAllCerts().then()
```
Literally you don't need any description here

### Remove cert by hostname

```js
cb.removeCert(hostname).then()
```
No, no description either

### List all certs

```js
cb.listCerts()
  .then(result => {})
```

The **result** object has `ca` and `certs` 2 fields where

- **ca** is the commonName of the ca cert
- **certs** is an array of the user certs name

## About How certs are stored

The certs are stored under the folder path the user give when calling the constructor function.

For each domain, which contains actually 2 files(`.key` file and `.crt` file) or called a **pair**, the files are placed under a folder named the same as the domain name. Like this:

```
cert-path/
  domain1/
    domain1.key
    domain1.crt
  domain2/
    domain2.key
    domain2.crt
  ...
```
