import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { deconstructEmail } from "../../lib/deconstructEmail";

export const createEmailMask = async (
  parent,
  { raw },
  { setAuthCookie, dalContext, currentUserID }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new AuthenticationError("authentication required");
  }

  const { base, domain } = deconstructEmail({ email: raw });
  const baseWithDomain = `${base}@${domain}`;

  if (await dal.isEmailMaskTaken(dalContext, { baseWithDomain })) {
    throw new UserInputError("That email is already in use");
  }

  const {
    emailMask: { id }
  } = await dal.createEmailMask(dalContext, {
    userID: currentUserID,
    baseWithDomain
  });

  return { id, base, domain, ownerUserID: currentUserID };
};
