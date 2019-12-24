import { ResolversTypes } from "../types.generated";

export const me: ResolversTypes["me"] = (
  parent,
  args,
  { dalContext, currentUserID },
  info
) => {
  // the top-level User query returns the user
  return {};
};
