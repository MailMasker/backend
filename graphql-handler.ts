// @ts-ignore
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import {
  AuthenticatedResolverContext,
  ResolverContext,
} from "./src/api/lib/ResolverContext";
import { MutationResolvers, QueryResolvers } from "./src/api/types.generated";

import AWS from "aws-sdk";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import { DALContext } from "./src/dal/DALContext";
import { authenticate } from "./src/api/mutations/authenticate";
import { authenticated } from "./src/api/lib/authenticated";
import { combineResolvers } from "graphql-resolvers";
import cookieParser from "cookie-parser";
import { createCheckoutSession } from "./src/api/mutations/createCheckoutSession";
import { createEmailMask } from "./src/api/mutations/createEmailMask";
import { createRoute } from "./src/api/mutations/createRoute";
import { createUser } from "./src/api/mutations/createUser";
import { createVerifiedEmail } from "./src/api/mutations/createVerifiedEmail";
import { deleteUser } from "./src/api/mutations/deleteUser";
import { emailMask } from "./src/api/objects/emailMask";
import { emailMaskChildren } from "./src/api/objects/emailMaskChildren";
import { exportData } from "./src/api/queries/exportData";
import express from "express";
import jwt from "jsonwebtoken";
import { me } from "./src/api/queries/me";
import newDynamoDB from "./src/dal/lib/newDynamoDB";
import { plan } from "./src/api/objects/plan";
import { redirectToVerifiedEmail } from "./src/api/objects/redirectToVerifiedEmail";
import { resendVerificationEmail } from "./src/api/mutations/resendVerificationEmail";
import { resetPassword } from "./src/api/mutations/resetPassword";
// @ts-ignore – this file is loaded via the raw-loader in webpack.config.js
import schema from "./src/api/schema/schema.graphql";
import { sendResetPasswordEmail } from "./src/api/mutations/sendResetPasswordEmail";
import serverless from "serverless-http";
import { unauthenticate } from "./src/api/mutations/unauthenticate";
import { updateRoute } from "./src/api/mutations/updateRoute";
import { user } from "./src/api/objects/user";
import { verifyEmailWithCode } from "./src/api/mutations/verifyEmailWithCode";

Bugsnag.start({
  apiKey: "3e593a7f71377ef86cf65c7cda2570db",
  plugins: [BugsnagPluginExpress],
  releaseStage: process.env.BUGSNAG_RELEASE_STAGE,
  enabledReleaseStages: ["dev", "prod"],
  appType: "graphql",
  // @ts-ignore
  collectUserIp: false,
  hostname: process.env.API_DOMAIN,
});

if (!process.env.WEB_APP_BASE_URL) {
  throw new Error("missing process.env.WEB_APP_BASE_URL");
}
if (!process.env.API_DOMAIN) {
  throw new Error("missing process.env.API_DOMAIN");
}

const dalContext: DALContext = {
  ddb: newDynamoDB(),
};

const queryResolvers: QueryResolvers = {
  ping: (parent, args, context, info) => {
    return "pong";
  },
  me: combineResolvers(authenticated, me),
  exportData: combineResolvers(authenticated, exportData),
};

const mutationResolvers: MutationResolvers = {
  authenticate,
  unauthenticate: combineResolvers(authenticated, unauthenticate),

  createUser,
  deleteUser: combineResolvers(authenticated, deleteUser),

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

  createCheckoutSession: combineResolvers(authenticated, createCheckoutSession),
};

const apollo = new ApolloServer({
  typeDefs: schema,
  resolvers: {
    Query: { ...queryResolvers },
    Me: { user },
    Route: { redirectToVerifiedEmail, emailMask },
    EmailMask: { children: emailMaskChildren },
    Mutation: { ...mutationResolvers },
    User: { plan },
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
      try {
        // This is based on: https://github.com/flaviocopes/apollo-graphql-client-server-authentication-jwt/blob/master/server/index.js
        const { userID, username } = jwt.verify(
          authToken,
          process.env.JWT_SECRET as string
        ) as {
          userID: string;
          username: string;
        };
        currentUserID = userID;
        Bugsnag.setUser(userID);
      } catch (err) {
        console.log(err);
        res.clearCookie("jwt");
        throw new AuthenticationError("It looks like you need to log in again");
      }
    }

    const context: ResolverContext | AuthenticatedResolverContext = {
      currentUserID,
      dalContext,
      setAuthCookie: ({ authToken, secondsUntilExpiry }) => {
        res.cookie("jwt", authToken, {
          httpOnly: true,
          ...(secondsUntilExpiry ? { maxAge: secondsUntilExpiry } : {}),
          secure: true,
          domain: process.env.API_DOMAIN,
          sameSite: process.env.S_STAGE === "local" ? "none" : "strict",
        });
      },
      clearAuthCookie: () => {
        res.clearCookie("jwt");
      },
      authToken,
      ses: new AWS.SES({ apiVersion: "2010-12-01" }),
    };
    return context;
  },
});

const app = express();

// This must be the first piece of middleware in the stack.
// It can only capture errors in downstream middleware
const middleware = Bugsnag.getPlugin("express");
app.use(middleware.requestHandler);

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

// This handles any errors that Express catches – it seems like it should be last?
app.use(middleware.errorHandler);

const handler = serverless(app);

export { handler };
