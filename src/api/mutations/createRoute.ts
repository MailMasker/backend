import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-core";
import { isAccountEmailTaken } from "../../dal/isAccountEmailTaken";

export const createRoute = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  // if (await isAccountEmailTaken(dalContext, { email: args.email })) {
  //   throw new UserInputError("User with email already exists");
  // }

  //   await dal.createRoute(dalContext, {
  //     to,
  //     redirectTo,
  //     userID
  //   });

  return { success: true };
};
