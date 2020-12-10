# MailMasker Backend

This is the Mail Masker backend, which includes:

- an API for the web app (and future apps on other platforms)
- the email hander: which forwards emails, putting them first on a queue to ensure no email is lost
- a handler for Stripe callbacks (for Mail Masker Premium subscriptions)

## License

[No permission](https://choosealicense.com/no-permission/) is given for this repo to be used by others. Practically speaking, this code doesn't seem to be useful to anyone else; however, we believe that there is tremendous value in transparency of making it publically accessible.

# Getting Started

The following are quick notes, jotted-down in the moment as a basis for future documentation.

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

## Run the GraphQL API locally

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

## Run the events API locally

```
brew install postgresql # I run postgresql 12.3 at the time of this writing

# Init postgres
initdb /usr/local/var/postgres

# Start the server (needs to be done each time)
pg_ctl -D /usr/local/var/postgres -l logfile start

# Create a user
createuser --pwprompt mailmasker

# Create the DB
createdb -Omailmasker -Eutf8 mailmasker

# Connect via the CLI
psql -U mailmasker -W mailmasker
```

Set up a .env file:

Contents of ./src/local/event/.env-local:

### Testing Stripe callbacks

brew cask install ngrok

OR

brew cask upgrade ngrok

Start the ngrok tunneling, which gives you

```
ngrok http https://localhost:4201
```

In the Stripe dashboard, turn on "test data", and configure a webhook to post to the URL that ngrok gives you (ex: https://a6f04893b67d.ngrok.io)

Note: the ngrok free plan gives you a different URL every time you start it, so you'll have to continually update the Stripe webhook URL

## Running in dev

Test the API at:

1. https://api.mailmasker-dev.com/playground
2. Open Settings in the GraphQL Playground interface and set `request.credentials` to `include`
3. Set `schema.polling.enable` to `false` in order to make much less noise in your CloudWatch logs
