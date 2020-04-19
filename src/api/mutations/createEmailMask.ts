import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { EmailMask } from "../types.generated";
import { deconstructMailMask } from "../lib/deconstructMailMask";

if (!process.env.MAIL_DOMAINS || process.env.MAIL_DOMAINS.length === 0) {
  throw new Error("missing env var process.env.MAIL_DOMAIN");
}

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

  if (parentEmailMaskID) {
    const parentEmailMask = await dal.emailMaskByID(
      dalContext,
      parentEmailMaskID
    );
    if (parentEmailMask.parentEmailMaskID) {
      throw new Error(
        "we currently only support one level of children emails mask at a time"
      );
    }
  }

  const { alias, domain, mailMaskParts, expiryToken } = deconstructMailMask({
    email: raw,
  });

  if (!process.env.MAIL_DOMAINS?.includes(domain)) {
    throw new UserInputError(
      `The domain specified, ${domain} isn't one that we support`
    );
  }

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
    parentEmailMaskID,
    children: [],
    disabled: false,
  };
};
