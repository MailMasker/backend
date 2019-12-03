import {
  AuthenticatedResolverContext,
  ResolverContext
} from "../lib/ResolverContext";

import { AuthenticatePayload } from "../types.generated";
import { createAuthToken } from "../../dal/createAuthToken";
import { userForUsername } from "../../dal/userForUsername";

export const authenticate = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  const user = await userForUsername(dalContext, args.input.username);

  const { authToken, expires } = await createAuthToken(dalContext, user.id);

  setAuthCookie(authToken, expires);

  return { userID: user.id, authToken: authToken, success: true };
};
