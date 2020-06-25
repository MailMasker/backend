import AWS from "aws-sdk";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import express from "express";
import serverless from "serverless-http";

const sns = new AWS.SNS({ region: "us-east-1" });

Bugsnag.start({
  apiKey: "3e593a7f71377ef86cf65c7cda2570db",
  plugins: [BugsnagPluginExpress],
  releaseStage: process.env.BUGSNAG_RELEASE_STAGE,
  enabledReleaseStages: ["dev", "prod"],
  appType: "event",
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

    console.log("ending");

    response.json({ received: true });
  }
);

const handler = serverless(app);

export { handler };
