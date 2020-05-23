import { ApolloError } from "apollo-server-core";
import Bugsnag from "@bugsnag/js";
import { MutationCreateCheckoutSessionArgs } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-express";

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
if (!process.env.STRIPE_PRIVATE_KEY) {
  Bugsnag.notify("missing process.env.STRIPE_PRIVATE_KEY");
}

export const createCheckoutSession = async (
  parent,
  args: MutationCreateCheckoutSessionArgs,
  { dalContext }: ResolverContext,
  info
) => {
  if (!args.priceID) {
    throw new UserInputError("Unable to check out because plan not selected");
  }

  console.info("creating checkout session");

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: args.priceID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `https://${process.env.WEB_APP_BASE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://${process.env.WEB_APP_BASE_URL}/checkout-cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    console.debug("session", session);

    return session.id;
  } catch (error) {
    console.error(error);
    Bugsnag.notify(error);
    throw new ApolloError("Unknown error while creating checkout error");
  }
};
