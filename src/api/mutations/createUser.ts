import { ApolloError, InvalidGraphQLRequestError } from "apollo-server-core";
import {
  AuthenticatedResolverContext,
  ResolverContext
} from "../lib/ResolverContext";

import { createUser as dalCreateUser } from "../../dal/createUser";
import { userForEmail } from "../../dal/userForEmail";

export const createUser = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  let existingUser: any;
  try {
    existingUser = await userForEmail(dalContext, args.input.email);
  } catch (err) {
    // This is good: we want to fail to fetch a user by this email
  }

  // TODO: someday handle UDID duplicates, but need to check for password match (maybe just call authenticate() ?)
  //
  // if (user) {
  //   if (user.uuid === args.input.uuid) {
  //     console.info(
  //       `creation skipped because duplicate creation request detected with UUID ${args.input.uuid}`
  //     );
  //     const { authToken, expires } = await createAuthToken(dalContext, user.id);
  //     return { userID: user.id, authToken: authToken, success: true };
  //   }
  //   throw new ApolloError("User with email already exists");
  // }

  const {
    user: { id: userID, email },
    authToken
  } = await dalCreateUser(dalContext, {
    email: args.input.email,
    password: args.input.password,
    requestUUID: args.input.uuid
  });

  setAuthCookie(authToken);

  return { userID, success: true };
};
