import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { MutationResolvers } from "../types.generated";
import { deconstructEmail } from "../../lib/deconstructEmail";

export const createEmailMask: MutationResolvers["createEmailMask"] = async (
  parent,
  { input: { raw } },
  { setAuthCookie, dalContext, currentUserID }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new AuthenticationError("authentication required");
  }

  const { base, domain } = deconstructEmail({ email: raw });
  const baseWithDomain = `${base}@${domain}`;

  if (await dal.isEmailMaskTaken(dalContext, { baseWithDomain })) {
    throw new UserInputError("User with username already exists");
  }

  const {
    emailMask: { id }
  } = await dal.createEmailMask(dalContext, {
    userID: currentUserID,
    baseWithDomain
  });

  return { id, base, domain, ownerUserID: currentUserID };
};
