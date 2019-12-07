import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type AuthenticateInput = {
  email: Scalars['String'],
  password: Scalars['String'],
};

export type AuthenticatePayload = {
   __typename?: 'AuthenticatePayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
  authToken?: Maybe<Scalars['String']>,
};

export type CreateRouteInput = {
  forwardTo: Scalars['String'],
  inboundToMaskedEmailID: Scalars['ID'],
  expires?: Maybe<Scalars['Int']>,
};

export type CreateRoutePayload = {
   __typename?: 'CreateRoutePayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
  route?: Maybe<Route>,
};

export type CreateUserInput = {
  uuid: Scalars['String'],
  email: Scalars['String'],
  password: Scalars['String'],
};

export type CreateUserPayload = {
   __typename?: 'CreateUserPayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
  userID?: Maybe<Scalars['ID']>,
  authToken?: Maybe<Scalars['String']>,
};

export type DeleteRouteInput = {
  id: Scalars['ID'],
};

export type DeleteRoutePayload = {
   __typename?: 'DeleteRoutePayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
};

export type DeleteUserPayload = {
   __typename?: 'DeleteUserPayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
  authToken?: Maybe<Scalars['String']>,
};

/** 
 * Once created, a MaskedEmail is reserved forever so that it cannot be used by another user
 * A MaskedEmail cannot be deleted, but a Route.forwardTo can be deleted because it's important for users' data rights.
 **/
export type MaskedEmail = {
   __typename?: 'MaskedEmail',
  id: Scalars['ID'],
  /** OwnerUserID could belong to a deleted user */
  ownerUserID: Scalars['ID'],
  /** For x+y@1nt.email, "x" is the base */
  base: Scalars['String'],
  /** For x+y@1nt.email, "1nt.email" is the domain */
  domain: Scalars['String'],
};

export type Mutation = {
   __typename?: 'Mutation',
  authenticate: AuthenticatePayload,
  unauthenticate: UnauthenticatePayload,
  createUser: CreateUserPayload,
};


export type MutationAuthenticateArgs = {
  input: AuthenticateInput
};


export type MutationUnauthenticateArgs = {
  input: UnauthenticateInput
};


export type MutationCreateUserArgs = {
  input: CreateUserInput
};

export type Query = {
   __typename?: 'Query',
  me: User,
  ping: Scalars['String'],
};

/** A Route can not be deleted, but its forwardTo property can be cleared at a user's request */
export type Route = {
   __typename?: 'Route',
  id: Scalars['ID'],
  /** If deleted is true, then forwardTo will contain a random string */
  forwardTo?: Maybe<Scalars['String']>,
  inboundTo: MaskedEmail,
  expires?: Maybe<Scalars['Int']>,
  disabled: Scalars['Boolean'],
  deleted: Scalars['Boolean'],
};

export type UnauthenticateInput = {
  token?: Maybe<Scalars['String']>,
};

export type UnauthenticatePayload = {
   __typename?: 'UnauthenticatePayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
};

export type UpdateRouteInput = {
  id: Scalars['ID'],
  forwardTo?: Maybe<Scalars['String']>,
  inboundToMaskedEmailID: Scalars['ID'],
  expires?: Maybe<Scalars['Int']>,
};

export type UpdateRoutePayload = {
   __typename?: 'UpdateRoutePayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
};

