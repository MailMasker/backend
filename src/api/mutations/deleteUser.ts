import { AuthenticationError, UserInputError } from "apollo-server-core";

import { AuthenticatedResolverContext } from "../lib/ResolverContext";
import Bugsnag from "@bugsnag/js";
import { NotFoundError } from "../../dal";
import { UnPromisify } from "../../dal/lib/UnPromisify";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { deleteAllAuthTokensForUserID } from "../../dal/deleteAllAuthTokensForUserID";
import { exportData } from "../../dal/exportData";
import populateTemplate from "../../dal/lib/populateTemplate";
import sendTransactionalEmail from "../../dal/lib/sendTransactionalEmail";
import { updateUser } from "../../dal/updateUser";
import { updateVerifiedEmail } from "../../dal/updateVerifiedEmail";
import { userByID } from "../../dal/userByID";
import { userByUsername } from "../../dal/userByUsername";
import { v4 as uuid } from "uuid";

const accountDeletedTemplate = require("../../email-templates/accountDeleted.template.html");

export const deleteUser = async (
  parent,
  args,
  {
    clearAuthCookie,
    dalContext,
    currentUserID,
    ses,
  }: AuthenticatedResolverContext,
  info
) => {
  if (!currentUserID) {
    throw new AuthenticationError(
      "You must be logged-in to delete your account."
    );
  }

  const user = await userByID(dalContext, currentUserID);
  const now = dayjs();

  if (!bcrypt.compareSync(args.password, user.passwordHash)) {
    throw new UserInputError("The password you provided isn't correct");
  }

  const dataBeforeDeletion = await exportData(dalContext, currentUserID);

  let scrambledUsername = uuid();

  // Ensure this scrambled username isn't taken (and try again a couple of times, if so)
  let existingUserWithNewUsername:
    | UnPromisify<ReturnType<typeof userByUsername>>
    | undefined;
  for (let i = 0; i < 3; i++) {
    try {
      scrambledUsername = uuid().toLowerCase();
      // A NotFoundError should be thrown, unless the user is already taken
      existingUserWithNewUsername = await userByUsername(dalContext, {
        username: scrambledUsername,
      });
    } catch (err) {
      if (err instanceof NotFoundError) {
        // This is the expected case
        break;
      } else {
        throw err;
      }
    }
  }
  if (existingUserWithNewUsername) {
    // We should never encounter this code path
    throw new Error(
      "We experienced an error prior to deleting your account. The account has not been deleted."
    );
  }

  await Promise.all(
    dataBeforeDeletion.verifiedEmails.map((verifiedEmail) =>
      updateVerifiedEmail(dalContext, verifiedEmail.id, {
        deletedISO: now.toISOString(),
      })
    )
  );

  console.log(
    `verifiedEmails with IDs successfully wiped: ${dataBeforeDeletion.verifiedEmails
      .map((ve) => ve.id)
      .join(", ")}`
  );

  await updateUser(dalContext, currentUserID, {
    username: scrambledUsername,
    deletedISO: dayjs().toISOString(),
  });

  const dataAfterDeletion = await exportData(dalContext, currentUserID);

  await deleteAllAuthTokensForUserID(dalContext, { userID: user.id });

  clearAuthCookie();

  try {
    const accountDeletedEmailHTML = populateTemplate(
      accountDeletedTemplate.default,
      [
        {
          key: "__NEW_USERNAME__",
          value: `${scrambledUsername}`,
        },
        {
          key: "__CTA_URL__",
          value: `https://help.mailmasker.com`,
        },
      ]
    );

    await Promise.all(
      dataBeforeDeletion.verifiedEmails.map((verifiedEmail) =>
        sendTransactionalEmail(ses, {
          to: [verifiedEmail.email],
          subject: "[Mail Masker] Your account has been deleted",
          bodyHTML: accountDeletedEmailHTML,
        })
      )
    );
  } catch (err) {
    Bugsnag.notify(err);
    throw new Error(
      "We had some trouble sending one or more account deletion emails. Please try again."
    );
  }

  return {
    dataBeforeDeletion: JSON.stringify(dataBeforeDeletion),
    dataAfterDeletion: JSON.stringify(dataAfterDeletion),
    scrambledUsername,
  };
};
