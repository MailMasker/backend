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

  const {
    user: { id: userID, username },
    auth: { authToken, secondsUntilExpiry },
  } = await dal.createUser(dalContext, {
    username: args.username,
    password: args.password,
    requestUUID: args.uuid,
    persistent: args.persistent,
  });

  setAuthCookie({ authToken, secondsUntilExpiry });

  return { userID };
};
