import * as dal from "../../dal/createVerifiedEmail";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import Bugsnag from "@bugsnag/js";
import { NotFoundError } from "../../dal";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";
import { UserInputError } from "apollo-server-core";
import { deconstructExternalEmail } from "../../dal/lib/deconstructExternalEmail";
import sendVerificationEmail from "../lib/sendVerificationEmail";
import { verifiedEmailByEmail } from "../../dal/verifiedEmailByEmail";

if (!process.env.WEB_APP_BASE_URL) {
  throw new Error("missing process.env.WEB_APP_BASE_URL");
}

export const createVerifiedEmail = async (
  parent,
  args,
  { dalContext, currentUserID, ses }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new Error("Must be signed in");
  }

  const { domain } = deconstructExternalEmail({ email: args.email });
  if (
    SupportedMailDomains.includes(domain) ||
    domain.toLowerCase().includes("mailmasker") // Protect against dev environment being used as well
  ) {
    throw new UserInputError(
      "We don't support using a Mail Mask as a Verified Email address."
    );
  }

  let existingVerifiedEmail;
  try {
    existingVerifiedEmail = await verifiedEmailByEmail(dalContext, {
      email: args.email,
      ownerUserID: currentUserID,
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
    userID: currentUserID,
  });

  if (process.env.S_STAGE !== "local") {
    try {
      await sendVerificationEmail(ses, {
        verificationCode: response.verificationCode,
        email: response.email,
      });
    } catch (err) {
      Bugsnag.notify(err);
      throw new Error(
        "We had some trouble sending you the verification email. Please try again."
      );
    }
  }

  return response;
};
