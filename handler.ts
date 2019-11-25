// @ts-ignore
import * as aws from "aws-sdk";

import { ApolloServer, gql } from "apollo-server-lambda";

import { Context } from "./src/dal/ctx";
import { QueryResolvers } from "./src/api/types.generated";
import { getUserFromToken } from "./src/dal/getUserFromToken";

aws.config.update({ region: "us-east-1" });

const ddb = new aws.DynamoDB({ apiVersion: "2012-08-10" });

const ctx: Context = {
  ddb
};

const resolvers: QueryResolvers = {
  hello: (root, args, context) => {
    return "hi!";
  }
};

const server = new ApolloServer({
  typeDefs: "./src/api/schema.graphql",
  resolvers,
  context: ({ req }) => {
    // get the user token from the headers
    const token = req.headers.authorization || "";

    // try to retrieve a user with the token
    const user = getUserFromToken(ddb, token);

    // add the user to the context
    return { user };
  }
});

module.exports.graphql = server.createHandler({
  // cors: {
  //   origin: true,
  //   credentials: true
  // }
});
