import { DALContext } from "./DALContext";
import { createAuthToken } from "./createAuthToken";
import { v4 as uuid } from "uuid";

export function createRoute(
  ctx: DALContext,
  userData: {
    accountEmail: string;
    requestUUID: string;
  }
) {
  const userID = uuid();

  const params = {
    TableName: "user",
    Item: {
      ID: { S: userID },
      Email: { S: userData.accountEmail },
      UUID: { S: userData.requestUUID }
    }
  };

  return new Promise<{
    user: {
      id: string;
      email: string;
    };
    auth: {
      authToken: string;
      expires: number;
    };
  }>((resolve, reject) => {
    ctx.ddb.putItem(params, function(err, data) {
      if (err) {
        console.error(new Error(`Error creating user ${userID}: ${err}`));
        reject(err);
      } else {
        console.info(`Successfully created user with userID ${userID}`);

        createAuthToken(ctx, userID).then(({ authToken, expires }) => {
          resolve({
            user: {
              id: userID,
              email: userData.accountEmail
            },
            auth: {
              authToken,
              expires
            }
          });
        });
      }
    });
  });
}
