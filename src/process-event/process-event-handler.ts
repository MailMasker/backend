import Bugsnag from "@bugsnag/js";
import { Client } from "pg";
import { SQSEvent } from "aws-lambda";

Bugsnag.start({
  apiKey: "3e593a7f71377ef86cf65c7cda2570db",
  releaseStage: process.env.BUGSNAG_RELEASE_STAGE,
  enabledReleaseStages: ["dev", "prod"],
  appType: "process-event",
  // @ts-ignore
  collectUserIp: false,
  hostname: process.env.API_DOMAIN,
});

if (!process.env.PENDING_EVENTS_SNS_ARN) {
  Bugsnag.notify("process.env.PENDING_EVENTS_SNS_ARN missing");
}

export const handler = async function(evt: SQSEvent, ctx) {
  try {
    const client = new Client({
      user: process.env.POSTGRES_DB_USERNAME,
      host: process.env.POSTGRES_DB_HOST,
      // For now, we expect username and db name to be equivalent
      database: process.env.POSTGRES_DB_USERNAME,
      password: process.env.POSTGRES_DB_PASSWORD,
      port: 5432,
    });
    client.connect();

    for (let index = 0; index < evt.Records.length; index++) {
      console.log(`processing item ${index + 1} of ${evt.Records.length}`);

      const sqsItem = evt.Records[index];
      const sqsItemBody = JSON.parse(sqsItem.body);
      const message = JSON.parse(sqsItemBody.Message);

      console.log("message: ", message);

      try {
        const text = `INSERT INTO event(name, userIDHash, uuid) 
          VALUES($1, $2, $3)
          ON CONFLICT ON CONSTRAINT unique_uuid_constraint 
          DO NOTHING`;
        const values = [
          message.name,
          message.userIDHash,
          sqsItemBody.MessageId,
        ];
        await client.query(text, values);
      } catch (err) {
        console.log(err);
        client.end();
        throw err;
      }
    }

    console.log(`finished all ${evt.Records.length} item(s)`);

    client.end();
  } catch (err) {
    Bugsnag.notify(err);
    throw err;
  }
};
