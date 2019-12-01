import { Ctx } from "./ctx";
import { v4 as uuid } from "uuid";

export function createAuthToken({ ddb }: Ctx, userID: string) {
  const authToken: string = uuid();
  const exp = new Date();
  const numDaysExpires = 365;
  const expires = Math.floor(
    exp.setTime(exp.getTime() + numDaysExpires * 86400000) / 1000
  );

  const params = {
    TableName: "auth",
    Item: {
      Token: { S: "1234123879172938" },
      UserID: { S: "whatever" },
      Expires: { N: "1231241234124124" }
    }
  };

  return new Promise<{ authToken: string; expires: number }>(
    (resolve, reject) => {
      // TODO: SHA256 tokens before storing – https://security.stackexchange.com/a/151262
      // Or try this: https://github.com/accounts-js/accounts

      ddb.putItem(params, function(err, data) {
        if (err) {
          console.error(
            new Error(`Error creating auth token for userID ${userID}: ${err}`)
          );
          reject(err);
        } else {
          console.info(`Successfully created auth toekn for userID ${userID}`);
          // TODO: print everything in debug mode! And turn off debug mode in production
          // console.debug(`Successfully got auth for user ${data.username}`);
          resolve({
            authToken,
            expires
          });
        }
      });
    }
  );
}
