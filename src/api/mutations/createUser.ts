import { ApolloError } from "apollo-server-core";
import { ResolverContext } from "../lib/ResolverContext";
import { createUser as dalCreateUser } from "../../dal/createUser";
import { isAccountEmailTaken } from "../../dal/isAccountEmailTaken";

export const createUser = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  if (await isAccountEmailTaken(dalContext, { email: args.input.email })) {
    throw new ApolloError("User with email already exists");
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
    auth: { authToken, expires }
  } = await dalCreateUser(dalContext, {
    email: args.input.email,
    password: args.input.password,
    requestUUID: args.input.uuid
  });

  setAuthCookie({ authToken, expires });

  return { userID, success: true };
};
