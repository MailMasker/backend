import { NotFoundError, verifiedEmailByID } from "../../dal";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import Bugsnag from "@bugsnag/js";
import { MutationSendResetPasswordEmailArgs } from "../types.generated";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";
import { createPasswordResetRequest } from "../../dal/createPasswordResetRequest";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import sendTransactionalEmail from "../../dal/lib/sendTransactionalEmail";
import { userByID } from "../../dal/userByID";
import { userByUsername } from "../../dal/userByUsername";
import { v4 as uuid } from "uuid";
import { verifiedEmailsByEmailForAllUsers } from "../../dal/verifiedEmailsByEmailForAllUsers";
import { visit } from "graphql";

dayjs.extend(relativeTime);

export const sendResetPasswordEmail = async (
  parent,
  args: MutationSendResetPasswordEmailArgs,
  context: AuthenticatedResolverContext,
  info
) => {
  if (!args.usernameOrEmail) {
    throw new Error("please provide your username or email");
  }

  let destinationEmails: string[] = [];
  let userID: string | undefined;
  try {
    const user = await userByUsername(context.dalContext, {
      username: args.usernameOrEmail,
    });
    userID = user.id;
  } catch (err) {
    if (err instanceof NotFoundError) {
      try {
        const verifiedEmails = await verifiedEmailsByEmailForAllUsers(
          context.dalContext,
          { email: args.usernameOrEmail }
        );
        if (verifiedEmails.length > 0) {
          console.error(
            `unexpectedly verifiedEmails.length > 0 – IDs are: ${verifiedEmails
              .map((ve) => ve.id)
              .join(", ")}`
          );
        }
        userID = verifiedEmails[0].ownerUserID;
      } catch (e) {
        if (err instanceof NotFoundError) {
          throw new Error(
            "The username or email address provided could not be found"
          );
        }
      }
    } else {
      throw err;
    }
  }

  if (!userID) {
    throw new Error(
      "We weren't able to find any users based on what you entered"
    );
  }

  const user = await userByID(context.dalContext, userID);

  const verifiedEmailsForUser = await Promise.all(
    user.verifiedEmailIDs.map((id) => verifiedEmailByID(context.dalContext, id))
  );

  destinationEmails = verifiedEmailsForUser
    .filter(({ deleted }) => !deleted)
    .map(({ email }) => email);

  if (destinationEmails.length === 0) {
    throw new Error(
      "We weren't able to find any usernames and/or verified email addresses based on what you entered"
    );
  }

  console.info(
    `sending password reset email to user ${userID} at ${destinationEmails.length} distinct addresses`
  );

  const verificationCode = uuid();

  const { expiresISO } = await createPasswordResetRequest(
    context.dalContext,
    userID,
    verificationCode
  );

  if (process.env.S_STAGE !== "local") {
    try {
      await Promise.all(
        destinationEmails.map((email) =>
          sendTransactionalEmail(context.ses, {
            to: [email],
            subject: "[Mail Masker] Reset your password",
            bodyHTML: `<p>Your username is ${user.username}</p><p><a href="${
              process.env.WEB_APP_BASE_URL
            }/reset-password/user/${
              user.id
            }/code/${verificationCode}/username/${
              user.username
            }">Click here</a> to choose a new password (${email}).</p><p>This link expires ${dayjs().to(
              dayjs(expiresISO)
            )}, and has been sent to all of the verified email addresses on your account.</p>`,
          })
        )
      );
    } catch (err) {
      Bugsnag.notify(err);
      throw new Error(
        "We had some trouble sending one or more password reset emails. Please try again."
      );
    }
  }

  return true;
};
