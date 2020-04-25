import AWS from "aws-sdk";
import SupportedMailDomains from "../../dal/lib/supportedMailDomains";

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
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<a href="${process.env.WEB_APP_BASE_URL}/verify-email/${email}/code/${verificationCode}">Click here</a> to verify your email address (${email}).`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "[Mail Masker] Verify your email address",
      },
    },
    // NOTE: if this gets updated, also update the place in the web app where we reference this email address by searching that project for "support@"
    Source: `support@${SupportedMailDomains[0]}`,
  };

  // Create the promise and SES service object
  const sendPromise = ses.sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  await sendPromise
    .then(function(data) {
      console.debug(data.MessageId);
    })
    .catch(function(err) {
      console.error(err, err.stack);
    });
}
