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

export type CreateUserPayload = {
   __typename?: 'CreateUserPayload',
  userID: Scalars['ID'],
};

export type DeleteUserPayload = {
   __typename?: 'DeleteUserPayload',
  scrambledUsername: Scalars['String'],
  dataBeforeDeletion: Scalars['String'],
  dataAfterDeletion: Scalars['String'],
};

export type EmailMask = {
   __typename?: 'EmailMask',
  id: Scalars['ID'],
  alias: Scalars['String'],
  domain: Scalars['String'],
  parentEmailMaskID?: Maybe<Scalars['ID']>,
  children: Array<EmailMask>,
};

export type Me = {
   __typename?: 'Me',
  user: User,
};

export type Mutation = {
   __typename?: 'Mutation',
  authenticate?: Maybe<Scalars['Boolean']>,
  unauthenticate?: Maybe<Scalars['Boolean']>,
  createUser: CreateUserPayload,
  deleteUser: DeleteUserPayload,
  createVerifiedEmail: VerifiedEmail,
  resendVerificationEmail: VerifiedEmail,
  createEmailMask: EmailMask,
  createRoute: Route,
  updateRoute: Route,
  sendResetPasswordEmail?: Maybe<Scalars['Boolean']>,
  resetPassword?: Maybe<Scalars['Boolean']>,
  verifyEmailWithCode: VerifiedEmail,
  createCheckoutSession: Scalars['String'],
};


export type MutationAuthenticateArgs = {
  username: Scalars['String'],
  password: Scalars['String'],
  persistent: Scalars['Boolean']
};


export type MutationUnauthenticateArgs = {
  token?: Maybe<Scalars['String']>
};


export type MutationCreateUserArgs = {
  username: Scalars['String'],
  password: Scalars['String'],
  uuid: Scalars['String'],
  persistent: Scalars['Boolean']
};


export type MutationDeleteUserArgs = {
  password: Scalars['String']
};


export type MutationCreateVerifiedEmailArgs = {
  email: Scalars['String']
};


export type MutationResendVerificationEmailArgs = {
  email: Scalars['String']
};


export type MutationCreateEmailMaskArgs = {
  raw: Scalars['String'],
  parentEmailMaskID?: Maybe<Scalars['ID']>
};


export type MutationCreateRouteArgs = {
  redirectToVerifiedEmailID: Scalars['ID'],
  emailMaskID: Scalars['ID']
};


export type MutationUpdateRouteArgs = {
  id: Scalars['ID'],
  redirectToVerifiedEmailID?: Maybe<Scalars['ID']>,
  expiresISO?: Maybe<Scalars['String']>,
  clearExpiresISO?: Maybe<Scalars['Boolean']>
};


export type MutationSendResetPasswordEmailArgs = {
  usernameOrEmail: Scalars['String']
};


export type MutationResetPasswordArgs = {
  newPassword: Scalars['String'],
  code: Scalars['String'],
  userID: Scalars['String']
};


export type MutationVerifyEmailWithCodeArgs = {
  email: Scalars['String'],
  code: Scalars['String']
};


export type MutationCreateCheckoutSessionArgs = {
  priceID: Scalars['String']
};

export type Plan = {
  displayName: Scalars['String'],
};

export type Query = {
   __typename?: 'Query',
  me: Me,
  ping: Scalars['String'],
  exportData: Scalars['String'],
};

export type Route = {
   __typename?: 'Route',
  id: Scalars['ID'],
  redirectToVerifiedEmail: VerifiedEmail,
  emailMask: EmailMask,
  expiresISO?: Maybe<Scalars['String']>,
};

export type SubscriptionPlan = Plan & {
   __typename?: 'SubscriptionPlan',
  displayName: Scalars['String'],
};

export type User = {
   __typename?: 'User',
  id: Scalars['ID'],
  username?: Maybe<Scalars['String']>,
  routes: Array<Route>,
  emailMasks: Array<EmailMask>,
  verifiedEmails: Array<VerifiedEmail>,
  plan?: Maybe<Plan>,
};

export type VerifiedEmail = {
   __typename?: 'VerifiedEmail',
  id: Scalars['ID'],
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
  Route: ResolverTypeWrapper<Route>,
  VerifiedEmail: ResolverTypeWrapper<VerifiedEmail>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  EmailMask: ResolverTypeWrapper<EmailMask>,
  Plan: ResolverTypeWrapper<Plan>,
  Mutation: ResolverTypeWrapper<{}>,
  CreateUserPayload: ResolverTypeWrapper<CreateUserPayload>,
  DeleteUserPayload: ResolverTypeWrapper<DeleteUserPayload>,
  SubscriptionPlan: ResolverTypeWrapper<SubscriptionPlan>,
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {},
  Me: Me,
  User: User,
  ID: Scalars['ID'],
  String: Scalars['String'],
  Route: Route,
  VerifiedEmail: VerifiedEmail,
  Boolean: Scalars['Boolean'],
  EmailMask: EmailMask,
  Plan: Plan,
  Mutation: {},
  CreateUserPayload: CreateUserPayload,
  DeleteUserPayload: DeleteUserPayload,
  SubscriptionPlan: SubscriptionPlan,
}>;

