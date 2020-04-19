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

  console.debug("list of emailMaskIDs", JSON.stringify(emailMaskIDs));

  return {
    id,
    username,
    verifiedEmails: () =>
      Promise.all(
        verifiedEmailIDs.map((id) => dal.verifiedEmailByID(dalContext, id))
      ),
    emailMasks: () =>
      Promise.all(emailMaskIDs.map((id) => dal.emailMaskByID(dalContext, id))),
    routes: () =>
      dal.routesByIDs(dalContext, routeIDs).then((routes) =>
        routes.map((route) => ({
          id: route.id,
          emailMask: dal.emailMaskByID(dalContext, route.emailMaskID),
          redirectToVerifiedEmail: dal.verifiedEmailByID(
            dalContext,
            route.redirectToVerifiedEmailID
          ),
          disabled: false,
        }))
      ),
  };
};
