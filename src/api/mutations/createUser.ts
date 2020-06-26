import * as dal from "../../dal/";

import Bugsnag from "@bugsnag/js";
import { MaxNumAccountsSharingAVerifiedEmail } from "../../dal/lib/constants";
import { MutationResolvers } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";
import { UserInputError } from "apollo-server-core";
import { deconstructExternalEmail } from "../../dal/lib/deconstructExternalEmail";
import { deconstructMailMask } from "../../lib/common/deconstructMailMask";
import sendVerificationEmail from "../../dal/lib/sendVerificationEmail";
import { verifiedEmailsByEmailForAllUsers } from "../../dal/verifiedEmailsByEmailForAllUsers";

export const createUser: MutationResolvers["createUser"] = async (
  parent,
  args,
  { setAuthCookie, dalContext, ses }: ResolverContext,
  info
) => {
  const cleanedDesiredUsername = args.username.toLowerCase().trim();
  const cleanedDesiredVerifiedEmail = args.verifiedEmail.toLowerCase().trim();
  const cleanedDesiredEmailMask = args.emailMask.toLowerCase().trim();
  const desiredPassword = args.password.trim();

  if (!cleanedDesiredUsername) {
    throw new UserInputError("username missing");
  } else {
    const { domain } = deconstructExternalEmail({
      email: cleanedDesiredVerifiedEmail,
    });
    if (SupportedMailDomains.includes(domain)) {
      throw new UserInputError(
        `Your real email address must not be at the domain "${domain}"`
      );
    }
  }
  if (
    await dal.isUsernameTaken(dalContext, { username: cleanedDesiredUsername })
  ) {
    throw new UserInputError(
      `User with username ${args.username} already exists`
    );
  }
  if (!desiredPassword) {
    throw new UserInputError("Please specify a password");
  }

  const { alias, domain } = deconstructMailMask({
    email: cleanedDesiredEmailMask,
  });
  if (!SupportedMailDomains.includes(domain)) {
    throw new UserInputError(
      "The domain of the Mail Mask you've chosen is unsupported"
    );
  }
  const emailMaskTaken = await dal.isEmailMaskTaken(dalContext, { alias });
  if (emailMaskTaken) {
    throw new UserInputError("The Mail Mask you've chosen is already taken");
  }

  // We do this primarily to prevent having to paginate or deal with performance issues when using the verifiedEmailsByEmailForAllUsers lookup once someone inevitably create many accounts
  // NOTE: this doesn't prevent people from doing you+1@gmail.com, but that's OK
  let verifiedEmailUsedTooManyTimes = false;
  try {
    const existingVerifiedEmails = await verifiedEmailsByEmailForAllUsers(
      dalContext,
      { email: cleanedDesiredVerifiedEmail }
    );
    if (existingVerifiedEmails.length >= MaxNumAccountsSharingAVerifiedEmail) {
      verifiedEmailUsedTooManyTimes = true;
    }
  } catch (err) {
    if (err instanceof dal.NotFoundError) {
      // No problem
    }
    // Let's just move on... hopefully the error is intermittent
    console.error(err);
    Bugsnag.notify(err);
  }
  if (verifiedEmailUsedTooManyTimes) {
    throw new UserInputError(
      `the email address ${cleanedDesiredVerifiedEmail} has already been verified on the maximum number of accounts`
    );
  }

  // TODO: some say handle duplicate requests via UUID, but need to check for password match (maybe just call authenticate() ?)

  const {
    user: { id: userID, username },
    verifiedEmail,
    auth: { authToken, secondsUntilExpiry },
  } = await dal.createUser(dalContext, {
    username: cleanedDesiredUsername,
    password: desiredPassword.trim(),
    requestUUID: args.uuid,
    persistent: args.persistent,
    emailMask: cleanedDesiredEmailMask,
    verifiedEmail: cleanedDesiredVerifiedEmail,
  });

  if (process.env.S_STAGE !== "local") {
    try {
      await sendVerificationEmail(ses, {
        verificationCode: verifiedEmail.verificationCode,
        email: verifiedEmail.email,
      });
      console.log("verification email sent");
    } catch (err) {
      Bugsnag.notify(err);
      throw new Error(
        "We had some trouble sending you the verification email. Please try again."
      );
    }
  }

  setAuthCookie({ authToken, secondsUntilExpiry });

  return { userID };
};
