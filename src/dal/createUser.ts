import { DALContext } from "./DALContext";
import { createAuthToken } from "./createAuthToken";
import { v4 as uuid } from "uuid";

export enum CreateUserError {
  UsernameAlreadyExists,
  UnknownError
}

export function createUser(
  ctx: DALContext,
  userData: {
    username: string;
    email: string;
    requestUUID: string;
  }
) {
  const userID = uuid();

  const params = {
    TableName: "user",
    Item: {
      ID: { S: userID },
      Username: { S: userData.username },
      Email: { S: userData.email },
      UUID: { S: userData.requestUUID }
    }
  };

  // TODO: create auth token and return a CreateUserResponse object

  return new Promise<{
    user: {
      id: string;
      username: string;
      email: string;
    };
    authToken: string;
  }>((resolve, reject) => {
    ctx.ddb.putItem(params, function(err, data) {
      if (err) {
        console.error(new Error(`Error creating user ${userID}: ${err}`));
        reject(err);
      } else {
        console.info(`Successfully created user with userID ${userID}`);
        // TODO: print everything in debug mode! And turn off debug mode in production
        // console.debug(`Successfully got auth for user ${data.username}`);

        createAuthToken(ctx, userID).then(({ authToken }) => {
          console.info(
            `Successfully created the first auth token for userID ${userID}`
          );
          resolve({
            user: {
              id: userID,
              username: userData.username,
              email: userData.email
            },
            authToken
          });
        });
      }
    });
  });
}
