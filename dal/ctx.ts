// @ts-ignore
import * as aws from "aws-sdk";

export type Context = {
  ddb: aws.DynamoDB;
};
