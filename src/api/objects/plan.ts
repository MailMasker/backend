import * as dal from "../../dal";

import { AuthenticationError } from "apollo-server-express";
import { ResolversTypes } from "../types.generated";

export const plan: ResolversTypes["plan"] = async (
  parent,
  args,
  { dalContext, currentUserID },
  info
) => {
  if (!currentUserID) {
    throw new AuthenticationError("Authentication required");
  }
  if (!parent._planDetails) {
    throw new Error(
      "there's no way to determine the plan type without _planDetails populated"
    );
  }

  if (parent._planDetails.planType === "premium") {
    return {
      displayName: "Premium",
      type: "PREMIUM",
    };
  }

  return {
    displayName: "Free",
    type: "FREE",
  };
};
