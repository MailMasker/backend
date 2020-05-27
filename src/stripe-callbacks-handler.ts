import AWS from "aws-sdk";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
import { DALContext } from "./dal";
import bodyParser from "body-parser";
import express from "express";
import serverless from "serverless-http";
import { updateUser } from "./dal/updateUser";

AWS.config.update({ region: "us-east-1" });

const dalContext: DALContext = {
  ddb: new AWS.DynamoDB({}),
};

Bugsnag.start({
  apiKey: "3e593a7f71377ef86cf65c7cda2570db",
  plugins: [BugsnagPluginExpress],
  releaseStage: process.env.BUGSNAG_RELEASE_STAGE,
});

if (!process.env.STRIPE_SECRET_KEY) {
  Bugsnag.notify("process.env.STRIPE_SECRET_KEY missing");
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Find your endpoint's secret in your Dashboard's webhook settings
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
if (!endpointSecret) {
  Bugsnag.notify("endpointSecret missing");
}

const app = express();

app.post(
  "/stripe-callbacks",
  bodyParser.raw({ type: "application/json" }),
  (request: express.Request, response: express.Response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    console.debug("request.headers: ");
    console.debug(request.headers);

    console.debug("request: ");
    console.debug(request);

    console.debug("endpointSecret: ");
    console.debug(endpointSecret);

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      Bugsnag.notify(err);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log(
        `checkout of session ${session.id} resulted in subscription ${session.subscription}`
      );

      // updateUser(dalContext, )

      // Fulfill the purchase...
      console.debug(session);
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      console.log(`deleted subscription ${subscription.id}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

const handler = serverless(app);

export { handler };
