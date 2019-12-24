import { ApolloError } from "apollo-server-core";
import { DALContext } from "./DALContext";

export function userForUsername(
  { ddb }: DALContext,
  { username }: { username: string }
): Promise<{
  username: string;
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
  console.debug("userForUsername query starting");

  return new Promise((resolve, reject) => {
    ddb.query(params, (err, data) => {
      console.debug("userForUsername query finished");
      if (err) {
        console.error(
          new Error(`Error getting user from username: ${JSON.stringify(err)}`)
        );
        reject(err);
      } else if (data && data.Items) {
        console.debug("userForUsername checking items length");
        if (data.Items.length > 1) {
          console.error(
            new Error(`Unexpected data.Items of length ${data.Items.length}`)
          );
          reject(new ApolloError("Unknown error"));
        } else {
          console.debug("userForUsername items length 1: ", data.Items[0]);
          let userItem = data.Items[0];
          if (
            userItem &&
            userItem.ID &&
            userItem.ID.S &&
            userItem.Username &&
            userItem.Username.S &&
            userItem.PasswordHash &&
            userItem.PasswordHash.S
          ) {
            resolve({
              id: userItem.ID.S,
              username: userItem.Username.S,
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
