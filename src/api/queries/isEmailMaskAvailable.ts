import { ResolversTypes } from "../types.generated";
import { deconstructMailMask } from "../../lib/common/deconstructMailMask";
import { isEmailMaskTaken } from "../../dal";

export const isEmailMaskAvailable: ResolversTypes["isEmailMaskAvailable"] = async (
  parent,
  args,
  { dalContext, currentUserID },
  info
): Promise<boolean> => {
  const { alias } = deconstructMailMask({ email: args.email });
  return isEmailMaskTaken(dalContext, { alias }).then((taken) => !taken);
};
