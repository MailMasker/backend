import { ApolloError } from "apollo-server-core";
import { DALContext } from "./DALContext";

export function userForUsername(
  { ddb }: DALContext,
  username: string
): Promise<{ username: string; email: string; id: string }> {
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
          // TODO: localize string
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
            userItem.Email.S
          ) {
            resolve({
              username: userItem.Username.S,
              id: userItem.ID.S,
              email: userItem.Email.S
            });
          } else {
            // TODO: localize string
            reject(new ApolloError("Unknown error"));
          }
        }
      } else {
        // TODO: localize string
        reject(new ApolloError("Unknown error"));
      }
    });
  });
}
