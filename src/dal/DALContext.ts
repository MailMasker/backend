// @ts-ignore
import * as aws from "aws-sdk";

export type DALContext = {
  ddb: aws.DynamoDB;
};
