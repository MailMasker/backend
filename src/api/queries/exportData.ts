import { ResolversTypes } from "../types.generated";

export const exportData: ResolversTypes["exportData"] = (
  parent,
  args,
  { dalContext, currentUserID },
  info
) => {
  return "exported!";
};
