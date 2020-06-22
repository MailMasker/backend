import AWS from "aws-sdk";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import { DALContext } from "./dal";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { createStripeSubscription } from "./dal/createStripeSubscription";
import dayjs from "dayjs";
import express from "express";
import { markStripeSubscriptionDeleted } from "./dal/markStripeSubscriptionDeleted";
import newDynamoDB from "./dal/lib/newDynamoDB";
import serverless from "serverless-http";
import { stripeCheckoutSessionByID } from "./dal/stripeCheckoutSessionByID";
import { stripeSubscriptionByID } from "./dal/stripeSubscriptionByID";
import { userByID } from "./dal/userByID";

const dalContext: DALContext = {
  ddb: newDynamoDB(),
};

Bugsnag.start({
  apiKey: "3e593a7f71377ef86cf65c7cda2570db",
  plugins: [BugsnagPluginExpress],
  releaseStage: process.env.BUGSNAG_RELEASE_STAGE,
  enabledReleaseStages: ["dev", "prod"],
  appType: "events",
  // @ts-ignore
  collectUserIp: false,
  hostname: process.env.API_DOMAIN,
});

if (!process.env.STRIPE_PRIVATE_KEY) {
  Bugsnag.notify("process.env.STRIPE_PRIVATE_KEY missing");
}

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY ?? "", {
  apiVersion: "2020-03-02",
});

// Find your endpoint's secret in your Dashboard's webhook settings
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

const app = express();

app.post(
  "/events",
  bodyParser.json(),
  async (request: express.Request, response: express.Response) => {
    console.log("request to events-handler: ", JSON.stringify(request));

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

const handler = serverless(app);

export { handler };
