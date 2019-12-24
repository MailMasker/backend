import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-core";
import { isUsernameTaken } from "../../dal/isUsernameTaken";

export const createRoute = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  return { success: true };
};