export type CreateUserPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserPayload'] = ResolversParentTypes['CreateUserPayload']> = ResolversObject<{
  userID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
}>;

export type DeleteUserPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteUserPayload'] = ResolversParentTypes['DeleteUserPayload']> = ResolversObject<{
  scrambledUsername?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  dataBeforeDeletion?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  dataAfterDeletion?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type EmailMaskResolvers<ContextType = any, ParentType extends ResolversParentTypes['EmailMask'] = ResolversParentTypes['EmailMask']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  alias?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  parentEmailMaskID?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>,
  children?: Resolver<Array<ResolversTypes['EmailMask']>, ParentType, ContextType>,
}>;

export type MeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Me'] = ResolversParentTypes['Me']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  authenticate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationAuthenticateArgs, 'username' | 'password' | 'persistent'>>,
  unauthenticate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, MutationUnauthenticateArgs>,
  createUser?: Resolver<ResolversTypes['CreateUserPayload'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'username' | 'password' | 'uuid' | 'persistent'>>,
  deleteUser?: Resolver<ResolversTypes['DeleteUserPayload'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'password'>>,
  createVerifiedEmail?: Resolver<ResolversTypes['VerifiedEmail'], ParentType, ContextType, RequireFields<MutationCreateVerifiedEmailArgs, 'email'>>,
  resendVerificationEmail?: Resolver<ResolversTypes['VerifiedEmail'], ParentType, ContextType, RequireFields<MutationResendVerificationEmailArgs, 'email'>>,
  createEmailMask?: Resolver<ResolversTypes['EmailMask'], ParentType, ContextType, RequireFields<MutationCreateEmailMaskArgs, 'raw'>>,
  createRoute?: Resolver<ResolversTypes['Route'], ParentType, ContextType, RequireFields<MutationCreateRouteArgs, 'redirectToVerifiedEmailID' | 'emailMaskID'>>,
  updateRoute?: Resolver<ResolversTypes['Route'], ParentType, ContextType, RequireFields<MutationUpdateRouteArgs, 'id'>>,
  sendResetPasswordEmail?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationSendResetPasswordEmailArgs, 'usernameOrEmail'>>,
  resetPassword?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'newPassword' | 'code' | 'userID'>>,
  verifyEmailWithCode?: Resolver<ResolversTypes['VerifiedEmail'], ParentType, ContextType, RequireFields<MutationVerifyEmailWithCodeArgs, 'email' | 'code'>>,
  createCheckoutSession?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationCreateCheckoutSessionArgs, 'priceID'>>,
}>;

export type PlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['Plan'] = ResolversParentTypes['Plan']> = ResolversObject<{
  __resolveType: TypeResolveFn<'SubscriptionPlan', ParentType, ContextType>,
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  me?: Resolver<ResolversTypes['Me'], ParentType, ContextType>,
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  exportData?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type RouteResolvers<ContextType = any, ParentType extends ResolversParentTypes['Route'] = ResolversParentTypes['Route']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  redirectToVerifiedEmail?: Resolver<ResolversTypes['VerifiedEmail'], ParentType, ContextType>,
  emailMask?: Resolver<ResolversTypes['EmailMask'], ParentType, ContextType>,
  expiresISO?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type SubscriptionPlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubscriptionPlan'] = ResolversParentTypes['SubscriptionPlan']> = ResolversObject<{
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  routes?: Resolver<Array<ResolversTypes['Route']>, ParentType, ContextType>,
  emailMasks?: Resolver<Array<ResolversTypes['EmailMask']>, ParentType, ContextType>,
  verifiedEmails?: Resolver<Array<ResolversTypes['VerifiedEmail']>, ParentType, ContextType>,
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType>,
}>;

export type VerifiedEmailResolvers<ContextType = any, ParentType extends ResolversParentTypes['VerifiedEmail'] = ResolversParentTypes['VerifiedEmail']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  CreateUserPayload?: CreateUserPayloadResolvers<ContextType>,
  DeleteUserPayload?: DeleteUserPayloadResolvers<ContextType>,
  EmailMask?: EmailMaskResolvers<ContextType>,
  Me?: MeResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Plan?: PlanResolvers,
  Query?: QueryResolvers<ContextType>,
  Route?: RouteResolvers<ContextType>,
  SubscriptionPlan?: SubscriptionPlanResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
  VerifiedEmail?: VerifiedEmailResolvers<ContextType>,
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
