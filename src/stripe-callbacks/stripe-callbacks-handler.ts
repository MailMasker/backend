import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import { DALContext } from "../dal";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { createStripeSubscription } from "../dal/createStripeSubscription";
import dayjs from "dayjs";
import express from "express";
import { markStripeSubscriptionDeleted } from "../dal/markStripeSubscriptionDeleted";
import newDynamoDB from "../dal/lib/newDynamoDB";
import serverless from "serverless-http";
import { stripeCheckoutSessionByID } from "../dal/stripeCheckoutSessionByID";
import { stripeSubscriptionByID } from "../dal/stripeSubscriptionByID";
import { userByID } from "../dal/userByID";

const dalContext: DALContext = {
  ddb: newDynamoDB(),
};

Bugsnag.start({
  apiKey: "3e593a7f71377ef86cf65c7cda2570db",
  plugins: [BugsnagPluginExpress],
  releaseStage: process.env.BUGSNAG_RELEASE_STAGE,
  enabledReleaseStages: ["dev", "prod"],
  appType: "stripe-callbacks",
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
  "/stripe-callbacks",
  bodyParser.raw({ type: "application/json" }),
  async (request: express.Request, response: express.Response) => {
    const sig = request.headers["stripe-signature"];

    if (!endpointSecret) {
      throw new Error("endpointSecret missing");
    }

    let event: ReturnType<typeof stripe.webhooks.constructEvent>;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        sig as any,
        endpointSecret
      );
    } catch (err) {
      Bugsnag.notify(err);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`stripe event type: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log(
        `checkout of session ${session.id} resulted in subscription ${session.subscription}`
      );

      const { userID } = await stripeCheckoutSessionByID(
        dalContext,
        session.id
      );

      Bugsnag.setUser(userID);

      const user = await userByID(dalContext, userID);

      console.log("finished looking up user by ID");

      if (user._stripeSubscriptionID) {
        const errorMessage = `user ${userID} is checking out and added new subscription ${session.subscription}, but already has existing subscription ${user._stripeSubscriptionID}. we will allow the old one to be overwritten, but in this case, there may be multiple subscriptions for this user.`;
        console.error(errorMessage);
        Bugsnag.notify(new Error(errorMessage));
      }

      await createStripeSubscription(dalContext, {
        stripeSubscriptionID: session.subscription as string,
        userID: userID,
        stripeCustomerID: session.customer as string,
      });

      console.log("finished creating stripe subscription");
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const { userID } = await stripeSubscriptionByID(
        dalContext,
        subscription.id
      );

      await markStripeSubscriptionDeleted(dalContext, {
        stripeSubscriptionID: subscription.id,
        userID,
        deletedISO: dayjs().toISOString(),
      });

      console.log(`deleted subscription ${subscription.id}`);
    }

    console.log("stripe webhook callback done");

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

const handler = serverless(app);

export { handler };
