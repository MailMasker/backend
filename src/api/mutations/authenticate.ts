import { ApolloError } from "apollo-server-core";
import { JWT_SECRET } from "../../..";
import { MutationAuthenticateArgs } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-express";
import bcrypt from "bcrypt";
import { createAuthToken } from "../../dal/createAuthToken";
import jwt from "jsonwebtoken";
import { userForUsername } from "../../dal/userForEmail";

// TODO: implement rate limiting

export const authenticate = async (
  parent,
  args: MutationAuthenticateArgs,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  try {
    console.debug("getting user for username: ", args.username);
    const user = await userForUsername(dalContext, { username: args.username });

    console.debug("userfound: ", user);

    if (!bcrypt.compareSync(args.password, user.passwordHash)) {
      throw new UserInputError("Password mismatch");
    }

    console.debug("password matches");

    const authToken = jwt.sign(
      { username: user.username, userID: user.id },
      JWT_SECRET
    );

    console.debug("authtoken during authenticate: ", authToken);

    const { expires } = await createAuthToken(dalContext, authToken, user.id);

    setAuthCookie({ authToken, expires });

    return true;
  } catch (error) {
    throw new UserInputError(
      "User with username provided could not be found or the password you provided doesn't match"
    );
  }
};
