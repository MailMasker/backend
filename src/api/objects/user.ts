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
  console.log("parent", parent);
  console.log("args", args);
  console.log("info", info);
  if (!currentUserID) {
    throw new AuthenticationError("Authentication required");
  }
  const {
    id,
    username,
    verifiedEmailIDs,
    emailMaskIDs,
    routeIDs
  } = await userByID(dalContext, currentUserID);

  return {
    id,
    username,
    verifiedEmails: () =>
      Promise.all(
        verifiedEmailIDs.map(id => dal.verifiedEmailByID(dalContext, id))
      ),
    emailMasks: () =>
      Promise.all(emailMaskIDs.map(id => dal.emailMaskByID(dalContext, id))),
    routes: () =>
      dal.routesByIDs(dalContext, routeIDs).then(routes =>
        routes.map(route => ({
          id: route.id,
          emailMask: dal.emailMaskByID(dalContext, id),
          redirectToVerifiedEmail: dal.verifiedEmailByID(dalContext, id),
          disabled: false
        }))
      )
  };
};
