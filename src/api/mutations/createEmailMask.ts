import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { EmailMask } from "../types.generated";
import { deconstructMailMask } from "../lib/deconstructMailMask";

export const createEmailMask = async (
  parent,
  { raw, parentEmailMaskID },
  { setAuthCookie, dalContext, currentUserID }: AuthenticatedResolverContext,
  info
): Promise<EmailMask> => {
  if (!currentUserID) {
    throw new AuthenticationError("authentication required");
  }
  if (!raw) {
    throw new UserInputError("Please specify an email address");
  }

  const { alias, domain, mailMaskParts, expiryToken } = deconstructMailMask({
    email: raw,
  });

  if (await dal.isEmailMaskTaken(dalContext, { alias })) {
    throw new UserInputError("That email is already in use");
  }

  const {
    emailMask: { id },
  } = await dal.createEmailMask(dalContext, {
    ownerUserID: currentUserID,
    alias,
    domain,
    parentEmailMaskID,
  });

  return {
    id,
    alias,
    domain,
    children: [],
    disabled: false,
  };
};
