import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";

export const verifyEmailWithCode = async (
  parent,
  { code, email },
  { dalContext, currentUserID }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new AuthenticationError("authentication required");
  }

  if (!code || !email) {
    return new UserInputError(
      "Either the verification code or the email is missing"
    );
  }

  const verifiedEmail = await dal.verifyCodeForVerifiedEmail(dalContext, {
    verificationCode: code,
    verifiedEmailEmail: email
  });

  if (!verifiedEmail.verified) {
    console.error(
      "Verified email should just have been verified, but it's being returned as non-verified. Something's wrong"
    );
  }

  return {
    id: verifiedEmail.id,
    email: verifiedEmail.email,
    verified: verifiedEmail.verified
  };
};
