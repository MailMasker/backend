import {
  TokenExpiredError,
  TokenNotFoundError,
  userIDForToken
} from "../../dal/userIDForToken";

import { AuthenticatedResolverContext } from "./ResolverContext";
import { AuthenticationError } from "apollo-server-express";
import { userForID } from "../../dal/userForID";

export async function ensureAuthenticated({
  dalContext,
  currentUserID,
  authToken
}: AuthenticatedResolverContext): Promise<{
  currentUser: {
    id: string;
    username: string;
    verifiedEmailIDs: string[];
    emailMaskIDs: string[];
  };
}> {
  if (!currentUserID || !authToken) {
    throw new AuthenticationError("authentication required");
  }

  // Necessary in order to ensure token still valid
  try {
    const uID = await userIDForToken(dalContext, authToken);
    if (uID !== currentUserID) {
      throw new AuthenticationError("Authentication required");
    }
  } catch (error) {
    if (error.name === TokenNotFoundError) {
      throw new AuthenticationError("Authentication required");
    } else if (error.name === TokenExpiredError) {
      throw new AuthenticationError(
        "Authentication expired. Please log in again."
      );
    }
    throw error;
  }

  const currentUser = await userForID(dalContext, currentUserID);

  return { currentUser };
}
