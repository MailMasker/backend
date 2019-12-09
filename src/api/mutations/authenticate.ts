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
    console.log("getting user for email: ", args.input);
    const user = await userForEmail(dalContext, { email: args.input.email });

    console.log("userfound: ", user);

    if (!bcrypt.compareSync(args.input.password, user.passwordHash)) {
      throw new ApolloError("Password mismatch");
    }

    console.log("password matches");

    const authToken = jwt.sign(
      { email: user.email, userID: user.id },
      JWT_SECRET
    );

    console.log("authtoken during authenticate: ", authToken);

    const { expires } = await createAuthToken(dalContext, authToken, user.id);

    setAuthCookie({ authToken, expires });

    return { userID: user.id, authToken, success: true };
  } catch (error) {
    throw new ApolloError(
      "User with email provided could not be found or the password you provided doesn't match"
    );
  }
};
