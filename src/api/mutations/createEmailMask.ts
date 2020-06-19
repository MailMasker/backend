import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";
import {
  MaxNumEmailMasksForFreeUsers,
  MaxNumEmailMasksForPaidUsers,
} from "../../dal/lib/constants";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { EmailMask } from "../types.generated";
import { PlanType } from "../../dal/lib/plans";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";
import { deconstructMailMask } from "../../lib/common/deconstructMailMask";
import { userByID } from "../../dal/userByID";

const aliasRegex = /^[a-z0-9]+$/i;

export const createEmailMask = async (
  parent,
  { raw, parentEmailMaskID },
  { dalContext, currentUserID }: AuthenticatedResolverContext,
  info
): Promise<EmailMask> => {
  if (!currentUserID) {
    throw new AuthenticationError("authentication required");
  }
  if (!raw) {
    throw new UserInputError("Please specify an email address");
  }

  const user = await userByID(dalContext, currentUserID);
  if (
    user._planDetails.planType === PlanType.Free &&
    user.emailMaskIDs.length >= MaxNumEmailMasksForFreeUsers
  ) {
    throw new UserInputError(
      "Since you're on the Free plan, you can only claim up to 3 Mail Masks. Upgrade now to claim more Mail Masks."
    );
  } else if (
    user._planDetails.planType !== PlanType.Free &&
    user.emailMaskIDs.length >= MaxNumEmailMasksForPaidUsers
  ) {
    throw new UserInputError(
      "You can only claim up to 100 Mail Masks. This limit has been put into place in order to protect the system from malintent. Please reach out to us at premium@mailmasker.com, explaining how you intend to use Mail Masker, to have this limit increased."
    );
  }

  const { alias, domain, mailMaskParts, expiryToken } = deconstructMailMask({
    email: raw,
  });

  if (!aliasRegex.test(alias)) {
    throw new UserInputError(
      `We currently only support letters and numbers in the alias of your Mail Mask, as other characters are reserved for future functionality.")`
    );
  }

  if (!SupportedMailDomains.includes(domain)) {
    throw new UserInputError(
      `The domain specified (${domain}) isn't one that we support.`
    );
  }

  const { id } = await dal.createEmailMask(dalContext, {
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
  };
};
