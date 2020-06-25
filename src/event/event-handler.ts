import AWS from "aws-sdk";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import express from "express";
import queueEvent from "../dal/lib/queueEvent";
import serverless from "serverless-http";

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

const app = express();

app.post(
  "/event",
  bodyParser.json({ type: "application/json" }),
  async (request: express.Request, response: express.Response) => {
    console.log("request to events-handler: ", request.body);

    if (!request.body.name) {
      response.json({ received: false });
      return;
    }

    await queueEvent({
      serviceName: request.body.serviceName,
      type: request.body.type,
      eventName: request.body.name,
      userID: request.body.userID ?? undefined,
    });

    response.json({ received: true });
  }
);

const handler = serverless(app);

export { handler };
