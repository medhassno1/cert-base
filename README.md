# cert-gen

Certification management tool using openssl wrapper **pem** to create and sign certifications

## Usage

To create a CA root certification, and then use it to sign a certificate

```js
/**
 * First we create a CA root cert
 */

const cg = new CertGenerator({
  path: 'path/to/a/folder/to/store/the/cert'
})

const caSubject = {
  commonName: 'my-ca-common-name'
}

cg.makeCACert(caSubject)

// then the ca root cert and key should be in the folder path you provide in the constructor function

/**
 * Then we sign a cert using the root cert
 */

const subject = {
  commonName: 'yourhostname.com'
}

cg.makeUserCert(subject)

// Cert will still be in the previous folder, done!
```

## API Documentations

### constructor options

Currently only one field is supported

```js
const cg = new CertGenerator({
  path: 'path/to/a/folder/to/store/the/cert'
})
```
where

- **path** is the folder path you want to store your certs and keys in


### create a CA root cert

```js
cg.makeCACert(subject)
```
returns a promise

where
- **subject** is the subject object that a cert needs. It has a default settings

```js
{
  country: 'CN',
  organization: 'Transfer',
  organizationUnit: 'Transfer Proxy Certification'
}
```

For more subject options, check [here](https://github.com/Dexus/pem#create-a-certificate-signing-request), because inside this package we use **pem** to do all those openssl work

### sign a cert by root cert using a hostname

Before you call this method, you must have a root cert generated

```js
cg.makeUserCert(subject)
```
returns a promise

where
- **subject** is the same as the above method, give your hostname to `commonName` field









s
