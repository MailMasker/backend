import * as fs from "fs";
import * as path from "path";

import {
  AuthenticatedResolverContext,
  ResolverContext,
} from "./src/api/lib/ResolverContext";
import { MutationResolvers, QueryResolvers } from "./src/api/types.generated";

import AWS from "aws-sdk";
// @ts-ignore
import { ApolloServer } from "apollo-server-express";
import { DALContext } from "./src/dal/DALContext";
import { authenticate } from "./src/api/mutations/authenticate";
import { authenticated } from "./src/api/lib/authenticated";
import { combineResolvers } from "graphql-resolvers";
import cookieParser from "cookie-parser";
import { createEmailMask } from "./src/api/mutations/createEmailMask";
import { createRoute } from "./src/api/mutations/createRoute";
import { createUser } from "./src/api/mutations/createUser";
import { createVerifiedEmail } from "./src/api/mutations/createVerifiedEmail";
import { emailMask } from "./src/api/objects/emailMask";
import { emailMaskChildren } from "./src/api/objects/emailMaskChildren";
import express from "express";
import jwt from "jsonwebtoken";
import { me } from "./src/api/queries/me";
import { redirectToVerifiedEmail } from "./src/api/objects/redirectToVerifiedEmail";
import { resendVerificationEmail } from "./src/api/mutations/resendVerificationEmail";
import { resetPassword } from "./src/api/mutations/resetPassword";
import { sendResetPasswordEmail } from "./src/api/mutations/sendResetPasswordEmail";
import serverless from "serverless-http";
import { unauthenticate } from "./src/api/mutations/unauthenticate";
import { updateRoute } from "./src/api/mutations/updateRoute";
import { user } from "./src/api/objects/user";
import { verifyEmailWithCode } from "./src/api/mutations/verifyEmailWithCode";

if (!process.env.WEB_APP_BASE_URL) {
  throw new Error("missing process.env.WEB_APP_BASE_URL");
}
if (!process.env.API_DOMAIN) {
  throw new Error("missing process.env.API_DOMAIN");
}

AWS.config.update({ region: "us-east-1" });

let ddbOptions = {};

// connect to local DB if running offline
if (process.env.S_STAGE === "local") {
  console.log("using local dynamodb");
  ddbOptions = {
    region: "localhost",
    endpoint: "http://localhost:8000",
    accessKeyId: "DEFAULT_ACCESS_KEY", // needed if you don't have aws credentials at all in env
    secretAccessKey: "DEFAULT_SECRET", // needed if you don't have aws credentials at all in env
  };
}

const dalContext: DALContext = {
  ddb: new AWS.DynamoDB(ddbOptions),
};

const queryResolvers: QueryResolvers = {
  ping: (parent, args, context, info) => {
    return "pong";
  },
  me: combineResolvers(authenticated, me),
};

const mutationResolvers: MutationResolvers = {
  authenticate,
  unauthenticate: combineResolvers(authenticated, unauthenticate),

  createUser,

  createVerifiedEmail: combineResolvers(authenticated, createVerifiedEmail),
  resendVerificationEmail: combineResolvers(
    authenticated,
    resendVerificationEmail
  ),

  createEmailMask: combineResolvers(authenticated, createEmailMask),

  createRoute: combineResolvers(authenticated, createRoute),
  updateRoute: combineResolvers(authenticated, updateRoute),

  sendResetPasswordEmail,
  resetPassword,

  verifyEmailWithCode,
};

const schema = fs.readFileSync(
  path.join(__dirname, "./src/api/schema/schema.graphql"),
  "utf8"
);

const apollo = new ApolloServer({
  typeDefs: schema,
  resolvers: {
    Query: { ...queryResolvers },
    Me: { user },
    Route: { redirectToVerifiedEmail, emailMask },
    EmailMask: { children: emailMaskChildren },
    Mutation: { ...mutationResolvers },
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
      setAuthCookie: ({ authToken, secondsUntilExpiry }) => {
        res.cookie("jwt", authToken, {
          httpOnly: true,
          maxAge: secondsUntilExpiry,
          // TODO: turn this on for prod eventually
          //secure: true, //on HTTPS
          domain: process.env.API_DOMAIN,

          // Allows cookies to be sent in cross-site requests (our API in on a different domain than our web app, at least for the time being)
          // TODO: update this when we get our own domain used on the API instead of the generic Lambda domain
          sameSite: "none",
        });
      },
      clearAuthCookie: () => {
        // NOTE: since we have HttpOnly cookies, we can't delete them
        // res.clearCookie("jwt");
      },
      authToken,
      ses: new AWS.SES({ apiVersion: "2010-12-01" }),
    };
    return context;
  },
});

const app = express();

app.use(cookieParser());

const allowedOrigins: string[] = [
  process.env.WEB_APP_BASE_URL,
  // Allow GraphQL Playground (dev only)
  ...(process.env.S_STAGE === "dev"
    ? [process.env.API_DOMAIN ?? ""]
    : ([] as string[])),
];

apollo.applyMiddleware({
  app,
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: "POST",
  },
});

const handler = serverless(app);

export { handler };
