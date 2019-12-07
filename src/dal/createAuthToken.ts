import { DALContext } from "./DALContext";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

export function createAuthToken(
  { ddb }: DALContext,
  authToken: string,
  userID: string
) {
  const exp = new Date();
  const numDaysExpires = 365;
  const expires = Math.floor(
    exp.setTime(exp.getTime() + numDaysExpires * 86400000) / 1000
  );

  const params = {
    TableName: "auth",
    Item: {
      AuthToken: { S: authToken },
      UserID: { S: userID },
      Expires: { N: `${expires}` }
    }
  };

  return new Promise<{ authToken: string; expires: number }>(
    (resolve, reject) => {
      ddb.putItem(params, function(err, data) {
        if (err) {
          console.error(
            new Error(`Error creating auth token for userID ${userID}: ${err}`)
          );
          reject(err);
        } else {
          console.info(`Successfully created auth token for userID ${userID}`);
          resolve({
            authToken,
            expires
          });
        }
      });
    }
  );
}
