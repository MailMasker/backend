require("dotenv").config();

import * as aws from "aws-sdk";
import * as fs from "fs";
import * as path from "path";

// @ts-ignore
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import {
  AuthenticatedResolverContext,
  ResolverContext
} from "./src/api/lib/ResolverContext";
import { MutationResolvers, QueryResolvers } from "./src/api/types.generated";

import { DALContext } from "./src/dal/DALContext";
import { authenticate } from "./src/api/mutations/authenticate";
import { authenticated } from "./src/api/lib/authenticated";
import { combineResolvers } from "graphql-resolvers";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createEmailMask } from "./src/api/mutations/createEmailMask";
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
import { verifyEmailWithCode } from "./src/api/mutations/verifyEmailWithCode";

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

  createVerifiedEmail: combineResolvers(authenticated, createVerifiedEmail),

  createEmailMask: combineResolvers(authenticated, createEmailMask),

  createRoute: combineResolvers(authenticated, createRoute),

  verifyEmailWithCode: combineResolvers(authenticated, verifyEmailWithCode)
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

    if (!process.env.JWT_SECRET) {
      throw new Error("process.env.JWT_SECRET empty");
    }

    // We get the "currentUserID" from the token, but we don't check whether the auth token is valid here – that happens separately, and only for authenticated queries and mutations

    let currentUserID: string | undefined;
    if (authToken) {
      // This is based on: https://github.com/flaviocopes/apollo-graphql-client-server-authentication-jwt/blob/master/server/index.js
      const { userID, username } = jwt.verify(
        authToken,
        process.env.JWT_SECRET as string
      ) as {
        userID: string;
        username: string;
      };
      currentUserID = userID;
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

// TODO: exclude localhost when promoting to production
// let whitelist = ["http://localhost:3000", "http://localhost:3001"];
// app.use(
//   cors({
//     origin: (origin: any, callback: any) => {
//       if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true
//   })
// );

app.use(cors());

// app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

server.applyMiddleware({ app });

app.get("/playground", graphiql({ endpoint: "/graphql" }));

const handler = serverless(app);

export { handler };
