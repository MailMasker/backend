import { DALContext } from "./DALContext";
import { JWT_SECRET } from "../..";
import bcrypt from "bcrypt";
import { createAuthToken } from "./createAuthToken";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

export function createVerifiedEmail(
  ctx: DALContext,
  {
    userID,
    email
  }: {
    userID: string;
    email: string;
  }
) {
  const id = uuid();
  const verified = false;

  const params = {
    TableName: "verified-email",
    Item: {
      ID: { S: id },
      Email: { S: email },
      Verified: { BOOL: verified }
    }
  };

  return new Promise<{
    verifiedEmail: {
      id: string;
      email: string;
      verified: boolean;
    };
  }>((resolve, reject) => {
    ctx.ddb.putItem(params, function(err, data) {
      if (err) {
        console.error(
          new Error(
            `Error creating verified email ${email} for ${userID}: ${err}`
          )
        );
        reject(err);
      } else {
        console.debug(
          `Successfully created verified email ${email} with userID ${userID}`
        );

        resolve({ verifiedEmail: { id, email, verified } });
      }
    });
  });
}
