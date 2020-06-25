import AWS from "aws-sdk";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import { Client } from "pg";
import bodyParser from "body-parser";
import { config } from "dotenv";
import crypto from "crypto";
import express from "express";
import serverless from "serverless-http";

const sns = new AWS.SNS({ region: "us-east-1" });

Bugsnag.start({
  apiKey: "3e593a7f71377ef86cf65c7cda2570db",
  plugins: [BugsnagPluginExpress],
  releaseStage: process.env.BUGSNAG_RELEASE_STAGE,
  enabledReleaseStages: ["dev", "prod"],
  appType: "events",
  // @ts-ignore
  collectUserIp: false,
  hostname: process.env.API_DOMAIN,
});

if (!process.env.DOT_ENV_FILE) {
  Bugsnag.notify("process.env.DOT_ENV_FILE missing");
}
config({ path: process.env.DOT_ENV_FILE });

if (!process.env.PENDING_EVENTS_SNS_ARN) {
  Bugsnag.notify("process.env.PENDING_EVENTS_SNS_ARN missing");
}

const app = express();

app.post(
  "/event",
  bodyParser.json({ type: "application/json" }),
  async (request: express.Request, response: express.Response) => {
    console.log("request to events-handler: ", request.body);

    if (!request.body.name) {
      response.json({ received: false });
      return;
    } else if (!request.body.userIDHash) {
      response.json({ received: false });
      return;
    }

    console.log(
      `publishing event ${request.body.name} for user ${request.body.userIDHash}`
    );

    let params = {
      Message: JSON.stringify({
        name: request.body.name,
        userIDHash: request.body.userIDHash,
      }),
      TopicArn: process.env.PENDING_EVENTS_SNS_ARN,
    };

    try {
      await sns.publish(params).promise();
    } catch (err) {
      console.log(err);
      throw err;
    }

    // const client = new Client({
    //   user: process.env.POSTGRES_DB_USERNAME,
    //   host: process.env.POSTGRES_DB_HOST,
    //   // For now, we expect username and db name to be equivalent
    //   database: process.env.POSTGRES_DB_USERNAME,
    //   password: process.env.POSTGRES_DB_PASSWORD,
    //   port: 5432,
    // });
    // client.connect();

    // try {
    //   const text = "INSERT INTO event(name, userIDHash) VALUES($1, $2, $3)";
    //   const values = [
    //     request.body.name,
    //     crypto
    //       .createHash("md5")
    //       .update(request.body.userIDHash)
    //       .digest("hex"),
    //   ];
    //   await client.query(text, values);
    // } catch (err) {
    //   console.log(err);
    //   throw err;
    // }

    console.log("ending");

    response.json({ received: true });
  }
);

const handler = serverless(app);

export { handler };
