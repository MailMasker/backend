import AWS from "aws-sdk";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";
import sendTransactionalEmail from "../../dal/lib/sendTransactionalEmail";

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
  await sendTransactionalEmail(ses, {
    to: [email],
    subject: "[Mail Masker] Verify your email address",
    bodyHTML: `<a href="${process.env.WEB_APP_BASE_URL}/verify-email/${email}/code/${verificationCode}">Click here</a> to verify your email address (${email}).`,
  });
}
