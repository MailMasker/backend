import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { ResolverContext } from "../lib/ResolverContext";
import sendTransactionalEmail from "../../dal/lib/sendTransactionalEmail";
import { userByID } from "../../dal/userByID";

export const verifyEmailWithCode = async (
  parent,
  { code, email },
  { dalContext, ses }: ResolverContext,
  info
) => {
  if (!code || !email) {
    throw new UserInputError(
      "Either the verification code or the email is missing"
    );
  }

  const verifiedEmail = await dal.verifyCodeForVerifiedEmail(dalContext, {
    verificationCode: code,
    verifiedEmailEmail: email,
  });

  if (!verifiedEmail.verified) {
    console.error(
      "Verified email should just have been verified, but it's being returned as non-verified. Something's wrong"
    );
  }

  if (verifiedEmail.verified) {
    // Look up all routes that have this email address and send the intro email
    const user = await userByID(dalContext, verifiedEmail.ownerUserID);
    await Promise.all(
      user.emailMaskIDs.map((emailMaskID) =>
        dal.emailMaskByID(dalContext, emailMaskID).then((emailMask) =>
          sendTransactionalEmail(ses, {
            to: [`${emailMask.alias}@${emailMask.domain}`],
            subject: `[Mail Masker] Your new Mail Mask, ${emailMask.alias}@${emailMask.domain}, is now active!`,
            bodyHTML: `Emails received at ${emailMask.alias}@${emailMask.domain} (such as this one) will be forwarded to ${verifiedEmail.email}.`,
          })
        )
      )
    );
  }

  return {
    id: verifiedEmail.id,
    email: verifiedEmail.email,
    verified: verifiedEmail.verified,
  };
};
