import { ApolloError } from "apollo-server-core";
import { DALContext } from "./DALContext";

export function userForEmail(
  { ddb }: DALContext,
  username: string
): Promise<{
  username: string;
  email: string;
  id: string;
  passwordHash: string;
}> {
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
          new Error(`Error getting user from username: ${JSON.stringify(err)}`)
        );
        reject(err);
      } else if (data && data.Items) {
        if (data.Items.length > 1) {
          console.error(
            new Error(`Unexpected data.Items of length ${data.Items.length}`)
          );
          reject(new ApolloError("Unknown error"));
        } else {
          let userItem = data.Items[0];
          if (
            userItem &&
            userItem.Username &&
            userItem.Username.S &&
            userItem.ID &&
            userItem.ID.S &&
            userItem.Email &&
            userItem.Email.S &&
            userItem.PasswordHash &&
            userItem.PasswordHash.S
          ) {
            resolve({
              username: userItem.Username.S,
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
