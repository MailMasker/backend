import { DALContext } from "./DALContext";
import { JWT_SECRET } from "../..";
import bcrypt from "bcrypt";
import { createAuthToken } from "./createAuthToken";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

export function createUser(
  ctx: DALContext,
  userData: {
    username: string;
    password: string;
    requestUUID: string;
  }
) {
  const userID = uuid();
  const usernameHash = bcrypt.hashSync(userData.username, 10);
  const passwordHash = bcrypt.hashSync(userData.password, 10);

  const params = {
    TableName: "user",
    Item: {
      ID: { S: userID },
      PasswordHash: { S: passwordHash },
      Username: { S: userData.username },
      UsernameHash: { S: usernameHash },
      UUID: { S: userData.requestUUID },
      Created: { N: String(new Date().getTime()) },
      VerifiedUsernameIDs: { L: [] }
    }
  };

  return new Promise<{
    user: {
      id: string;
      username: string;
    };
    auth: { authToken: string; expires: number };
  }>((resolve, reject) => {
    ctx.ddb.putItem(params, function(err, data) {
      if (err) {
        console.error(new Error(`Error creating user ${userID}: ${err}`));
        reject(err);
      } else {
        console.info(`Successfully created user with userID ${userID}`);

        const token = jwt.sign(
          { username: userData.username, userID },
          JWT_SECRET
        );

        createAuthToken(ctx, token, userID)
          .then(({ authToken, expires }) => {
            resolve({
              user: {
                id: userID,
                username: userData.username
              },
              auth: { authToken, expires }
            });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  });
}
