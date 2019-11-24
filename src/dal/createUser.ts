// @ts-ignore
import * as aws from "aws-sdk";

import { AuthSchema } from "./ddbTableSchemas";
import { Context } from "./ctx";

export enum CreateUserError {
  UsernameAlreadyExists,
  UnknownError
}

export type CreateUserResponse = {
  userID: string;
  username: string;
  authToken: string;
};

export function createUser(
  { ddb }: Context,
  userData: {
    username: string;
    userID: number;
    requestUUID: string;
    password: string;
  }
) {
  const forwardRoutesParams = {
    TableName: "users",
    Item: {
      toEmail: { S: "jonsibley+test1@1nt.email" },
      toEmailBase: { S: "jonsibley@1nt.email" },
      forwardToEmails: { L: [{ S: "jonsibley+test1@gmail.com" }] }
    }
  };

  // TODO: create auth token and return a CreateUserResponse object

  return new Promise<AuthSchema>((resolve, reject) => {
    ddb.putItem(forwardRoutesParams, function(err, data) {
      if (err) {
        console.error(
          new Error(`Error creating user ${userData.userID}: ${err}`)
        );
        reject(err);
      } else {
        console.info(`Successfully got auth for user ${data.username}`);
        // TODO: print everything in debug mode! And turn off debug mode in production
        // console.debug(`Successfully got auth for user ${data.username}`);
        resolve(data);
      }
    });
  });
}
