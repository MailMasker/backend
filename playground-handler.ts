import express from "express";
import graphiql from "graphql-playground-middleware-express";
import serverless from "serverless-http";

const app = express();

if (process.env.S_STAGE === "local" || process.env.S_STAGE === "dev") {
  app.get("/playground", graphiql({ endpoint: "/graphql" }));
}

const handler = serverless(app);

export { handler };
