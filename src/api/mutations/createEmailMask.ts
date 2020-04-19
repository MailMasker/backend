import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { EmailMask } from "../types.generated";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";
import { deconstructMailMask } from "../../dal/lib/deconstructMailMask";

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

  if (!SupportedMailDomains.includes(domain)) {
    throw new UserInputError(
      `The domain specified, ${domain} isn't one that we support`
    );
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
    parentEmailMaskID,
    children: [],
    disabled: false,
  };
};
