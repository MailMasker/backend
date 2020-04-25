import * as dal from "../../dal";

import { AuthenticationError } from "apollo-server-express";
import { ResolversTypes } from "../types.generated";

export const redirectToVerifiedEmail: ResolversTypes["redirectToVerifiedEmail"] = async (
  parent,
  args,
  { dalContext, currentUserID },
  info
) => {
  if (!currentUserID) {
    throw new AuthenticationError("Authentication required");
  }

  // If another resolver has already populated this field, use it (ex: updateRoute sometimes already has the Verified Email object fetch, and thus, populates this field)
  if (parent.redirectToVerifiedEmail) {
    return parent.redirectToVerifiedEmail;
  }

  const verifiedEmail = await dal.verifiedEmailByID(
    dalContext,
    parent.redirectToVerifiedEmailID
  );

  return verifiedEmail;
};
