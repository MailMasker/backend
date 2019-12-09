require("dotenv").config();

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
import { authenticate } from "./src/api/mutations/authenticate";
import { authenticated } from "./src/api/lib/authenticated";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createUser } from "./src/api/mutations/createUser";
import { raw as ddb } from "serverless-dynamodb-client";
import express from "express";
import graphiql from "graphql-playground-middleware-express";
import jwt from "jsonwebtoken";
import { me } from "./src/api/queries/me";
import serverless from "serverless-http";
import { unauthenticate } from "./src/api/mutations/unauthenticate";
import { userIDForToken } from "./src/dal/userIDForToken";

// TODO: Follow https://serverless.com/blog/aws-secrets-management/ to store secrets in production
export const JWT_SECRET = "W2UBYMsADD$ZDfrXJMnvHcWm";

const OneYear = 60 * 60 * 24 * 365;

aws.config.update({ region: "us-east-1" });

const dalContext: DALContext = {
  ddb: ddb
};

const queryResolvers: QueryResolvers = {
  ping: (parent, args, context, info) => {
    return "pong";
  },
  me: authenticated(me)
};

const mutationResolvers: MutationResolvers = {
  authenticate,
  unauthenticate: authenticated(unauthenticate),
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
    const authToken = req.cookies.jwt || req.headers.Authorization;

    let currentUserID: string | undefined;
    if (authToken) {
      // This is based on: https://github.com/flaviocopes/apollo-graphql-client-server-authentication-jwt/blob/master/server/index.js
      const { userID, email } = jwt.verify(authToken, JWT_SECRET) as {
        userID: string;
        email: string;
      };
      currentUserID = userID;

      // This is no longer needed due to JWTs
      //
      // try {
      //   userID = await userIDForToken(dalContext, authToken);
      // } catch (error) {
      //   console.warn("Error getting userID: ", error);
      // }
    }

    console.log("currentUserID", currentUserID);

    const context: ResolverContext | AuthenticatedResolverContext = {
      currentUserID,
      dalContext,
      setAuthCookie: ({ authToken, expires }) => {
        res.cookie("jwt", authToken, {
          httpOnly: true,
          maxAge: expires
          // TODO: turn this on for prod eventually
          //secure: true, //on HTTPS
          // TODO: set example for dev and prod and local
          //domain: 'example.com', //set your domain
        });
      },
      clearAuthCookie: () => {
        res.clearCookie("jwt");
      },
      authToken
    };
    return context;
  }
});

const app = express();

app.use(cookieParser());

var corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};
app.use(cors(corsOptions));

server.applyMiddleware({ app });

app.get("/playground", graphiql({ endpoint: "/graphql" }));

const handler = serverless(app);

export { handler };
