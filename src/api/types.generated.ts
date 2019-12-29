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

export type CreateEmailMaskInput = {
  /** For x+y@1nt.email, "x+y@1nt.email" is the raw value (i.e. the entire thing) */
  raw: Scalars['String'],
};

export type CreateUserPayload = {
   __typename?: 'CreateUserPayload',
  userID: Scalars['ID'],
};

export type DeleteRouteInput = {
  id: Scalars['ID'],
};

export type DeleteRoutePayload = {
   __typename?: 'DeleteRoutePayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
};

/** 
 * type CreateRoutePayload {
 *   route: Route
 * }
 **/
export type DeleteUserPayload = {
   __typename?: 'DeleteUserPayload',
  authToken?: Maybe<Scalars['String']>,
};

/** 
 * Once created, an EmailMask is reserved forever so that it cannot be used by another user
 * An EmailMask cannot be deleted, but a Route.forwardTo can be deleted because it's important for users' data rights.
 **/
export type EmailMask = {
   __typename?: 'EmailMask',
  id: Scalars['ID'],
  /** OwnerUserID could belong to a deleted user */
  ownerUserID: Scalars['ID'],
  /** For x+y@1nt.email, "x" is the base */
  base: Scalars['String'],
  /** For x+y@1nt.email, "1nt.email" is the domain */
  domain: Scalars['String'],
};

export type Me = {
   __typename?: 'Me',
  user: User,
};

export type Mutation = {
   __typename?: 'Mutation',
  authenticate?: Maybe<Scalars['Boolean']>,
  /** Token is optional because the server will first attempt to read the token from a cookie, if present */
  unauthenticate?: Maybe<Scalars['Boolean']>,
  createUser: CreateUserPayload,
  /** returns the ID of the VerifiedEmail object */
  createVerifiedEmail: VerifiedEmail,
  createEmailMask: EmailMask,
};


export type MutationAuthenticateArgs = {
  username: Scalars['String'],
  password: Scalars['String']
};


export type MutationUnauthenticateArgs = {
  token?: Maybe<Scalars['String']>
};


export type MutationCreateUserArgs = {
  username: Scalars['String'],
  password: Scalars['String'],
  uuid: Scalars['String']
};


export type MutationCreateVerifiedEmailArgs = {
  email: Scalars['String']
};


export type MutationCreateEmailMaskArgs = {
  input: CreateEmailMaskInput
};

export type Query = {
   __typename?: 'Query',
  me: Me,
  ping: Scalars['String'],
};

export type UpdateRouteInput = {
  id: Scalars['ID'],
  forwardTo?: Maybe<Scalars['String']>,
  inboundToEmailMaskID: Scalars['ID'],
  expires?: Maybe<Scalars['Int']>,
};

export type UpdateRoutePayload = {
   __typename?: 'UpdateRoutePayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
};

/** A User can't be deleted, but its username can be cleared at a user's request */
export type User = {
   __typename?: 'User',
  id: Scalars['ID'],
  username?: Maybe<Scalars['String']>,
  /** 
 * routes: [Route!]!
   * emailMasks: [EmailMask!]!
 **/
  verifiedEmails: Array<VerifiedEmail>,
};

/** A VerifiedEmail is one for which ownership has been verified when `verified` is true */
export type VerifiedEmail = {
   __typename?: 'VerifiedEmail',
  id: Scalars['ID'],
  /** If deleted, then `email` will be null */
  email?: Maybe<Scalars['String']>,
  verified: Scalars['Boolean'],
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
  Me: ResolverTypeWrapper<Me>,
  User: ResolverTypeWrapper<User>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  String: ResolverTypeWrapper<Scalars['String']>,
  VerifiedEmail: ResolverTypeWrapper<VerifiedEmail>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  Mutation: ResolverTypeWrapper<{}>,
  CreateUserPayload: ResolverTypeWrapper<CreateUserPayload>,
  CreateEmailMaskInput: CreateEmailMaskInput,
  EmailMask: ResolverTypeWrapper<EmailMask>,
  DeleteUserPayload: ResolverTypeWrapper<DeleteUserPayload>,
  DeleteRouteInput: DeleteRouteInput,
  DeleteRoutePayload: ResolverTypeWrapper<DeleteRoutePayload>,
  UpdateRouteInput: UpdateRouteInput,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  UpdateRoutePayload: ResolverTypeWrapper<UpdateRoutePayload>,
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {},
  Me: Me,
  User: User,
  ID: Scalars['ID'],
  String: Scalars['String'],
  VerifiedEmail: VerifiedEmail,
  Boolean: Scalars['Boolean'],
  Mutation: {},
  CreateUserPayload: CreateUserPayload,
  CreateEmailMaskInput: CreateEmailMaskInput,
  EmailMask: EmailMask,
  DeleteUserPayload: DeleteUserPayload,
  DeleteRouteInput: DeleteRouteInput,
  DeleteRoutePayload: DeleteRoutePayload,
  UpdateRouteInput: UpdateRouteInput,
  Int: Scalars['Int'],
  UpdateRoutePayload: UpdateRoutePayload,
}>;

export type CreateUserPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserPayload'] = ResolversParentTypes['CreateUserPayload']> = ResolversObject<{
  userID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
}>;

export type DeleteRoutePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteRoutePayload'] = ResolversParentTypes['DeleteRoutePayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type DeleteUserPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteUserPayload'] = ResolversParentTypes['DeleteUserPayload']> = ResolversObject<{
  authToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type EmailMaskResolvers<ContextType = any, ParentType extends ResolversParentTypes['EmailMask'] = ResolversParentTypes['EmailMask']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  ownerUserID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  base?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type MeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Me'] = ResolversParentTypes['Me']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  authenticate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationAuthenticateArgs, 'username' | 'password'>>,
  unauthenticate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, MutationUnauthenticateArgs>,
  createUser?: Resolver<ResolversTypes['CreateUserPayload'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'username' | 'password' | 'uuid'>>,
  createVerifiedEmail?: Resolver<ResolversTypes['VerifiedEmail'], ParentType, ContextType, RequireFields<MutationCreateVerifiedEmailArgs, 'email'>>,
  createEmailMask?: Resolver<ResolversTypes['EmailMask'], ParentType, ContextType, RequireFields<MutationCreateEmailMaskArgs, 'input'>>,
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  me?: Resolver<ResolversTypes['Me'], ParentType, ContextType>,
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type UpdateRoutePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdateRoutePayload'] = ResolversParentTypes['UpdateRoutePayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  verifiedEmails?: Resolver<Array<ResolversTypes['VerifiedEmail']>, ParentType, ContextType>,
}>;

export type VerifiedEmailResolvers<ContextType = any, ParentType extends ResolversParentTypes['VerifiedEmail'] = ResolversParentTypes['VerifiedEmail']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  CreateUserPayload?: CreateUserPayloadResolvers<ContextType>,
  DeleteRoutePayload?: DeleteRoutePayloadResolvers<ContextType>,
  DeleteUserPayload?: DeleteUserPayloadResolvers<ContextType>,
  EmailMask?: EmailMaskResolvers<ContextType>,
  Me?: MeResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  UpdateRoutePayload?: UpdateRoutePayloadResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
  VerifiedEmail?: VerifiedEmailResolvers<ContextType>,
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
