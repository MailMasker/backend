import { DALContext } from "./DALContext";
import { verifiedEmailForEmail } from "./verifiedEmailForEmail";

export function isVerifiedEmailTaken(
  { ddb }: DALContext,
  { email }: { email: string }
): Promise<boolean> {
  var params = {
    TableName: "verified-email",
    IndexName: "Email",
    KeyConditionExpression: "Email = :email",
    ExpressionAttributeValues: {
      ":email": { S: email }
    }
  };

  return verifiedEmailForEmail({ ddb }, { email: email }).then(
    verifiedEmail => {
      return !!verifiedEmail;
    }
  );
}
