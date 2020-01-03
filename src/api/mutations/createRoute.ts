import * as dal from "../../dal/";

import { ForbiddenError, UserInputError } from "apollo-server-express";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { EmailMaskInUseInRouteError } from "../../dal/createRoute";
import { MutationResolvers } from "../types.generated";
import { ensureAuthenticated } from "../lib/ensureAuthenticated";

export const createRoute: MutationResolvers["createRoute"] = async (
  parent,
  args,
  context: AuthenticatedResolverContext,
  info
) => {
  const { currentUser } = await ensureAuthenticated(context);

  // Validate that the Verified Email belongs to this user
  const { ownerUserID: verifiedEmailOwnerUserID } = await dal.verifiedEmailByID(
    context.dalContext,
    args.input.redirectToVerifiedEmailID
  );
  if (verifiedEmailOwnerUserID !== currentUser.id) {
    throw new ForbiddenError(
      `the verified email ${args.input.redirectToVerifiedEmailID} belongs to user ${verifiedEmailOwnerUserID}, not ${currentUser.id}`
    );
  }

  // Validate that the Email Mask belongs to this user
  const { ownerUserID: emailMaskOwnerUserID } = await dal.emailMaskByID(
    context.dalContext,
    args.input.emailMaskID
  );
  if (emailMaskOwnerUserID !== currentUser.id) {
    throw new ForbiddenError(
      `the email mask ${args.input.emailMaskID} belongs to user ${emailMaskOwnerUserID}, not ${currentUser.id}`
    );
  }

  try {
    const { route } = await dal.createRoute(
      { ddb: context.dalContext.ddb },
      {
        redirectToVerifiedEmailID: args.input.redirectToVerifiedEmailID,
        ownerUserID: currentUser.id,
        emailMaskID: args.input.emailMaskID
      }
    );
    return { routeID: route.id };
  } catch (err) {
    if (err instanceof EmailMaskInUseInRouteError) {
      throw new UserInputError(
        "The email mask you've chosen is already being used in another route"
      );
    }
    throw err;
  }
};
