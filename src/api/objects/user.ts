import * as dal from "../../dal/";

import { AuthenticationError } from "apollo-server-express";
import { ResolversTypes } from "../types.generated";
import { userByID } from "../../dal/userByID";

export const user: ResolversTypes["user"] = async (
  parent,
  args,
  { dalContext, currentUserID },
  info
) => {
  console.debug("parent", parent);
  console.debug("args", args);
  console.debug("info", info);
  if (!currentUserID) {
    throw new AuthenticationError("Authentication required");
  }
  const {
    id,
    username,
    verifiedEmailIDs,
    emailMaskIDs,
    routeIDs,
  } = await userByID(dalContext, currentUserID);

  // Look up email masks in advance to save DDB lookups
  const [emailMasks, verifiedEmails] = await Promise.all([
    Promise.all(emailMaskIDs.map((id) => dal.emailMaskByID(dalContext, id))),
    Promise.all(
      verifiedEmailIDs.map((id) => dal.verifiedEmailByID(dalContext, id))
    ),
  ]);

  return {
    id,
    username,
    verifiedEmails,
    emailMasks,
    routes: () =>
      dal.routesByIDs(dalContext, routeIDs).then((routes) =>
        routes.map((route) => ({
          ...route,
          emailMask:
            // this saves some look-ups
            emailMasks.find(
              (emailMask) => emailMask.id === route.emailMaskID
            ) ?? dal.emailMaskByID(dalContext, route.emailMaskID), // Really, we should never have to do the `dal.emailMaskByID` lookup
          // this saves some look-ups
          redirectToVerifiedEmail:
            verifiedEmails.find(
              (verifiedEmail) =>
                verifiedEmail.id === route.redirectToVerifiedEmailID
            ) ??
            dal.verifiedEmailByID(dalContext, route.redirectToVerifiedEmailID),
        }))
      ),
  };
};
