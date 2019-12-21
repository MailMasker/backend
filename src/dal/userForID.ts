import { ApolloError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { DALContext } from "./DALContext";

export function userForID(
  { ddb }: DALContext,
  userID: string
): Promise<{
  id: string;
  email: string;
  // routes: {}[];
  // maskedEmails: {}[];
}> {
  const params = {
    TableName: "user",
    Key: {
      ID: { S: userID }
    }
  };

  return new Promise((resolve, reject) => {
    ddb.getItem(params, (err, data) => {
      if (err) {
        console.error(
          new Error(
            `Error getting username for userID ${userID}: ${JSON.stringify(
              err
            )}`
          )
        );
        reject(err);
      } else if (
        data &&
        data.Item &&
        data.Item.ID &&
        data.Item.ID.S &&
        data.Item.Email &&
        data.Item.Email.S &&
        data.Item.EmailHash &&
        data.Item.EmailHash.S
      ) {
        console.info(`Successfully got email for userID ${userID}`);
        resolve({
          id: data.Item.ID.S,
          email: data.Item.Email.S
          // routes: [],
          // maskedEmails: []
        });
      } else {
        reject(new AuthenticationError("UserID not found"));
      }
    });
  });
}
