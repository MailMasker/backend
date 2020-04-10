# Getting Started

## Check out the repo

Clone the repo. Note that this project uses submodules:

```
git submodule init
git submodule update --remote
```

and to always see the diff, including submodules, when you run `git diff`:

```
git config --global diff.submodule log
```

and finally:

```
yarn install
```

## Run it locally

Generate certificate and private key so that the localhost API can be on HTTPS:

```
yarn gencerts
```

Rename the certificate and private key to cert.pem and key.pem, respectively.

You'll need two terminals. In the first:

```
yarn generate
yarn start
```

In the second terminal:

```
yarn dynamo-local
```
