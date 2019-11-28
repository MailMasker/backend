// @ts-ignore
import * as aws from "aws-sdk";

import { Auth, User } from "./ddbSchemaTypes";

import { Ctx } from "./ctx";

export function userIDForToken({ ddb }: Ctx, token: string): Promise<string> {
  const statsParams = {
    TableName: "auth",
    Key: {
      Token: { S: "foo" },
      UserID: { S: "1234235134" },
      Expires: { N: "1461938400" }
    },
    ProjectionExpression: "ATTRIBUTE_NAME"
  };

  return new Promise<string>((resolve, reject) => {
    ddb.getItem(
      statsParams,
      (err, data: { Item: { UserID: { S: string } } }) => {
        if (err) {
          console.error(
            new Error(`Error getting userID from token: ${JSON.stringify(err)}`)
          );
          reject(err);
        } else {
          console.info(
            `Successfully got userID from token ${data.Item.UserID.S}`
          );
          resolve(data.Item.UserID.S);
        }
      }
    );
  });
}
