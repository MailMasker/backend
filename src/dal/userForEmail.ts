import { ApolloError } from "apollo-server-core";
import { DALContext } from "./DALContext";

export function userForEmail(
  { ddb }: DALContext,
  { email }: { email: string }
): Promise<{
  email: string;
  id: string;
  passwordHash: string;
}> {
  var params = {
    TableName: "user",
    IndexName: "Email",
    KeyConditionExpression: "Email = :email",
    ExpressionAttributeValues: {
      ":email": { S: email }
    }
  };
  console.debug("userForEmail query starting");

  return new Promise((resolve, reject) => {
    ddb.query(params, (err, data) => {
      console.debug("userForEmail query finished");
      if (err) {
        console.error(
          new Error(`Error getting user from username: ${JSON.stringify(err)}`)
        );
        reject(err);
      } else if (data && data.Items) {
        console.debug("userForEmail checking items length");
        if (data.Items.length > 1) {
          console.error(
            new Error(`Unexpected data.Items of length ${data.Items.length}`)
          );
          reject(new ApolloError("Unknown error"));
        } else {
          console.debug("userForEmail items length 1: ", data.Items[0]);
          let userItem = data.Items[0];
          if (
            userItem &&
            userItem.ID &&
            userItem.ID.S &&
            userItem.Email &&
            userItem.Email.S &&
            userItem.PasswordHash &&
            userItem.PasswordHash.S
          ) {
            resolve({
              id: userItem.ID.S,
              email: userItem.Email.S,
              passwordHash: userItem.PasswordHash.S
            });
          } else {
            reject(new ApolloError("Unknown error"));
          }
        }
      } else {
        reject(new ApolloError("Unknown error"));
      }
    });
  });
}
