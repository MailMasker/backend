// @ts-ignore
import * as aws from "aws-sdk";
import * as fs from "fs";
import * as path from "path";

import { ApolloServer, gql } from "apollo-server-express";
import { MutationResolvers, QueryResolvers } from "./src/api/types.generated";

import { Ctx } from "./src/dal/ctx";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createUser } from "./src/dal/createUser";
import express from "express";
import graphiql from "graphql-playground-middleware-express";
import serverless from "serverless-http";
import { userIDForToken } from "./src/dal/userIDForToken";

// @ts-ignore
const { raw: ddb } = require("serverless-dynamodb-client");

// console.log("ddb at init: ", ddb);

aws.config.update({ region: "us-east-1" });

const ctx: Ctx = {
  ddb
};

export const authenticated = next => (root, args, context, info) => {
  if (!context.currentUserID) {
    throw new Error(`Unauthenticated!`);
  }

  return next(root, args, context, info);
};

const queryResolvers: QueryResolvers = {
  ping: (parent, args, context, info) => {
    // console.log("parent", JSON.stringify(parent));
    // console.log("args", JSON.stringify(args));
    // console.log("context", JSON.stringify(context));
    // console.log("info", JSON.stringify(info));
    return "pong";
  },
  me: authenticated((parent, args, context, info) => {
    // console.log("parent", JSON.stringify(parent));
    // console.log("args", JSON.stringify(args));
    // console.log("context", JSON.stringify(context));
    // console.log("info", JSON.stringify(info));
    return { userID: "123" };
  })
};

const mutationResolvers: MutationResolvers = {
  createUser: async (parent, args, context, info) => {
    // console.log("parent", JSON.stringify(parent));
    // console.log("args", JSON.stringify(args));
    // console.log("context", JSON.stringify(context));
    // console.log("info", JSON.stringify(info));

    const {
      user: { id },
      authToken
    } = await createUser(ctx, {
      username: args.input.username,
      email: args.input.email,
      requestUUID: args.input.uuid
    });

    return { userID: id, token: authToken, success: true };
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
  introspection: true,
  context: async ({ req, res }) => {
    // console.log("req during context: ", req);

    if (req.cookies.authorization) {
      console.log("cookie: ", req.cookies.authorization);
    }

    const token = req.cookies.authorization || req.headers.authorization;

    let userID: string | null = null;
    if (token) {
      try {
        userID = await userIDForToken(ctx, token);
      } catch (error) {
        console.warn("Error getting userID: ", error);
      }
    }

    return { currentUserID: userID };
  }
});

const app = express();

app.use(cookieParser());

var corsOptions = {
  origin: true,
  credentials: true
};
app.use(cors(corsOptions));

server.applyMiddleware({ app });

app.get("/playground", graphiql({ endpoint: "/graphql" }));

const handler = serverless(app);

export { handler };
