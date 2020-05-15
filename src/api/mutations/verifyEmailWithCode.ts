import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { ResolverContext } from "../lib/ResolverContext";

export const verifyEmailWithCode = async (
  parent,
  { code, email },
  { dalContext }: ResolverContext,
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
    // verifiedEmail.ownerUserID
  }

  return {
    id: verifiedEmail.id,
    email: verifiedEmail.email,
    verified: verifiedEmail.verified,
  };
};
