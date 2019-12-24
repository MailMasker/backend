import { ApolloError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { DALContext } from "./DALContext";

export function userForID(
  { ddb }: DALContext,
  userID: string
): Promise<{
  id: string;
  username: string;
  verifiedEmailIDs: string[];
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
        data.Item.Username &&
        data.Item.Username.S &&
        data.Item.UsernameHash &&
        data.Item.UsernameHash.S &&
        data.Item.VerifiedEmailIDs.L
      ) {
        console.info(`Successfully got username for userID ${userID}`);
        resolve({
          id: data.Item.ID.S,
          username: data.Item.Username.S,
          verifiedEmailIDs: data.Item.VerifiedEmailIDs.L.map(
            ({ S: verifiedEmailID }: { S: string }) => verifiedEmailID
          )
          // routes: [],
          // maskedEmails: []
        });
      } else {
        reject(new AuthenticationError("UserID not found"));
      }
    });
  });
}
