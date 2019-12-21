import * as dal from "../../dal/createVerifiedEmail";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { MutationCreateVerifiedEmailArgs } from "../types.generated";
import { isAccountEmailTaken } from "../../dal/isAccountEmailTaken";

export const createVerifiedEmail = async (
  parent,
  args,
  { setAuthCookie, dalContext, currentUserID }: AuthenticatedResolverContext,
  info
) => {
  if (await isAccountEmailTaken(dalContext, { email: args.email })) {
    throw new UserInputError("User with email already exists");
  }
  if (!currentUserID) {
    throw new AuthenticationError("Must be signed in");
  }

  const { verifiedEmail } = await dal.createVerifiedEmail(dalContext, {
    email: args.email,
    userID: currentUserID
  });

  return verifiedEmail;
};
