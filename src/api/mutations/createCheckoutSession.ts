import {
  AuthenticatedResolverContext,
  ResolverContext,
} from "../lib/ResolverContext";

import { ApolloError } from "apollo-server-core";
import Bugsnag from "@bugsnag/js";
import { MutationCreateCheckoutSessionArgs } from "../types.generated";
import { UserInputError } from "apollo-server-express";
import { createStripeCheckoutSession } from "../../dal/createStripeCheckoutSession";
import { emailMaskByID } from "../../dal";
import { userByID } from "../../dal/userByID";

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
if (!process.env.STRIPE_PRIVATE_KEY) {
  Bugsnag.notify("missing process.env.STRIPE_PRIVATE_KEY");
}

export const createCheckoutSession = async (
  parent,
  args: MutationCreateCheckoutSessionArgs,
  { dalContext, currentUserID }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new Error("couldn't determine user");
  }
  if (!args.priceID) {
    throw new UserInputError("Unable to check out because plan not selected");
  }

  console.info("creating checkout session");

  let firstMailMaskEmail = "";
  try {
    const user = await userByID(dalContext, currentUserID);
    if (user.emailMaskIDs?.length > 0) {
      const firstMailMask = await emailMaskByID(
        dalContext,
        user.emailMaskIDs[0]
      );
      if (firstMailMask) {
        firstMailMaskEmail = `${firstMailMask.alias}.stripe@${firstMailMask.domain}`;
      }
    }
  } catch (err) {
    // An error here shouldn't block
    Bugsnag.notify(err);
  }

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
      success_url: `${process.env.WEB_APP_BASE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEB_APP_BASE_URL}/checkout-cancel?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: firstMailMaskEmail ?? undefined,
    });

    console.debug("session", session);

    await createStripeCheckoutSession(dalContext, currentUserID, session.id);

    return session.id;
  } catch (error) {
    console.error(error);
    Bugsnag.notify(error);
    throw new ApolloError("Unknown error while creating checkout error");
  }
};
