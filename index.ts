// @ts-ignore
import * as aws from "aws-sdk";
import * as fs from "fs";
import * as path from "path";

import { ApolloServer, gql } from "apollo-server-express";
import { MutationResolvers, QueryResolvers } from "./src/api/types.generated";

import { Ctx } from "./src/dal/ctx";
import express from "express";
import graphiql from "graphql-playground-middleware-express";
import serverless from "serverless-http";
import { userIDForToken } from "./src/dal/userIDForToken";

aws.config.update({ region: "us-east-1" });

const ddb = new aws.DynamoDB({ apiVersion: "2012-08-10" });

const ctx: Ctx = {
  ddb
};

const queryResolvers: QueryResolvers = {
  me: (parent, args, context, info) => {
    console.log("parent", JSON.stringify(parent));
    console.log("args", JSON.stringify(args));
    console.log("context", JSON.stringify(context));
    console.log("info", JSON.stringify(info));
    return { userID: "123" };
  }
};

const mutationResolvers: MutationResolvers = {
  createAccount: (parent, args, context, info) => {
    console.log("parent", JSON.stringify(parent));
    console.log("args", JSON.stringify(args));
    console.log("context", JSON.stringify(context));
    console.log("info", JSON.stringify(info));
    return { userID: "123", success: true };
  }
};

const schema = fs.readFileSync(
  path.join(__dirname, "./src/api/schema.graphql"),
  "utf8"
);

const server = new ApolloServer({
  typeDefs: schema,
  resolvers: {
    Query: { ...queryResolvers },
    Mutation: { ...mutationResolvers }
  },
  introspection: false,
  context: ({ req }) => {
    // get the user token from the headers
    const token = req.headers.authorization || "";

    // try to retrieve a user with the token
    const userID = userIDForToken(ctx, token);

    // add the user to the context
    return { userID };
  }
});

const app = express();

server.applyMiddleware({ app });

app.get("/playground", graphiql({ endpoint: "/graphql" }));

const handler = serverless(app);

export { handler };
