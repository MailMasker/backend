import { authenticated } from "../lib/authenticated";
export const me = authenticated((parent, args, context, info) => {
  return { id: context.currentUserID, username: "x", email: "y" };
});
