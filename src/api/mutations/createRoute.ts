import * as dal from "../../dal/";

import { ForbiddenError, UserInputError } from "apollo-server-express";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { EmailMaskInUseInRouteError } from "../../dal/createRoute";
import { ensureAuthenticated } from "../lib/ensureAuthenticated";

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
      `the verified email ${args.redirectToVerifiedEmailID} belongs to user ${verifiedEmail.ownerUserID}, not ${currentUser.id}`
    );
  }

  // Validate that the Email Mask belongs to this user
  const emailMask = await dal.emailMaskByID(
    context.dalContext,
    args.emailMaskID
  );
  if (emailMask.ownerUserID !== currentUser.id) {
    throw new ForbiddenError(
      `the email mask ${args.emailMaskID} belongs to user ${emailMask.ownerUserID}, not ${currentUser.id}`
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
    return {
      id: route.id,
      emailMask,
      expires: route.expiresMS,
      disabled: false,
      redirectToVerifiedEmail: verifiedEmail,
    };
  } catch (err) {
    if (err instanceof EmailMaskInUseInRouteError) {
      throw new UserInputError(
        "The email mask you've chosen is already being used in another route"
      );
    }
    throw err;
  }
};
