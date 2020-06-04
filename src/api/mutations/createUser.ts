import * as dal from "../../dal/";

import Bugsnag from "@bugsnag/js";
import { MutationResolvers } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-core";
import { deconstructMailMask } from "../../dal/lib/deconstructMailMask";
import sendVerificationEmail from "../lib/sendVerificationEmail";

export const createUser: MutationResolvers["createUser"] = async (
  parent,
  args,
  { setAuthCookie, dalContext, ses }: ResolverContext,
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

  // TODO: some say handle duplicate requests via UUID, but need to check for password match (maybe just call authenticate() ?)

  const {
    user: { id: userID, username },
    verifiedEmail,
    auth: { authToken, secondsUntilExpiry },
  } = await dal.createUser(dalContext, {
    username: desiredUsername,
    password: desiredPassword,
    requestUUID: args.uuid,
    persistent: args.persistent,
    emailMask: args.emailMask,
    verifiedEmail: args.verifiedEmail,
  });

  if (process.env.S_STAGE !== "local") {
    try {
      await sendVerificationEmail(ses, {
        verificationCode: verifiedEmail.verificationCode,
        email: verifiedEmail.email,
      });
      console.log("verification email sent");
    } catch (err) {
      Bugsnag.notify(err);
      throw new Error(
        "We had some trouble sending you the verification email. Please try again."
      );
    }
  }

  setAuthCookie({ authToken, secondsUntilExpiry });

  return { userID };
};
