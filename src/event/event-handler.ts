import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import { Client } from "pg";
import bodyParser from "body-parser";
import { config } from "dotenv";
import express from "express";
import serverless from "serverless-http";

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

const app = express();

app.use(bodyParser.json({ type: "application/json" }));

app.post(
  "/event",
  async (request: express.Request, response: express.Response) => {
    console.log("request to events-handler: ", request.body);

    const client = new Client({
      user: process.env.POSTGRES_DB_USERNAME,
      host: process.env.POSTGRES_DB_HOST,
      database: "mailmasker",
      password: process.env.POSTGRES_DB_PASSWORD,
      port: 5432,
    });
    client.connect();

    await client
      .query("SELECT NOW() as now")
      .then((res) => console.log(res.rows[0]))
      .catch((e) => console.error(e.stack));

    console.log("ending");

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

const handler = serverless(app);

export { handler };
