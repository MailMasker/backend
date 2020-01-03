import { AuthenticatedResolverContext } from "./ResolverContext";
import { ensureAuthenticated } from "./ensureAuthenticated";
import { skip } from "graphql-resolvers";

export async function authenticated(
  root: any,
  args: any,
  context: AuthenticatedResolverContext,
  info: any
) {
  ensureAuthenticated(context);
  return skip;
}
