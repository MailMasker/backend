import { AuthenticatedResolverContext } from "./ResolverContext";
import { ensureAuthenticated } from "./ensureAuthenticated";
import { skip } from "graphql-resolvers";

export async function authenticated(
  root: any,
  args: any,
  context: AuthenticatedResolverContext,
  info: any
) {
  try {
    await ensureAuthenticated(context);
    return skip;
  } catch (err) {
    return err;
  }
}
