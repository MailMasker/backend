import { authenticated } from "../lib/authenticated";
import { userForID } from "../../dal/userForID";

export const me = (parent, args, { dalContext, currentUserID }, info) => {
  return userForID(dalContext, currentUserID);
};
