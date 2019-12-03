import {
  AuthenticatedResolverContext,
  ResolverContext
} from "../lib/ResolverContext";

import { createUser as dalCreateUser } from "../../dal/createUser";

export const createUser = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  // TODO: do better error handling here: handle the case where username is taken
  // https://www.apollographql.com/docs/apollo-server/data/errors/
  const {
    user: { id },
    authToken
  } = await dalCreateUser(dalContext, {
    username: args.input.username,
    email: args.input.email,
    requestUUID: args.input.uuid
  });

  setAuthCookie(authToken);

  return { userID: id, token: authToken, success: true };
};
