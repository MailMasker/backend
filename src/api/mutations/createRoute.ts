import * as dal from "../../dal/";

import { ForbiddenError, UserInputError } from "apollo-server-express";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import Bugsnag from "@bugsnag/js";
import { EmailMaskInUseInRouteError } from "../../dal/createRoute";
import { ensureAuthenticated } from "../lib/ensureAuthenticated";
import { redirectToVerifiedEmail } from "../objects/redirectToVerifiedEmail";
import sendTransactionalEmail from "../../dal/lib/sendTransactionalEmail";

export const createRoute = async (
  parent,
  args,
  context: AuthenticatedResolverContext,
  info
) => {
  const { currentUser } = await ensureAuthenticated(context);

  // Validate that the Verified Email belongs to this user
  const verifiedEmail = await dal.verifiedEmailByID(
    context.dalContext,
    args.redirectToVerifiedEmailID
  );
  if (verifiedEmail.ownerUserID !== currentUser.id) {
    throw new ForbiddenError(
      `you do not have access to the Verified Email with ID ${verifiedEmail.id}`
    );
  }

  // Validate that the Email Mask belongs to this user
  const emailMask = await dal.emailMaskByID(
    context.dalContext,
    args.emailMaskID
  );
  if (emailMask.ownerUserID !== currentUser.id) {
    throw new ForbiddenError(
      `you do not have access to the Email Mask with ID ${args.emailMaskID}`
    );
  }

  try {
    const route = await dal.createRoute(
      { ddb: context.dalContext.ddb },
      {
        redirectToVerifiedEmailID: args.redirectToVerifiedEmailID,
        ownerUserID: currentUser.id,
        emailMaskID: args.emailMaskID,
      }
    );

    if (verifiedEmail.verified) {
      // Send intro email to new Mail Mask
      try {
        await sendTransactionalEmail(context.ses, {
          to: [`${emailMask.alias}@${emailMask.domain}`],
          subject: `[Mail Masker] Your new Mail Mask, ${emailMask.alias}@${emailMask.domain}, is now active!`,
          bodyHTML: `Emails received at ${emailMask.alias}@${emailMask.domain} (such as this one) will be forwarded to ${redirectToVerifiedEmail.email}.`,
        });
      } catch (err) {
        Bugsnag.notify(err);
      }
    }

    return {
      ...route,
      emailMask,
      redirectToVerifiedEmail: verifiedEmail,
    };
  } catch (err) {
    if (err instanceof EmailMaskInUseInRouteError) {
      throw new UserInputError(
        "The email mask you've chosen is already being used"
      );
    }
    throw err;
  }
};
