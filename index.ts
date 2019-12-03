// @ts-ignore
import * as aws from "aws-sdk";
import * as fs from "fs";
import * as path from "path";

import { ApolloServer, gql } from "apollo-server-express";
import {
  AuthenticatedResolverContext,
  ResolverContext
} from "./src/api/lib/ResolverContext";
import { MutationResolvers, QueryResolvers } from "./src/api/types.generated";

import { DALContext } from "./src/dal/DALContext";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createUser } from "./src/api/mutations/createUser";
import { raw as ddb } from "serverless-dynamodb-client";
import express from "express";
import graphiql from "graphql-playground-middleware-express";
import { me } from "./src/api/queries/me";
import serverless from "serverless-http";
import { userIDForToken } from "./src/dal/userIDForToken";

const OneYear = 60 * 60 * 24 * 365;

aws.config.update({ region: "us-east-1" });

const dalContext: DALContext = {
  ddb: ddb
};

const queryResolvers: QueryResolvers = {
  ping: (parent, args, context, info) => {
    return "pong";
  },
  me
};

const mutationResolvers: MutationResolvers = {
  createUser
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
    const token = req.cookies.Authorization || req.headers.Authorization;

    let userID: string | undefined;
    if (token) {
      try {
        userID = await userIDForToken(dalContext, token);
      } catch (error) {
        console.warn("Error getting userID: ", error);
      }
    }

    const context: ResolverContext | AuthenticatedResolverContext = {
      currentUserID: userID,
      dalContext,
      setAuthCookie: (token: string) => {
        // TODO: make max-age shorter if marked as a public computer
        res.setHeader(
          "Set-Cookie",
          `Authorization=${token}; Max-Age=${OneYear}`
        );
      }
    };
    return context;
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
