import { ApolloError } from "apollo-server-core";
import { JWT_SECRET } from "../../..";
import { MutationAuthenticateArgs } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import bcrypt from "bcrypt";
import { createAuthToken } from "../../dal/createAuthToken";
import jwt from "jsonwebtoken";
import { userForEmail } from "../../dal/userForEmail";

// TODO: implement rate limiting

export const authenticate = async (
  parent,
  args: MutationAuthenticateArgs,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  try {
    const user = await userForEmail(dalContext, args.input.email);

    if (!bcrypt.compareSync(args.input.password, user.passwordHash)) {
      throw new ApolloError("Password mismatch");
    }

    const authToken = jwt.sign(
      { email: user.email, userID: user.id },
      JWT_SECRET
    );

    await createAuthToken(dalContext, authToken, user.id);

    setAuthCookie(authToken);

    return { userID: user.id, authToken, success: true };
  } catch (error) {
    throw new ApolloError(
      "User with email provided could not be found or the password you provided doesn't match"
    );
  }
};
