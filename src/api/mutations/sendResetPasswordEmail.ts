import { NotFoundError, verifiedEmailByID } from "../../dal";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import Bugsnag from "@bugsnag/js";
import { MutationSendResetPasswordEmailArgs } from "../types.generated";
import { createPasswordResetRequest } from "../../dal/createPasswordResetRequest";
import dayjs from "dayjs";
import populateTemplate from "../../dal/lib/populateTemplate";
import relativeTime from "dayjs/plugin/relativeTime";
import sendTransactionalEmail from "../../dal/lib/sendTransactionalEmail";
import { userByID } from "../../dal/userByID";
import { userByUsername } from "../../dal/userByUsername";
import { v4 as uuid } from "uuid";
import { verifiedEmailsByEmailForAllUsers } from "../../dal/verifiedEmailsByEmailForAllUsers";

const forgotPasswordTemplate = require("../../email-templates/forgotPassword.template.html");

dayjs.extend(relativeTime);

export const sendResetPasswordEmail = async (
  parent,
  args: MutationSendResetPasswordEmailArgs,
  context: AuthenticatedResolverContext,
  info
) => {
  const cleanedUsernameOrEmail = args.usernameOrEmail.toLowerCase().trim();

  if (!cleanedUsernameOrEmail) {
    throw new Error("please provide your username or email");
  }

  let destinationEmails: string[] = [];
  let userID: string | undefined;
  try {
    const user = await userByUsername(context.dalContext, {
      username: cleanedUsernameOrEmail,
    });
    userID = user.id;
  } catch (err) {
    if (err instanceof NotFoundError) {
      try {
        const verifiedEmails = await verifiedEmailsByEmailForAllUsers(
          context.dalContext,
          { email: cleanedUsernameOrEmail }
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
      const forgotPasswordEmailHTML = populateTemplate(
        forgotPasswordTemplate.default,
        [
          {
            key: "__USERNAME__",
            value: `${user.username}`,
          },
          {
            key: "__CTA_URL__",
            value: `${process.env.WEB_APP_BASE_URL}/reset-password/user/${user.id}/code/${verificationCode}/username/${user.username}`,
          },
        ]
      );

      await Promise.all(
        destinationEmails.map((email) =>
          sendTransactionalEmail(context.ses, {
            to: [email],
            subject: "[Mail Masker] Reset your password",
            bodyHTML: forgotPasswordEmailHTML,
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
