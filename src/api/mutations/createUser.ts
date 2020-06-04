import * as dal from "../../dal/";

import { MutationResolvers } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-core";
import { deconstructMailMask } from "../../dal/lib/deconstructMailMask";

export const createUser: MutationResolvers["createUser"] = async (
  parent,
  args,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  const desiredUsername = args.username.trim();
  const desiredPassword = args.password.trim();

  if (!desiredUsername) {
    throw new UserInputError("username missing");
  }
  if (await dal.isUsernameTaken(dalContext, { username: desiredUsername })) {
    throw new UserInputError("User with username already exists");
  }
  if (!desiredPassword) {
    throw new UserInputError("password missing");
  }

  const { alias } = deconstructMailMask({ email: args.emailMask });
  const emailMaskTaken = await dal.isEmailMaskTaken(dalContext, { alias });
  if (emailMaskTaken) {
    throw new UserInputError("the Mail Mask you've chosen is already taken");
  }

  // TODO: some sday handle duplicate requests via UUID, but need to check for password match (maybe just call authenticate() ?)

  const {
    user: { id: userID, username },
    auth: { authToken, secondsUntilExpiry },
  } = await dal.createUser(dalContext, {
    username: desiredUsername,
    password: desiredPassword,
    requestUUID: args.uuid,
    persistent: args.persistent,
    emailMask: args.emailMask,
    verifiedEmail: args.verifiedEmail,
  });

  setAuthCookie({ authToken, secondsUntilExpiry });

  return { userID };
};
