import { ApolloError } from "apollo-server-core";
import { MutationUnauthenticateArgs } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import { UserInputError } from "apollo-server-express";
import { deleteAuthToken } from "../../dal/deleteAuthToken";

export const unauthenticate = async (
  parent,
  args: MutationUnauthenticateArgs,
  { clearAuthCookie, dalContext, authToken }: ResolverContext,
  info
) => {
  const token = (args && args.token ? args.token : undefined) || authToken;
  if (!token) {
    throw new UserInputError(
      "Unable to unauthenticate because auth token not provided"
    );
  }

  try {
    await deleteAuthToken(dalContext, token);

    clearAuthCookie();

    return true;
  } catch (error) {
    throw new ApolloError("Unknown error while unauthenticating");
  }
};
