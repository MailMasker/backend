import * as dal from "../../dal/createVerifiedEmail";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { NotFoundError } from "../../dal";
import { verifiedEmailByEmail } from "../../dal/verifiedEmailByEmail";

// TODO: move this into the context

// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// Set the region
AWS.config.update({ region: "REGION" });

export const createVerifiedEmail = async (
  parent,
  args,
  { setAuthCookie, dalContext, currentUserID }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new Error("Must be signed in");
  }
  let existingVerifiedEmail;
  try {
    existingVerifiedEmail = await verifiedEmailByEmail(dalContext, {
      email: args.email,
      ownerUserID: currentUserID
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      // This is good: it means the verified email is not already in use
    } else {
      throw err;
    }
  }

  if (existingVerifiedEmail) {
    if (existingVerifiedEmail.verified) {
      throw new Error(
        "The email address provided is already verified for your account"
      );
    }
    throw new Error(
      "The email address provided is already in the process of being verified, but has not yet been verified"
    );
  }

  const response = await dal.createVerifiedEmail(dalContext, {
    email: args.email,
    userID: currentUserID
  });

  // Create sendEmail params
  const params = {
    Destination: {
      ToAddresses: ["jonsibley@gmail.com"]
    },
    Message: {
      /* required */
      Body: {
        Html: {
          Charset: "UTF-8",
          // TODO: set up for various environments: dev and prod
          Data: `Dear username,

<a href="http://localhost:3001/verify-email/jonsibley+22@gmail.com/code/c6263648-5783-45a3-904a-e394ad88851a">Click here</a> to verify your email address (jonsibley@gmail.com).`
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "[1nt] Verify your email address"
      }
    },
    Source: "support@1nt.email"
  };

  // Create the promise and SES service object
  const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  await sendPromise
    .then(function(data) {
      console.debug(data.MessageId);
    })
    .catch(function(err) {
      console.error(err, err.stack);
    });

  return response;
};
