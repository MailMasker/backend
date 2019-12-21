import { DALContext } from "./DALContext";

export function verifiedEmailForEmail(
  { ddb }: DALContext,
  { email }: { email: string }
): Promise<{
  id: string;
  email: string;
  verified: boolean;
  ownerUserID: string;
} | null> {
  var params = {
    TableName: "verified-email",
    IndexName: "Email",
    KeyConditionExpression: "Email = :email",
    ExpressionAttributeValues: {
      ":email": { S: email }
    }
  };

  return new Promise((resolve, reject) => {
    ddb.query(params, (err, data) => {
      if (err) {
        console.error(
          new Error(
            `Error getting verified email from email ${email}: ${JSON.stringify(
              err
            )}`
          )
        );
        reject(err);
      } else if (data && data.Items) {
        if (data.Items.length > 1) {
          console.error(
            new Error(`Unexpected data.Items of length ${data.Items.length}`)
          );
          reject(
            new Error(
              "Multiple verified emails detected with the same email address"
            )
          );
        }
        let item = data.Items[0];
        if (
          item &&
          item.ID &&
          item.ID.S &&
          item.Email &&
          item.Email.S &&
          item.Verified &&
          // Necessary to check if BOOL is set (TypeScript doesn't like hasOwnProperty() here)
          (item.Verified.BOOL === true || item.Verified.BOOL === false) &&
          item.OwnerUserID &&
          item.OwnerUserID.S
        ) {
          resolve({
            id: item.ID.S,
            email: item.Email.S,
            verified: item.Verified.BOOL,
            ownerUserID: item.OwnerUserID.S
          });
        } else {
          resolve(null);
        }
      } else {
        reject(new Error("Unknown error"));
      }
    });
  });
}
