import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-core";
import { createUser as dalCreateUser } from "../../dal/createUser";
import { isUsernameTaken } from "../../dal/isUsernameTaken";

export const createUser = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  if (await isUsernameTaken(dalContext, { username: args.username })) {
    throw new UserInputError("User with username already exists");
  }

  // TODO: someday handle UDID duplicates, but need to check for password match (maybe just call authenticate() ?)
  //
  // if (user) {
  //   if (user.uuid === args.uuid) {
  //     console.info(
  //       `creation skipped because duplicate creation request detected with UUID ${args.uuid}`
  //     );
  //     const { authToken, expires } = await createAuthToken(dalContext, user.id);
  //     return { userID: user.id };
  //   }
  //   throw new UserInputError("User with username already exists");
  // }

  const {
    user: { id: userID, username },
    auth: { authToken, expires }
  } = await dalCreateUser(dalContext, {
    username: args.username,
    password: args.password,
    requestUUID: args.uuid
  });

  setAuthCookie({ authToken, expires });

  return { userID };
};
