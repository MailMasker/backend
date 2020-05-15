import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import { MutationResetPasswordArgs } from "../types.generated";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";
import { createAuthToken } from "../../dal/createAuthToken";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import { updateUser } from "../../dal/updateUser";
import { userByID } from "../../dal/userByID";
import { verifiedEmailByID } from "../../dal";

export const resetPassword = async (
  parent,
  args: MutationResetPasswordArgs,
  context: AuthenticatedResolverContext,
  info
) => {
  if (!args.code || !args.newPassword || !args.userID) {
    throw new Error("missing code, new password, or user ID");
  }

  const { passwordResetRequests } = await userByID(
    context.dalContext,
    args.userID
  );

  if (passwordResetRequests.length === 0) {
    throw new Error("no password reset request was found");
  }

  let foundMatchingCode = false;
  let foundDestionationEmail = false;
  for (let i = 0; i < passwordResetRequests.length; i++) {
    const request = passwordResetRequests[i];
    if (request.code === args.code) {
      foundMatchingCode = true;
      if (!dayjs().isBefore(dayjs(request.expiresISO))) {
        throw new Error("this password reset request has expired");
      }

      const userPreUpdate = await userByID(context.dalContext, args.userID);
      const verifiedEmailsForUser = await Promise.all(
        userPreUpdate.verifiedEmailIDs.map((id) =>
          verifiedEmailByID(context.dalContext, id)
        )
      );
      const destinationEmails = verifiedEmailsForUser
        .filter(({ deleted }) => !deleted)
        .map(({ email }) => email);

      await updateUser(context.dalContext, userPreUpdate.id, {
        password: args.newPassword,
        clearAllPasswordResetRequests: true,
      });
      if (destinationEmails.length === 0) {
        console.error(
          new Error(
            `password reset took place for user ${args.userID}, but there are no email addresses to send confirmation to`
          )
        );
      } else {
        foundDestionationEmail = true;
      }

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
                    Data: `Your password has been changed. If you did not do this, and believe your account has been compromised, please respond to this email immediately.`,
                  },
                },
                Subject: {
                  Charset: "UTF-8",
                  Data: "[Mail Masker] Your password has been changed",
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
                throw new Error(
                  "We were unable to send a password reset email"
                );
              });
          })
        );
      }

      const authToken = jwt.sign(
        { username: userPreUpdate.username, userID: userPreUpdate.id },
        process.env.JWT_SECRET as string
      );

      const { secondsUntilExpiry } = await createAuthToken(
        context.dalContext,
        authToken,
        userPreUpdate.id,
        // "Remember Me" is considered unchecked, since there was no UI to check it
        false
      );

      context.setAuthCookie({ authToken, secondsUntilExpiry });

      return true;
    }
  }

  if (!foundMatchingCode) {
    throw new Error("We could not locate your password reset request");
  } else if (!foundDestionationEmail) {
    throw new Error("This account");
  } else {
    throw new Error("An unknown error has occurred");
  }
};
