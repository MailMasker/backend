// @ts-ignore
import * as aws from "aws-sdk";

import { AuthSchema } from "./ddbTableSchemas";

export function getUserFromToken(ddb: aws.DynamoDB, token: string) {
  const statsParams = {
    TableName: "auth",
    Key: {
      token: { S: "foo" },
      userID: { S: "1234235134" },
      expiryTimestamp: { N: "001" }
    },
    ProjectionExpression: "ATTRIBUTE_NAME"
  };

  return new Promise<AuthSchema>((resolve, reject) => {
    ddb.getItem(statsParams, function(err, data) {
      if (err) {
        console.error(new Error(`Error getting auth: ${JSON.stringify(err)}`));
        reject(err);
      } else {
        console.info(`Successfully got auth for user ${data.username}`);
        resolve(data);
      }
    });
  });
}