/** A User can't be deleted, but its email can be cleared at a user's request */
export type User = {
   __typename?: 'User',
  id: Scalars['ID'],
  email?: Maybe<Scalars['String']>,
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Query: ResolverTypeWrapper<{}>,
  User: ResolverTypeWrapper<User>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  String: ResolverTypeWrapper<Scalars['String']>,
  Mutation: ResolverTypeWrapper<{}>,
  AuthenticateInput: AuthenticateInput,
  AuthenticatePayload: ResolverTypeWrapper<AuthenticatePayload>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  UnauthenticateInput: UnauthenticateInput,
  UnauthenticatePayload: ResolverTypeWrapper<UnauthenticatePayload>,
  CreateUserInput: CreateUserInput,
  CreateUserPayload: ResolverTypeWrapper<CreateUserPayload>,
  CreateRouteInput: CreateRouteInput,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  Route: ResolverTypeWrapper<Route>,
  MaskedEmail: ResolverTypeWrapper<MaskedEmail>,
  CreateRoutePayload: ResolverTypeWrapper<CreateRoutePayload>,
  DeleteUserPayload: ResolverTypeWrapper<DeleteUserPayload>,
  DeleteRouteInput: DeleteRouteInput,
  DeleteRoutePayload: ResolverTypeWrapper<DeleteRoutePayload>,
  UpdateRouteInput: UpdateRouteInput,
  UpdateRoutePayload: ResolverTypeWrapper<UpdateRoutePayload>,
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {},
  User: User,
  ID: Scalars['ID'],
  String: Scalars['String'],
  Mutation: {},
  AuthenticateInput: AuthenticateInput,
  AuthenticatePayload: AuthenticatePayload,
  Boolean: Scalars['Boolean'],
  UnauthenticateInput: UnauthenticateInput,
  UnauthenticatePayload: UnauthenticatePayload,
  CreateUserInput: CreateUserInput,
  CreateUserPayload: CreateUserPayload,
  CreateRouteInput: CreateRouteInput,
  Int: Scalars['Int'],
  Route: Route,
  MaskedEmail: MaskedEmail,
  CreateRoutePayload: CreateRoutePayload,
  DeleteUserPayload: DeleteUserPayload,
  DeleteRouteInput: DeleteRouteInput,
  DeleteRoutePayload: DeleteRoutePayload,
  UpdateRouteInput: UpdateRouteInput,
  UpdateRoutePayload: UpdateRoutePayload,
}>;

export type AuthenticatePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthenticatePayload'] = ResolversParentTypes['AuthenticatePayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  authToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type CreateRoutePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateRoutePayload'] = ResolversParentTypes['CreateRoutePayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  route?: Resolver<Maybe<ResolversTypes['Route']>, ParentType, ContextType>,
}>;

export type CreateUserPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserPayload'] = ResolversParentTypes['CreateUserPayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  userID?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>,
  authToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type DeleteRoutePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteRoutePayload'] = ResolversParentTypes['DeleteRoutePayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type DeleteUserPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteUserPayload'] = ResolversParentTypes['DeleteUserPayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  authToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type MaskedEmailResolvers<ContextType = any, ParentType extends ResolversParentTypes['MaskedEmail'] = ResolversParentTypes['MaskedEmail']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  ownerUserID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  base?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  authenticate?: Resolver<ResolversTypes['AuthenticatePayload'], ParentType, ContextType, RequireFields<MutationAuthenticateArgs, 'input'>>,
  unauthenticate?: Resolver<ResolversTypes['UnauthenticatePayload'], ParentType, ContextType, RequireFields<MutationUnauthenticateArgs, 'input'>>,
  createUser?: Resolver<ResolversTypes['CreateUserPayload'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>,
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type RouteResolvers<ContextType = any, ParentType extends ResolversParentTypes['Route'] = ResolversParentTypes['Route']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  forwardTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  inboundTo?: Resolver<ResolversTypes['MaskedEmail'], ParentType, ContextType>,
  expires?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>,
  disabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
}>;

export type UnauthenticatePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['UnauthenticatePayload'] = ResolversParentTypes['UnauthenticatePayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type UpdateRoutePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdateRoutePayload'] = ResolversParentTypes['UpdateRoutePayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  AuthenticatePayload?: AuthenticatePayloadResolvers<ContextType>,
  CreateRoutePayload?: CreateRoutePayloadResolvers<ContextType>,
  CreateUserPayload?: CreateUserPayloadResolvers<ContextType>,
  DeleteRoutePayload?: DeleteRoutePayloadResolvers<ContextType>,
  DeleteUserPayload?: DeleteUserPayloadResolvers<ContextType>,
  MaskedEmail?: MaskedEmailResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  Route?: RouteResolvers<ContextType>,
  UnauthenticatePayload?: UnauthenticatePayloadResolvers<ContextType>,
  UpdateRoutePayload?: UpdateRoutePayloadResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
