import { DALContext } from "../../dal/DALContext";

export interface ResolverContext {
  setAuthCookie: (authToken: string) => void;
  clearAuthCookie: () => void;
  dalContext: DALContext;
  authToken?: string;
}

export interface AuthenticatedResolverContext extends ResolverContext {
  currentUserID?: string;
}
