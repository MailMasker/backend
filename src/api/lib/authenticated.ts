import {
  AuthenticatedResolverContext,
  ResolverContext
} from "./ResolverContext";

import { AuthenticationError } from "apollo-server-express";

export function authenticated<T>(
  next: (root: any, args: any, context: any, info: any) => T
) {
  return (root: any, args: any, context: ResolverContext, info: any) => {
    if (!(context as any).currentUserID) {
      throw new AuthenticationError("authentication required");
    }
    return next(root, args, context as AuthenticatedResolverContext, info);
  };
}
