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
  username: Scalars['String'],
};

export type AuthenticatePayload = {
   __typename?: 'AuthenticatePayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
  authToken?: Maybe<Scalars['String']>,
};

export type CreateUserInput = {
  uuid: Scalars['String'],
  username: Scalars['String'],
  email: Scalars['String'],
};

export type CreateUserPayload = {
   __typename?: 'CreateUserPayload',
  success: Scalars['Boolean'],
  errorMessage?: Maybe<Scalars['String']>,
  userID?: Maybe<Scalars['String']>,
  authToken?: Maybe<Scalars['String']>,
};

export type Mutation = {
   __typename?: 'Mutation',
  authenticate: AuthenticatePayload,
  createUser: CreateUserPayload,
};


export type MutationAuthenticateArgs = {
  input: AuthenticateInput
};


export type MutationCreateUserArgs = {
  input: CreateUserInput
};

export type Query = {
   __typename?: 'Query',
  me: User,
  ping: Scalars['String'],
};

export type User = {
   __typename?: 'User',
  id: Scalars['String'],
  username: Scalars['String'],
  email: Scalars['String'],
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
  String: ResolverTypeWrapper<Scalars['String']>,
  Mutation: ResolverTypeWrapper<{}>,
  AuthenticateInput: AuthenticateInput,
  AuthenticatePayload: ResolverTypeWrapper<AuthenticatePayload>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  CreateUserInput: CreateUserInput,
  CreateUserPayload: ResolverTypeWrapper<CreateUserPayload>,
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {},
  User: User,
  String: Scalars['String'],
  Mutation: {},
  AuthenticateInput: AuthenticateInput,
  AuthenticatePayload: AuthenticatePayload,
  Boolean: Scalars['Boolean'],
  CreateUserInput: CreateUserInput,
  CreateUserPayload: CreateUserPayload,
}>;

export type AuthenticatePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthenticatePayload'] = ResolversParentTypes['AuthenticatePayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  authToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type CreateUserPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserPayload'] = ResolversParentTypes['CreateUserPayload']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  userID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  authToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  authenticate?: Resolver<ResolversTypes['AuthenticatePayload'], ParentType, ContextType, RequireFields<MutationAuthenticateArgs, 'input'>>,
  createUser?: Resolver<ResolversTypes['CreateUserPayload'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>,
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  AuthenticatePayload?: AuthenticatePayloadResolvers<ContextType>,
  CreateUserPayload?: CreateUserPayloadResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
