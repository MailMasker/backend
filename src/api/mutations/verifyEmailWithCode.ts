import * as dal from "../../dal/";

import { AuthenticationError, UserInputError } from "apollo-server-core";

import Bugsnag from "@bugsnag/js";
import { ResolverContext } from "../lib/ResolverContext";
import populateTemplate from "../../dal/lib/populateTemplate";
import sendTransactionalEmail from "../../dal/lib/sendTransactionalEmail";
import { userByID } from "../../dal/userByID";

const mailMaskActiveTemplate = require("../../email-templates/mailMaskActive.template.html");

export const verifyEmailWithCode = async (
  parent,
  { code, email },
  { dalContext, ses }: ResolverContext,
  info
) => {
  if (!code || !email) {
    throw new UserInputError(
      "Either the verification code or the email is missing"
    );
  }

  const verifiedEmail = await dal.verifyCodeForVerifiedEmail(dalContext, {
    verificationCode: code,
    verifiedEmailEmail: email,
  });

  if (!verifiedEmail.verified) {
    console.error(
      "Verified email should just have been verified, but it's being returned as non-verified. Something's wrong"
    );
  }

  if (verifiedEmail.verified) {
    try {
      // Look up all routes that have this email address and send the intro email
      const user = await userByID(dalContext, verifiedEmail.ownerUserID);
      await Promise.all(
        user.routeIDs.map((routeID) =>
          dal.routesByIDs(dalContext, [routeID]).then(([route]) => {
            if (route.redirectToVerifiedEmailID === verifiedEmail.id) {
              return dal
                .emailMaskByID(dalContext, route.emailMaskID)
                .then((emailMask) => {
                  const mailMaskActiveEmailHTML = populateTemplate(
                    mailMaskActiveTemplate.default,
                    [
                      {
                        key: "__MAIL_MASK__",
                        value: `${emailMask.alias}@${emailMask.domain}`,
                      },
                      {
                        key: "__VERIFIED_EMAIL__",
                        value: verifiedEmail.email,
                      },
                    ]
                  );

                  return sendTransactionalEmail(ses, {
                    to: [`${emailMask.alias}@${emailMask.domain}`],
                    subject: `[Mail Masker] ${emailMask.alias}@${emailMask.domain} is now active!`,
                    bodyHTML: mailMaskActiveEmailHTML,
                  });
                });
            } else {
              return Promise.resolve();
            }
          })
        )
      );
    } catch (err) {
      console.error(err);
      Bugsnag.notify(err);
    }
  }

  return {
    id: verifiedEmail.id,
    email: verifiedEmail.email,
    verified: verifiedEmail.verified,
  };
};
