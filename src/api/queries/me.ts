import { authenticated } from "../lib/authenticated";
import { userForID } from "../../dal/userForID";

export const me = (parent, args, { dalContext, currentUserID }, info) => {
  console.log("parent", parent);
  console.log("args", args);
  console.log("info", info);
  return userForID(dalContext, currentUserID);
};
