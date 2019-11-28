// @ts-ignore
import * as aws from "aws-sdk";

import { ApolloServer, gql } from "apollo-server-lambda";
import { MutationResolvers, QueryResolvers } from "./src/api/types.generated";

import { Ctx } from "./src/dal/ctx";
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

const server = new ApolloServer({
  typeDefs: "./src/api/schema.graphql",
  resolvers: {
    ...queryResolvers,
    ...mutationResolvers
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

module.exports.graphql = server.createHandler({
  cors: {
    origin: true,
    credentials: true
  }
});
