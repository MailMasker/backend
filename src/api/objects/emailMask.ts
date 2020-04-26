import * as dal from "../../dal";

import { AuthenticationError } from "apollo-server-express";
import { ResolversTypes } from "../types.generated";

export const emailMask: ResolversTypes["emailMask"] = async (
  parent,
  args,
  { dalContext, currentUserID },
  info
) => {
  if (!currentUserID) {
    throw new AuthenticationError("Authentication required");
  }

  // If another resolver has already populated this field, use it instead of fetching again
  if (parent.emailMask) {
    return parent.emailMask;
  }

  const verifiedEmail = await dal.emailMaskByID(dalContext, parent.emailMaskID);

  return verifiedEmail;
};
