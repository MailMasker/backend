import { DALContext } from "../../dal/DALContext";

export interface ResolverContext {
  setAuthCookie: (token: string, expires: number) => void;
  dalContext: DALContext;
}
export interface AuthenticatedResolverContext extends ResolverContext {
  currentUserID?: string;
}
