import * as dal from "../../dal/createVerifiedEmail";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { verifiedEmailByEmail } from "../../dal/verifiedEmailByEmail";

export const createVerifiedEmail = async (
  parent,
  args,
  { setAuthCookie, dalContext, currentUserID }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new AuthenticationError("Must be signed in");
  }
  const existingVerifiedEmail = await verifiedEmailByEmail(dalContext, {
    email: args.email
  });
  if (existingVerifiedEmail) {
    if (existingVerifiedEmail.verified) {
      throw new UserInputError(
        "The email address provided is already verified"
      );
    }
    throw new UserInputError(
      "The email address provided is already in the process of being verified, but has not yet been verified"
    );
  }

  return await dal.createVerifiedEmail(dalContext, {
    email: args.email,
    userID: currentUserID
  });
};
