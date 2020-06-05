import * as dal from "../../dal/createVerifiedEmail";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import Bugsnag from "@bugsnag/js";
import { MaxNumAccountsSharingAVerifiedEmail } from "../../dal/lib/constants";
import { MutationCreateVerifiedEmailArgs } from "../types.generated";
import { NotFoundError } from "../../dal";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";
import { UserInputError } from "apollo-server-core";
import { deconstructExternalEmail } from "../../dal/lib/deconstructExternalEmail";
import sendVerificationEmail from "../../dal/lib/sendVerificationEmail";
import { verifiedEmailByEmail } from "../../dal/verifiedEmailByEmail";
import { verifiedEmailsByEmailForAllUsers } from "../../dal/verifiedEmailsByEmailForAllUsers";

if (!process.env.WEB_APP_BASE_URL) {
  throw new Error("missing process.env.WEB_APP_BASE_URL");
}

export const createVerifiedEmail = async (
  parent,
  args: MutationCreateVerifiedEmailArgs,
  { dalContext, currentUserID, ses }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new Error("Must be signed in");
  }

  const cleanedDesiredEmail = args.email.toLocaleLowerCase().trim();

  const { domain } = deconstructExternalEmail({ email: cleanedDesiredEmail });
  if (
    SupportedMailDomains.includes(domain) ||
    domain.toLowerCase().includes("mailmasker") // Protect against dev environment being used as well
  ) {
    throw new UserInputError(
      "We don't support using a Mail Mask as a Verified Email address."
    );
  }

  // We do this primarily to prevent having to paginate or deal with performance issues when using the verifiedEmailsByEmailForAllUsers lookup once someone inevitably create many accounts
  // NOTE: this doesn't prevent people from doing you+1@gmail.com, but that's OK
  let verifiedEmailUsedTooManyTimes = false;
  try {
    const existingVerifiedEmails = await verifiedEmailsByEmailForAllUsers(
      dalContext,
      { email: cleanedDesiredEmail }
    );
    if (existingVerifiedEmails.length >= MaxNumAccountsSharingAVerifiedEmail) {
      verifiedEmailUsedTooManyTimes = true;
    }
  } catch (err) {
    if (err instanceof NotFoundError) {
      // No problem
    }
    // Let's just move on... hopefully the error is intermittent
    console.error(err);
    Bugsnag.notify(err);
  }
  if (verifiedEmailUsedTooManyTimes) {
    throw new UserInputError(
      `the email address ${cleanedDesiredEmail} has already been verified on the maximum number of accounts`
    );
  }

  let existingVerifiedEmail;
  try {
    existingVerifiedEmail = await verifiedEmailByEmail(dalContext, {
      email: cleanedDesiredEmail,
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
    email: cleanedDesiredEmail,
    userID: currentUserID,
  });

  if (process.env.S_STAGE !== "local") {
    try {
      await sendVerificationEmail(ses, {
        verificationCode: response.verificationCode,
        email: response.email,
      });
      console.log("verification email sent");
    } catch (err) {
      Bugsnag.notify(err);
      throw new Error(
        "We had some trouble sending you the verification email. Please try again."
      );
    }
  }

  return response;
};
