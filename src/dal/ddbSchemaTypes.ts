export type Auth = {
  token: string;
  userID: string;
  expires: number;
};

export type User = {
  userID: string;
  username: string;
  email: string;
  created: number;
  modified: number;
};

export type Route = {
  to: string;
  userID: string;
  created: number;
  modified: number;
  expires: number;
};
