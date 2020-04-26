import * as dal from "../../dal";

import { ForbiddenError, UserInputError } from "apollo-server-express";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { EmailMaskInUseInRouteError } from "../../dal/createRoute";
import { MutationUpdateRouteArgs } from "../types.generated";
import { UnPromisify } from "../../dal/lib/UnPromisify";
import { ensureAuthenticated } from "../lib/ensureAuthenticated";
import { transformVerifiedEmail } from "../../dal/transforms/transformVerifiedEmail";

export const updateRoute = async (
  parent,
  args: MutationUpdateRouteArgs,
  context: AuthenticatedResolverContext,
  info
) => {
  if (!args.expiresISO && !args.redirectToVerifiedEmailID) {
    throw new Error("nothing to update");
  }

  const { currentUser } = await ensureAuthenticated(context);

  if (!args.id) {
    throw new Error("missing id");
  }

  // Validate that the Route belongs to this user
  const [routePreUpdate] = await dal.routesByIDs(context.dalContext, [args.id]);
  if (routePreUpdate.ownerUserID !== currentUser.id) {
    throw new ForbiddenError(
      `you do not have access to the route you're trying to update`
    );
  }

  // Validate that the new Verified Email belongs to this user
  let targetVerifiedEmail:
    | UnPromisify<ReturnType<typeof transformVerifiedEmail>>
    | undefined;
  if (args.redirectToVerifiedEmailID) {
    const ve = await dal.verifiedEmailByID(
      context.dalContext,
      args.redirectToVerifiedEmailID
    );
    if (ve.ownerUserID !== currentUser.id) {
      throw new ForbiddenError(
        `you do not have access to the Verified Email with ID ${ve.id}`
      );
    }
    if (ve) {
      targetVerifiedEmail = ve;
    }
  }

  try {
    const routePostUpdate = await dal.updateRoute(
      { ddb: context.dalContext.ddb },
      args.id,
      {
        redirectToVerifiedEmailID: args.redirectToVerifiedEmailID,
        expiresISO: args.expiresISO,
        clearExpiresISO: args.clearExpiresISO,
      },
      {
        route: routePreUpdate,
        targetVerifiedEmail,
      }
    );
    return {
      ...routePostUpdate,
      // Use the prefetched value, if there is one. Otherwise, rely on the custom Route
      // resolver to fetch `redirectToVerifiedEmail` if the field was indeed requested
      redirectToVerifiedEmail: targetVerifiedEmail,
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
