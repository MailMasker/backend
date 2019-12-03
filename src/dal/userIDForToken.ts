import { ApolloError } from "apollo-server-core";
import { DALContext } from "./DALContext";

export function userIDForToken(
  { ddb }: DALContext,
  token: string
): Promise<string> {
  const params = {
    TableName: "auth",
    Key: {
      Token: { S: token }
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
        // TODO: localize string
        reject(new ApolloError("Unknown error"));
      }
    });
  });
}
