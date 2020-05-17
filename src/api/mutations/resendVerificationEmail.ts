import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import Bugsnag from "@bugsnag/js";
import sendVerificationEmail from "../lib/sendVerificationEmail";
import { verifiedEmailByEmail } from "../../dal/verifiedEmailByEmail";

if (!process.env.WEB_APP_BASE_URL) {
  throw new Error("missing process.env.WEB_APP_BASE_URL");
}

export const resendVerificationEmail = async (
  parent,
  args,
  { dalContext, currentUserID, ses }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new Error("Must be signed in");
  }
  const existingVerifiedEmail = await verifiedEmailByEmail(dalContext, {
    email: args.email,
    ownerUserID: currentUserID,
  });

  if (process.env.S_STAGE !== "local") {
    try {
      await sendVerificationEmail(ses, {
        email: existingVerifiedEmail.email,
        verificationCode: existingVerifiedEmail.verificationCode,
      });
      console.log("verification email sent");
    } catch (err) {
      Bugsnag.notify(err);
      throw new Error(
        "We had some trouble resending you the verification email. Please try again."
      );
    }
  }

  return existingVerifiedEmail;
};
