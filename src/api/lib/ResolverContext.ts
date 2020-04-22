import { DALContext } from "../../dal/DALContext";

export interface ResolverContext {
  setAuthCookie: ({ authToken: string, expires: number }) => void;
  clearAuthCookie: () => void;
  dalContext: DALContext;
  ses: AWS.SES;
  authToken?: string;
}

export interface AuthenticatedResolverContext extends ResolverContext {
  currentUserID?: string;
}
