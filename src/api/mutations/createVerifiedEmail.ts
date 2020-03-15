import * as dal from "../../dal/createVerifiedEmail";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { NotFoundError } from "../../dal";
import { verifiedEmailByEmail } from "../../dal/verifiedEmailByEmail";

export const createVerifiedEmail = async (
  parent,
  args,
  { setAuthCookie, dalContext, currentUserID }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new Error("Must be signed in");
  }
  let existingVerifiedEmail;
  try {
    existingVerifiedEmail = await verifiedEmailByEmail(dalContext, {
      email: args.email,
      ownerUserID: currentUserID
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      // This is good: it means the verified email is not already in use
    } else {
      throw err;
    }
  }

  if (existingVerifiedEmail) {
    if (existingVerifiedEmail.verified) {
      throw new Error(
        "The email address provided is already verified for your account"
      );
    }
    throw new Error(
      "The email address provided is already in the process of being verified, but has not yet been verified"
    );
  }

  return await dal.createVerifiedEmail(dalContext, {
    email: args.email,
    userID: currentUserID
  });
};
