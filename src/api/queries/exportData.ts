import { emailMaskByID, routesByIDs, verifiedEmailByID } from "../../dal";

import { ResolversTypes } from "../types.generated";
import { exportData as dalExportData } from "../../dal/exportData";

export const exportData: ResolversTypes["exportData"] = async (
  parent,
  args,
  { dalContext, currentUserID },
  info
): Promise<string> => {
  const exportedData = dalExportData(dalContext, currentUserID);
  return JSON.stringify(exportedData);
};
