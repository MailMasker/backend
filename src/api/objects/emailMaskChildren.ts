import * as dal from "../../dal/";

import { AuthenticationError } from "apollo-server-express";
import { ResolversTypes } from "../types.generated";
import { userByID } from "../../dal/userByID";

export const emailMaskChildren: ResolversTypes["children"] = async (
  parent,
  args,
  { dalContext, currentUserID },
  info
) => {
  console.debug("parent", JSON.stringify(parent));
  console.debug("args", JSON.stringify(args));
  console.debug("info", JSON.stringify(info));

  if (!currentUserID) {
    throw new AuthenticationError("Authentication required");
  }

  if (parent.childIDs.length === 0) {
    return [];
  }

  return Promise.all(
    parent.childIDs.map((id) => dal.emailMaskByID(dalContext, id))
  );
};
