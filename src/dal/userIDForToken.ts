import { ApolloError } from "apollo-server-core";
import { DALContext } from "./DALContext";
import bcrypt from "bcrypt";

export function userIDForToken(
  { ddb }: DALContext,
  authToken: string
): Promise<string> {
  const params = {
    TableName: "auth",
    Key: {
      AuthToken: { S: authToken }
    }
  };

  return new Promise<string>((resolve, reject) => {
    ddb.getItem(params, (err, data) => {
      if (err) {
        console.error(
          new Error(`Error getting userID from token: ${JSON.stringify(err)}`)
        );
        reject(err);
      } else if (data && data.Item && data.Item.UserID && data.Item.UserID.S) {
        console.info(
          `Successfully got userID from token ${data.Item.UserID.S}`
        );
        resolve(data.Item.UserID.S);
      } else {
        reject(new ApolloError("Unknown error"));
      }
    });
  });
}
