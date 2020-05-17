import Bugsnag from "@bugsnag/js";
import replaceAllOccurrancesOfManyStrings from "../../dal/lib/replaceAllOccurrancesOfManyStrings";
import sendTransactionalEmail from "../../dal/lib/sendTransactionalEmail";

const verifyEmailTemplate = require("../../email-templates/verifyEmail.template.html");

const staticReplacements = [
  { key: "__ASSETS_BASE_URL__", value: process.env.ASSETS_BASE_URL ?? "" },
];
staticReplacements.forEach(({ key, value }) => {
  if (!!value) {
    Bugsnag.notify(new Error(`missing value for ${key}`));
  }
});

export default async function sendVerificationEmail(
  ses: AWS.SES,
  {
    email,
    verificationCode,
  }: {
    email: string;
    verificationCode: string;
  }
) {
  console.log("verifyEmailTemplate: ", verifyEmailTemplate.default);

  const replacements: [{ key: string; value: string }] = [
    { key: "__ASSETS_BASE_URL__", value: process.env.ASSETS_BASE_URL ?? "" },
  ];

  let verifyEmailHTML = replaceAllOccurrancesOfManyStrings(
    verifyEmailTemplate.default,
    [
      ...staticReplacements,
      { key: "__EMAIL_ADDRESS__", value: email },
      {
        key: "__CTA_URL__",
        value: `${process.env.WEB_APP_BASE_URL}/verify-email/${email}/code/${verificationCode}`,
      },
    ]
  );

  console.log("verifyEmailHTML: ", verifyEmailHTML);

  await sendTransactionalEmail(ses, {
    to: [email],
    subject: "[Mail Masker] Verify your email address",
    bodyHTML: verifyEmailHTML,
  });
}
