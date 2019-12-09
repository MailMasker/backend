import { DALContext } from "./DALContext";
import { JWT_SECRET } from "../..";
import bcrypt from "bcrypt";
import { createAuthToken } from "./createAuthToken";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

export function createUser(
  ctx: DALContext,
  userData: {
    email: string;
    password: string;
    requestUUID: string;
  }
) {
  const userID = uuid();
  const emailHash = bcrypt.hashSync(userData.email, 10);
  const passwordHash = bcrypt.hashSync(userData.password, 10);

  const params = {
    TableName: "user",
    Item: {
      ID: { S: userID },
      PasswordHash: { S: passwordHash },
      Email: { S: userData.email },
      EmailHash: { S: emailHash },
      UUID: { S: userData.requestUUID },
      Created: { N: String(new Date().getTime()) }
    }
  };

  return new Promise<{
    user: {
      id: string;
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

        const token = jwt.sign({ email: userData.email, userID }, JWT_SECRET);

        createAuthToken(ctx, token, userID)
          .then(({ authToken, expires }) => {
            resolve({
              user: {
                id: userID,
                email: userData.email
              },
              authToken
            });
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  });
}
