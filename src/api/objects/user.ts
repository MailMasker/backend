import * as dal from "../../dal/";

import {
  Resolver,
  ResolversParentTypes,
  ResolversTypes
} from "../types.generated";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { AuthenticationError } from "apollo-server-express";
import { userForID } from "../../dal/userForID";

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
  const { id, username, verifiedEmailIDs, emailMaskIDs } = await userForID(
    dalContext,
    currentUserID
  );

  return {
    id,
    username,
    verifiedEmails: () =>
      Promise.all(
        verifiedEmailIDs.map(id => dal.verifiedEmailByID(dalContext, id))
      ),
    emailMasks: () =>
      Promise.all(emailMaskIDs.map(id => dal.emailMaskByID(dalContext, id)))
  };
};
