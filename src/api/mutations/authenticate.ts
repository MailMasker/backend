import { MutationAuthenticateArgs } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-express";
import bcrypt from "bcryptjs";
import { createAuthToken } from "../../dal/createAuthToken";
import jwt from "jsonwebtoken";
import { updateUser } from "../../dal/updateUser";
import { userByUsername } from "../../dal/userByUsername";

// TODO: implement rate limiting

export const authenticate = async (
  parent,
  args: MutationAuthenticateArgs,
  { setAuthCookie, dalContext }: ResolverContext,
  info
) => {
  try {
    console.debug("getting user for username: ", args.username);
    const user = await userByUsername(dalContext, { username: args.username });

    if (user.deletedISO) {
      await updateUser(dalContext, user.id, {
        deletedISO: null,
      });

      console.log(
        `user ${user.id} was automatically marked undeleted after logging in`
      );
    }

    console.debug("user found: ", user);

    if (!bcrypt.compareSync(args.password, user.passwordHash)) {
      throw new UserInputError("Password mismatch");
    }

    console.debug("password matches");

    const authToken = jwt.sign(
      { username: user.username, userID: user.id },
      process.env.JWT_SECRET as string
    );

    console.debug("authtoken during authenticate: ", authToken);

    const { secondsUntilExpiry } = await createAuthToken(
      dalContext,
      authToken,
      user.id
    );

    setAuthCookie({ authToken, secondsUntilExpiry });

    return true;
  } catch (error) {
    throw new UserInputError(
      "User with username provided could not be found or the password you provided doesn't match"
    );
  }
};
