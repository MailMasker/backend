import { ApolloError } from "apollo-server-core";
import { MutationUnauthenticateArgs } from "../types.generated";
import { ResolverContext } from "../lib/ResolverContext";
import { deleteAuthToken } from "../../dal/deleteAuthToken";

export const unauthenticate = async (
  parent,
  args: MutationUnauthenticateArgs,
  { clearAuthCookie, dalContext, authToken }: ResolverContext,
  info
) => {
  const token =
    (args.input && args.input.token ? args.input.token : undefined) ||
    authToken;
  if (!token) {
    return {
      success: false,
      errorMessage: "Unable to unauthenticate because auth token not provided"
    };
  }

  try {
    await deleteAuthToken(dalContext, token);

    clearAuthCookie();

    return { success: true };
  } catch (error) {
    throw new ApolloError("Unknown error while unauthenticating");
  }
};
