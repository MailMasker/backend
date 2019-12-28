import * as dal from "../../dal/";

import {
  AuthenticatedResolverContext,
  ResolverContext
} from "../lib/ResolverContext";
import { AuthenticationError, UserInputError } from "apollo-server-core";

import { MutationResolvers } from "../types.generated";
import { deconstructEmail } from "../../lib/deconstructEmail";

export const createEmailMask: MutationResolvers["createEmailMask"] = async (
  parent,
  { input: { raw } },
  { setAuthCookie, dalContext, currentUserID }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    return new AuthenticationError("authentication required");
  }
  if (await dal.isUsernameTaken(dalContext, { username: args.username })) {
    throw new UserInputError("User with username already exists");
  }

  const { base, domain } = deconstructEmail({ email: raw });

  const {
    emailMask: { id, baseWithDomain, ownerUserID }
  } = await dal.createEmailMask(dalContext, {
    userID: currentUserID,
    baseWithDomain
  });

  return {};
};
