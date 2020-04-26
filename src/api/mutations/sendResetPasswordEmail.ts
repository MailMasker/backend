import { NotFoundError, verifiedEmailByID } from "../../dal";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { MutationSendResetPasswordEmailArgs } from "../types.generated";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";
import { createPasswordResetRequest } from "../../dal/createPasswordResetRequest";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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
    await Promise.all(
      destinationEmails.map((email) => {
        const params = {
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Body: {
              Html: {
                Charset: "UTF-8",
                Data: `<p>Your username is ${user.username}</p><p><a href="${
                  process.env.WEB_APP_BASE_URL
                }/reset-password/${
                  args.usernameOrEmail
                }/code/${verificationCode}/username/${
                  user.username
                }">Click here</a> to choose a new password (${email}).</p><p>This link expires ${dayjs().to(
                  dayjs(expiresISO)
                )}, and has been sent to all of the verified email addresses on your account.</p>`,
              },
            },
            Subject: {
              Charset: "UTF-8",
              Data: "[Mail Masker] Reset your password",
            },
          },
          // NOTE: if this gets updated, also update the place in the web app where we reference this email address by searching that project for "support@"
          Source: `support@${SupportedMailDomains[0]}`,
        };

        // Create the promise and SES service object
        const sendPromise = context.ses.sendEmail(params).promise();

        // Handle promise's fulfilled/rejected states
        return sendPromise
          .then(function(data) {
            console.debug(data.MessageId);
          })
          .catch(function(err) {
            console.error(err, err.stack);
            throw new Error("We were unable to send a password reset email");
          });
      })
    );
  }

  return true;
};
