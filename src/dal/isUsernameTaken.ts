import { ApolloError } from "apollo-server-core";
import { DALContext } from "./DALContext";

export function isUsernameTaken(
  { ddb }: DALContext,
  { username }: { username: string }
): Promise<boolean> {
  var params = {
    TableName: "user",
    IndexName: "Username",
    KeyConditionExpression: "Username = :username",
    ExpressionAttributeValues: {
      ":username": { S: username }
    }
  };

  return new Promise((resolve, reject) => {
    ddb.query(params, (err, data) => {
      if (err) {
        console.error(
          new Error(
            `Error determining whether username is taken: ${JSON.stringify(
              err
            )}`
          )
        );
        reject(err);
      } else if (data && data.Items && data.Items.length > 0) {
        resolve(true);
      }

      resolve(false);
    });
  });
}
