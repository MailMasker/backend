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

Rename the certificate and private key to cert.pem and key.pem, respectively. Lastly, add the cert.pem to the Keychain app and set it to "Always Trust"

You'll need two terminals. In the first:

```
yarn generate
yarn start
```

In the second terminal:

```
yarn dynamo-local
```

Running GraphQL Playground to test the API:

1. https://localhost:4201/local/playground
2. Set the URL text box inside the interface itself to `https://localhost:4201/local/graphql` – this is because the local API is at https://localhost:4201/local/graphql
3. Open Settings in the GraphQL Playground interface and set `request.credentials` to `include`
4. Set `schema.polling.enable` to `false` in order to make much less noise in your CloudWatch logs

## Running in dev

Test the API at:

1. https://api.mailmasker-dev.com/playground
2. Open Settings in the GraphQL Playground interface and set `request.credentials` to `include`
3. Set `schema.polling.enable` to `false` in order to make much less noise in your CloudWatch logs
