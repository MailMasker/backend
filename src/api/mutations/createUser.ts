import {
  AuthenticatedResolverContext,
  ResolverContext
} from "../lib/ResolverContext";

import { ApolloError } from "apollo-server-core";
import { createUser as dalCreateUser } from "../../dal/createUser";
import { userForUsername } from "../../dal/userForUsername";

export const createUser = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  let user: any;
  try {
    user = await userForUsername(dalContext, args.input.username);
  } catch (err) {
    // This is good: we want to fail to fetch a user by this username
  }
  if (user) {
    throw new ApolloError("Username already exists");
  }

  // TODO: do better error handling here: handle the case where username is taken
  // https://www.apollographql.com/docs/apollo-server/data/errors/
  const {
    user: { id },
    auth: { authToken, expires }
  } = await dalCreateUser(dalContext, {
    username: args.input.username,
    email: args.input.email,
    requestUUID: args.input.uuid
  });

  setAuthCookie(authToken, expires);

  return { userID: id, authToken: authToken, success: true };
};
