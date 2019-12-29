require("dotenv").config();

import * as aws from "aws-sdk";
import * as fs from "fs";
import * as path from "path";

import {
  AuthenticatedResolverContext,
  ResolverContext
} from "./src/api/lib/ResolverContext";
import { MutationResolvers, QueryResolvers } from "./src/api/types.generated";

// @ts-ignore
import { ApolloServer } from "apollo-server-express";
import { DALContext } from "./src/dal/DALContext";
import { authenticate } from "./src/api/mutations/authenticate";
import { authenticated } from "./src/api/lib/authenticated";
import { combineResolvers } from "graphql-resolvers";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createRoute } from "./src/api/mutations/createRoute";
import { createUser } from "./src/api/mutations/createUser";
import { createVerifiedEmail } from "./src/api/mutations/createVerifiedEmail";
import { raw as ddb } from "serverless-dynamodb-client";
import express from "express";
import graphiql from "graphql-playground-middleware-express";
import jwt from "jsonwebtoken";
import { me } from "./src/api/queries/me";
import serverless from "serverless-http";
import { unauthenticate } from "./src/api/mutations/unauthenticate";
import { user } from "./src/api/objects/user";

// TODO: Follow https://serverless.com/blog/aws-secrets-management/ to store secrets in production
export const JWT_SECRET = "W2UBYMsADD$ZDfrXJMnvHcWm";

aws.config.update({ region: "us-east-1" });

const dalContext: DALContext = {
  ddb: ddb
};

const queryResolvers: QueryResolvers = {
  ping: (parent, args, context, info) => {
    return "pong";
  },
  me: combineResolvers(authenticated, me)
};

const mutationResolvers: MutationResolvers = {
  authenticate,
  unauthenticate: combineResolvers(authenticated, unauthenticate),

  createUser,

  createVerifiedEmail

  // createRoute
};

const schema = fs.readFileSync(
  path.join(__dirname, "./src/api/schema/schema.graphql"),
  "utf8"
);

const server = new ApolloServer({
  typeDefs: schema,
  resolvers: {
    Query: { ...queryResolvers },
    Me: { user },
    Mutation: { ...mutationResolvers }
  },
  introspection: true,
  context: async ({ req, res }) => {
    const authToken = req.cookies.jwt || req.headers.Authorization;

    let currentUserID: string | undefined;
    if (authToken) {
      // This is based on: https://github.com/flaviocopes/apollo-graphql-client-server-authentication-jwt/blob/master/server/index.js
      const { userID, username } = jwt.verify(authToken, JWT_SECRET) as {
        userID: string;
        username: string;
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
