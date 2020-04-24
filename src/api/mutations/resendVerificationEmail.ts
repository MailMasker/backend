import { AuthenticatedResolverContext } from "../lib/ResolverContext";
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
    await sendVerificationEmail(ses, {
      email: existingVerifiedEmail.email,
      verificationCode: existingVerifiedEmail.verificationCode,
    });
  }

  return existingVerifiedEmail;
};
