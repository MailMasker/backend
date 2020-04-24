import * as dal from "../../dal/";

import { MutationResolvers } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-core";

export const createUser: MutationResolvers["createUser"] = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  if (await dal.isUsernameTaken(dalContext, { username: args.username })) {
    throw new UserInputError("User with username already exists");
  }

  // TODO: someday handle duplicate requests via UUID, but need to check for password match (maybe just call authenticate() ?)
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
    auth: { authToken, secondsUntilExpiry },
  } = await dal.createUser(dalContext, {
    username: args.username,
    password: args.password,
    requestUUID: args.uuid,
  });

  setAuthCookie({ authToken, secondsUntilExpiry });

  return { userID };
};
