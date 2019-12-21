import { AuthenticationError } from "apollo-server-express";
import { ResolverContext } from "./ResolverContext";
import { skip } from "graphql-resolvers";

export function authenticated(
  root: any,
  args: any,
  context: any,
  info: any
) {
  if (!(context as any).currentUserID) {
    throw new AuthenticationError("authentication required");
  }
  return skip;
}
