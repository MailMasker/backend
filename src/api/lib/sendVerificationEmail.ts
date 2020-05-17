import populateTemplate from "../../dal/lib/populateTemplate";
import sendTransactionalEmail from "../../dal/lib/sendTransactionalEmail";

const verifyEmailTemplate = require("../../email-templates/verifyEmail.template.html");

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

  const verifyEmailHTML = populateTemplate(verifyEmailTemplate.default, [
    { key: "__EMAIL_ADDRESS__", value: email },
    {
      key: "__CTA_URL__",
      value: `${process.env.WEB_APP_BASE_URL}/verify-email/${email}/code/${verificationCode}`,
    },
  ]);

  console.log("verifyEmailHTML: ", verifyEmailHTML);

  await sendTransactionalEmail(ses, {
    to: [email],
    subject: "[Mail Masker] Verify your email address",
    bodyHTML: verifyEmailHTML,
  });
}
