import { ApolloError } from "apollo-server-core";
import { DALContext } from "./DALContext";

export function isAccountEmailTaken(
  { ddb }: DALContext,
  { email }: { email: string }
): Promise<boolean> {
  var params = {
    TableName: "user",
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
          new Error(`Error getting user from username: ${JSON.stringify(err)}`)
        );
        reject(err);
      } else if (data && data.Items && data.Items.length > 0) {
        resolve(true);
      }

      resolve(false);
    });
  });
}
