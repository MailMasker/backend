import bodyParser from "body-parser";
import express from "express";
import serverless from "serverless-http";

const stripe = require("stripe")("sk_test_y4mgUwBVREMB30AG5rHnSst200EZseO09s");

// Find your endpoint's secret in your Dashboard's webhook settings
const endpointSecret = "whsec_EwMBdVeOmAR4ACrZC28AyB94EHnvlQo8";

const app = express();

app.post(
  "/stripe-callbacks",
  bodyParser.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Fulfill the purchase...
      console.log(session);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

const handler = serverless(app);

export { handler };
