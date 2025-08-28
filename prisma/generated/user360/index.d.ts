
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model UserProfile
 * 
 */
export type UserProfile = $Result.DefaultSelection<Prisma.$UserProfilePayload>
/**
 * Model LinkedAccount
 * 
 */
export type LinkedAccount = $Result.DefaultSelection<Prisma.$LinkedAccountPayload>
/**
 * Model AssetAssignment
 * 
 */
export type AssetAssignment = $Result.DefaultSelection<Prisma.$AssetAssignmentPayload>
/**
 * Model UserTicket
 * 
 */
export type UserTicket = $Result.DefaultSelection<Prisma.$UserTicketPayload>
/**
 * Model ActivityLog
 * 
 */
export type ActivityLog = $Result.DefaultSelection<Prisma.$ActivityLogPayload>
/**
 * Model SecurityEvent
 * 
 */
export type SecurityEvent = $Result.DefaultSelection<Prisma.$SecurityEventPayload>
/**
 * Model TrainingRecord
 * 
 */
export type TrainingRecord = $Result.DefaultSelection<Prisma.$TrainingRecordPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
  DEPARTED: 'DEPARTED'
};

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]


export const RiskLevel: {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel]


export const AssetType: {
  DEVICE: 'DEVICE',
  SOFTWARE_LICENSE: 'SOFTWARE_LICENSE',
  CERTIFICATE: 'CERTIFICATE',
  ACCESS_CARD: 'ACCESS_CARD',
  MOBILE_DEVICE: 'MOBILE_DEVICE',
  LAPTOP: 'LAPTOP',
  DESKTOP: 'DESKTOP',
  SERVER: 'SERVER',
  OTHER: 'OTHER'
};

export type AssetType = (typeof AssetType)[keyof typeof AssetType]


export const AssetStatus: {
  ASSIGNED: 'ASSIGNED',
  UNASSIGNED: 'UNASSIGNED',
  PENDING_RETURN: 'PENDING_RETURN',
  RETURNED: 'RETURNED',
  LOST: 'LOST',
  STOLEN: 'STOLEN',
  DAMAGED: 'DAMAGED'
};

export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus]


export const ComplianceStatus: {
  COMPLIANT: 'COMPLIANT',
  NON_COMPLIANT: 'NON_COMPLIANT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  EXEMPT: 'EXEMPT',
  UNKNOWN: 'UNKNOWN'
};

export type ComplianceStatus = (typeof ComplianceStatus)[keyof typeof ComplianceStatus]


export const TicketRelationship: {
  REQUESTER: 'REQUESTER',
  ASSIGNEE: 'ASSIGNEE',
  WATCHER: 'WATCHER',
  APPROVER: 'APPROVER',
  RESOLVER: 'RESOLVER'
};

export type TicketRelationship = (typeof TicketRelationship)[keyof typeof TicketRelationship]


export const ActivityOutcome: {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  BLOCKED: 'BLOCKED',
  WARNING: 'WARNING'
};

export type ActivityOutcome = (typeof ActivityOutcome)[keyof typeof ActivityOutcome]


export const EventSeverity: {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export type EventSeverity = (typeof EventSeverity)[keyof typeof EventSeverity]


export const EventStatus: {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  FALSE_POSITIVE: 'FALSE_POSITIVE'
};

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]


export const TrainingStatus: {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  WAIVED: 'WAIVED'
};

export type TrainingStatus = (typeof TrainingStatus)[keyof typeof TrainingStatus]

}

export type UserStatus = $Enums.UserStatus

export const UserStatus: typeof $Enums.UserStatus

export type RiskLevel = $Enums.RiskLevel

export const RiskLevel: typeof $Enums.RiskLevel

export type AssetType = $Enums.AssetType

export const AssetType: typeof $Enums.AssetType

export type AssetStatus = $Enums.AssetStatus

export const AssetStatus: typeof $Enums.AssetStatus

export type ComplianceStatus = $Enums.ComplianceStatus

export const ComplianceStatus: typeof $Enums.ComplianceStatus

export type TicketRelationship = $Enums.TicketRelationship

export const TicketRelationship: typeof $Enums.TicketRelationship

export type ActivityOutcome = $Enums.ActivityOutcome

export const ActivityOutcome: typeof $Enums.ActivityOutcome

export type EventSeverity = $Enums.EventSeverity

export const EventSeverity: typeof $Enums.EventSeverity

export type EventStatus = $Enums.EventStatus

export const EventStatus: typeof $Enums.EventStatus

export type TrainingStatus = $Enums.TrainingStatus

export const TrainingStatus: typeof $Enums.TrainingStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more UserProfiles
 * const userProfiles = await prisma.userProfile.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more UserProfiles
   * const userProfiles = await prisma.userProfile.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.userProfile`: Exposes CRUD operations for the **UserProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserProfiles
    * const userProfiles = await prisma.userProfile.findMany()
    * ```
    */
  get userProfile(): Prisma.UserProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.linkedAccount`: Exposes CRUD operations for the **LinkedAccount** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LinkedAccounts
    * const linkedAccounts = await prisma.linkedAccount.findMany()
    * ```
    */
  get linkedAccount(): Prisma.LinkedAccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.assetAssignment`: Exposes CRUD operations for the **AssetAssignment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AssetAssignments
    * const assetAssignments = await prisma.assetAssignment.findMany()
    * ```
    */
  get assetAssignment(): Prisma.AssetAssignmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userTicket`: Exposes CRUD operations for the **UserTicket** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserTickets
    * const userTickets = await prisma.userTicket.findMany()
    * ```
    */
  get userTicket(): Prisma.UserTicketDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.activityLog`: Exposes CRUD operations for the **ActivityLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ActivityLogs
    * const activityLogs = await prisma.activityLog.findMany()
    * ```
    */
  get activityLog(): Prisma.ActivityLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.securityEvent`: Exposes CRUD operations for the **SecurityEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SecurityEvents
    * const securityEvents = await prisma.securityEvent.findMany()
    * ```
    */
  get securityEvent(): Prisma.SecurityEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.trainingRecord`: Exposes CRUD operations for the **TrainingRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrainingRecords
    * const trainingRecords = await prisma.trainingRecord.findMany()
    * ```
    */
  get trainingRecord(): Prisma.TrainingRecordDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.12.0
   * Query Engine version: 8047c96bbd92db98a2abc7c9323ce77c02c89dbc
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    UserProfile: 'UserProfile',
    LinkedAccount: 'LinkedAccount',
    AssetAssignment: 'AssetAssignment',
    UserTicket: 'UserTicket',
    ActivityLog: 'ActivityLog',
    SecurityEvent: 'SecurityEvent',
    TrainingRecord: 'TrainingRecord'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    user360_db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "userProfile" | "linkedAccount" | "assetAssignment" | "userTicket" | "activityLog" | "securityEvent" | "trainingRecord"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      UserProfile: {
        payload: Prisma.$UserProfilePayload<ExtArgs>
        fields: Prisma.UserProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findFirst: {
            args: Prisma.UserProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findMany: {
            args: Prisma.UserProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          create: {
            args: Prisma.UserProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          createMany: {
            args: Prisma.UserProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          delete: {
            args: Prisma.UserProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          update: {
            args: Prisma.UserProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          deleteMany: {
            args: Prisma.UserProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          upsert: {
            args: Prisma.UserProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          aggregate: {
            args: Prisma.UserProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserProfile>
          }
          groupBy: {
            args: Prisma.UserProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserProfileCountArgs<ExtArgs>
            result: $Utils.Optional<UserProfileCountAggregateOutputType> | number
          }
        }
      }
      LinkedAccount: {
        payload: Prisma.$LinkedAccountPayload<ExtArgs>
        fields: Prisma.LinkedAccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LinkedAccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LinkedAccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload>
          }
          findFirst: {
            args: Prisma.LinkedAccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LinkedAccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload>
          }
          findMany: {
            args: Prisma.LinkedAccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload>[]
          }
          create: {
            args: Prisma.LinkedAccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload>
          }
          createMany: {
            args: Prisma.LinkedAccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LinkedAccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload>[]
          }
          delete: {
            args: Prisma.LinkedAccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload>
          }
          update: {
            args: Prisma.LinkedAccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload>
          }
          deleteMany: {
            args: Prisma.LinkedAccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LinkedAccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LinkedAccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload>[]
          }
          upsert: {
            args: Prisma.LinkedAccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LinkedAccountPayload>
          }
          aggregate: {
            args: Prisma.LinkedAccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLinkedAccount>
          }
          groupBy: {
            args: Prisma.LinkedAccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<LinkedAccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.LinkedAccountCountArgs<ExtArgs>
            result: $Utils.Optional<LinkedAccountCountAggregateOutputType> | number
          }
        }
      }
      AssetAssignment: {
        payload: Prisma.$AssetAssignmentPayload<ExtArgs>
        fields: Prisma.AssetAssignmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetAssignmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetAssignmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload>
          }
          findFirst: {
            args: Prisma.AssetAssignmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetAssignmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload>
          }
          findMany: {
            args: Prisma.AssetAssignmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload>[]
          }
          create: {
            args: Prisma.AssetAssignmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload>
          }
          createMany: {
            args: Prisma.AssetAssignmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetAssignmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload>[]
          }
          delete: {
            args: Prisma.AssetAssignmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload>
          }
          update: {
            args: Prisma.AssetAssignmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload>
          }
          deleteMany: {
            args: Prisma.AssetAssignmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetAssignmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AssetAssignmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload>[]
          }
          upsert: {
            args: Prisma.AssetAssignmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetAssignmentPayload>
          }
          aggregate: {
            args: Prisma.AssetAssignmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssetAssignment>
          }
          groupBy: {
            args: Prisma.AssetAssignmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetAssignmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetAssignmentCountArgs<ExtArgs>
            result: $Utils.Optional<AssetAssignmentCountAggregateOutputType> | number
          }
        }
      }
      UserTicket: {
        payload: Prisma.$UserTicketPayload<ExtArgs>
        fields: Prisma.UserTicketFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserTicketFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserTicketFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload>
          }
          findFirst: {
            args: Prisma.UserTicketFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserTicketFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload>
          }
          findMany: {
            args: Prisma.UserTicketFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload>[]
          }
          create: {
            args: Prisma.UserTicketCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload>
          }
          createMany: {
            args: Prisma.UserTicketCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserTicketCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload>[]
          }
          delete: {
            args: Prisma.UserTicketDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload>
          }
          update: {
            args: Prisma.UserTicketUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload>
          }
          deleteMany: {
            args: Prisma.UserTicketDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserTicketUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserTicketUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload>[]
          }
          upsert: {
            args: Prisma.UserTicketUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTicketPayload>
          }
          aggregate: {
            args: Prisma.UserTicketAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserTicket>
          }
          groupBy: {
            args: Prisma.UserTicketGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserTicketGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserTicketCountArgs<ExtArgs>
            result: $Utils.Optional<UserTicketCountAggregateOutputType> | number
          }
        }
      }
      ActivityLog: {
        payload: Prisma.$ActivityLogPayload<ExtArgs>
        fields: Prisma.ActivityLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ActivityLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ActivityLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          findFirst: {
            args: Prisma.ActivityLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ActivityLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          findMany: {
            args: Prisma.ActivityLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>[]
          }
          create: {
            args: Prisma.ActivityLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          createMany: {
            args: Prisma.ActivityLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ActivityLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>[]
          }
          delete: {
            args: Prisma.ActivityLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          update: {
            args: Prisma.ActivityLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          deleteMany: {
            args: Prisma.ActivityLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ActivityLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ActivityLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>[]
          }
          upsert: {
            args: Prisma.ActivityLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          aggregate: {
            args: Prisma.ActivityLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateActivityLog>
          }
          groupBy: {
            args: Prisma.ActivityLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ActivityLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ActivityLogCountArgs<ExtArgs>
            result: $Utils.Optional<ActivityLogCountAggregateOutputType> | number
          }
        }
      }
      SecurityEvent: {
        payload: Prisma.$SecurityEventPayload<ExtArgs>
        fields: Prisma.SecurityEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SecurityEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SecurityEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload>
          }
          findFirst: {
            args: Prisma.SecurityEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SecurityEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload>
          }
          findMany: {
            args: Prisma.SecurityEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload>[]
          }
          create: {
            args: Prisma.SecurityEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload>
          }
          createMany: {
            args: Prisma.SecurityEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SecurityEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload>[]
          }
          delete: {
            args: Prisma.SecurityEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload>
          }
          update: {
            args: Prisma.SecurityEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload>
          }
          deleteMany: {
            args: Prisma.SecurityEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SecurityEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SecurityEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload>[]
          }
          upsert: {
            args: Prisma.SecurityEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SecurityEventPayload>
          }
          aggregate: {
            args: Prisma.SecurityEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSecurityEvent>
          }
          groupBy: {
            args: Prisma.SecurityEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<SecurityEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.SecurityEventCountArgs<ExtArgs>
            result: $Utils.Optional<SecurityEventCountAggregateOutputType> | number
          }
        }
      }
      TrainingRecord: {
        payload: Prisma.$TrainingRecordPayload<ExtArgs>
        fields: Prisma.TrainingRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrainingRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrainingRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          findFirst: {
            args: Prisma.TrainingRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrainingRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          findMany: {
            args: Prisma.TrainingRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>[]
          }
          create: {
            args: Prisma.TrainingRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          createMany: {
            args: Prisma.TrainingRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrainingRecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>[]
          }
          delete: {
            args: Prisma.TrainingRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          update: {
            args: Prisma.TrainingRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          deleteMany: {
            args: Prisma.TrainingRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrainingRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TrainingRecordUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>[]
          }
          upsert: {
            args: Prisma.TrainingRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingRecordPayload>
          }
          aggregate: {
            args: Prisma.TrainingRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrainingRecord>
          }
          groupBy: {
            args: Prisma.TrainingRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrainingRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrainingRecordCountArgs<ExtArgs>
            result: $Utils.Optional<TrainingRecordCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    userProfile?: UserProfileOmit
    linkedAccount?: LinkedAccountOmit
    assetAssignment?: AssetAssignmentOmit
    userTicket?: UserTicketOmit
    activityLog?: ActivityLogOmit
    securityEvent?: SecurityEventOmit
    trainingRecord?: TrainingRecordOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserProfileCountOutputType
   */

  export type UserProfileCountOutputType = {
    directReports: number
    linkedAccounts: number
    assets: number
    tickets: number
    activityLogs: number
    securityEvents: number
    trainingRecords: number
  }

  export type UserProfileCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    directReports?: boolean | UserProfileCountOutputTypeCountDirectReportsArgs
    linkedAccounts?: boolean | UserProfileCountOutputTypeCountLinkedAccountsArgs
    assets?: boolean | UserProfileCountOutputTypeCountAssetsArgs
    tickets?: boolean | UserProfileCountOutputTypeCountTicketsArgs
    activityLogs?: boolean | UserProfileCountOutputTypeCountActivityLogsArgs
    securityEvents?: boolean | UserProfileCountOutputTypeCountSecurityEventsArgs
    trainingRecords?: boolean | UserProfileCountOutputTypeCountTrainingRecordsArgs
  }

  // Custom InputTypes
  /**
   * UserProfileCountOutputType without action
   */
  export type UserProfileCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfileCountOutputType
     */
    select?: UserProfileCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserProfileCountOutputType without action
   */
  export type UserProfileCountOutputTypeCountDirectReportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProfileWhereInput
  }

  /**
   * UserProfileCountOutputType without action
   */
  export type UserProfileCountOutputTypeCountLinkedAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LinkedAccountWhereInput
  }

  /**
   * UserProfileCountOutputType without action
   */
  export type UserProfileCountOutputTypeCountAssetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetAssignmentWhereInput
  }

  /**
   * UserProfileCountOutputType without action
   */
  export type UserProfileCountOutputTypeCountTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTicketWhereInput
  }

  /**
   * UserProfileCountOutputType without action
   */
  export type UserProfileCountOutputTypeCountActivityLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityLogWhereInput
  }

  /**
   * UserProfileCountOutputType without action
   */
  export type UserProfileCountOutputTypeCountSecurityEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SecurityEventWhereInput
  }

  /**
   * UserProfileCountOutputType without action
   */
  export type UserProfileCountOutputTypeCountTrainingRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingRecordWhereInput
  }


  /**
   * Models
   */

  /**
   * Model UserProfile
   */

  export type AggregateUserProfile = {
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  export type UserProfileAvgAggregateOutputType = {
    securityScore: number | null
    dataVersion: number | null
  }

  export type UserProfileSumAggregateOutputType = {
    securityScore: number | null
    dataVersion: number | null
  }

  export type UserProfileMinAggregateOutputType = {
    id: string | null
    helixUid: string | null
    email: string | null
    emailCanonical: string | null
    employeeId: string | null
    firstName: string | null
    lastName: string | null
    displayName: string | null
    preferredName: string | null
    profilePicture: string | null
    phoneNumber: string | null
    mobileNumber: string | null
    department: string | null
    jobTitle: string | null
    managerId: string | null
    location: string | null
    timezone: string | null
    startDate: Date | null
    endDate: Date | null
    status: $Enums.UserStatus | null
    lastLoginAt: Date | null
    lastActiveAt: Date | null
    isServiceAccount: boolean | null
    securityScore: number | null
    riskLevel: $Enums.RiskLevel | null
    mfaEnabled: boolean | null
    tenantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
    lastUpdatedBy: string | null
    dataVersion: number | null
  }

  export type UserProfileMaxAggregateOutputType = {
    id: string | null
    helixUid: string | null
    email: string | null
    emailCanonical: string | null
    employeeId: string | null
    firstName: string | null
    lastName: string | null
    displayName: string | null
    preferredName: string | null
    profilePicture: string | null
    phoneNumber: string | null
    mobileNumber: string | null
    department: string | null
    jobTitle: string | null
    managerId: string | null
    location: string | null
    timezone: string | null
    startDate: Date | null
    endDate: Date | null
    status: $Enums.UserStatus | null
    lastLoginAt: Date | null
    lastActiveAt: Date | null
    isServiceAccount: boolean | null
    securityScore: number | null
    riskLevel: $Enums.RiskLevel | null
    mfaEnabled: boolean | null
    tenantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
    lastUpdatedBy: string | null
    dataVersion: number | null
  }

  export type UserProfileCountAggregateOutputType = {
    id: number
    helixUid: number
    email: number
    emailCanonical: number
    employeeId: number
    firstName: number
    lastName: number
    displayName: number
    preferredName: number
    profilePicture: number
    phoneNumber: number
    mobileNumber: number
    department: number
    jobTitle: number
    managerId: number
    location: number
    timezone: number
    startDate: number
    endDate: number
    status: number
    lastLoginAt: number
    lastActiveAt: number
    isServiceAccount: number
    securityScore: number
    riskLevel: number
    mfaEnabled: number
    tenantId: number
    roles: number
    permissions: number
    createdAt: number
    updatedAt: number
    createdBy: number
    lastUpdatedBy: number
    dataVersion: number
    _all: number
  }


  export type UserProfileAvgAggregateInputType = {
    securityScore?: true
    dataVersion?: true
  }

  export type UserProfileSumAggregateInputType = {
    securityScore?: true
    dataVersion?: true
  }

  export type UserProfileMinAggregateInputType = {
    id?: true
    helixUid?: true
    email?: true
    emailCanonical?: true
    employeeId?: true
    firstName?: true
    lastName?: true
    displayName?: true
    preferredName?: true
    profilePicture?: true
    phoneNumber?: true
    mobileNumber?: true
    department?: true
    jobTitle?: true
    managerId?: true
    location?: true
    timezone?: true
    startDate?: true
    endDate?: true
    status?: true
    lastLoginAt?: true
    lastActiveAt?: true
    isServiceAccount?: true
    securityScore?: true
    riskLevel?: true
    mfaEnabled?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    lastUpdatedBy?: true
    dataVersion?: true
  }

  export type UserProfileMaxAggregateInputType = {
    id?: true
    helixUid?: true
    email?: true
    emailCanonical?: true
    employeeId?: true
    firstName?: true
    lastName?: true
    displayName?: true
    preferredName?: true
    profilePicture?: true
    phoneNumber?: true
    mobileNumber?: true
    department?: true
    jobTitle?: true
    managerId?: true
    location?: true
    timezone?: true
    startDate?: true
    endDate?: true
    status?: true
    lastLoginAt?: true
    lastActiveAt?: true
    isServiceAccount?: true
    securityScore?: true
    riskLevel?: true
    mfaEnabled?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    lastUpdatedBy?: true
    dataVersion?: true
  }

  export type UserProfileCountAggregateInputType = {
    id?: true
    helixUid?: true
    email?: true
    emailCanonical?: true
    employeeId?: true
    firstName?: true
    lastName?: true
    displayName?: true
    preferredName?: true
    profilePicture?: true
    phoneNumber?: true
    mobileNumber?: true
    department?: true
    jobTitle?: true
    managerId?: true
    location?: true
    timezone?: true
    startDate?: true
    endDate?: true
    status?: true
    lastLoginAt?: true
    lastActiveAt?: true
    isServiceAccount?: true
    securityScore?: true
    riskLevel?: true
    mfaEnabled?: true
    tenantId?: true
    roles?: true
    permissions?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    lastUpdatedBy?: true
    dataVersion?: true
    _all?: true
  }

  export type UserProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfile to aggregate.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserProfiles
    **/
    _count?: true | UserProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserProfileMaxAggregateInputType
  }

  export type GetUserProfileAggregateType<T extends UserProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateUserProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserProfile[P]>
      : GetScalarType<T[P], AggregateUserProfile[P]>
  }




  export type UserProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProfileWhereInput
    orderBy?: UserProfileOrderByWithAggregationInput | UserProfileOrderByWithAggregationInput[]
    by: UserProfileScalarFieldEnum[] | UserProfileScalarFieldEnum
    having?: UserProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserProfileCountAggregateInputType | true
    _avg?: UserProfileAvgAggregateInputType
    _sum?: UserProfileSumAggregateInputType
    _min?: UserProfileMinAggregateInputType
    _max?: UserProfileMaxAggregateInputType
  }

  export type UserProfileGroupByOutputType = {
    id: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId: string | null
    firstName: string
    lastName: string
    displayName: string | null
    preferredName: string | null
    profilePicture: string | null
    phoneNumber: string | null
    mobileNumber: string | null
    department: string | null
    jobTitle: string | null
    managerId: string | null
    location: string | null
    timezone: string | null
    startDate: Date | null
    endDate: Date | null
    status: $Enums.UserStatus
    lastLoginAt: Date | null
    lastActiveAt: Date | null
    isServiceAccount: boolean
    securityScore: number | null
    riskLevel: $Enums.RiskLevel
    mfaEnabled: boolean
    tenantId: string
    roles: string[]
    permissions: string[]
    createdAt: Date
    updatedAt: Date
    createdBy: string | null
    lastUpdatedBy: string | null
    dataVersion: number
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  type GetUserProfileGroupByPayload<T extends UserProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
            : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
        }
      >
    >


  export type UserProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    helixUid?: boolean
    email?: boolean
    emailCanonical?: boolean
    employeeId?: boolean
    firstName?: boolean
    lastName?: boolean
    displayName?: boolean
    preferredName?: boolean
    profilePicture?: boolean
    phoneNumber?: boolean
    mobileNumber?: boolean
    department?: boolean
    jobTitle?: boolean
    managerId?: boolean
    location?: boolean
    timezone?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    lastLoginAt?: boolean
    lastActiveAt?: boolean
    isServiceAccount?: boolean
    securityScore?: boolean
    riskLevel?: boolean
    mfaEnabled?: boolean
    tenantId?: boolean
    roles?: boolean
    permissions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    lastUpdatedBy?: boolean
    dataVersion?: boolean
    manager?: boolean | UserProfile$managerArgs<ExtArgs>
    directReports?: boolean | UserProfile$directReportsArgs<ExtArgs>
    linkedAccounts?: boolean | UserProfile$linkedAccountsArgs<ExtArgs>
    assets?: boolean | UserProfile$assetsArgs<ExtArgs>
    tickets?: boolean | UserProfile$ticketsArgs<ExtArgs>
    activityLogs?: boolean | UserProfile$activityLogsArgs<ExtArgs>
    securityEvents?: boolean | UserProfile$securityEventsArgs<ExtArgs>
    trainingRecords?: boolean | UserProfile$trainingRecordsArgs<ExtArgs>
    _count?: boolean | UserProfileCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    helixUid?: boolean
    email?: boolean
    emailCanonical?: boolean
    employeeId?: boolean
    firstName?: boolean
    lastName?: boolean
    displayName?: boolean
    preferredName?: boolean
    profilePicture?: boolean
    phoneNumber?: boolean
    mobileNumber?: boolean
    department?: boolean
    jobTitle?: boolean
    managerId?: boolean
    location?: boolean
    timezone?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    lastLoginAt?: boolean
    lastActiveAt?: boolean
    isServiceAccount?: boolean
    securityScore?: boolean
    riskLevel?: boolean
    mfaEnabled?: boolean
    tenantId?: boolean
    roles?: boolean
    permissions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    lastUpdatedBy?: boolean
    dataVersion?: boolean
    manager?: boolean | UserProfile$managerArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    helixUid?: boolean
    email?: boolean
    emailCanonical?: boolean
    employeeId?: boolean
    firstName?: boolean
    lastName?: boolean
    displayName?: boolean
    preferredName?: boolean
    profilePicture?: boolean
    phoneNumber?: boolean
    mobileNumber?: boolean
    department?: boolean
    jobTitle?: boolean
    managerId?: boolean
    location?: boolean
    timezone?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    lastLoginAt?: boolean
    lastActiveAt?: boolean
    isServiceAccount?: boolean
    securityScore?: boolean
    riskLevel?: boolean
    mfaEnabled?: boolean
    tenantId?: boolean
    roles?: boolean
    permissions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    lastUpdatedBy?: boolean
    dataVersion?: boolean
    manager?: boolean | UserProfile$managerArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectScalar = {
    id?: boolean
    helixUid?: boolean
    email?: boolean
    emailCanonical?: boolean
    employeeId?: boolean
    firstName?: boolean
    lastName?: boolean
    displayName?: boolean
    preferredName?: boolean
    profilePicture?: boolean
    phoneNumber?: boolean
    mobileNumber?: boolean
    department?: boolean
    jobTitle?: boolean
    managerId?: boolean
    location?: boolean
    timezone?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    lastLoginAt?: boolean
    lastActiveAt?: boolean
    isServiceAccount?: boolean
    securityScore?: boolean
    riskLevel?: boolean
    mfaEnabled?: boolean
    tenantId?: boolean
    roles?: boolean
    permissions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    lastUpdatedBy?: boolean
    dataVersion?: boolean
  }

  export type UserProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "helixUid" | "email" | "emailCanonical" | "employeeId" | "firstName" | "lastName" | "displayName" | "preferredName" | "profilePicture" | "phoneNumber" | "mobileNumber" | "department" | "jobTitle" | "managerId" | "location" | "timezone" | "startDate" | "endDate" | "status" | "lastLoginAt" | "lastActiveAt" | "isServiceAccount" | "securityScore" | "riskLevel" | "mfaEnabled" | "tenantId" | "roles" | "permissions" | "createdAt" | "updatedAt" | "createdBy" | "lastUpdatedBy" | "dataVersion", ExtArgs["result"]["userProfile"]>
  export type UserProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    manager?: boolean | UserProfile$managerArgs<ExtArgs>
    directReports?: boolean | UserProfile$directReportsArgs<ExtArgs>
    linkedAccounts?: boolean | UserProfile$linkedAccountsArgs<ExtArgs>
    assets?: boolean | UserProfile$assetsArgs<ExtArgs>
    tickets?: boolean | UserProfile$ticketsArgs<ExtArgs>
    activityLogs?: boolean | UserProfile$activityLogsArgs<ExtArgs>
    securityEvents?: boolean | UserProfile$securityEventsArgs<ExtArgs>
    trainingRecords?: boolean | UserProfile$trainingRecordsArgs<ExtArgs>
    _count?: boolean | UserProfileCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    manager?: boolean | UserProfile$managerArgs<ExtArgs>
  }
  export type UserProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    manager?: boolean | UserProfile$managerArgs<ExtArgs>
  }

  export type $UserProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserProfile"
    objects: {
      manager: Prisma.$UserProfilePayload<ExtArgs> | null
      directReports: Prisma.$UserProfilePayload<ExtArgs>[]
      linkedAccounts: Prisma.$LinkedAccountPayload<ExtArgs>[]
      assets: Prisma.$AssetAssignmentPayload<ExtArgs>[]
      tickets: Prisma.$UserTicketPayload<ExtArgs>[]
      activityLogs: Prisma.$ActivityLogPayload<ExtArgs>[]
      securityEvents: Prisma.$SecurityEventPayload<ExtArgs>[]
      trainingRecords: Prisma.$TrainingRecordPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      helixUid: string
      email: string
      emailCanonical: string
      employeeId: string | null
      firstName: string
      lastName: string
      displayName: string | null
      preferredName: string | null
      profilePicture: string | null
      phoneNumber: string | null
      mobileNumber: string | null
      department: string | null
      jobTitle: string | null
      managerId: string | null
      location: string | null
      timezone: string | null
      startDate: Date | null
      endDate: Date | null
      status: $Enums.UserStatus
      lastLoginAt: Date | null
      lastActiveAt: Date | null
      isServiceAccount: boolean
      securityScore: number | null
      riskLevel: $Enums.RiskLevel
      mfaEnabled: boolean
      tenantId: string
      roles: string[]
      permissions: string[]
      createdAt: Date
      updatedAt: Date
      createdBy: string | null
      lastUpdatedBy: string | null
      dataVersion: number
    }, ExtArgs["result"]["userProfile"]>
    composites: {}
  }

  type UserProfileGetPayload<S extends boolean | null | undefined | UserProfileDefaultArgs> = $Result.GetResult<Prisma.$UserProfilePayload, S>

  type UserProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserProfileCountAggregateInputType | true
    }

  export interface UserProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserProfile'], meta: { name: 'UserProfile' } }
    /**
     * Find zero or one UserProfile that matches the filter.
     * @param {UserProfileFindUniqueArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserProfileFindUniqueArgs>(args: SelectSubset<T, UserProfileFindUniqueArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserProfileFindUniqueOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, UserProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserProfileFindFirstArgs>(args?: SelectSubset<T, UserProfileFindFirstArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, UserProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserProfiles
     * const userProfiles = await prisma.userProfile.findMany()
     * 
     * // Get first 10 UserProfiles
     * const userProfiles = await prisma.userProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserProfileFindManyArgs>(args?: SelectSubset<T, UserProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserProfile.
     * @param {UserProfileCreateArgs} args - Arguments to create a UserProfile.
     * @example
     * // Create one UserProfile
     * const UserProfile = await prisma.userProfile.create({
     *   data: {
     *     // ... data to create a UserProfile
     *   }
     * })
     * 
     */
    create<T extends UserProfileCreateArgs>(args: SelectSubset<T, UserProfileCreateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserProfiles.
     * @param {UserProfileCreateManyArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserProfileCreateManyArgs>(args?: SelectSubset<T, UserProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserProfiles and returns the data saved in the database.
     * @param {UserProfileCreateManyAndReturnArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserProfiles and only return the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, UserProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserProfile.
     * @param {UserProfileDeleteArgs} args - Arguments to delete one UserProfile.
     * @example
     * // Delete one UserProfile
     * const UserProfile = await prisma.userProfile.delete({
     *   where: {
     *     // ... filter to delete one UserProfile
     *   }
     * })
     * 
     */
    delete<T extends UserProfileDeleteArgs>(args: SelectSubset<T, UserProfileDeleteArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserProfile.
     * @param {UserProfileUpdateArgs} args - Arguments to update one UserProfile.
     * @example
     * // Update one UserProfile
     * const userProfile = await prisma.userProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserProfileUpdateArgs>(args: SelectSubset<T, UserProfileUpdateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserProfiles.
     * @param {UserProfileDeleteManyArgs} args - Arguments to filter UserProfiles to delete.
     * @example
     * // Delete a few UserProfiles
     * const { count } = await prisma.userProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserProfileDeleteManyArgs>(args?: SelectSubset<T, UserProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserProfiles
     * const userProfile = await prisma.userProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserProfileUpdateManyArgs>(args: SelectSubset<T, UserProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProfiles and returns the data updated in the database.
     * @param {UserProfileUpdateManyAndReturnArgs} args - Arguments to update many UserProfiles.
     * @example
     * // Update many UserProfiles
     * const userProfile = await prisma.userProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserProfiles and only return the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, UserProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserProfile.
     * @param {UserProfileUpsertArgs} args - Arguments to update or create a UserProfile.
     * @example
     * // Update or create a UserProfile
     * const userProfile = await prisma.userProfile.upsert({
     *   create: {
     *     // ... data to create a UserProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserProfile we want to update
     *   }
     * })
     */
    upsert<T extends UserProfileUpsertArgs>(args: SelectSubset<T, UserProfileUpsertArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileCountArgs} args - Arguments to filter UserProfiles to count.
     * @example
     * // Count the number of UserProfiles
     * const count = await prisma.userProfile.count({
     *   where: {
     *     // ... the filter for the UserProfiles we want to count
     *   }
     * })
    **/
    count<T extends UserProfileCountArgs>(
      args?: Subset<T, UserProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserProfileAggregateArgs>(args: Subset<T, UserProfileAggregateArgs>): Prisma.PrismaPromise<GetUserProfileAggregateType<T>>

    /**
     * Group by UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserProfileGroupByArgs['orderBy'] }
        : { orderBy?: UserProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserProfile model
   */
  readonly fields: UserProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    manager<T extends UserProfile$managerArgs<ExtArgs> = {}>(args?: Subset<T, UserProfile$managerArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    directReports<T extends UserProfile$directReportsArgs<ExtArgs> = {}>(args?: Subset<T, UserProfile$directReportsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    linkedAccounts<T extends UserProfile$linkedAccountsArgs<ExtArgs> = {}>(args?: Subset<T, UserProfile$linkedAccountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    assets<T extends UserProfile$assetsArgs<ExtArgs> = {}>(args?: Subset<T, UserProfile$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tickets<T extends UserProfile$ticketsArgs<ExtArgs> = {}>(args?: Subset<T, UserProfile$ticketsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    activityLogs<T extends UserProfile$activityLogsArgs<ExtArgs> = {}>(args?: Subset<T, UserProfile$activityLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    securityEvents<T extends UserProfile$securityEventsArgs<ExtArgs> = {}>(args?: Subset<T, UserProfile$securityEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    trainingRecords<T extends UserProfile$trainingRecordsArgs<ExtArgs> = {}>(args?: Subset<T, UserProfile$trainingRecordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserProfile model
   */
  interface UserProfileFieldRefs {
    readonly id: FieldRef<"UserProfile", 'String'>
    readonly helixUid: FieldRef<"UserProfile", 'String'>
    readonly email: FieldRef<"UserProfile", 'String'>
    readonly emailCanonical: FieldRef<"UserProfile", 'String'>
    readonly employeeId: FieldRef<"UserProfile", 'String'>
    readonly firstName: FieldRef<"UserProfile", 'String'>
    readonly lastName: FieldRef<"UserProfile", 'String'>
    readonly displayName: FieldRef<"UserProfile", 'String'>
    readonly preferredName: FieldRef<"UserProfile", 'String'>
    readonly profilePicture: FieldRef<"UserProfile", 'String'>
    readonly phoneNumber: FieldRef<"UserProfile", 'String'>
    readonly mobileNumber: FieldRef<"UserProfile", 'String'>
    readonly department: FieldRef<"UserProfile", 'String'>
    readonly jobTitle: FieldRef<"UserProfile", 'String'>
    readonly managerId: FieldRef<"UserProfile", 'String'>
    readonly location: FieldRef<"UserProfile", 'String'>
    readonly timezone: FieldRef<"UserProfile", 'String'>
    readonly startDate: FieldRef<"UserProfile", 'DateTime'>
    readonly endDate: FieldRef<"UserProfile", 'DateTime'>
    readonly status: FieldRef<"UserProfile", 'UserStatus'>
    readonly lastLoginAt: FieldRef<"UserProfile", 'DateTime'>
    readonly lastActiveAt: FieldRef<"UserProfile", 'DateTime'>
    readonly isServiceAccount: FieldRef<"UserProfile", 'Boolean'>
    readonly securityScore: FieldRef<"UserProfile", 'Int'>
    readonly riskLevel: FieldRef<"UserProfile", 'RiskLevel'>
    readonly mfaEnabled: FieldRef<"UserProfile", 'Boolean'>
    readonly tenantId: FieldRef<"UserProfile", 'String'>
    readonly roles: FieldRef<"UserProfile", 'String[]'>
    readonly permissions: FieldRef<"UserProfile", 'String[]'>
    readonly createdAt: FieldRef<"UserProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"UserProfile", 'DateTime'>
    readonly createdBy: FieldRef<"UserProfile", 'String'>
    readonly lastUpdatedBy: FieldRef<"UserProfile", 'String'>
    readonly dataVersion: FieldRef<"UserProfile", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * UserProfile findUnique
   */
  export type UserProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile findUniqueOrThrow
   */
  export type UserProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile findFirst
   */
  export type UserProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile findFirstOrThrow
   */
  export type UserProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile findMany
   */
  export type UserProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfiles to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile create
   */
  export type UserProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a UserProfile.
     */
    data: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
  }

  /**
   * UserProfile createMany
   */
  export type UserProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserProfile createManyAndReturn
   */
  export type UserProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProfile update
   */
  export type UserProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a UserProfile.
     */
    data: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
    /**
     * Choose, which UserProfile to update.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile updateMany
   */
  export type UserProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserProfiles.
     */
    data: XOR<UserProfileUpdateManyMutationInput, UserProfileUncheckedUpdateManyInput>
    /**
     * Filter which UserProfiles to update
     */
    where?: UserProfileWhereInput
    /**
     * Limit how many UserProfiles to update.
     */
    limit?: number
  }

  /**
   * UserProfile updateManyAndReturn
   */
  export type UserProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * The data used to update UserProfiles.
     */
    data: XOR<UserProfileUpdateManyMutationInput, UserProfileUncheckedUpdateManyInput>
    /**
     * Filter which UserProfiles to update
     */
    where?: UserProfileWhereInput
    /**
     * Limit how many UserProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProfile upsert
   */
  export type UserProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the UserProfile to update in case it exists.
     */
    where: UserProfileWhereUniqueInput
    /**
     * In case the UserProfile found by the `where` argument doesn't exist, create a new UserProfile with this data.
     */
    create: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
    /**
     * In case the UserProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
  }

  /**
   * UserProfile delete
   */
  export type UserProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter which UserProfile to delete.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile deleteMany
   */
  export type UserProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfiles to delete
     */
    where?: UserProfileWhereInput
    /**
     * Limit how many UserProfiles to delete.
     */
    limit?: number
  }

  /**
   * UserProfile.manager
   */
  export type UserProfile$managerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    where?: UserProfileWhereInput
  }

  /**
   * UserProfile.directReports
   */
  export type UserProfile$directReportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    where?: UserProfileWhereInput
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    cursor?: UserProfileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile.linkedAccounts
   */
  export type UserProfile$linkedAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    where?: LinkedAccountWhereInput
    orderBy?: LinkedAccountOrderByWithRelationInput | LinkedAccountOrderByWithRelationInput[]
    cursor?: LinkedAccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LinkedAccountScalarFieldEnum | LinkedAccountScalarFieldEnum[]
  }

  /**
   * UserProfile.assets
   */
  export type UserProfile$assetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    where?: AssetAssignmentWhereInput
    orderBy?: AssetAssignmentOrderByWithRelationInput | AssetAssignmentOrderByWithRelationInput[]
    cursor?: AssetAssignmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AssetAssignmentScalarFieldEnum | AssetAssignmentScalarFieldEnum[]
  }

  /**
   * UserProfile.tickets
   */
  export type UserProfile$ticketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    where?: UserTicketWhereInput
    orderBy?: UserTicketOrderByWithRelationInput | UserTicketOrderByWithRelationInput[]
    cursor?: UserTicketWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserTicketScalarFieldEnum | UserTicketScalarFieldEnum[]
  }

  /**
   * UserProfile.activityLogs
   */
  export type UserProfile$activityLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    where?: ActivityLogWhereInput
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    cursor?: ActivityLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * UserProfile.securityEvents
   */
  export type UserProfile$securityEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    where?: SecurityEventWhereInput
    orderBy?: SecurityEventOrderByWithRelationInput | SecurityEventOrderByWithRelationInput[]
    cursor?: SecurityEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SecurityEventScalarFieldEnum | SecurityEventScalarFieldEnum[]
  }

  /**
   * UserProfile.trainingRecords
   */
  export type UserProfile$trainingRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    where?: TrainingRecordWhereInput
    orderBy?: TrainingRecordOrderByWithRelationInput | TrainingRecordOrderByWithRelationInput[]
    cursor?: TrainingRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrainingRecordScalarFieldEnum | TrainingRecordScalarFieldEnum[]
  }

  /**
   * UserProfile without action
   */
  export type UserProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
  }


  /**
   * Model LinkedAccount
   */

  export type AggregateLinkedAccount = {
    _count: LinkedAccountCountAggregateOutputType | null
    _min: LinkedAccountMinAggregateOutputType | null
    _max: LinkedAccountMaxAggregateOutputType | null
  }

  export type LinkedAccountMinAggregateOutputType = {
    id: string | null
    userId: string | null
    platform: string | null
    platformUserId: string | null
    platformUsername: string | null
    accountEmail: string | null
    accountStatus: string | null
    accountType: string | null
    lastSyncAt: Date | null
    syncEnabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LinkedAccountMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    platform: string | null
    platformUserId: string | null
    platformUsername: string | null
    accountEmail: string | null
    accountStatus: string | null
    accountType: string | null
    lastSyncAt: Date | null
    syncEnabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LinkedAccountCountAggregateOutputType = {
    id: number
    userId: number
    platform: number
    platformUserId: number
    platformUsername: number
    accountEmail: number
    accountStatus: number
    accountType: number
    lastSyncAt: number
    metadata: number
    syncEnabled: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LinkedAccountMinAggregateInputType = {
    id?: true
    userId?: true
    platform?: true
    platformUserId?: true
    platformUsername?: true
    accountEmail?: true
    accountStatus?: true
    accountType?: true
    lastSyncAt?: true
    syncEnabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LinkedAccountMaxAggregateInputType = {
    id?: true
    userId?: true
    platform?: true
    platformUserId?: true
    platformUsername?: true
    accountEmail?: true
    accountStatus?: true
    accountType?: true
    lastSyncAt?: true
    syncEnabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LinkedAccountCountAggregateInputType = {
    id?: true
    userId?: true
    platform?: true
    platformUserId?: true
    platformUsername?: true
    accountEmail?: true
    accountStatus?: true
    accountType?: true
    lastSyncAt?: true
    metadata?: true
    syncEnabled?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LinkedAccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LinkedAccount to aggregate.
     */
    where?: LinkedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkedAccounts to fetch.
     */
    orderBy?: LinkedAccountOrderByWithRelationInput | LinkedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LinkedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkedAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LinkedAccounts
    **/
    _count?: true | LinkedAccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LinkedAccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LinkedAccountMaxAggregateInputType
  }

  export type GetLinkedAccountAggregateType<T extends LinkedAccountAggregateArgs> = {
        [P in keyof T & keyof AggregateLinkedAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLinkedAccount[P]>
      : GetScalarType<T[P], AggregateLinkedAccount[P]>
  }




  export type LinkedAccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LinkedAccountWhereInput
    orderBy?: LinkedAccountOrderByWithAggregationInput | LinkedAccountOrderByWithAggregationInput[]
    by: LinkedAccountScalarFieldEnum[] | LinkedAccountScalarFieldEnum
    having?: LinkedAccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LinkedAccountCountAggregateInputType | true
    _min?: LinkedAccountMinAggregateInputType
    _max?: LinkedAccountMaxAggregateInputType
  }

  export type LinkedAccountGroupByOutputType = {
    id: string
    userId: string
    platform: string
    platformUserId: string
    platformUsername: string | null
    accountEmail: string | null
    accountStatus: string
    accountType: string | null
    lastSyncAt: Date | null
    metadata: JsonValue | null
    syncEnabled: boolean
    createdAt: Date
    updatedAt: Date
    _count: LinkedAccountCountAggregateOutputType | null
    _min: LinkedAccountMinAggregateOutputType | null
    _max: LinkedAccountMaxAggregateOutputType | null
  }

  type GetLinkedAccountGroupByPayload<T extends LinkedAccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LinkedAccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LinkedAccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LinkedAccountGroupByOutputType[P]>
            : GetScalarType<T[P], LinkedAccountGroupByOutputType[P]>
        }
      >
    >


  export type LinkedAccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    platform?: boolean
    platformUserId?: boolean
    platformUsername?: boolean
    accountEmail?: boolean
    accountStatus?: boolean
    accountType?: boolean
    lastSyncAt?: boolean
    metadata?: boolean
    syncEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["linkedAccount"]>

  export type LinkedAccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    platform?: boolean
    platformUserId?: boolean
    platformUsername?: boolean
    accountEmail?: boolean
    accountStatus?: boolean
    accountType?: boolean
    lastSyncAt?: boolean
    metadata?: boolean
    syncEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["linkedAccount"]>

  export type LinkedAccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    platform?: boolean
    platformUserId?: boolean
    platformUsername?: boolean
    accountEmail?: boolean
    accountStatus?: boolean
    accountType?: boolean
    lastSyncAt?: boolean
    metadata?: boolean
    syncEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["linkedAccount"]>

  export type LinkedAccountSelectScalar = {
    id?: boolean
    userId?: boolean
    platform?: boolean
    platformUserId?: boolean
    platformUsername?: boolean
    accountEmail?: boolean
    accountStatus?: boolean
    accountType?: boolean
    lastSyncAt?: boolean
    metadata?: boolean
    syncEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LinkedAccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "platform" | "platformUserId" | "platformUsername" | "accountEmail" | "accountStatus" | "accountType" | "lastSyncAt" | "metadata" | "syncEnabled" | "createdAt" | "updatedAt", ExtArgs["result"]["linkedAccount"]>
  export type LinkedAccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type LinkedAccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type LinkedAccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }

  export type $LinkedAccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LinkedAccount"
    objects: {
      user: Prisma.$UserProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      platform: string
      platformUserId: string
      platformUsername: string | null
      accountEmail: string | null
      accountStatus: string
      accountType: string | null
      lastSyncAt: Date | null
      metadata: Prisma.JsonValue | null
      syncEnabled: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["linkedAccount"]>
    composites: {}
  }

  type LinkedAccountGetPayload<S extends boolean | null | undefined | LinkedAccountDefaultArgs> = $Result.GetResult<Prisma.$LinkedAccountPayload, S>

  type LinkedAccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LinkedAccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LinkedAccountCountAggregateInputType | true
    }

  export interface LinkedAccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LinkedAccount'], meta: { name: 'LinkedAccount' } }
    /**
     * Find zero or one LinkedAccount that matches the filter.
     * @param {LinkedAccountFindUniqueArgs} args - Arguments to find a LinkedAccount
     * @example
     * // Get one LinkedAccount
     * const linkedAccount = await prisma.linkedAccount.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LinkedAccountFindUniqueArgs>(args: SelectSubset<T, LinkedAccountFindUniqueArgs<ExtArgs>>): Prisma__LinkedAccountClient<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LinkedAccount that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LinkedAccountFindUniqueOrThrowArgs} args - Arguments to find a LinkedAccount
     * @example
     * // Get one LinkedAccount
     * const linkedAccount = await prisma.linkedAccount.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LinkedAccountFindUniqueOrThrowArgs>(args: SelectSubset<T, LinkedAccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LinkedAccountClient<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LinkedAccount that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkedAccountFindFirstArgs} args - Arguments to find a LinkedAccount
     * @example
     * // Get one LinkedAccount
     * const linkedAccount = await prisma.linkedAccount.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LinkedAccountFindFirstArgs>(args?: SelectSubset<T, LinkedAccountFindFirstArgs<ExtArgs>>): Prisma__LinkedAccountClient<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LinkedAccount that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkedAccountFindFirstOrThrowArgs} args - Arguments to find a LinkedAccount
     * @example
     * // Get one LinkedAccount
     * const linkedAccount = await prisma.linkedAccount.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LinkedAccountFindFirstOrThrowArgs>(args?: SelectSubset<T, LinkedAccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__LinkedAccountClient<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LinkedAccounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkedAccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LinkedAccounts
     * const linkedAccounts = await prisma.linkedAccount.findMany()
     * 
     * // Get first 10 LinkedAccounts
     * const linkedAccounts = await prisma.linkedAccount.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const linkedAccountWithIdOnly = await prisma.linkedAccount.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LinkedAccountFindManyArgs>(args?: SelectSubset<T, LinkedAccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LinkedAccount.
     * @param {LinkedAccountCreateArgs} args - Arguments to create a LinkedAccount.
     * @example
     * // Create one LinkedAccount
     * const LinkedAccount = await prisma.linkedAccount.create({
     *   data: {
     *     // ... data to create a LinkedAccount
     *   }
     * })
     * 
     */
    create<T extends LinkedAccountCreateArgs>(args: SelectSubset<T, LinkedAccountCreateArgs<ExtArgs>>): Prisma__LinkedAccountClient<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LinkedAccounts.
     * @param {LinkedAccountCreateManyArgs} args - Arguments to create many LinkedAccounts.
     * @example
     * // Create many LinkedAccounts
     * const linkedAccount = await prisma.linkedAccount.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LinkedAccountCreateManyArgs>(args?: SelectSubset<T, LinkedAccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LinkedAccounts and returns the data saved in the database.
     * @param {LinkedAccountCreateManyAndReturnArgs} args - Arguments to create many LinkedAccounts.
     * @example
     * // Create many LinkedAccounts
     * const linkedAccount = await prisma.linkedAccount.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LinkedAccounts and only return the `id`
     * const linkedAccountWithIdOnly = await prisma.linkedAccount.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LinkedAccountCreateManyAndReturnArgs>(args?: SelectSubset<T, LinkedAccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LinkedAccount.
     * @param {LinkedAccountDeleteArgs} args - Arguments to delete one LinkedAccount.
     * @example
     * // Delete one LinkedAccount
     * const LinkedAccount = await prisma.linkedAccount.delete({
     *   where: {
     *     // ... filter to delete one LinkedAccount
     *   }
     * })
     * 
     */
    delete<T extends LinkedAccountDeleteArgs>(args: SelectSubset<T, LinkedAccountDeleteArgs<ExtArgs>>): Prisma__LinkedAccountClient<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LinkedAccount.
     * @param {LinkedAccountUpdateArgs} args - Arguments to update one LinkedAccount.
     * @example
     * // Update one LinkedAccount
     * const linkedAccount = await prisma.linkedAccount.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LinkedAccountUpdateArgs>(args: SelectSubset<T, LinkedAccountUpdateArgs<ExtArgs>>): Prisma__LinkedAccountClient<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LinkedAccounts.
     * @param {LinkedAccountDeleteManyArgs} args - Arguments to filter LinkedAccounts to delete.
     * @example
     * // Delete a few LinkedAccounts
     * const { count } = await prisma.linkedAccount.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LinkedAccountDeleteManyArgs>(args?: SelectSubset<T, LinkedAccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LinkedAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkedAccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LinkedAccounts
     * const linkedAccount = await prisma.linkedAccount.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LinkedAccountUpdateManyArgs>(args: SelectSubset<T, LinkedAccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LinkedAccounts and returns the data updated in the database.
     * @param {LinkedAccountUpdateManyAndReturnArgs} args - Arguments to update many LinkedAccounts.
     * @example
     * // Update many LinkedAccounts
     * const linkedAccount = await prisma.linkedAccount.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LinkedAccounts and only return the `id`
     * const linkedAccountWithIdOnly = await prisma.linkedAccount.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LinkedAccountUpdateManyAndReturnArgs>(args: SelectSubset<T, LinkedAccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LinkedAccount.
     * @param {LinkedAccountUpsertArgs} args - Arguments to update or create a LinkedAccount.
     * @example
     * // Update or create a LinkedAccount
     * const linkedAccount = await prisma.linkedAccount.upsert({
     *   create: {
     *     // ... data to create a LinkedAccount
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LinkedAccount we want to update
     *   }
     * })
     */
    upsert<T extends LinkedAccountUpsertArgs>(args: SelectSubset<T, LinkedAccountUpsertArgs<ExtArgs>>): Prisma__LinkedAccountClient<$Result.GetResult<Prisma.$LinkedAccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LinkedAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkedAccountCountArgs} args - Arguments to filter LinkedAccounts to count.
     * @example
     * // Count the number of LinkedAccounts
     * const count = await prisma.linkedAccount.count({
     *   where: {
     *     // ... the filter for the LinkedAccounts we want to count
     *   }
     * })
    **/
    count<T extends LinkedAccountCountArgs>(
      args?: Subset<T, LinkedAccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LinkedAccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LinkedAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkedAccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LinkedAccountAggregateArgs>(args: Subset<T, LinkedAccountAggregateArgs>): Prisma.PrismaPromise<GetLinkedAccountAggregateType<T>>

    /**
     * Group by LinkedAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LinkedAccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LinkedAccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LinkedAccountGroupByArgs['orderBy'] }
        : { orderBy?: LinkedAccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LinkedAccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLinkedAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LinkedAccount model
   */
  readonly fields: LinkedAccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LinkedAccount.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LinkedAccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserProfileDefaultArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LinkedAccount model
   */
  interface LinkedAccountFieldRefs {
    readonly id: FieldRef<"LinkedAccount", 'String'>
    readonly userId: FieldRef<"LinkedAccount", 'String'>
    readonly platform: FieldRef<"LinkedAccount", 'String'>
    readonly platformUserId: FieldRef<"LinkedAccount", 'String'>
    readonly platformUsername: FieldRef<"LinkedAccount", 'String'>
    readonly accountEmail: FieldRef<"LinkedAccount", 'String'>
    readonly accountStatus: FieldRef<"LinkedAccount", 'String'>
    readonly accountType: FieldRef<"LinkedAccount", 'String'>
    readonly lastSyncAt: FieldRef<"LinkedAccount", 'DateTime'>
    readonly metadata: FieldRef<"LinkedAccount", 'Json'>
    readonly syncEnabled: FieldRef<"LinkedAccount", 'Boolean'>
    readonly createdAt: FieldRef<"LinkedAccount", 'DateTime'>
    readonly updatedAt: FieldRef<"LinkedAccount", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LinkedAccount findUnique
   */
  export type LinkedAccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    /**
     * Filter, which LinkedAccount to fetch.
     */
    where: LinkedAccountWhereUniqueInput
  }

  /**
   * LinkedAccount findUniqueOrThrow
   */
  export type LinkedAccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    /**
     * Filter, which LinkedAccount to fetch.
     */
    where: LinkedAccountWhereUniqueInput
  }

  /**
   * LinkedAccount findFirst
   */
  export type LinkedAccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    /**
     * Filter, which LinkedAccount to fetch.
     */
    where?: LinkedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkedAccounts to fetch.
     */
    orderBy?: LinkedAccountOrderByWithRelationInput | LinkedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LinkedAccounts.
     */
    cursor?: LinkedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkedAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LinkedAccounts.
     */
    distinct?: LinkedAccountScalarFieldEnum | LinkedAccountScalarFieldEnum[]
  }

  /**
   * LinkedAccount findFirstOrThrow
   */
  export type LinkedAccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    /**
     * Filter, which LinkedAccount to fetch.
     */
    where?: LinkedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkedAccounts to fetch.
     */
    orderBy?: LinkedAccountOrderByWithRelationInput | LinkedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LinkedAccounts.
     */
    cursor?: LinkedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkedAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LinkedAccounts.
     */
    distinct?: LinkedAccountScalarFieldEnum | LinkedAccountScalarFieldEnum[]
  }

  /**
   * LinkedAccount findMany
   */
  export type LinkedAccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    /**
     * Filter, which LinkedAccounts to fetch.
     */
    where?: LinkedAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LinkedAccounts to fetch.
     */
    orderBy?: LinkedAccountOrderByWithRelationInput | LinkedAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LinkedAccounts.
     */
    cursor?: LinkedAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LinkedAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LinkedAccounts.
     */
    skip?: number
    distinct?: LinkedAccountScalarFieldEnum | LinkedAccountScalarFieldEnum[]
  }

  /**
   * LinkedAccount create
   */
  export type LinkedAccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    /**
     * The data needed to create a LinkedAccount.
     */
    data: XOR<LinkedAccountCreateInput, LinkedAccountUncheckedCreateInput>
  }

  /**
   * LinkedAccount createMany
   */
  export type LinkedAccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LinkedAccounts.
     */
    data: LinkedAccountCreateManyInput | LinkedAccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LinkedAccount createManyAndReturn
   */
  export type LinkedAccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * The data used to create many LinkedAccounts.
     */
    data: LinkedAccountCreateManyInput | LinkedAccountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LinkedAccount update
   */
  export type LinkedAccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    /**
     * The data needed to update a LinkedAccount.
     */
    data: XOR<LinkedAccountUpdateInput, LinkedAccountUncheckedUpdateInput>
    /**
     * Choose, which LinkedAccount to update.
     */
    where: LinkedAccountWhereUniqueInput
  }

  /**
   * LinkedAccount updateMany
   */
  export type LinkedAccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LinkedAccounts.
     */
    data: XOR<LinkedAccountUpdateManyMutationInput, LinkedAccountUncheckedUpdateManyInput>
    /**
     * Filter which LinkedAccounts to update
     */
    where?: LinkedAccountWhereInput
    /**
     * Limit how many LinkedAccounts to update.
     */
    limit?: number
  }

  /**
   * LinkedAccount updateManyAndReturn
   */
  export type LinkedAccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * The data used to update LinkedAccounts.
     */
    data: XOR<LinkedAccountUpdateManyMutationInput, LinkedAccountUncheckedUpdateManyInput>
    /**
     * Filter which LinkedAccounts to update
     */
    where?: LinkedAccountWhereInput
    /**
     * Limit how many LinkedAccounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LinkedAccount upsert
   */
  export type LinkedAccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    /**
     * The filter to search for the LinkedAccount to update in case it exists.
     */
    where: LinkedAccountWhereUniqueInput
    /**
     * In case the LinkedAccount found by the `where` argument doesn't exist, create a new LinkedAccount with this data.
     */
    create: XOR<LinkedAccountCreateInput, LinkedAccountUncheckedCreateInput>
    /**
     * In case the LinkedAccount was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LinkedAccountUpdateInput, LinkedAccountUncheckedUpdateInput>
  }

  /**
   * LinkedAccount delete
   */
  export type LinkedAccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
    /**
     * Filter which LinkedAccount to delete.
     */
    where: LinkedAccountWhereUniqueInput
  }

  /**
   * LinkedAccount deleteMany
   */
  export type LinkedAccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LinkedAccounts to delete
     */
    where?: LinkedAccountWhereInput
    /**
     * Limit how many LinkedAccounts to delete.
     */
    limit?: number
  }

  /**
   * LinkedAccount without action
   */
  export type LinkedAccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LinkedAccount
     */
    select?: LinkedAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LinkedAccount
     */
    omit?: LinkedAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LinkedAccountInclude<ExtArgs> | null
  }


  /**
   * Model AssetAssignment
   */

  export type AggregateAssetAssignment = {
    _count: AssetAssignmentCountAggregateOutputType | null
    _min: AssetAssignmentMinAggregateOutputType | null
    _max: AssetAssignmentMaxAggregateOutputType | null
  }

  export type AssetAssignmentMinAggregateOutputType = {
    id: string | null
    userId: string | null
    assetId: string | null
    assetType: $Enums.AssetType | null
    assetName: string | null
    assetCategory: string | null
    assignedAt: Date | null
    assignedBy: string | null
    unassignedAt: Date | null
    unassignedBy: string | null
    status: $Enums.AssetStatus | null
    complianceStatus: $Enums.ComplianceStatus | null
    lastCheckAt: Date | null
    notes: string | null
  }

  export type AssetAssignmentMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    assetId: string | null
    assetType: $Enums.AssetType | null
    assetName: string | null
    assetCategory: string | null
    assignedAt: Date | null
    assignedBy: string | null
    unassignedAt: Date | null
    unassignedBy: string | null
    status: $Enums.AssetStatus | null
    complianceStatus: $Enums.ComplianceStatus | null
    lastCheckAt: Date | null
    notes: string | null
  }

  export type AssetAssignmentCountAggregateOutputType = {
    id: number
    userId: number
    assetId: number
    assetType: number
    assetName: number
    assetCategory: number
    assignedAt: number
    assignedBy: number
    unassignedAt: number
    unassignedBy: number
    status: number
    complianceStatus: number
    lastCheckAt: number
    notes: number
    metadata: number
    _all: number
  }


  export type AssetAssignmentMinAggregateInputType = {
    id?: true
    userId?: true
    assetId?: true
    assetType?: true
    assetName?: true
    assetCategory?: true
    assignedAt?: true
    assignedBy?: true
    unassignedAt?: true
    unassignedBy?: true
    status?: true
    complianceStatus?: true
    lastCheckAt?: true
    notes?: true
  }

  export type AssetAssignmentMaxAggregateInputType = {
    id?: true
    userId?: true
    assetId?: true
    assetType?: true
    assetName?: true
    assetCategory?: true
    assignedAt?: true
    assignedBy?: true
    unassignedAt?: true
    unassignedBy?: true
    status?: true
    complianceStatus?: true
    lastCheckAt?: true
    notes?: true
  }

  export type AssetAssignmentCountAggregateInputType = {
    id?: true
    userId?: true
    assetId?: true
    assetType?: true
    assetName?: true
    assetCategory?: true
    assignedAt?: true
    assignedBy?: true
    unassignedAt?: true
    unassignedBy?: true
    status?: true
    complianceStatus?: true
    lastCheckAt?: true
    notes?: true
    metadata?: true
    _all?: true
  }

  export type AssetAssignmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetAssignment to aggregate.
     */
    where?: AssetAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetAssignments to fetch.
     */
    orderBy?: AssetAssignmentOrderByWithRelationInput | AssetAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AssetAssignments
    **/
    _count?: true | AssetAssignmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetAssignmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetAssignmentMaxAggregateInputType
  }

  export type GetAssetAssignmentAggregateType<T extends AssetAssignmentAggregateArgs> = {
        [P in keyof T & keyof AggregateAssetAssignment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssetAssignment[P]>
      : GetScalarType<T[P], AggregateAssetAssignment[P]>
  }




  export type AssetAssignmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetAssignmentWhereInput
    orderBy?: AssetAssignmentOrderByWithAggregationInput | AssetAssignmentOrderByWithAggregationInput[]
    by: AssetAssignmentScalarFieldEnum[] | AssetAssignmentScalarFieldEnum
    having?: AssetAssignmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetAssignmentCountAggregateInputType | true
    _min?: AssetAssignmentMinAggregateInputType
    _max?: AssetAssignmentMaxAggregateInputType
  }

  export type AssetAssignmentGroupByOutputType = {
    id: string
    userId: string
    assetId: string
    assetType: $Enums.AssetType
    assetName: string
    assetCategory: string | null
    assignedAt: Date
    assignedBy: string
    unassignedAt: Date | null
    unassignedBy: string | null
    status: $Enums.AssetStatus
    complianceStatus: $Enums.ComplianceStatus
    lastCheckAt: Date | null
    notes: string | null
    metadata: JsonValue | null
    _count: AssetAssignmentCountAggregateOutputType | null
    _min: AssetAssignmentMinAggregateOutputType | null
    _max: AssetAssignmentMaxAggregateOutputType | null
  }

  type GetAssetAssignmentGroupByPayload<T extends AssetAssignmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetAssignmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetAssignmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetAssignmentGroupByOutputType[P]>
            : GetScalarType<T[P], AssetAssignmentGroupByOutputType[P]>
        }
      >
    >


  export type AssetAssignmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    assetId?: boolean
    assetType?: boolean
    assetName?: boolean
    assetCategory?: boolean
    assignedAt?: boolean
    assignedBy?: boolean
    unassignedAt?: boolean
    unassignedBy?: boolean
    status?: boolean
    complianceStatus?: boolean
    lastCheckAt?: boolean
    notes?: boolean
    metadata?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assetAssignment"]>

  export type AssetAssignmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    assetId?: boolean
    assetType?: boolean
    assetName?: boolean
    assetCategory?: boolean
    assignedAt?: boolean
    assignedBy?: boolean
    unassignedAt?: boolean
    unassignedBy?: boolean
    status?: boolean
    complianceStatus?: boolean
    lastCheckAt?: boolean
    notes?: boolean
    metadata?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assetAssignment"]>

  export type AssetAssignmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    assetId?: boolean
    assetType?: boolean
    assetName?: boolean
    assetCategory?: boolean
    assignedAt?: boolean
    assignedBy?: boolean
    unassignedAt?: boolean
    unassignedBy?: boolean
    status?: boolean
    complianceStatus?: boolean
    lastCheckAt?: boolean
    notes?: boolean
    metadata?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assetAssignment"]>

  export type AssetAssignmentSelectScalar = {
    id?: boolean
    userId?: boolean
    assetId?: boolean
    assetType?: boolean
    assetName?: boolean
    assetCategory?: boolean
    assignedAt?: boolean
    assignedBy?: boolean
    unassignedAt?: boolean
    unassignedBy?: boolean
    status?: boolean
    complianceStatus?: boolean
    lastCheckAt?: boolean
    notes?: boolean
    metadata?: boolean
  }

  export type AssetAssignmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "assetId" | "assetType" | "assetName" | "assetCategory" | "assignedAt" | "assignedBy" | "unassignedAt" | "unassignedBy" | "status" | "complianceStatus" | "lastCheckAt" | "notes" | "metadata", ExtArgs["result"]["assetAssignment"]>
  export type AssetAssignmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type AssetAssignmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type AssetAssignmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }

  export type $AssetAssignmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AssetAssignment"
    objects: {
      user: Prisma.$UserProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      assetId: string
      assetType: $Enums.AssetType
      assetName: string
      assetCategory: string | null
      assignedAt: Date
      assignedBy: string
      unassignedAt: Date | null
      unassignedBy: string | null
      status: $Enums.AssetStatus
      complianceStatus: $Enums.ComplianceStatus
      lastCheckAt: Date | null
      notes: string | null
      metadata: Prisma.JsonValue | null
    }, ExtArgs["result"]["assetAssignment"]>
    composites: {}
  }

  type AssetAssignmentGetPayload<S extends boolean | null | undefined | AssetAssignmentDefaultArgs> = $Result.GetResult<Prisma.$AssetAssignmentPayload, S>

  type AssetAssignmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AssetAssignmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AssetAssignmentCountAggregateInputType | true
    }

  export interface AssetAssignmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AssetAssignment'], meta: { name: 'AssetAssignment' } }
    /**
     * Find zero or one AssetAssignment that matches the filter.
     * @param {AssetAssignmentFindUniqueArgs} args - Arguments to find a AssetAssignment
     * @example
     * // Get one AssetAssignment
     * const assetAssignment = await prisma.assetAssignment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetAssignmentFindUniqueArgs>(args: SelectSubset<T, AssetAssignmentFindUniqueArgs<ExtArgs>>): Prisma__AssetAssignmentClient<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AssetAssignment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssetAssignmentFindUniqueOrThrowArgs} args - Arguments to find a AssetAssignment
     * @example
     * // Get one AssetAssignment
     * const assetAssignment = await prisma.assetAssignment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetAssignmentFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetAssignmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetAssignmentClient<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AssetAssignment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAssignmentFindFirstArgs} args - Arguments to find a AssetAssignment
     * @example
     * // Get one AssetAssignment
     * const assetAssignment = await prisma.assetAssignment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetAssignmentFindFirstArgs>(args?: SelectSubset<T, AssetAssignmentFindFirstArgs<ExtArgs>>): Prisma__AssetAssignmentClient<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AssetAssignment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAssignmentFindFirstOrThrowArgs} args - Arguments to find a AssetAssignment
     * @example
     * // Get one AssetAssignment
     * const assetAssignment = await prisma.assetAssignment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetAssignmentFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetAssignmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetAssignmentClient<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AssetAssignments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAssignmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssetAssignments
     * const assetAssignments = await prisma.assetAssignment.findMany()
     * 
     * // Get first 10 AssetAssignments
     * const assetAssignments = await prisma.assetAssignment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetAssignmentWithIdOnly = await prisma.assetAssignment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetAssignmentFindManyArgs>(args?: SelectSubset<T, AssetAssignmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AssetAssignment.
     * @param {AssetAssignmentCreateArgs} args - Arguments to create a AssetAssignment.
     * @example
     * // Create one AssetAssignment
     * const AssetAssignment = await prisma.assetAssignment.create({
     *   data: {
     *     // ... data to create a AssetAssignment
     *   }
     * })
     * 
     */
    create<T extends AssetAssignmentCreateArgs>(args: SelectSubset<T, AssetAssignmentCreateArgs<ExtArgs>>): Prisma__AssetAssignmentClient<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AssetAssignments.
     * @param {AssetAssignmentCreateManyArgs} args - Arguments to create many AssetAssignments.
     * @example
     * // Create many AssetAssignments
     * const assetAssignment = await prisma.assetAssignment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetAssignmentCreateManyArgs>(args?: SelectSubset<T, AssetAssignmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AssetAssignments and returns the data saved in the database.
     * @param {AssetAssignmentCreateManyAndReturnArgs} args - Arguments to create many AssetAssignments.
     * @example
     * // Create many AssetAssignments
     * const assetAssignment = await prisma.assetAssignment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AssetAssignments and only return the `id`
     * const assetAssignmentWithIdOnly = await prisma.assetAssignment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetAssignmentCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetAssignmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AssetAssignment.
     * @param {AssetAssignmentDeleteArgs} args - Arguments to delete one AssetAssignment.
     * @example
     * // Delete one AssetAssignment
     * const AssetAssignment = await prisma.assetAssignment.delete({
     *   where: {
     *     // ... filter to delete one AssetAssignment
     *   }
     * })
     * 
     */
    delete<T extends AssetAssignmentDeleteArgs>(args: SelectSubset<T, AssetAssignmentDeleteArgs<ExtArgs>>): Prisma__AssetAssignmentClient<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AssetAssignment.
     * @param {AssetAssignmentUpdateArgs} args - Arguments to update one AssetAssignment.
     * @example
     * // Update one AssetAssignment
     * const assetAssignment = await prisma.assetAssignment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetAssignmentUpdateArgs>(args: SelectSubset<T, AssetAssignmentUpdateArgs<ExtArgs>>): Prisma__AssetAssignmentClient<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AssetAssignments.
     * @param {AssetAssignmentDeleteManyArgs} args - Arguments to filter AssetAssignments to delete.
     * @example
     * // Delete a few AssetAssignments
     * const { count } = await prisma.assetAssignment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetAssignmentDeleteManyArgs>(args?: SelectSubset<T, AssetAssignmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssetAssignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAssignmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssetAssignments
     * const assetAssignment = await prisma.assetAssignment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetAssignmentUpdateManyArgs>(args: SelectSubset<T, AssetAssignmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssetAssignments and returns the data updated in the database.
     * @param {AssetAssignmentUpdateManyAndReturnArgs} args - Arguments to update many AssetAssignments.
     * @example
     * // Update many AssetAssignments
     * const assetAssignment = await prisma.assetAssignment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AssetAssignments and only return the `id`
     * const assetAssignmentWithIdOnly = await prisma.assetAssignment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AssetAssignmentUpdateManyAndReturnArgs>(args: SelectSubset<T, AssetAssignmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AssetAssignment.
     * @param {AssetAssignmentUpsertArgs} args - Arguments to update or create a AssetAssignment.
     * @example
     * // Update or create a AssetAssignment
     * const assetAssignment = await prisma.assetAssignment.upsert({
     *   create: {
     *     // ... data to create a AssetAssignment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssetAssignment we want to update
     *   }
     * })
     */
    upsert<T extends AssetAssignmentUpsertArgs>(args: SelectSubset<T, AssetAssignmentUpsertArgs<ExtArgs>>): Prisma__AssetAssignmentClient<$Result.GetResult<Prisma.$AssetAssignmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AssetAssignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAssignmentCountArgs} args - Arguments to filter AssetAssignments to count.
     * @example
     * // Count the number of AssetAssignments
     * const count = await prisma.assetAssignment.count({
     *   where: {
     *     // ... the filter for the AssetAssignments we want to count
     *   }
     * })
    **/
    count<T extends AssetAssignmentCountArgs>(
      args?: Subset<T, AssetAssignmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetAssignmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AssetAssignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAssignmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetAssignmentAggregateArgs>(args: Subset<T, AssetAssignmentAggregateArgs>): Prisma.PrismaPromise<GetAssetAssignmentAggregateType<T>>

    /**
     * Group by AssetAssignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAssignmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetAssignmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetAssignmentGroupByArgs['orderBy'] }
        : { orderBy?: AssetAssignmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetAssignmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetAssignmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AssetAssignment model
   */
  readonly fields: AssetAssignmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AssetAssignment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetAssignmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserProfileDefaultArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AssetAssignment model
   */
  interface AssetAssignmentFieldRefs {
    readonly id: FieldRef<"AssetAssignment", 'String'>
    readonly userId: FieldRef<"AssetAssignment", 'String'>
    readonly assetId: FieldRef<"AssetAssignment", 'String'>
    readonly assetType: FieldRef<"AssetAssignment", 'AssetType'>
    readonly assetName: FieldRef<"AssetAssignment", 'String'>
    readonly assetCategory: FieldRef<"AssetAssignment", 'String'>
    readonly assignedAt: FieldRef<"AssetAssignment", 'DateTime'>
    readonly assignedBy: FieldRef<"AssetAssignment", 'String'>
    readonly unassignedAt: FieldRef<"AssetAssignment", 'DateTime'>
    readonly unassignedBy: FieldRef<"AssetAssignment", 'String'>
    readonly status: FieldRef<"AssetAssignment", 'AssetStatus'>
    readonly complianceStatus: FieldRef<"AssetAssignment", 'ComplianceStatus'>
    readonly lastCheckAt: FieldRef<"AssetAssignment", 'DateTime'>
    readonly notes: FieldRef<"AssetAssignment", 'String'>
    readonly metadata: FieldRef<"AssetAssignment", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * AssetAssignment findUnique
   */
  export type AssetAssignmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which AssetAssignment to fetch.
     */
    where: AssetAssignmentWhereUniqueInput
  }

  /**
   * AssetAssignment findUniqueOrThrow
   */
  export type AssetAssignmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which AssetAssignment to fetch.
     */
    where: AssetAssignmentWhereUniqueInput
  }

  /**
   * AssetAssignment findFirst
   */
  export type AssetAssignmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which AssetAssignment to fetch.
     */
    where?: AssetAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetAssignments to fetch.
     */
    orderBy?: AssetAssignmentOrderByWithRelationInput | AssetAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetAssignments.
     */
    cursor?: AssetAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetAssignments.
     */
    distinct?: AssetAssignmentScalarFieldEnum | AssetAssignmentScalarFieldEnum[]
  }

  /**
   * AssetAssignment findFirstOrThrow
   */
  export type AssetAssignmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which AssetAssignment to fetch.
     */
    where?: AssetAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetAssignments to fetch.
     */
    orderBy?: AssetAssignmentOrderByWithRelationInput | AssetAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetAssignments.
     */
    cursor?: AssetAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetAssignments.
     */
    distinct?: AssetAssignmentScalarFieldEnum | AssetAssignmentScalarFieldEnum[]
  }

  /**
   * AssetAssignment findMany
   */
  export type AssetAssignmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which AssetAssignments to fetch.
     */
    where?: AssetAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetAssignments to fetch.
     */
    orderBy?: AssetAssignmentOrderByWithRelationInput | AssetAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AssetAssignments.
     */
    cursor?: AssetAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetAssignments.
     */
    skip?: number
    distinct?: AssetAssignmentScalarFieldEnum | AssetAssignmentScalarFieldEnum[]
  }

  /**
   * AssetAssignment create
   */
  export type AssetAssignmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    /**
     * The data needed to create a AssetAssignment.
     */
    data: XOR<AssetAssignmentCreateInput, AssetAssignmentUncheckedCreateInput>
  }

  /**
   * AssetAssignment createMany
   */
  export type AssetAssignmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssetAssignments.
     */
    data: AssetAssignmentCreateManyInput | AssetAssignmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssetAssignment createManyAndReturn
   */
  export type AssetAssignmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * The data used to create many AssetAssignments.
     */
    data: AssetAssignmentCreateManyInput | AssetAssignmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AssetAssignment update
   */
  export type AssetAssignmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    /**
     * The data needed to update a AssetAssignment.
     */
    data: XOR<AssetAssignmentUpdateInput, AssetAssignmentUncheckedUpdateInput>
    /**
     * Choose, which AssetAssignment to update.
     */
    where: AssetAssignmentWhereUniqueInput
  }

  /**
   * AssetAssignment updateMany
   */
  export type AssetAssignmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AssetAssignments.
     */
    data: XOR<AssetAssignmentUpdateManyMutationInput, AssetAssignmentUncheckedUpdateManyInput>
    /**
     * Filter which AssetAssignments to update
     */
    where?: AssetAssignmentWhereInput
    /**
     * Limit how many AssetAssignments to update.
     */
    limit?: number
  }

  /**
   * AssetAssignment updateManyAndReturn
   */
  export type AssetAssignmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * The data used to update AssetAssignments.
     */
    data: XOR<AssetAssignmentUpdateManyMutationInput, AssetAssignmentUncheckedUpdateManyInput>
    /**
     * Filter which AssetAssignments to update
     */
    where?: AssetAssignmentWhereInput
    /**
     * Limit how many AssetAssignments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AssetAssignment upsert
   */
  export type AssetAssignmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    /**
     * The filter to search for the AssetAssignment to update in case it exists.
     */
    where: AssetAssignmentWhereUniqueInput
    /**
     * In case the AssetAssignment found by the `where` argument doesn't exist, create a new AssetAssignment with this data.
     */
    create: XOR<AssetAssignmentCreateInput, AssetAssignmentUncheckedCreateInput>
    /**
     * In case the AssetAssignment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetAssignmentUpdateInput, AssetAssignmentUncheckedUpdateInput>
  }

  /**
   * AssetAssignment delete
   */
  export type AssetAssignmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
    /**
     * Filter which AssetAssignment to delete.
     */
    where: AssetAssignmentWhereUniqueInput
  }

  /**
   * AssetAssignment deleteMany
   */
  export type AssetAssignmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetAssignments to delete
     */
    where?: AssetAssignmentWhereInput
    /**
     * Limit how many AssetAssignments to delete.
     */
    limit?: number
  }

  /**
   * AssetAssignment without action
   */
  export type AssetAssignmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetAssignment
     */
    select?: AssetAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssetAssignment
     */
    omit?: AssetAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetAssignmentInclude<ExtArgs> | null
  }


  /**
   * Model UserTicket
   */

  export type AggregateUserTicket = {
    _count: UserTicketCountAggregateOutputType | null
    _min: UserTicketMinAggregateOutputType | null
    _max: UserTicketMaxAggregateOutputType | null
  }

  export type UserTicketMinAggregateOutputType = {
    id: string | null
    userId: string | null
    ticketId: string | null
    ticketNumber: string | null
    relationship: $Enums.TicketRelationship | null
    title: string | null
    status: string | null
    priority: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserTicketMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    ticketId: string | null
    ticketNumber: string | null
    relationship: $Enums.TicketRelationship | null
    title: string | null
    status: string | null
    priority: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserTicketCountAggregateOutputType = {
    id: number
    userId: number
    ticketId: number
    ticketNumber: number
    relationship: number
    title: number
    status: number
    priority: number
    category: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserTicketMinAggregateInputType = {
    id?: true
    userId?: true
    ticketId?: true
    ticketNumber?: true
    relationship?: true
    title?: true
    status?: true
    priority?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserTicketMaxAggregateInputType = {
    id?: true
    userId?: true
    ticketId?: true
    ticketNumber?: true
    relationship?: true
    title?: true
    status?: true
    priority?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserTicketCountAggregateInputType = {
    id?: true
    userId?: true
    ticketId?: true
    ticketNumber?: true
    relationship?: true
    title?: true
    status?: true
    priority?: true
    category?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserTicketAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTicket to aggregate.
     */
    where?: UserTicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTickets to fetch.
     */
    orderBy?: UserTicketOrderByWithRelationInput | UserTicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserTicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserTickets
    **/
    _count?: true | UserTicketCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserTicketMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserTicketMaxAggregateInputType
  }

  export type GetUserTicketAggregateType<T extends UserTicketAggregateArgs> = {
        [P in keyof T & keyof AggregateUserTicket]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserTicket[P]>
      : GetScalarType<T[P], AggregateUserTicket[P]>
  }




  export type UserTicketGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTicketWhereInput
    orderBy?: UserTicketOrderByWithAggregationInput | UserTicketOrderByWithAggregationInput[]
    by: UserTicketScalarFieldEnum[] | UserTicketScalarFieldEnum
    having?: UserTicketScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserTicketCountAggregateInputType | true
    _min?: UserTicketMinAggregateInputType
    _max?: UserTicketMaxAggregateInputType
  }

  export type UserTicketGroupByOutputType = {
    id: string
    userId: string
    ticketId: string
    ticketNumber: string
    relationship: $Enums.TicketRelationship
    title: string
    status: string
    priority: string
    category: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserTicketCountAggregateOutputType | null
    _min: UserTicketMinAggregateOutputType | null
    _max: UserTicketMaxAggregateOutputType | null
  }

  type GetUserTicketGroupByPayload<T extends UserTicketGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserTicketGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserTicketGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserTicketGroupByOutputType[P]>
            : GetScalarType<T[P], UserTicketGroupByOutputType[P]>
        }
      >
    >


  export type UserTicketSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    ticketId?: boolean
    ticketNumber?: boolean
    relationship?: boolean
    title?: boolean
    status?: boolean
    priority?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTicket"]>

  export type UserTicketSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    ticketId?: boolean
    ticketNumber?: boolean
    relationship?: boolean
    title?: boolean
    status?: boolean
    priority?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTicket"]>

  export type UserTicketSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    ticketId?: boolean
    ticketNumber?: boolean
    relationship?: boolean
    title?: boolean
    status?: boolean
    priority?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTicket"]>

  export type UserTicketSelectScalar = {
    id?: boolean
    userId?: boolean
    ticketId?: boolean
    ticketNumber?: boolean
    relationship?: boolean
    title?: boolean
    status?: boolean
    priority?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserTicketOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "ticketId" | "ticketNumber" | "relationship" | "title" | "status" | "priority" | "category" | "createdAt" | "updatedAt", ExtArgs["result"]["userTicket"]>
  export type UserTicketInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type UserTicketIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type UserTicketIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }

  export type $UserTicketPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserTicket"
    objects: {
      user: Prisma.$UserProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      ticketId: string
      ticketNumber: string
      relationship: $Enums.TicketRelationship
      title: string
      status: string
      priority: string
      category: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userTicket"]>
    composites: {}
  }

  type UserTicketGetPayload<S extends boolean | null | undefined | UserTicketDefaultArgs> = $Result.GetResult<Prisma.$UserTicketPayload, S>

  type UserTicketCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserTicketFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserTicketCountAggregateInputType | true
    }

  export interface UserTicketDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserTicket'], meta: { name: 'UserTicket' } }
    /**
     * Find zero or one UserTicket that matches the filter.
     * @param {UserTicketFindUniqueArgs} args - Arguments to find a UserTicket
     * @example
     * // Get one UserTicket
     * const userTicket = await prisma.userTicket.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserTicketFindUniqueArgs>(args: SelectSubset<T, UserTicketFindUniqueArgs<ExtArgs>>): Prisma__UserTicketClient<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserTicket that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserTicketFindUniqueOrThrowArgs} args - Arguments to find a UserTicket
     * @example
     * // Get one UserTicket
     * const userTicket = await prisma.userTicket.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserTicketFindUniqueOrThrowArgs>(args: SelectSubset<T, UserTicketFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserTicketClient<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTicket that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTicketFindFirstArgs} args - Arguments to find a UserTicket
     * @example
     * // Get one UserTicket
     * const userTicket = await prisma.userTicket.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserTicketFindFirstArgs>(args?: SelectSubset<T, UserTicketFindFirstArgs<ExtArgs>>): Prisma__UserTicketClient<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTicket that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTicketFindFirstOrThrowArgs} args - Arguments to find a UserTicket
     * @example
     * // Get one UserTicket
     * const userTicket = await prisma.userTicket.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserTicketFindFirstOrThrowArgs>(args?: SelectSubset<T, UserTicketFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserTicketClient<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserTickets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTicketFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserTickets
     * const userTickets = await prisma.userTicket.findMany()
     * 
     * // Get first 10 UserTickets
     * const userTickets = await prisma.userTicket.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userTicketWithIdOnly = await prisma.userTicket.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserTicketFindManyArgs>(args?: SelectSubset<T, UserTicketFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserTicket.
     * @param {UserTicketCreateArgs} args - Arguments to create a UserTicket.
     * @example
     * // Create one UserTicket
     * const UserTicket = await prisma.userTicket.create({
     *   data: {
     *     // ... data to create a UserTicket
     *   }
     * })
     * 
     */
    create<T extends UserTicketCreateArgs>(args: SelectSubset<T, UserTicketCreateArgs<ExtArgs>>): Prisma__UserTicketClient<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserTickets.
     * @param {UserTicketCreateManyArgs} args - Arguments to create many UserTickets.
     * @example
     * // Create many UserTickets
     * const userTicket = await prisma.userTicket.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserTicketCreateManyArgs>(args?: SelectSubset<T, UserTicketCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserTickets and returns the data saved in the database.
     * @param {UserTicketCreateManyAndReturnArgs} args - Arguments to create many UserTickets.
     * @example
     * // Create many UserTickets
     * const userTicket = await prisma.userTicket.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserTickets and only return the `id`
     * const userTicketWithIdOnly = await prisma.userTicket.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserTicketCreateManyAndReturnArgs>(args?: SelectSubset<T, UserTicketCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserTicket.
     * @param {UserTicketDeleteArgs} args - Arguments to delete one UserTicket.
     * @example
     * // Delete one UserTicket
     * const UserTicket = await prisma.userTicket.delete({
     *   where: {
     *     // ... filter to delete one UserTicket
     *   }
     * })
     * 
     */
    delete<T extends UserTicketDeleteArgs>(args: SelectSubset<T, UserTicketDeleteArgs<ExtArgs>>): Prisma__UserTicketClient<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserTicket.
     * @param {UserTicketUpdateArgs} args - Arguments to update one UserTicket.
     * @example
     * // Update one UserTicket
     * const userTicket = await prisma.userTicket.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserTicketUpdateArgs>(args: SelectSubset<T, UserTicketUpdateArgs<ExtArgs>>): Prisma__UserTicketClient<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserTickets.
     * @param {UserTicketDeleteManyArgs} args - Arguments to filter UserTickets to delete.
     * @example
     * // Delete a few UserTickets
     * const { count } = await prisma.userTicket.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserTicketDeleteManyArgs>(args?: SelectSubset<T, UserTicketDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTicketUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserTickets
     * const userTicket = await prisma.userTicket.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserTicketUpdateManyArgs>(args: SelectSubset<T, UserTicketUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTickets and returns the data updated in the database.
     * @param {UserTicketUpdateManyAndReturnArgs} args - Arguments to update many UserTickets.
     * @example
     * // Update many UserTickets
     * const userTicket = await prisma.userTicket.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserTickets and only return the `id`
     * const userTicketWithIdOnly = await prisma.userTicket.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserTicketUpdateManyAndReturnArgs>(args: SelectSubset<T, UserTicketUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserTicket.
     * @param {UserTicketUpsertArgs} args - Arguments to update or create a UserTicket.
     * @example
     * // Update or create a UserTicket
     * const userTicket = await prisma.userTicket.upsert({
     *   create: {
     *     // ... data to create a UserTicket
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserTicket we want to update
     *   }
     * })
     */
    upsert<T extends UserTicketUpsertArgs>(args: SelectSubset<T, UserTicketUpsertArgs<ExtArgs>>): Prisma__UserTicketClient<$Result.GetResult<Prisma.$UserTicketPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserTickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTicketCountArgs} args - Arguments to filter UserTickets to count.
     * @example
     * // Count the number of UserTickets
     * const count = await prisma.userTicket.count({
     *   where: {
     *     // ... the filter for the UserTickets we want to count
     *   }
     * })
    **/
    count<T extends UserTicketCountArgs>(
      args?: Subset<T, UserTicketCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserTicketCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserTicket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTicketAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserTicketAggregateArgs>(args: Subset<T, UserTicketAggregateArgs>): Prisma.PrismaPromise<GetUserTicketAggregateType<T>>

    /**
     * Group by UserTicket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTicketGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserTicketGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserTicketGroupByArgs['orderBy'] }
        : { orderBy?: UserTicketGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserTicketGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserTicketGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserTicket model
   */
  readonly fields: UserTicketFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserTicket.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserTicketClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserProfileDefaultArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserTicket model
   */
  interface UserTicketFieldRefs {
    readonly id: FieldRef<"UserTicket", 'String'>
    readonly userId: FieldRef<"UserTicket", 'String'>
    readonly ticketId: FieldRef<"UserTicket", 'String'>
    readonly ticketNumber: FieldRef<"UserTicket", 'String'>
    readonly relationship: FieldRef<"UserTicket", 'TicketRelationship'>
    readonly title: FieldRef<"UserTicket", 'String'>
    readonly status: FieldRef<"UserTicket", 'String'>
    readonly priority: FieldRef<"UserTicket", 'String'>
    readonly category: FieldRef<"UserTicket", 'String'>
    readonly createdAt: FieldRef<"UserTicket", 'DateTime'>
    readonly updatedAt: FieldRef<"UserTicket", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserTicket findUnique
   */
  export type UserTicketFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    /**
     * Filter, which UserTicket to fetch.
     */
    where: UserTicketWhereUniqueInput
  }

  /**
   * UserTicket findUniqueOrThrow
   */
  export type UserTicketFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    /**
     * Filter, which UserTicket to fetch.
     */
    where: UserTicketWhereUniqueInput
  }

  /**
   * UserTicket findFirst
   */
  export type UserTicketFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    /**
     * Filter, which UserTicket to fetch.
     */
    where?: UserTicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTickets to fetch.
     */
    orderBy?: UserTicketOrderByWithRelationInput | UserTicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTickets.
     */
    cursor?: UserTicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTickets.
     */
    distinct?: UserTicketScalarFieldEnum | UserTicketScalarFieldEnum[]
  }

  /**
   * UserTicket findFirstOrThrow
   */
  export type UserTicketFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    /**
     * Filter, which UserTicket to fetch.
     */
    where?: UserTicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTickets to fetch.
     */
    orderBy?: UserTicketOrderByWithRelationInput | UserTicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTickets.
     */
    cursor?: UserTicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTickets.
     */
    distinct?: UserTicketScalarFieldEnum | UserTicketScalarFieldEnum[]
  }

  /**
   * UserTicket findMany
   */
  export type UserTicketFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    /**
     * Filter, which UserTickets to fetch.
     */
    where?: UserTicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTickets to fetch.
     */
    orderBy?: UserTicketOrderByWithRelationInput | UserTicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserTickets.
     */
    cursor?: UserTicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTickets.
     */
    skip?: number
    distinct?: UserTicketScalarFieldEnum | UserTicketScalarFieldEnum[]
  }

  /**
   * UserTicket create
   */
  export type UserTicketCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    /**
     * The data needed to create a UserTicket.
     */
    data: XOR<UserTicketCreateInput, UserTicketUncheckedCreateInput>
  }

  /**
   * UserTicket createMany
   */
  export type UserTicketCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserTickets.
     */
    data: UserTicketCreateManyInput | UserTicketCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserTicket createManyAndReturn
   */
  export type UserTicketCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * The data used to create many UserTickets.
     */
    data: UserTicketCreateManyInput | UserTicketCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTicket update
   */
  export type UserTicketUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    /**
     * The data needed to update a UserTicket.
     */
    data: XOR<UserTicketUpdateInput, UserTicketUncheckedUpdateInput>
    /**
     * Choose, which UserTicket to update.
     */
    where: UserTicketWhereUniqueInput
  }

  /**
   * UserTicket updateMany
   */
  export type UserTicketUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserTickets.
     */
    data: XOR<UserTicketUpdateManyMutationInput, UserTicketUncheckedUpdateManyInput>
    /**
     * Filter which UserTickets to update
     */
    where?: UserTicketWhereInput
    /**
     * Limit how many UserTickets to update.
     */
    limit?: number
  }

  /**
   * UserTicket updateManyAndReturn
   */
  export type UserTicketUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * The data used to update UserTickets.
     */
    data: XOR<UserTicketUpdateManyMutationInput, UserTicketUncheckedUpdateManyInput>
    /**
     * Filter which UserTickets to update
     */
    where?: UserTicketWhereInput
    /**
     * Limit how many UserTickets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTicket upsert
   */
  export type UserTicketUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    /**
     * The filter to search for the UserTicket to update in case it exists.
     */
    where: UserTicketWhereUniqueInput
    /**
     * In case the UserTicket found by the `where` argument doesn't exist, create a new UserTicket with this data.
     */
    create: XOR<UserTicketCreateInput, UserTicketUncheckedCreateInput>
    /**
     * In case the UserTicket was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserTicketUpdateInput, UserTicketUncheckedUpdateInput>
  }

  /**
   * UserTicket delete
   */
  export type UserTicketDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
    /**
     * Filter which UserTicket to delete.
     */
    where: UserTicketWhereUniqueInput
  }

  /**
   * UserTicket deleteMany
   */
  export type UserTicketDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTickets to delete
     */
    where?: UserTicketWhereInput
    /**
     * Limit how many UserTickets to delete.
     */
    limit?: number
  }

  /**
   * UserTicket without action
   */
  export type UserTicketDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTicket
     */
    select?: UserTicketSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTicket
     */
    omit?: UserTicketOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTicketInclude<ExtArgs> | null
  }


  /**
   * Model ActivityLog
   */

  export type AggregateActivityLog = {
    _count: ActivityLogCountAggregateOutputType | null
    _avg: ActivityLogAvgAggregateOutputType | null
    _sum: ActivityLogSumAggregateOutputType | null
    _min: ActivityLogMinAggregateOutputType | null
    _max: ActivityLogMaxAggregateOutputType | null
  }

  export type ActivityLogAvgAggregateOutputType = {
    riskScore: number | null
  }

  export type ActivityLogSumAggregateOutputType = {
    riskScore: number | null
  }

  export type ActivityLogMinAggregateOutputType = {
    id: string | null
    userId: string | null
    activity: string | null
    source: string | null
    ipAddress: string | null
    userAgent: string | null
    location: string | null
    outcome: $Enums.ActivityOutcome | null
    riskScore: number | null
    sessionId: string | null
    correlationId: string | null
    timestamp: Date | null
    retentionDate: Date | null
  }

  export type ActivityLogMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    activity: string | null
    source: string | null
    ipAddress: string | null
    userAgent: string | null
    location: string | null
    outcome: $Enums.ActivityOutcome | null
    riskScore: number | null
    sessionId: string | null
    correlationId: string | null
    timestamp: Date | null
    retentionDate: Date | null
  }

  export type ActivityLogCountAggregateOutputType = {
    id: number
    userId: number
    activity: number
    source: number
    ipAddress: number
    userAgent: number
    location: number
    details: number
    outcome: number
    riskScore: number
    sessionId: number
    correlationId: number
    timestamp: number
    retentionDate: number
    _all: number
  }


  export type ActivityLogAvgAggregateInputType = {
    riskScore?: true
  }

  export type ActivityLogSumAggregateInputType = {
    riskScore?: true
  }

  export type ActivityLogMinAggregateInputType = {
    id?: true
    userId?: true
    activity?: true
    source?: true
    ipAddress?: true
    userAgent?: true
    location?: true
    outcome?: true
    riskScore?: true
    sessionId?: true
    correlationId?: true
    timestamp?: true
    retentionDate?: true
  }

  export type ActivityLogMaxAggregateInputType = {
    id?: true
    userId?: true
    activity?: true
    source?: true
    ipAddress?: true
    userAgent?: true
    location?: true
    outcome?: true
    riskScore?: true
    sessionId?: true
    correlationId?: true
    timestamp?: true
    retentionDate?: true
  }

  export type ActivityLogCountAggregateInputType = {
    id?: true
    userId?: true
    activity?: true
    source?: true
    ipAddress?: true
    userAgent?: true
    location?: true
    details?: true
    outcome?: true
    riskScore?: true
    sessionId?: true
    correlationId?: true
    timestamp?: true
    retentionDate?: true
    _all?: true
  }

  export type ActivityLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityLog to aggregate.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ActivityLogs
    **/
    _count?: true | ActivityLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ActivityLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ActivityLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ActivityLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ActivityLogMaxAggregateInputType
  }

  export type GetActivityLogAggregateType<T extends ActivityLogAggregateArgs> = {
        [P in keyof T & keyof AggregateActivityLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateActivityLog[P]>
      : GetScalarType<T[P], AggregateActivityLog[P]>
  }




  export type ActivityLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityLogWhereInput
    orderBy?: ActivityLogOrderByWithAggregationInput | ActivityLogOrderByWithAggregationInput[]
    by: ActivityLogScalarFieldEnum[] | ActivityLogScalarFieldEnum
    having?: ActivityLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ActivityLogCountAggregateInputType | true
    _avg?: ActivityLogAvgAggregateInputType
    _sum?: ActivityLogSumAggregateInputType
    _min?: ActivityLogMinAggregateInputType
    _max?: ActivityLogMaxAggregateInputType
  }

  export type ActivityLogGroupByOutputType = {
    id: string
    userId: string
    activity: string
    source: string
    ipAddress: string | null
    userAgent: string | null
    location: string | null
    details: JsonValue | null
    outcome: $Enums.ActivityOutcome
    riskScore: number | null
    sessionId: string | null
    correlationId: string | null
    timestamp: Date
    retentionDate: Date | null
    _count: ActivityLogCountAggregateOutputType | null
    _avg: ActivityLogAvgAggregateOutputType | null
    _sum: ActivityLogSumAggregateOutputType | null
    _min: ActivityLogMinAggregateOutputType | null
    _max: ActivityLogMaxAggregateOutputType | null
  }

  type GetActivityLogGroupByPayload<T extends ActivityLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ActivityLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ActivityLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ActivityLogGroupByOutputType[P]>
            : GetScalarType<T[P], ActivityLogGroupByOutputType[P]>
        }
      >
    >


  export type ActivityLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    activity?: boolean
    source?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    location?: boolean
    details?: boolean
    outcome?: boolean
    riskScore?: boolean
    sessionId?: boolean
    correlationId?: boolean
    timestamp?: boolean
    retentionDate?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activityLog"]>

  export type ActivityLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    activity?: boolean
    source?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    location?: boolean
    details?: boolean
    outcome?: boolean
    riskScore?: boolean
    sessionId?: boolean
    correlationId?: boolean
    timestamp?: boolean
    retentionDate?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activityLog"]>

  export type ActivityLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    activity?: boolean
    source?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    location?: boolean
    details?: boolean
    outcome?: boolean
    riskScore?: boolean
    sessionId?: boolean
    correlationId?: boolean
    timestamp?: boolean
    retentionDate?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activityLog"]>

  export type ActivityLogSelectScalar = {
    id?: boolean
    userId?: boolean
    activity?: boolean
    source?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    location?: boolean
    details?: boolean
    outcome?: boolean
    riskScore?: boolean
    sessionId?: boolean
    correlationId?: boolean
    timestamp?: boolean
    retentionDate?: boolean
  }

  export type ActivityLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "activity" | "source" | "ipAddress" | "userAgent" | "location" | "details" | "outcome" | "riskScore" | "sessionId" | "correlationId" | "timestamp" | "retentionDate", ExtArgs["result"]["activityLog"]>
  export type ActivityLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type ActivityLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type ActivityLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }

  export type $ActivityLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ActivityLog"
    objects: {
      user: Prisma.$UserProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      activity: string
      source: string
      ipAddress: string | null
      userAgent: string | null
      location: string | null
      details: Prisma.JsonValue | null
      outcome: $Enums.ActivityOutcome
      riskScore: number | null
      sessionId: string | null
      correlationId: string | null
      timestamp: Date
      retentionDate: Date | null
    }, ExtArgs["result"]["activityLog"]>
    composites: {}
  }

  type ActivityLogGetPayload<S extends boolean | null | undefined | ActivityLogDefaultArgs> = $Result.GetResult<Prisma.$ActivityLogPayload, S>

  type ActivityLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ActivityLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ActivityLogCountAggregateInputType | true
    }

  export interface ActivityLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ActivityLog'], meta: { name: 'ActivityLog' } }
    /**
     * Find zero or one ActivityLog that matches the filter.
     * @param {ActivityLogFindUniqueArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActivityLogFindUniqueArgs>(args: SelectSubset<T, ActivityLogFindUniqueArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ActivityLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ActivityLogFindUniqueOrThrowArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActivityLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ActivityLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogFindFirstArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActivityLogFindFirstArgs>(args?: SelectSubset<T, ActivityLogFindFirstArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogFindFirstOrThrowArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActivityLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ActivityLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ActivityLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ActivityLogs
     * const activityLogs = await prisma.activityLog.findMany()
     * 
     * // Get first 10 ActivityLogs
     * const activityLogs = await prisma.activityLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const activityLogWithIdOnly = await prisma.activityLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ActivityLogFindManyArgs>(args?: SelectSubset<T, ActivityLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ActivityLog.
     * @param {ActivityLogCreateArgs} args - Arguments to create a ActivityLog.
     * @example
     * // Create one ActivityLog
     * const ActivityLog = await prisma.activityLog.create({
     *   data: {
     *     // ... data to create a ActivityLog
     *   }
     * })
     * 
     */
    create<T extends ActivityLogCreateArgs>(args: SelectSubset<T, ActivityLogCreateArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ActivityLogs.
     * @param {ActivityLogCreateManyArgs} args - Arguments to create many ActivityLogs.
     * @example
     * // Create many ActivityLogs
     * const activityLog = await prisma.activityLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ActivityLogCreateManyArgs>(args?: SelectSubset<T, ActivityLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ActivityLogs and returns the data saved in the database.
     * @param {ActivityLogCreateManyAndReturnArgs} args - Arguments to create many ActivityLogs.
     * @example
     * // Create many ActivityLogs
     * const activityLog = await prisma.activityLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ActivityLogs and only return the `id`
     * const activityLogWithIdOnly = await prisma.activityLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ActivityLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ActivityLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ActivityLog.
     * @param {ActivityLogDeleteArgs} args - Arguments to delete one ActivityLog.
     * @example
     * // Delete one ActivityLog
     * const ActivityLog = await prisma.activityLog.delete({
     *   where: {
     *     // ... filter to delete one ActivityLog
     *   }
     * })
     * 
     */
    delete<T extends ActivityLogDeleteArgs>(args: SelectSubset<T, ActivityLogDeleteArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ActivityLog.
     * @param {ActivityLogUpdateArgs} args - Arguments to update one ActivityLog.
     * @example
     * // Update one ActivityLog
     * const activityLog = await prisma.activityLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ActivityLogUpdateArgs>(args: SelectSubset<T, ActivityLogUpdateArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ActivityLogs.
     * @param {ActivityLogDeleteManyArgs} args - Arguments to filter ActivityLogs to delete.
     * @example
     * // Delete a few ActivityLogs
     * const { count } = await prisma.activityLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ActivityLogDeleteManyArgs>(args?: SelectSubset<T, ActivityLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivityLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ActivityLogs
     * const activityLog = await prisma.activityLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ActivityLogUpdateManyArgs>(args: SelectSubset<T, ActivityLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivityLogs and returns the data updated in the database.
     * @param {ActivityLogUpdateManyAndReturnArgs} args - Arguments to update many ActivityLogs.
     * @example
     * // Update many ActivityLogs
     * const activityLog = await prisma.activityLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ActivityLogs and only return the `id`
     * const activityLogWithIdOnly = await prisma.activityLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ActivityLogUpdateManyAndReturnArgs>(args: SelectSubset<T, ActivityLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ActivityLog.
     * @param {ActivityLogUpsertArgs} args - Arguments to update or create a ActivityLog.
     * @example
     * // Update or create a ActivityLog
     * const activityLog = await prisma.activityLog.upsert({
     *   create: {
     *     // ... data to create a ActivityLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ActivityLog we want to update
     *   }
     * })
     */
    upsert<T extends ActivityLogUpsertArgs>(args: SelectSubset<T, ActivityLogUpsertArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ActivityLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogCountArgs} args - Arguments to filter ActivityLogs to count.
     * @example
     * // Count the number of ActivityLogs
     * const count = await prisma.activityLog.count({
     *   where: {
     *     // ... the filter for the ActivityLogs we want to count
     *   }
     * })
    **/
    count<T extends ActivityLogCountArgs>(
      args?: Subset<T, ActivityLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ActivityLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ActivityLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ActivityLogAggregateArgs>(args: Subset<T, ActivityLogAggregateArgs>): Prisma.PrismaPromise<GetActivityLogAggregateType<T>>

    /**
     * Group by ActivityLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ActivityLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ActivityLogGroupByArgs['orderBy'] }
        : { orderBy?: ActivityLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ActivityLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActivityLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ActivityLog model
   */
  readonly fields: ActivityLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ActivityLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ActivityLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserProfileDefaultArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ActivityLog model
   */
  interface ActivityLogFieldRefs {
    readonly id: FieldRef<"ActivityLog", 'String'>
    readonly userId: FieldRef<"ActivityLog", 'String'>
    readonly activity: FieldRef<"ActivityLog", 'String'>
    readonly source: FieldRef<"ActivityLog", 'String'>
    readonly ipAddress: FieldRef<"ActivityLog", 'String'>
    readonly userAgent: FieldRef<"ActivityLog", 'String'>
    readonly location: FieldRef<"ActivityLog", 'String'>
    readonly details: FieldRef<"ActivityLog", 'Json'>
    readonly outcome: FieldRef<"ActivityLog", 'ActivityOutcome'>
    readonly riskScore: FieldRef<"ActivityLog", 'Int'>
    readonly sessionId: FieldRef<"ActivityLog", 'String'>
    readonly correlationId: FieldRef<"ActivityLog", 'String'>
    readonly timestamp: FieldRef<"ActivityLog", 'DateTime'>
    readonly retentionDate: FieldRef<"ActivityLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ActivityLog findUnique
   */
  export type ActivityLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog findUniqueOrThrow
   */
  export type ActivityLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog findFirst
   */
  export type ActivityLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityLogs.
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityLogs.
     */
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * ActivityLog findFirstOrThrow
   */
  export type ActivityLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityLogs.
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityLogs.
     */
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * ActivityLog findMany
   */
  export type ActivityLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter, which ActivityLogs to fetch.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ActivityLogs.
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * ActivityLog create
   */
  export type ActivityLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * The data needed to create a ActivityLog.
     */
    data: XOR<ActivityLogCreateInput, ActivityLogUncheckedCreateInput>
  }

  /**
   * ActivityLog createMany
   */
  export type ActivityLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ActivityLogs.
     */
    data: ActivityLogCreateManyInput | ActivityLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ActivityLog createManyAndReturn
   */
  export type ActivityLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * The data used to create many ActivityLogs.
     */
    data: ActivityLogCreateManyInput | ActivityLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ActivityLog update
   */
  export type ActivityLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * The data needed to update a ActivityLog.
     */
    data: XOR<ActivityLogUpdateInput, ActivityLogUncheckedUpdateInput>
    /**
     * Choose, which ActivityLog to update.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog updateMany
   */
  export type ActivityLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ActivityLogs.
     */
    data: XOR<ActivityLogUpdateManyMutationInput, ActivityLogUncheckedUpdateManyInput>
    /**
     * Filter which ActivityLogs to update
     */
    where?: ActivityLogWhereInput
    /**
     * Limit how many ActivityLogs to update.
     */
    limit?: number
  }

  /**
   * ActivityLog updateManyAndReturn
   */
  export type ActivityLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * The data used to update ActivityLogs.
     */
    data: XOR<ActivityLogUpdateManyMutationInput, ActivityLogUncheckedUpdateManyInput>
    /**
     * Filter which ActivityLogs to update
     */
    where?: ActivityLogWhereInput
    /**
     * Limit how many ActivityLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ActivityLog upsert
   */
  export type ActivityLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * The filter to search for the ActivityLog to update in case it exists.
     */
    where: ActivityLogWhereUniqueInput
    /**
     * In case the ActivityLog found by the `where` argument doesn't exist, create a new ActivityLog with this data.
     */
    create: XOR<ActivityLogCreateInput, ActivityLogUncheckedCreateInput>
    /**
     * In case the ActivityLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ActivityLogUpdateInput, ActivityLogUncheckedUpdateInput>
  }

  /**
   * ActivityLog delete
   */
  export type ActivityLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
    /**
     * Filter which ActivityLog to delete.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog deleteMany
   */
  export type ActivityLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityLogs to delete
     */
    where?: ActivityLogWhereInput
    /**
     * Limit how many ActivityLogs to delete.
     */
    limit?: number
  }

  /**
   * ActivityLog without action
   */
  export type ActivityLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityLogInclude<ExtArgs> | null
  }


  /**
   * Model SecurityEvent
   */

  export type AggregateSecurityEvent = {
    _count: SecurityEventCountAggregateOutputType | null
    _min: SecurityEventMinAggregateOutputType | null
    _max: SecurityEventMaxAggregateOutputType | null
  }

  export type SecurityEventMinAggregateOutputType = {
    id: string | null
    userId: string | null
    eventType: string | null
    severity: $Enums.EventSeverity | null
    category: string | null
    description: string | null
    source: string | null
    ipAddress: string | null
    location: string | null
    status: $Enums.EventStatus | null
    assignedTo: string | null
    resolvedAt: Date | null
    resolution: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SecurityEventMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    eventType: string | null
    severity: $Enums.EventSeverity | null
    category: string | null
    description: string | null
    source: string | null
    ipAddress: string | null
    location: string | null
    status: $Enums.EventStatus | null
    assignedTo: string | null
    resolvedAt: Date | null
    resolution: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SecurityEventCountAggregateOutputType = {
    id: number
    userId: number
    eventType: number
    severity: number
    category: number
    description: number
    source: number
    ipAddress: number
    location: number
    status: number
    assignedTo: number
    resolvedAt: number
    resolution: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SecurityEventMinAggregateInputType = {
    id?: true
    userId?: true
    eventType?: true
    severity?: true
    category?: true
    description?: true
    source?: true
    ipAddress?: true
    location?: true
    status?: true
    assignedTo?: true
    resolvedAt?: true
    resolution?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SecurityEventMaxAggregateInputType = {
    id?: true
    userId?: true
    eventType?: true
    severity?: true
    category?: true
    description?: true
    source?: true
    ipAddress?: true
    location?: true
    status?: true
    assignedTo?: true
    resolvedAt?: true
    resolution?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SecurityEventCountAggregateInputType = {
    id?: true
    userId?: true
    eventType?: true
    severity?: true
    category?: true
    description?: true
    source?: true
    ipAddress?: true
    location?: true
    status?: true
    assignedTo?: true
    resolvedAt?: true
    resolution?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SecurityEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SecurityEvent to aggregate.
     */
    where?: SecurityEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SecurityEvents to fetch.
     */
    orderBy?: SecurityEventOrderByWithRelationInput | SecurityEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SecurityEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SecurityEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SecurityEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SecurityEvents
    **/
    _count?: true | SecurityEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SecurityEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SecurityEventMaxAggregateInputType
  }

  export type GetSecurityEventAggregateType<T extends SecurityEventAggregateArgs> = {
        [P in keyof T & keyof AggregateSecurityEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSecurityEvent[P]>
      : GetScalarType<T[P], AggregateSecurityEvent[P]>
  }




  export type SecurityEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SecurityEventWhereInput
    orderBy?: SecurityEventOrderByWithAggregationInput | SecurityEventOrderByWithAggregationInput[]
    by: SecurityEventScalarFieldEnum[] | SecurityEventScalarFieldEnum
    having?: SecurityEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SecurityEventCountAggregateInputType | true
    _min?: SecurityEventMinAggregateInputType
    _max?: SecurityEventMaxAggregateInputType
  }

  export type SecurityEventGroupByOutputType = {
    id: string
    userId: string
    eventType: string
    severity: $Enums.EventSeverity
    category: string
    description: string
    source: string
    ipAddress: string | null
    location: string | null
    status: $Enums.EventStatus
    assignedTo: string | null
    resolvedAt: Date | null
    resolution: string | null
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: SecurityEventCountAggregateOutputType | null
    _min: SecurityEventMinAggregateOutputType | null
    _max: SecurityEventMaxAggregateOutputType | null
  }

  type GetSecurityEventGroupByPayload<T extends SecurityEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SecurityEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SecurityEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SecurityEventGroupByOutputType[P]>
            : GetScalarType<T[P], SecurityEventGroupByOutputType[P]>
        }
      >
    >


  export type SecurityEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    eventType?: boolean
    severity?: boolean
    category?: boolean
    description?: boolean
    source?: boolean
    ipAddress?: boolean
    location?: boolean
    status?: boolean
    assignedTo?: boolean
    resolvedAt?: boolean
    resolution?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["securityEvent"]>

  export type SecurityEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    eventType?: boolean
    severity?: boolean
    category?: boolean
    description?: boolean
    source?: boolean
    ipAddress?: boolean
    location?: boolean
    status?: boolean
    assignedTo?: boolean
    resolvedAt?: boolean
    resolution?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["securityEvent"]>

  export type SecurityEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    eventType?: boolean
    severity?: boolean
    category?: boolean
    description?: boolean
    source?: boolean
    ipAddress?: boolean
    location?: boolean
    status?: boolean
    assignedTo?: boolean
    resolvedAt?: boolean
    resolution?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["securityEvent"]>

  export type SecurityEventSelectScalar = {
    id?: boolean
    userId?: boolean
    eventType?: boolean
    severity?: boolean
    category?: boolean
    description?: boolean
    source?: boolean
    ipAddress?: boolean
    location?: boolean
    status?: boolean
    assignedTo?: boolean
    resolvedAt?: boolean
    resolution?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SecurityEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "eventType" | "severity" | "category" | "description" | "source" | "ipAddress" | "location" | "status" | "assignedTo" | "resolvedAt" | "resolution" | "metadata" | "createdAt" | "updatedAt", ExtArgs["result"]["securityEvent"]>
  export type SecurityEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type SecurityEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type SecurityEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }

  export type $SecurityEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SecurityEvent"
    objects: {
      user: Prisma.$UserProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      eventType: string
      severity: $Enums.EventSeverity
      category: string
      description: string
      source: string
      ipAddress: string | null
      location: string | null
      status: $Enums.EventStatus
      assignedTo: string | null
      resolvedAt: Date | null
      resolution: string | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["securityEvent"]>
    composites: {}
  }

  type SecurityEventGetPayload<S extends boolean | null | undefined | SecurityEventDefaultArgs> = $Result.GetResult<Prisma.$SecurityEventPayload, S>

  type SecurityEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SecurityEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SecurityEventCountAggregateInputType | true
    }

  export interface SecurityEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SecurityEvent'], meta: { name: 'SecurityEvent' } }
    /**
     * Find zero or one SecurityEvent that matches the filter.
     * @param {SecurityEventFindUniqueArgs} args - Arguments to find a SecurityEvent
     * @example
     * // Get one SecurityEvent
     * const securityEvent = await prisma.securityEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SecurityEventFindUniqueArgs>(args: SelectSubset<T, SecurityEventFindUniqueArgs<ExtArgs>>): Prisma__SecurityEventClient<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SecurityEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SecurityEventFindUniqueOrThrowArgs} args - Arguments to find a SecurityEvent
     * @example
     * // Get one SecurityEvent
     * const securityEvent = await prisma.securityEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SecurityEventFindUniqueOrThrowArgs>(args: SelectSubset<T, SecurityEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SecurityEventClient<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SecurityEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityEventFindFirstArgs} args - Arguments to find a SecurityEvent
     * @example
     * // Get one SecurityEvent
     * const securityEvent = await prisma.securityEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SecurityEventFindFirstArgs>(args?: SelectSubset<T, SecurityEventFindFirstArgs<ExtArgs>>): Prisma__SecurityEventClient<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SecurityEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityEventFindFirstOrThrowArgs} args - Arguments to find a SecurityEvent
     * @example
     * // Get one SecurityEvent
     * const securityEvent = await prisma.securityEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SecurityEventFindFirstOrThrowArgs>(args?: SelectSubset<T, SecurityEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__SecurityEventClient<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SecurityEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SecurityEvents
     * const securityEvents = await prisma.securityEvent.findMany()
     * 
     * // Get first 10 SecurityEvents
     * const securityEvents = await prisma.securityEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const securityEventWithIdOnly = await prisma.securityEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SecurityEventFindManyArgs>(args?: SelectSubset<T, SecurityEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SecurityEvent.
     * @param {SecurityEventCreateArgs} args - Arguments to create a SecurityEvent.
     * @example
     * // Create one SecurityEvent
     * const SecurityEvent = await prisma.securityEvent.create({
     *   data: {
     *     // ... data to create a SecurityEvent
     *   }
     * })
     * 
     */
    create<T extends SecurityEventCreateArgs>(args: SelectSubset<T, SecurityEventCreateArgs<ExtArgs>>): Prisma__SecurityEventClient<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SecurityEvents.
     * @param {SecurityEventCreateManyArgs} args - Arguments to create many SecurityEvents.
     * @example
     * // Create many SecurityEvents
     * const securityEvent = await prisma.securityEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SecurityEventCreateManyArgs>(args?: SelectSubset<T, SecurityEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SecurityEvents and returns the data saved in the database.
     * @param {SecurityEventCreateManyAndReturnArgs} args - Arguments to create many SecurityEvents.
     * @example
     * // Create many SecurityEvents
     * const securityEvent = await prisma.securityEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SecurityEvents and only return the `id`
     * const securityEventWithIdOnly = await prisma.securityEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SecurityEventCreateManyAndReturnArgs>(args?: SelectSubset<T, SecurityEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SecurityEvent.
     * @param {SecurityEventDeleteArgs} args - Arguments to delete one SecurityEvent.
     * @example
     * // Delete one SecurityEvent
     * const SecurityEvent = await prisma.securityEvent.delete({
     *   where: {
     *     // ... filter to delete one SecurityEvent
     *   }
     * })
     * 
     */
    delete<T extends SecurityEventDeleteArgs>(args: SelectSubset<T, SecurityEventDeleteArgs<ExtArgs>>): Prisma__SecurityEventClient<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SecurityEvent.
     * @param {SecurityEventUpdateArgs} args - Arguments to update one SecurityEvent.
     * @example
     * // Update one SecurityEvent
     * const securityEvent = await prisma.securityEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SecurityEventUpdateArgs>(args: SelectSubset<T, SecurityEventUpdateArgs<ExtArgs>>): Prisma__SecurityEventClient<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SecurityEvents.
     * @param {SecurityEventDeleteManyArgs} args - Arguments to filter SecurityEvents to delete.
     * @example
     * // Delete a few SecurityEvents
     * const { count } = await prisma.securityEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SecurityEventDeleteManyArgs>(args?: SelectSubset<T, SecurityEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SecurityEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SecurityEvents
     * const securityEvent = await prisma.securityEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SecurityEventUpdateManyArgs>(args: SelectSubset<T, SecurityEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SecurityEvents and returns the data updated in the database.
     * @param {SecurityEventUpdateManyAndReturnArgs} args - Arguments to update many SecurityEvents.
     * @example
     * // Update many SecurityEvents
     * const securityEvent = await prisma.securityEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SecurityEvents and only return the `id`
     * const securityEventWithIdOnly = await prisma.securityEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SecurityEventUpdateManyAndReturnArgs>(args: SelectSubset<T, SecurityEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SecurityEvent.
     * @param {SecurityEventUpsertArgs} args - Arguments to update or create a SecurityEvent.
     * @example
     * // Update or create a SecurityEvent
     * const securityEvent = await prisma.securityEvent.upsert({
     *   create: {
     *     // ... data to create a SecurityEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SecurityEvent we want to update
     *   }
     * })
     */
    upsert<T extends SecurityEventUpsertArgs>(args: SelectSubset<T, SecurityEventUpsertArgs<ExtArgs>>): Prisma__SecurityEventClient<$Result.GetResult<Prisma.$SecurityEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SecurityEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityEventCountArgs} args - Arguments to filter SecurityEvents to count.
     * @example
     * // Count the number of SecurityEvents
     * const count = await prisma.securityEvent.count({
     *   where: {
     *     // ... the filter for the SecurityEvents we want to count
     *   }
     * })
    **/
    count<T extends SecurityEventCountArgs>(
      args?: Subset<T, SecurityEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SecurityEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SecurityEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SecurityEventAggregateArgs>(args: Subset<T, SecurityEventAggregateArgs>): Prisma.PrismaPromise<GetSecurityEventAggregateType<T>>

    /**
     * Group by SecurityEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SecurityEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SecurityEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SecurityEventGroupByArgs['orderBy'] }
        : { orderBy?: SecurityEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SecurityEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSecurityEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SecurityEvent model
   */
  readonly fields: SecurityEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SecurityEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SecurityEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserProfileDefaultArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SecurityEvent model
   */
  interface SecurityEventFieldRefs {
    readonly id: FieldRef<"SecurityEvent", 'String'>
    readonly userId: FieldRef<"SecurityEvent", 'String'>
    readonly eventType: FieldRef<"SecurityEvent", 'String'>
    readonly severity: FieldRef<"SecurityEvent", 'EventSeverity'>
    readonly category: FieldRef<"SecurityEvent", 'String'>
    readonly description: FieldRef<"SecurityEvent", 'String'>
    readonly source: FieldRef<"SecurityEvent", 'String'>
    readonly ipAddress: FieldRef<"SecurityEvent", 'String'>
    readonly location: FieldRef<"SecurityEvent", 'String'>
    readonly status: FieldRef<"SecurityEvent", 'EventStatus'>
    readonly assignedTo: FieldRef<"SecurityEvent", 'String'>
    readonly resolvedAt: FieldRef<"SecurityEvent", 'DateTime'>
    readonly resolution: FieldRef<"SecurityEvent", 'String'>
    readonly metadata: FieldRef<"SecurityEvent", 'Json'>
    readonly createdAt: FieldRef<"SecurityEvent", 'DateTime'>
    readonly updatedAt: FieldRef<"SecurityEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SecurityEvent findUnique
   */
  export type SecurityEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    /**
     * Filter, which SecurityEvent to fetch.
     */
    where: SecurityEventWhereUniqueInput
  }

  /**
   * SecurityEvent findUniqueOrThrow
   */
  export type SecurityEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    /**
     * Filter, which SecurityEvent to fetch.
     */
    where: SecurityEventWhereUniqueInput
  }

  /**
   * SecurityEvent findFirst
   */
  export type SecurityEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    /**
     * Filter, which SecurityEvent to fetch.
     */
    where?: SecurityEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SecurityEvents to fetch.
     */
    orderBy?: SecurityEventOrderByWithRelationInput | SecurityEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SecurityEvents.
     */
    cursor?: SecurityEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SecurityEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SecurityEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SecurityEvents.
     */
    distinct?: SecurityEventScalarFieldEnum | SecurityEventScalarFieldEnum[]
  }

  /**
   * SecurityEvent findFirstOrThrow
   */
  export type SecurityEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    /**
     * Filter, which SecurityEvent to fetch.
     */
    where?: SecurityEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SecurityEvents to fetch.
     */
    orderBy?: SecurityEventOrderByWithRelationInput | SecurityEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SecurityEvents.
     */
    cursor?: SecurityEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SecurityEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SecurityEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SecurityEvents.
     */
    distinct?: SecurityEventScalarFieldEnum | SecurityEventScalarFieldEnum[]
  }

  /**
   * SecurityEvent findMany
   */
  export type SecurityEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    /**
     * Filter, which SecurityEvents to fetch.
     */
    where?: SecurityEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SecurityEvents to fetch.
     */
    orderBy?: SecurityEventOrderByWithRelationInput | SecurityEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SecurityEvents.
     */
    cursor?: SecurityEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SecurityEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SecurityEvents.
     */
    skip?: number
    distinct?: SecurityEventScalarFieldEnum | SecurityEventScalarFieldEnum[]
  }

  /**
   * SecurityEvent create
   */
  export type SecurityEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    /**
     * The data needed to create a SecurityEvent.
     */
    data: XOR<SecurityEventCreateInput, SecurityEventUncheckedCreateInput>
  }

  /**
   * SecurityEvent createMany
   */
  export type SecurityEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SecurityEvents.
     */
    data: SecurityEventCreateManyInput | SecurityEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SecurityEvent createManyAndReturn
   */
  export type SecurityEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * The data used to create many SecurityEvents.
     */
    data: SecurityEventCreateManyInput | SecurityEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SecurityEvent update
   */
  export type SecurityEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    /**
     * The data needed to update a SecurityEvent.
     */
    data: XOR<SecurityEventUpdateInput, SecurityEventUncheckedUpdateInput>
    /**
     * Choose, which SecurityEvent to update.
     */
    where: SecurityEventWhereUniqueInput
  }

  /**
   * SecurityEvent updateMany
   */
  export type SecurityEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SecurityEvents.
     */
    data: XOR<SecurityEventUpdateManyMutationInput, SecurityEventUncheckedUpdateManyInput>
    /**
     * Filter which SecurityEvents to update
     */
    where?: SecurityEventWhereInput
    /**
     * Limit how many SecurityEvents to update.
     */
    limit?: number
  }

  /**
   * SecurityEvent updateManyAndReturn
   */
  export type SecurityEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * The data used to update SecurityEvents.
     */
    data: XOR<SecurityEventUpdateManyMutationInput, SecurityEventUncheckedUpdateManyInput>
    /**
     * Filter which SecurityEvents to update
     */
    where?: SecurityEventWhereInput
    /**
     * Limit how many SecurityEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SecurityEvent upsert
   */
  export type SecurityEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    /**
     * The filter to search for the SecurityEvent to update in case it exists.
     */
    where: SecurityEventWhereUniqueInput
    /**
     * In case the SecurityEvent found by the `where` argument doesn't exist, create a new SecurityEvent with this data.
     */
    create: XOR<SecurityEventCreateInput, SecurityEventUncheckedCreateInput>
    /**
     * In case the SecurityEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SecurityEventUpdateInput, SecurityEventUncheckedUpdateInput>
  }

  /**
   * SecurityEvent delete
   */
  export type SecurityEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
    /**
     * Filter which SecurityEvent to delete.
     */
    where: SecurityEventWhereUniqueInput
  }

  /**
   * SecurityEvent deleteMany
   */
  export type SecurityEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SecurityEvents to delete
     */
    where?: SecurityEventWhereInput
    /**
     * Limit how many SecurityEvents to delete.
     */
    limit?: number
  }

  /**
   * SecurityEvent without action
   */
  export type SecurityEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SecurityEvent
     */
    select?: SecurityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SecurityEvent
     */
    omit?: SecurityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SecurityEventInclude<ExtArgs> | null
  }


  /**
   * Model TrainingRecord
   */

  export type AggregateTrainingRecord = {
    _count: TrainingRecordCountAggregateOutputType | null
    _avg: TrainingRecordAvgAggregateOutputType | null
    _sum: TrainingRecordSumAggregateOutputType | null
    _min: TrainingRecordMinAggregateOutputType | null
    _max: TrainingRecordMaxAggregateOutputType | null
  }

  export type TrainingRecordAvgAggregateOutputType = {
    score: number | null
  }

  export type TrainingRecordSumAggregateOutputType = {
    score: number | null
  }

  export type TrainingRecordMinAggregateOutputType = {
    id: string | null
    userId: string | null
    courseId: string | null
    courseName: string | null
    courseCategory: string | null
    provider: string | null
    status: $Enums.TrainingStatus | null
    startedAt: Date | null
    completedAt: Date | null
    expiresAt: Date | null
    score: number | null
    isRequired: boolean | null
    dueDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingRecordMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    courseId: string | null
    courseName: string | null
    courseCategory: string | null
    provider: string | null
    status: $Enums.TrainingStatus | null
    startedAt: Date | null
    completedAt: Date | null
    expiresAt: Date | null
    score: number | null
    isRequired: boolean | null
    dueDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrainingRecordCountAggregateOutputType = {
    id: number
    userId: number
    courseId: number
    courseName: number
    courseCategory: number
    provider: number
    status: number
    startedAt: number
    completedAt: number
    expiresAt: number
    score: number
    isRequired: number
    dueDate: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TrainingRecordAvgAggregateInputType = {
    score?: true
  }

  export type TrainingRecordSumAggregateInputType = {
    score?: true
  }

  export type TrainingRecordMinAggregateInputType = {
    id?: true
    userId?: true
    courseId?: true
    courseName?: true
    courseCategory?: true
    provider?: true
    status?: true
    startedAt?: true
    completedAt?: true
    expiresAt?: true
    score?: true
    isRequired?: true
    dueDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingRecordMaxAggregateInputType = {
    id?: true
    userId?: true
    courseId?: true
    courseName?: true
    courseCategory?: true
    provider?: true
    status?: true
    startedAt?: true
    completedAt?: true
    expiresAt?: true
    score?: true
    isRequired?: true
    dueDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrainingRecordCountAggregateInputType = {
    id?: true
    userId?: true
    courseId?: true
    courseName?: true
    courseCategory?: true
    provider?: true
    status?: true
    startedAt?: true
    completedAt?: true
    expiresAt?: true
    score?: true
    isRequired?: true
    dueDate?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TrainingRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingRecord to aggregate.
     */
    where?: TrainingRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingRecords to fetch.
     */
    orderBy?: TrainingRecordOrderByWithRelationInput | TrainingRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrainingRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrainingRecords
    **/
    _count?: true | TrainingRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrainingRecordAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrainingRecordSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrainingRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrainingRecordMaxAggregateInputType
  }

  export type GetTrainingRecordAggregateType<T extends TrainingRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateTrainingRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrainingRecord[P]>
      : GetScalarType<T[P], AggregateTrainingRecord[P]>
  }




  export type TrainingRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingRecordWhereInput
    orderBy?: TrainingRecordOrderByWithAggregationInput | TrainingRecordOrderByWithAggregationInput[]
    by: TrainingRecordScalarFieldEnum[] | TrainingRecordScalarFieldEnum
    having?: TrainingRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrainingRecordCountAggregateInputType | true
    _avg?: TrainingRecordAvgAggregateInputType
    _sum?: TrainingRecordSumAggregateInputType
    _min?: TrainingRecordMinAggregateInputType
    _max?: TrainingRecordMaxAggregateInputType
  }

  export type TrainingRecordGroupByOutputType = {
    id: string
    userId: string
    courseId: string
    courseName: string
    courseCategory: string | null
    provider: string | null
    status: $Enums.TrainingStatus
    startedAt: Date | null
    completedAt: Date | null
    expiresAt: Date | null
    score: number | null
    isRequired: boolean
    dueDate: Date | null
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: TrainingRecordCountAggregateOutputType | null
    _avg: TrainingRecordAvgAggregateOutputType | null
    _sum: TrainingRecordSumAggregateOutputType | null
    _min: TrainingRecordMinAggregateOutputType | null
    _max: TrainingRecordMaxAggregateOutputType | null
  }

  type GetTrainingRecordGroupByPayload<T extends TrainingRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrainingRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrainingRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrainingRecordGroupByOutputType[P]>
            : GetScalarType<T[P], TrainingRecordGroupByOutputType[P]>
        }
      >
    >


  export type TrainingRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    courseId?: boolean
    courseName?: boolean
    courseCategory?: boolean
    provider?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    expiresAt?: boolean
    score?: boolean
    isRequired?: boolean
    dueDate?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingRecord"]>

  export type TrainingRecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    courseId?: boolean
    courseName?: boolean
    courseCategory?: boolean
    provider?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    expiresAt?: boolean
    score?: boolean
    isRequired?: boolean
    dueDate?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingRecord"]>

  export type TrainingRecordSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    courseId?: boolean
    courseName?: boolean
    courseCategory?: boolean
    provider?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    expiresAt?: boolean
    score?: boolean
    isRequired?: boolean
    dueDate?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainingRecord"]>

  export type TrainingRecordSelectScalar = {
    id?: boolean
    userId?: boolean
    courseId?: boolean
    courseName?: boolean
    courseCategory?: boolean
    provider?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    expiresAt?: boolean
    score?: boolean
    isRequired?: boolean
    dueDate?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TrainingRecordOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "courseId" | "courseName" | "courseCategory" | "provider" | "status" | "startedAt" | "completedAt" | "expiresAt" | "score" | "isRequired" | "dueDate" | "metadata" | "createdAt" | "updatedAt", ExtArgs["result"]["trainingRecord"]>
  export type TrainingRecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type TrainingRecordIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }
  export type TrainingRecordIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserProfileDefaultArgs<ExtArgs>
  }

  export type $TrainingRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrainingRecord"
    objects: {
      user: Prisma.$UserProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      courseId: string
      courseName: string
      courseCategory: string | null
      provider: string | null
      status: $Enums.TrainingStatus
      startedAt: Date | null
      completedAt: Date | null
      expiresAt: Date | null
      score: number | null
      isRequired: boolean
      dueDate: Date | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["trainingRecord"]>
    composites: {}
  }

  type TrainingRecordGetPayload<S extends boolean | null | undefined | TrainingRecordDefaultArgs> = $Result.GetResult<Prisma.$TrainingRecordPayload, S>

  type TrainingRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TrainingRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TrainingRecordCountAggregateInputType | true
    }

  export interface TrainingRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrainingRecord'], meta: { name: 'TrainingRecord' } }
    /**
     * Find zero or one TrainingRecord that matches the filter.
     * @param {TrainingRecordFindUniqueArgs} args - Arguments to find a TrainingRecord
     * @example
     * // Get one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrainingRecordFindUniqueArgs>(args: SelectSubset<T, TrainingRecordFindUniqueArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TrainingRecord that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TrainingRecordFindUniqueOrThrowArgs} args - Arguments to find a TrainingRecord
     * @example
     * // Get one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrainingRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, TrainingRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TrainingRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordFindFirstArgs} args - Arguments to find a TrainingRecord
     * @example
     * // Get one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrainingRecordFindFirstArgs>(args?: SelectSubset<T, TrainingRecordFindFirstArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TrainingRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordFindFirstOrThrowArgs} args - Arguments to find a TrainingRecord
     * @example
     * // Get one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrainingRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, TrainingRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TrainingRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrainingRecords
     * const trainingRecords = await prisma.trainingRecord.findMany()
     * 
     * // Get first 10 TrainingRecords
     * const trainingRecords = await prisma.trainingRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trainingRecordWithIdOnly = await prisma.trainingRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrainingRecordFindManyArgs>(args?: SelectSubset<T, TrainingRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TrainingRecord.
     * @param {TrainingRecordCreateArgs} args - Arguments to create a TrainingRecord.
     * @example
     * // Create one TrainingRecord
     * const TrainingRecord = await prisma.trainingRecord.create({
     *   data: {
     *     // ... data to create a TrainingRecord
     *   }
     * })
     * 
     */
    create<T extends TrainingRecordCreateArgs>(args: SelectSubset<T, TrainingRecordCreateArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TrainingRecords.
     * @param {TrainingRecordCreateManyArgs} args - Arguments to create many TrainingRecords.
     * @example
     * // Create many TrainingRecords
     * const trainingRecord = await prisma.trainingRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrainingRecordCreateManyArgs>(args?: SelectSubset<T, TrainingRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrainingRecords and returns the data saved in the database.
     * @param {TrainingRecordCreateManyAndReturnArgs} args - Arguments to create many TrainingRecords.
     * @example
     * // Create many TrainingRecords
     * const trainingRecord = await prisma.trainingRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrainingRecords and only return the `id`
     * const trainingRecordWithIdOnly = await prisma.trainingRecord.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrainingRecordCreateManyAndReturnArgs>(args?: SelectSubset<T, TrainingRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TrainingRecord.
     * @param {TrainingRecordDeleteArgs} args - Arguments to delete one TrainingRecord.
     * @example
     * // Delete one TrainingRecord
     * const TrainingRecord = await prisma.trainingRecord.delete({
     *   where: {
     *     // ... filter to delete one TrainingRecord
     *   }
     * })
     * 
     */
    delete<T extends TrainingRecordDeleteArgs>(args: SelectSubset<T, TrainingRecordDeleteArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TrainingRecord.
     * @param {TrainingRecordUpdateArgs} args - Arguments to update one TrainingRecord.
     * @example
     * // Update one TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrainingRecordUpdateArgs>(args: SelectSubset<T, TrainingRecordUpdateArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TrainingRecords.
     * @param {TrainingRecordDeleteManyArgs} args - Arguments to filter TrainingRecords to delete.
     * @example
     * // Delete a few TrainingRecords
     * const { count } = await prisma.trainingRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrainingRecordDeleteManyArgs>(args?: SelectSubset<T, TrainingRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrainingRecords
     * const trainingRecord = await prisma.trainingRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrainingRecordUpdateManyArgs>(args: SelectSubset<T, TrainingRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingRecords and returns the data updated in the database.
     * @param {TrainingRecordUpdateManyAndReturnArgs} args - Arguments to update many TrainingRecords.
     * @example
     * // Update many TrainingRecords
     * const trainingRecord = await prisma.trainingRecord.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TrainingRecords and only return the `id`
     * const trainingRecordWithIdOnly = await prisma.trainingRecord.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TrainingRecordUpdateManyAndReturnArgs>(args: SelectSubset<T, TrainingRecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TrainingRecord.
     * @param {TrainingRecordUpsertArgs} args - Arguments to update or create a TrainingRecord.
     * @example
     * // Update or create a TrainingRecord
     * const trainingRecord = await prisma.trainingRecord.upsert({
     *   create: {
     *     // ... data to create a TrainingRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrainingRecord we want to update
     *   }
     * })
     */
    upsert<T extends TrainingRecordUpsertArgs>(args: SelectSubset<T, TrainingRecordUpsertArgs<ExtArgs>>): Prisma__TrainingRecordClient<$Result.GetResult<Prisma.$TrainingRecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TrainingRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordCountArgs} args - Arguments to filter TrainingRecords to count.
     * @example
     * // Count the number of TrainingRecords
     * const count = await prisma.trainingRecord.count({
     *   where: {
     *     // ... the filter for the TrainingRecords we want to count
     *   }
     * })
    **/
    count<T extends TrainingRecordCountArgs>(
      args?: Subset<T, TrainingRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrainingRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrainingRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrainingRecordAggregateArgs>(args: Subset<T, TrainingRecordAggregateArgs>): Prisma.PrismaPromise<GetTrainingRecordAggregateType<T>>

    /**
     * Group by TrainingRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingRecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrainingRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrainingRecordGroupByArgs['orderBy'] }
        : { orderBy?: TrainingRecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrainingRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrainingRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrainingRecord model
   */
  readonly fields: TrainingRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrainingRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrainingRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserProfileDefaultArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrainingRecord model
   */
  interface TrainingRecordFieldRefs {
    readonly id: FieldRef<"TrainingRecord", 'String'>
    readonly userId: FieldRef<"TrainingRecord", 'String'>
    readonly courseId: FieldRef<"TrainingRecord", 'String'>
    readonly courseName: FieldRef<"TrainingRecord", 'String'>
    readonly courseCategory: FieldRef<"TrainingRecord", 'String'>
    readonly provider: FieldRef<"TrainingRecord", 'String'>
    readonly status: FieldRef<"TrainingRecord", 'TrainingStatus'>
    readonly startedAt: FieldRef<"TrainingRecord", 'DateTime'>
    readonly completedAt: FieldRef<"TrainingRecord", 'DateTime'>
    readonly expiresAt: FieldRef<"TrainingRecord", 'DateTime'>
    readonly score: FieldRef<"TrainingRecord", 'Int'>
    readonly isRequired: FieldRef<"TrainingRecord", 'Boolean'>
    readonly dueDate: FieldRef<"TrainingRecord", 'DateTime'>
    readonly metadata: FieldRef<"TrainingRecord", 'Json'>
    readonly createdAt: FieldRef<"TrainingRecord", 'DateTime'>
    readonly updatedAt: FieldRef<"TrainingRecord", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TrainingRecord findUnique
   */
  export type TrainingRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    /**
     * Filter, which TrainingRecord to fetch.
     */
    where: TrainingRecordWhereUniqueInput
  }

  /**
   * TrainingRecord findUniqueOrThrow
   */
  export type TrainingRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    /**
     * Filter, which TrainingRecord to fetch.
     */
    where: TrainingRecordWhereUniqueInput
  }

  /**
   * TrainingRecord findFirst
   */
  export type TrainingRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    /**
     * Filter, which TrainingRecord to fetch.
     */
    where?: TrainingRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingRecords to fetch.
     */
    orderBy?: TrainingRecordOrderByWithRelationInput | TrainingRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingRecords.
     */
    cursor?: TrainingRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingRecords.
     */
    distinct?: TrainingRecordScalarFieldEnum | TrainingRecordScalarFieldEnum[]
  }

  /**
   * TrainingRecord findFirstOrThrow
   */
  export type TrainingRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    /**
     * Filter, which TrainingRecord to fetch.
     */
    where?: TrainingRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingRecords to fetch.
     */
    orderBy?: TrainingRecordOrderByWithRelationInput | TrainingRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingRecords.
     */
    cursor?: TrainingRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingRecords.
     */
    distinct?: TrainingRecordScalarFieldEnum | TrainingRecordScalarFieldEnum[]
  }

  /**
   * TrainingRecord findMany
   */
  export type TrainingRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    /**
     * Filter, which TrainingRecords to fetch.
     */
    where?: TrainingRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingRecords to fetch.
     */
    orderBy?: TrainingRecordOrderByWithRelationInput | TrainingRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrainingRecords.
     */
    cursor?: TrainingRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingRecords.
     */
    skip?: number
    distinct?: TrainingRecordScalarFieldEnum | TrainingRecordScalarFieldEnum[]
  }

  /**
   * TrainingRecord create
   */
  export type TrainingRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    /**
     * The data needed to create a TrainingRecord.
     */
    data: XOR<TrainingRecordCreateInput, TrainingRecordUncheckedCreateInput>
  }

  /**
   * TrainingRecord createMany
   */
  export type TrainingRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrainingRecords.
     */
    data: TrainingRecordCreateManyInput | TrainingRecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TrainingRecord createManyAndReturn
   */
  export type TrainingRecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * The data used to create many TrainingRecords.
     */
    data: TrainingRecordCreateManyInput | TrainingRecordCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrainingRecord update
   */
  export type TrainingRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    /**
     * The data needed to update a TrainingRecord.
     */
    data: XOR<TrainingRecordUpdateInput, TrainingRecordUncheckedUpdateInput>
    /**
     * Choose, which TrainingRecord to update.
     */
    where: TrainingRecordWhereUniqueInput
  }

  /**
   * TrainingRecord updateMany
   */
  export type TrainingRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrainingRecords.
     */
    data: XOR<TrainingRecordUpdateManyMutationInput, TrainingRecordUncheckedUpdateManyInput>
    /**
     * Filter which TrainingRecords to update
     */
    where?: TrainingRecordWhereInput
    /**
     * Limit how many TrainingRecords to update.
     */
    limit?: number
  }

  /**
   * TrainingRecord updateManyAndReturn
   */
  export type TrainingRecordUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * The data used to update TrainingRecords.
     */
    data: XOR<TrainingRecordUpdateManyMutationInput, TrainingRecordUncheckedUpdateManyInput>
    /**
     * Filter which TrainingRecords to update
     */
    where?: TrainingRecordWhereInput
    /**
     * Limit how many TrainingRecords to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrainingRecord upsert
   */
  export type TrainingRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    /**
     * The filter to search for the TrainingRecord to update in case it exists.
     */
    where: TrainingRecordWhereUniqueInput
    /**
     * In case the TrainingRecord found by the `where` argument doesn't exist, create a new TrainingRecord with this data.
     */
    create: XOR<TrainingRecordCreateInput, TrainingRecordUncheckedCreateInput>
    /**
     * In case the TrainingRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrainingRecordUpdateInput, TrainingRecordUncheckedUpdateInput>
  }

  /**
   * TrainingRecord delete
   */
  export type TrainingRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
    /**
     * Filter which TrainingRecord to delete.
     */
    where: TrainingRecordWhereUniqueInput
  }

  /**
   * TrainingRecord deleteMany
   */
  export type TrainingRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingRecords to delete
     */
    where?: TrainingRecordWhereInput
    /**
     * Limit how many TrainingRecords to delete.
     */
    limit?: number
  }

  /**
   * TrainingRecord without action
   */
  export type TrainingRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingRecord
     */
    select?: TrainingRecordSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrainingRecord
     */
    omit?: TrainingRecordOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrainingRecordInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserProfileScalarFieldEnum: {
    id: 'id',
    helixUid: 'helixUid',
    email: 'email',
    emailCanonical: 'emailCanonical',
    employeeId: 'employeeId',
    firstName: 'firstName',
    lastName: 'lastName',
    displayName: 'displayName',
    preferredName: 'preferredName',
    profilePicture: 'profilePicture',
    phoneNumber: 'phoneNumber',
    mobileNumber: 'mobileNumber',
    department: 'department',
    jobTitle: 'jobTitle',
    managerId: 'managerId',
    location: 'location',
    timezone: 'timezone',
    startDate: 'startDate',
    endDate: 'endDate',
    status: 'status',
    lastLoginAt: 'lastLoginAt',
    lastActiveAt: 'lastActiveAt',
    isServiceAccount: 'isServiceAccount',
    securityScore: 'securityScore',
    riskLevel: 'riskLevel',
    mfaEnabled: 'mfaEnabled',
    tenantId: 'tenantId',
    roles: 'roles',
    permissions: 'permissions',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy',
    lastUpdatedBy: 'lastUpdatedBy',
    dataVersion: 'dataVersion'
  };

  export type UserProfileScalarFieldEnum = (typeof UserProfileScalarFieldEnum)[keyof typeof UserProfileScalarFieldEnum]


  export const LinkedAccountScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    platform: 'platform',
    platformUserId: 'platformUserId',
    platformUsername: 'platformUsername',
    accountEmail: 'accountEmail',
    accountStatus: 'accountStatus',
    accountType: 'accountType',
    lastSyncAt: 'lastSyncAt',
    metadata: 'metadata',
    syncEnabled: 'syncEnabled',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LinkedAccountScalarFieldEnum = (typeof LinkedAccountScalarFieldEnum)[keyof typeof LinkedAccountScalarFieldEnum]


  export const AssetAssignmentScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    assetId: 'assetId',
    assetType: 'assetType',
    assetName: 'assetName',
    assetCategory: 'assetCategory',
    assignedAt: 'assignedAt',
    assignedBy: 'assignedBy',
    unassignedAt: 'unassignedAt',
    unassignedBy: 'unassignedBy',
    status: 'status',
    complianceStatus: 'complianceStatus',
    lastCheckAt: 'lastCheckAt',
    notes: 'notes',
    metadata: 'metadata'
  };

  export type AssetAssignmentScalarFieldEnum = (typeof AssetAssignmentScalarFieldEnum)[keyof typeof AssetAssignmentScalarFieldEnum]


  export const UserTicketScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    ticketId: 'ticketId',
    ticketNumber: 'ticketNumber',
    relationship: 'relationship',
    title: 'title',
    status: 'status',
    priority: 'priority',
    category: 'category',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserTicketScalarFieldEnum = (typeof UserTicketScalarFieldEnum)[keyof typeof UserTicketScalarFieldEnum]


  export const ActivityLogScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    activity: 'activity',
    source: 'source',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    location: 'location',
    details: 'details',
    outcome: 'outcome',
    riskScore: 'riskScore',
    sessionId: 'sessionId',
    correlationId: 'correlationId',
    timestamp: 'timestamp',
    retentionDate: 'retentionDate'
  };

  export type ActivityLogScalarFieldEnum = (typeof ActivityLogScalarFieldEnum)[keyof typeof ActivityLogScalarFieldEnum]


  export const SecurityEventScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    eventType: 'eventType',
    severity: 'severity',
    category: 'category',
    description: 'description',
    source: 'source',
    ipAddress: 'ipAddress',
    location: 'location',
    status: 'status',
    assignedTo: 'assignedTo',
    resolvedAt: 'resolvedAt',
    resolution: 'resolution',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SecurityEventScalarFieldEnum = (typeof SecurityEventScalarFieldEnum)[keyof typeof SecurityEventScalarFieldEnum]


  export const TrainingRecordScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    courseId: 'courseId',
    courseName: 'courseName',
    courseCategory: 'courseCategory',
    provider: 'provider',
    status: 'status',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    expiresAt: 'expiresAt',
    score: 'score',
    isRequired: 'isRequired',
    dueDate: 'dueDate',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TrainingRecordScalarFieldEnum = (typeof TrainingRecordScalarFieldEnum)[keyof typeof TrainingRecordScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'UserStatus'
   */
  export type EnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus'>
    


  /**
   * Reference to a field of type 'UserStatus[]'
   */
  export type ListEnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'RiskLevel'
   */
  export type EnumRiskLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskLevel'>
    


  /**
   * Reference to a field of type 'RiskLevel[]'
   */
  export type ListEnumRiskLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskLevel[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'AssetType'
   */
  export type EnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType'>
    


  /**
   * Reference to a field of type 'AssetType[]'
   */
  export type ListEnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType[]'>
    


  /**
   * Reference to a field of type 'AssetStatus'
   */
  export type EnumAssetStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetStatus'>
    


  /**
   * Reference to a field of type 'AssetStatus[]'
   */
  export type ListEnumAssetStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetStatus[]'>
    


  /**
   * Reference to a field of type 'ComplianceStatus'
   */
  export type EnumComplianceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ComplianceStatus'>
    


  /**
   * Reference to a field of type 'ComplianceStatus[]'
   */
  export type ListEnumComplianceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ComplianceStatus[]'>
    


  /**
   * Reference to a field of type 'TicketRelationship'
   */
  export type EnumTicketRelationshipFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketRelationship'>
    


  /**
   * Reference to a field of type 'TicketRelationship[]'
   */
  export type ListEnumTicketRelationshipFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketRelationship[]'>
    


  /**
   * Reference to a field of type 'ActivityOutcome'
   */
  export type EnumActivityOutcomeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityOutcome'>
    


  /**
   * Reference to a field of type 'ActivityOutcome[]'
   */
  export type ListEnumActivityOutcomeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityOutcome[]'>
    


  /**
   * Reference to a field of type 'EventSeverity'
   */
  export type EnumEventSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EventSeverity'>
    


  /**
   * Reference to a field of type 'EventSeverity[]'
   */
  export type ListEnumEventSeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EventSeverity[]'>
    


  /**
   * Reference to a field of type 'EventStatus'
   */
  export type EnumEventStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EventStatus'>
    


  /**
   * Reference to a field of type 'EventStatus[]'
   */
  export type ListEnumEventStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EventStatus[]'>
    


  /**
   * Reference to a field of type 'TrainingStatus'
   */
  export type EnumTrainingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TrainingStatus'>
    


  /**
   * Reference to a field of type 'TrainingStatus[]'
   */
  export type ListEnumTrainingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TrainingStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserProfileWhereInput = {
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    id?: StringFilter<"UserProfile"> | string
    helixUid?: StringFilter<"UserProfile"> | string
    email?: StringFilter<"UserProfile"> | string
    emailCanonical?: StringFilter<"UserProfile"> | string
    employeeId?: StringNullableFilter<"UserProfile"> | string | null
    firstName?: StringFilter<"UserProfile"> | string
    lastName?: StringFilter<"UserProfile"> | string
    displayName?: StringNullableFilter<"UserProfile"> | string | null
    preferredName?: StringNullableFilter<"UserProfile"> | string | null
    profilePicture?: StringNullableFilter<"UserProfile"> | string | null
    phoneNumber?: StringNullableFilter<"UserProfile"> | string | null
    mobileNumber?: StringNullableFilter<"UserProfile"> | string | null
    department?: StringNullableFilter<"UserProfile"> | string | null
    jobTitle?: StringNullableFilter<"UserProfile"> | string | null
    managerId?: StringNullableFilter<"UserProfile"> | string | null
    location?: StringNullableFilter<"UserProfile"> | string | null
    timezone?: StringNullableFilter<"UserProfile"> | string | null
    startDate?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    endDate?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    status?: EnumUserStatusFilter<"UserProfile"> | $Enums.UserStatus
    lastLoginAt?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    lastActiveAt?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    isServiceAccount?: BoolFilter<"UserProfile"> | boolean
    securityScore?: IntNullableFilter<"UserProfile"> | number | null
    riskLevel?: EnumRiskLevelFilter<"UserProfile"> | $Enums.RiskLevel
    mfaEnabled?: BoolFilter<"UserProfile"> | boolean
    tenantId?: StringFilter<"UserProfile"> | string
    roles?: StringNullableListFilter<"UserProfile">
    permissions?: StringNullableListFilter<"UserProfile">
    createdAt?: DateTimeFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeFilter<"UserProfile"> | Date | string
    createdBy?: StringNullableFilter<"UserProfile"> | string | null
    lastUpdatedBy?: StringNullableFilter<"UserProfile"> | string | null
    dataVersion?: IntFilter<"UserProfile"> | number
    manager?: XOR<UserProfileNullableScalarRelationFilter, UserProfileWhereInput> | null
    directReports?: UserProfileListRelationFilter
    linkedAccounts?: LinkedAccountListRelationFilter
    assets?: AssetAssignmentListRelationFilter
    tickets?: UserTicketListRelationFilter
    activityLogs?: ActivityLogListRelationFilter
    securityEvents?: SecurityEventListRelationFilter
    trainingRecords?: TrainingRecordListRelationFilter
  }

  export type UserProfileOrderByWithRelationInput = {
    id?: SortOrder
    helixUid?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    employeeId?: SortOrderInput | SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    displayName?: SortOrderInput | SortOrder
    preferredName?: SortOrderInput | SortOrder
    profilePicture?: SortOrderInput | SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    mobileNumber?: SortOrderInput | SortOrder
    department?: SortOrderInput | SortOrder
    jobTitle?: SortOrderInput | SortOrder
    managerId?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    timezone?: SortOrderInput | SortOrder
    startDate?: SortOrderInput | SortOrder
    endDate?: SortOrderInput | SortOrder
    status?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    lastActiveAt?: SortOrderInput | SortOrder
    isServiceAccount?: SortOrder
    securityScore?: SortOrderInput | SortOrder
    riskLevel?: SortOrder
    mfaEnabled?: SortOrder
    tenantId?: SortOrder
    roles?: SortOrder
    permissions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    lastUpdatedBy?: SortOrderInput | SortOrder
    dataVersion?: SortOrder
    manager?: UserProfileOrderByWithRelationInput
    directReports?: UserProfileOrderByRelationAggregateInput
    linkedAccounts?: LinkedAccountOrderByRelationAggregateInput
    assets?: AssetAssignmentOrderByRelationAggregateInput
    tickets?: UserTicketOrderByRelationAggregateInput
    activityLogs?: ActivityLogOrderByRelationAggregateInput
    securityEvents?: SecurityEventOrderByRelationAggregateInput
    trainingRecords?: TrainingRecordOrderByRelationAggregateInput
  }

  export type UserProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    helixUid?: string
    email?: string
    emailCanonical?: string
    employeeId?: string
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    firstName?: StringFilter<"UserProfile"> | string
    lastName?: StringFilter<"UserProfile"> | string
    displayName?: StringNullableFilter<"UserProfile"> | string | null
    preferredName?: StringNullableFilter<"UserProfile"> | string | null
    profilePicture?: StringNullableFilter<"UserProfile"> | string | null
    phoneNumber?: StringNullableFilter<"UserProfile"> | string | null
    mobileNumber?: StringNullableFilter<"UserProfile"> | string | null
    department?: StringNullableFilter<"UserProfile"> | string | null
    jobTitle?: StringNullableFilter<"UserProfile"> | string | null
    managerId?: StringNullableFilter<"UserProfile"> | string | null
    location?: StringNullableFilter<"UserProfile"> | string | null
    timezone?: StringNullableFilter<"UserProfile"> | string | null
    startDate?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    endDate?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    status?: EnumUserStatusFilter<"UserProfile"> | $Enums.UserStatus
    lastLoginAt?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    lastActiveAt?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    isServiceAccount?: BoolFilter<"UserProfile"> | boolean
    securityScore?: IntNullableFilter<"UserProfile"> | number | null
    riskLevel?: EnumRiskLevelFilter<"UserProfile"> | $Enums.RiskLevel
    mfaEnabled?: BoolFilter<"UserProfile"> | boolean
    tenantId?: StringFilter<"UserProfile"> | string
    roles?: StringNullableListFilter<"UserProfile">
    permissions?: StringNullableListFilter<"UserProfile">
    createdAt?: DateTimeFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeFilter<"UserProfile"> | Date | string
    createdBy?: StringNullableFilter<"UserProfile"> | string | null
    lastUpdatedBy?: StringNullableFilter<"UserProfile"> | string | null
    dataVersion?: IntFilter<"UserProfile"> | number
    manager?: XOR<UserProfileNullableScalarRelationFilter, UserProfileWhereInput> | null
    directReports?: UserProfileListRelationFilter
    linkedAccounts?: LinkedAccountListRelationFilter
    assets?: AssetAssignmentListRelationFilter
    tickets?: UserTicketListRelationFilter
    activityLogs?: ActivityLogListRelationFilter
    securityEvents?: SecurityEventListRelationFilter
    trainingRecords?: TrainingRecordListRelationFilter
  }, "id" | "helixUid" | "email" | "emailCanonical" | "employeeId">

  export type UserProfileOrderByWithAggregationInput = {
    id?: SortOrder
    helixUid?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    employeeId?: SortOrderInput | SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    displayName?: SortOrderInput | SortOrder
    preferredName?: SortOrderInput | SortOrder
    profilePicture?: SortOrderInput | SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    mobileNumber?: SortOrderInput | SortOrder
    department?: SortOrderInput | SortOrder
    jobTitle?: SortOrderInput | SortOrder
    managerId?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    timezone?: SortOrderInput | SortOrder
    startDate?: SortOrderInput | SortOrder
    endDate?: SortOrderInput | SortOrder
    status?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    lastActiveAt?: SortOrderInput | SortOrder
    isServiceAccount?: SortOrder
    securityScore?: SortOrderInput | SortOrder
    riskLevel?: SortOrder
    mfaEnabled?: SortOrder
    tenantId?: SortOrder
    roles?: SortOrder
    permissions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    lastUpdatedBy?: SortOrderInput | SortOrder
    dataVersion?: SortOrder
    _count?: UserProfileCountOrderByAggregateInput
    _avg?: UserProfileAvgOrderByAggregateInput
    _max?: UserProfileMaxOrderByAggregateInput
    _min?: UserProfileMinOrderByAggregateInput
    _sum?: UserProfileSumOrderByAggregateInput
  }

  export type UserProfileScalarWhereWithAggregatesInput = {
    AND?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    OR?: UserProfileScalarWhereWithAggregatesInput[]
    NOT?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserProfile"> | string
    helixUid?: StringWithAggregatesFilter<"UserProfile"> | string
    email?: StringWithAggregatesFilter<"UserProfile"> | string
    emailCanonical?: StringWithAggregatesFilter<"UserProfile"> | string
    employeeId?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    firstName?: StringWithAggregatesFilter<"UserProfile"> | string
    lastName?: StringWithAggregatesFilter<"UserProfile"> | string
    displayName?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    preferredName?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    profilePicture?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    phoneNumber?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    mobileNumber?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    department?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    jobTitle?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    managerId?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    location?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    timezone?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    startDate?: DateTimeNullableWithAggregatesFilter<"UserProfile"> | Date | string | null
    endDate?: DateTimeNullableWithAggregatesFilter<"UserProfile"> | Date | string | null
    status?: EnumUserStatusWithAggregatesFilter<"UserProfile"> | $Enums.UserStatus
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"UserProfile"> | Date | string | null
    lastActiveAt?: DateTimeNullableWithAggregatesFilter<"UserProfile"> | Date | string | null
    isServiceAccount?: BoolWithAggregatesFilter<"UserProfile"> | boolean
    securityScore?: IntNullableWithAggregatesFilter<"UserProfile"> | number | null
    riskLevel?: EnumRiskLevelWithAggregatesFilter<"UserProfile"> | $Enums.RiskLevel
    mfaEnabled?: BoolWithAggregatesFilter<"UserProfile"> | boolean
    tenantId?: StringWithAggregatesFilter<"UserProfile"> | string
    roles?: StringNullableListFilter<"UserProfile">
    permissions?: StringNullableListFilter<"UserProfile">
    createdAt?: DateTimeWithAggregatesFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserProfile"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    lastUpdatedBy?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    dataVersion?: IntWithAggregatesFilter<"UserProfile"> | number
  }

  export type LinkedAccountWhereInput = {
    AND?: LinkedAccountWhereInput | LinkedAccountWhereInput[]
    OR?: LinkedAccountWhereInput[]
    NOT?: LinkedAccountWhereInput | LinkedAccountWhereInput[]
    id?: StringFilter<"LinkedAccount"> | string
    userId?: StringFilter<"LinkedAccount"> | string
    platform?: StringFilter<"LinkedAccount"> | string
    platformUserId?: StringFilter<"LinkedAccount"> | string
    platformUsername?: StringNullableFilter<"LinkedAccount"> | string | null
    accountEmail?: StringNullableFilter<"LinkedAccount"> | string | null
    accountStatus?: StringFilter<"LinkedAccount"> | string
    accountType?: StringNullableFilter<"LinkedAccount"> | string | null
    lastSyncAt?: DateTimeNullableFilter<"LinkedAccount"> | Date | string | null
    metadata?: JsonNullableFilter<"LinkedAccount">
    syncEnabled?: BoolFilter<"LinkedAccount"> | boolean
    createdAt?: DateTimeFilter<"LinkedAccount"> | Date | string
    updatedAt?: DateTimeFilter<"LinkedAccount"> | Date | string
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }

  export type LinkedAccountOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    platform?: SortOrder
    platformUserId?: SortOrder
    platformUsername?: SortOrderInput | SortOrder
    accountEmail?: SortOrderInput | SortOrder
    accountStatus?: SortOrder
    accountType?: SortOrderInput | SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    syncEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserProfileOrderByWithRelationInput
  }

  export type LinkedAccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    platform_platformUserId?: LinkedAccountPlatformPlatformUserIdCompoundUniqueInput
    AND?: LinkedAccountWhereInput | LinkedAccountWhereInput[]
    OR?: LinkedAccountWhereInput[]
    NOT?: LinkedAccountWhereInput | LinkedAccountWhereInput[]
    userId?: StringFilter<"LinkedAccount"> | string
    platform?: StringFilter<"LinkedAccount"> | string
    platformUserId?: StringFilter<"LinkedAccount"> | string
    platformUsername?: StringNullableFilter<"LinkedAccount"> | string | null
    accountEmail?: StringNullableFilter<"LinkedAccount"> | string | null
    accountStatus?: StringFilter<"LinkedAccount"> | string
    accountType?: StringNullableFilter<"LinkedAccount"> | string | null
    lastSyncAt?: DateTimeNullableFilter<"LinkedAccount"> | Date | string | null
    metadata?: JsonNullableFilter<"LinkedAccount">
    syncEnabled?: BoolFilter<"LinkedAccount"> | boolean
    createdAt?: DateTimeFilter<"LinkedAccount"> | Date | string
    updatedAt?: DateTimeFilter<"LinkedAccount"> | Date | string
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }, "id" | "platform_platformUserId">

  export type LinkedAccountOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    platform?: SortOrder
    platformUserId?: SortOrder
    platformUsername?: SortOrderInput | SortOrder
    accountEmail?: SortOrderInput | SortOrder
    accountStatus?: SortOrder
    accountType?: SortOrderInput | SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    syncEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LinkedAccountCountOrderByAggregateInput
    _max?: LinkedAccountMaxOrderByAggregateInput
    _min?: LinkedAccountMinOrderByAggregateInput
  }

  export type LinkedAccountScalarWhereWithAggregatesInput = {
    AND?: LinkedAccountScalarWhereWithAggregatesInput | LinkedAccountScalarWhereWithAggregatesInput[]
    OR?: LinkedAccountScalarWhereWithAggregatesInput[]
    NOT?: LinkedAccountScalarWhereWithAggregatesInput | LinkedAccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LinkedAccount"> | string
    userId?: StringWithAggregatesFilter<"LinkedAccount"> | string
    platform?: StringWithAggregatesFilter<"LinkedAccount"> | string
    platformUserId?: StringWithAggregatesFilter<"LinkedAccount"> | string
    platformUsername?: StringNullableWithAggregatesFilter<"LinkedAccount"> | string | null
    accountEmail?: StringNullableWithAggregatesFilter<"LinkedAccount"> | string | null
    accountStatus?: StringWithAggregatesFilter<"LinkedAccount"> | string
    accountType?: StringNullableWithAggregatesFilter<"LinkedAccount"> | string | null
    lastSyncAt?: DateTimeNullableWithAggregatesFilter<"LinkedAccount"> | Date | string | null
    metadata?: JsonNullableWithAggregatesFilter<"LinkedAccount">
    syncEnabled?: BoolWithAggregatesFilter<"LinkedAccount"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"LinkedAccount"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LinkedAccount"> | Date | string
  }

  export type AssetAssignmentWhereInput = {
    AND?: AssetAssignmentWhereInput | AssetAssignmentWhereInput[]
    OR?: AssetAssignmentWhereInput[]
    NOT?: AssetAssignmentWhereInput | AssetAssignmentWhereInput[]
    id?: StringFilter<"AssetAssignment"> | string
    userId?: StringFilter<"AssetAssignment"> | string
    assetId?: StringFilter<"AssetAssignment"> | string
    assetType?: EnumAssetTypeFilter<"AssetAssignment"> | $Enums.AssetType
    assetName?: StringFilter<"AssetAssignment"> | string
    assetCategory?: StringNullableFilter<"AssetAssignment"> | string | null
    assignedAt?: DateTimeFilter<"AssetAssignment"> | Date | string
    assignedBy?: StringFilter<"AssetAssignment"> | string
    unassignedAt?: DateTimeNullableFilter<"AssetAssignment"> | Date | string | null
    unassignedBy?: StringNullableFilter<"AssetAssignment"> | string | null
    status?: EnumAssetStatusFilter<"AssetAssignment"> | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFilter<"AssetAssignment"> | $Enums.ComplianceStatus
    lastCheckAt?: DateTimeNullableFilter<"AssetAssignment"> | Date | string | null
    notes?: StringNullableFilter<"AssetAssignment"> | string | null
    metadata?: JsonNullableFilter<"AssetAssignment">
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }

  export type AssetAssignmentOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    assetType?: SortOrder
    assetName?: SortOrder
    assetCategory?: SortOrderInput | SortOrder
    assignedAt?: SortOrder
    assignedBy?: SortOrder
    unassignedAt?: SortOrderInput | SortOrder
    unassignedBy?: SortOrderInput | SortOrder
    status?: SortOrder
    complianceStatus?: SortOrder
    lastCheckAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    user?: UserProfileOrderByWithRelationInput
  }

  export type AssetAssignmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AssetAssignmentWhereInput | AssetAssignmentWhereInput[]
    OR?: AssetAssignmentWhereInput[]
    NOT?: AssetAssignmentWhereInput | AssetAssignmentWhereInput[]
    userId?: StringFilter<"AssetAssignment"> | string
    assetId?: StringFilter<"AssetAssignment"> | string
    assetType?: EnumAssetTypeFilter<"AssetAssignment"> | $Enums.AssetType
    assetName?: StringFilter<"AssetAssignment"> | string
    assetCategory?: StringNullableFilter<"AssetAssignment"> | string | null
    assignedAt?: DateTimeFilter<"AssetAssignment"> | Date | string
    assignedBy?: StringFilter<"AssetAssignment"> | string
    unassignedAt?: DateTimeNullableFilter<"AssetAssignment"> | Date | string | null
    unassignedBy?: StringNullableFilter<"AssetAssignment"> | string | null
    status?: EnumAssetStatusFilter<"AssetAssignment"> | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFilter<"AssetAssignment"> | $Enums.ComplianceStatus
    lastCheckAt?: DateTimeNullableFilter<"AssetAssignment"> | Date | string | null
    notes?: StringNullableFilter<"AssetAssignment"> | string | null
    metadata?: JsonNullableFilter<"AssetAssignment">
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }, "id">

  export type AssetAssignmentOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    assetType?: SortOrder
    assetName?: SortOrder
    assetCategory?: SortOrderInput | SortOrder
    assignedAt?: SortOrder
    assignedBy?: SortOrder
    unassignedAt?: SortOrderInput | SortOrder
    unassignedBy?: SortOrderInput | SortOrder
    status?: SortOrder
    complianceStatus?: SortOrder
    lastCheckAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    _count?: AssetAssignmentCountOrderByAggregateInput
    _max?: AssetAssignmentMaxOrderByAggregateInput
    _min?: AssetAssignmentMinOrderByAggregateInput
  }

  export type AssetAssignmentScalarWhereWithAggregatesInput = {
    AND?: AssetAssignmentScalarWhereWithAggregatesInput | AssetAssignmentScalarWhereWithAggregatesInput[]
    OR?: AssetAssignmentScalarWhereWithAggregatesInput[]
    NOT?: AssetAssignmentScalarWhereWithAggregatesInput | AssetAssignmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AssetAssignment"> | string
    userId?: StringWithAggregatesFilter<"AssetAssignment"> | string
    assetId?: StringWithAggregatesFilter<"AssetAssignment"> | string
    assetType?: EnumAssetTypeWithAggregatesFilter<"AssetAssignment"> | $Enums.AssetType
    assetName?: StringWithAggregatesFilter<"AssetAssignment"> | string
    assetCategory?: StringNullableWithAggregatesFilter<"AssetAssignment"> | string | null
    assignedAt?: DateTimeWithAggregatesFilter<"AssetAssignment"> | Date | string
    assignedBy?: StringWithAggregatesFilter<"AssetAssignment"> | string
    unassignedAt?: DateTimeNullableWithAggregatesFilter<"AssetAssignment"> | Date | string | null
    unassignedBy?: StringNullableWithAggregatesFilter<"AssetAssignment"> | string | null
    status?: EnumAssetStatusWithAggregatesFilter<"AssetAssignment"> | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusWithAggregatesFilter<"AssetAssignment"> | $Enums.ComplianceStatus
    lastCheckAt?: DateTimeNullableWithAggregatesFilter<"AssetAssignment"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"AssetAssignment"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"AssetAssignment">
  }

  export type UserTicketWhereInput = {
    AND?: UserTicketWhereInput | UserTicketWhereInput[]
    OR?: UserTicketWhereInput[]
    NOT?: UserTicketWhereInput | UserTicketWhereInput[]
    id?: StringFilter<"UserTicket"> | string
    userId?: StringFilter<"UserTicket"> | string
    ticketId?: StringFilter<"UserTicket"> | string
    ticketNumber?: StringFilter<"UserTicket"> | string
    relationship?: EnumTicketRelationshipFilter<"UserTicket"> | $Enums.TicketRelationship
    title?: StringFilter<"UserTicket"> | string
    status?: StringFilter<"UserTicket"> | string
    priority?: StringFilter<"UserTicket"> | string
    category?: StringNullableFilter<"UserTicket"> | string | null
    createdAt?: DateTimeFilter<"UserTicket"> | Date | string
    updatedAt?: DateTimeFilter<"UserTicket"> | Date | string
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }

  export type UserTicketOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    ticketId?: SortOrder
    ticketNumber?: SortOrder
    relationship?: SortOrder
    title?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    category?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserProfileOrderByWithRelationInput
  }

  export type UserTicketWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_ticketId_relationship?: UserTicketUserIdTicketIdRelationshipCompoundUniqueInput
    AND?: UserTicketWhereInput | UserTicketWhereInput[]
    OR?: UserTicketWhereInput[]
    NOT?: UserTicketWhereInput | UserTicketWhereInput[]
    userId?: StringFilter<"UserTicket"> | string
    ticketId?: StringFilter<"UserTicket"> | string
    ticketNumber?: StringFilter<"UserTicket"> | string
    relationship?: EnumTicketRelationshipFilter<"UserTicket"> | $Enums.TicketRelationship
    title?: StringFilter<"UserTicket"> | string
    status?: StringFilter<"UserTicket"> | string
    priority?: StringFilter<"UserTicket"> | string
    category?: StringNullableFilter<"UserTicket"> | string | null
    createdAt?: DateTimeFilter<"UserTicket"> | Date | string
    updatedAt?: DateTimeFilter<"UserTicket"> | Date | string
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }, "id" | "userId_ticketId_relationship">

  export type UserTicketOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    ticketId?: SortOrder
    ticketNumber?: SortOrder
    relationship?: SortOrder
    title?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    category?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserTicketCountOrderByAggregateInput
    _max?: UserTicketMaxOrderByAggregateInput
    _min?: UserTicketMinOrderByAggregateInput
  }

  export type UserTicketScalarWhereWithAggregatesInput = {
    AND?: UserTicketScalarWhereWithAggregatesInput | UserTicketScalarWhereWithAggregatesInput[]
    OR?: UserTicketScalarWhereWithAggregatesInput[]
    NOT?: UserTicketScalarWhereWithAggregatesInput | UserTicketScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserTicket"> | string
    userId?: StringWithAggregatesFilter<"UserTicket"> | string
    ticketId?: StringWithAggregatesFilter<"UserTicket"> | string
    ticketNumber?: StringWithAggregatesFilter<"UserTicket"> | string
    relationship?: EnumTicketRelationshipWithAggregatesFilter<"UserTicket"> | $Enums.TicketRelationship
    title?: StringWithAggregatesFilter<"UserTicket"> | string
    status?: StringWithAggregatesFilter<"UserTicket"> | string
    priority?: StringWithAggregatesFilter<"UserTicket"> | string
    category?: StringNullableWithAggregatesFilter<"UserTicket"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UserTicket"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserTicket"> | Date | string
  }

  export type ActivityLogWhereInput = {
    AND?: ActivityLogWhereInput | ActivityLogWhereInput[]
    OR?: ActivityLogWhereInput[]
    NOT?: ActivityLogWhereInput | ActivityLogWhereInput[]
    id?: StringFilter<"ActivityLog"> | string
    userId?: StringFilter<"ActivityLog"> | string
    activity?: StringFilter<"ActivityLog"> | string
    source?: StringFilter<"ActivityLog"> | string
    ipAddress?: StringNullableFilter<"ActivityLog"> | string | null
    userAgent?: StringNullableFilter<"ActivityLog"> | string | null
    location?: StringNullableFilter<"ActivityLog"> | string | null
    details?: JsonNullableFilter<"ActivityLog">
    outcome?: EnumActivityOutcomeFilter<"ActivityLog"> | $Enums.ActivityOutcome
    riskScore?: IntNullableFilter<"ActivityLog"> | number | null
    sessionId?: StringNullableFilter<"ActivityLog"> | string | null
    correlationId?: StringNullableFilter<"ActivityLog"> | string | null
    timestamp?: DateTimeFilter<"ActivityLog"> | Date | string
    retentionDate?: DateTimeNullableFilter<"ActivityLog"> | Date | string | null
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }

  export type ActivityLogOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    activity?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    details?: SortOrderInput | SortOrder
    outcome?: SortOrder
    riskScore?: SortOrderInput | SortOrder
    sessionId?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    retentionDate?: SortOrderInput | SortOrder
    user?: UserProfileOrderByWithRelationInput
  }

  export type ActivityLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ActivityLogWhereInput | ActivityLogWhereInput[]
    OR?: ActivityLogWhereInput[]
    NOT?: ActivityLogWhereInput | ActivityLogWhereInput[]
    userId?: StringFilter<"ActivityLog"> | string
    activity?: StringFilter<"ActivityLog"> | string
    source?: StringFilter<"ActivityLog"> | string
    ipAddress?: StringNullableFilter<"ActivityLog"> | string | null
    userAgent?: StringNullableFilter<"ActivityLog"> | string | null
    location?: StringNullableFilter<"ActivityLog"> | string | null
    details?: JsonNullableFilter<"ActivityLog">
    outcome?: EnumActivityOutcomeFilter<"ActivityLog"> | $Enums.ActivityOutcome
    riskScore?: IntNullableFilter<"ActivityLog"> | number | null
    sessionId?: StringNullableFilter<"ActivityLog"> | string | null
    correlationId?: StringNullableFilter<"ActivityLog"> | string | null
    timestamp?: DateTimeFilter<"ActivityLog"> | Date | string
    retentionDate?: DateTimeNullableFilter<"ActivityLog"> | Date | string | null
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }, "id">

  export type ActivityLogOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    activity?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    details?: SortOrderInput | SortOrder
    outcome?: SortOrder
    riskScore?: SortOrderInput | SortOrder
    sessionId?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    retentionDate?: SortOrderInput | SortOrder
    _count?: ActivityLogCountOrderByAggregateInput
    _avg?: ActivityLogAvgOrderByAggregateInput
    _max?: ActivityLogMaxOrderByAggregateInput
    _min?: ActivityLogMinOrderByAggregateInput
    _sum?: ActivityLogSumOrderByAggregateInput
  }

  export type ActivityLogScalarWhereWithAggregatesInput = {
    AND?: ActivityLogScalarWhereWithAggregatesInput | ActivityLogScalarWhereWithAggregatesInput[]
    OR?: ActivityLogScalarWhereWithAggregatesInput[]
    NOT?: ActivityLogScalarWhereWithAggregatesInput | ActivityLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ActivityLog"> | string
    userId?: StringWithAggregatesFilter<"ActivityLog"> | string
    activity?: StringWithAggregatesFilter<"ActivityLog"> | string
    source?: StringWithAggregatesFilter<"ActivityLog"> | string
    ipAddress?: StringNullableWithAggregatesFilter<"ActivityLog"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"ActivityLog"> | string | null
    location?: StringNullableWithAggregatesFilter<"ActivityLog"> | string | null
    details?: JsonNullableWithAggregatesFilter<"ActivityLog">
    outcome?: EnumActivityOutcomeWithAggregatesFilter<"ActivityLog"> | $Enums.ActivityOutcome
    riskScore?: IntNullableWithAggregatesFilter<"ActivityLog"> | number | null
    sessionId?: StringNullableWithAggregatesFilter<"ActivityLog"> | string | null
    correlationId?: StringNullableWithAggregatesFilter<"ActivityLog"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"ActivityLog"> | Date | string
    retentionDate?: DateTimeNullableWithAggregatesFilter<"ActivityLog"> | Date | string | null
  }

  export type SecurityEventWhereInput = {
    AND?: SecurityEventWhereInput | SecurityEventWhereInput[]
    OR?: SecurityEventWhereInput[]
    NOT?: SecurityEventWhereInput | SecurityEventWhereInput[]
    id?: StringFilter<"SecurityEvent"> | string
    userId?: StringFilter<"SecurityEvent"> | string
    eventType?: StringFilter<"SecurityEvent"> | string
    severity?: EnumEventSeverityFilter<"SecurityEvent"> | $Enums.EventSeverity
    category?: StringFilter<"SecurityEvent"> | string
    description?: StringFilter<"SecurityEvent"> | string
    source?: StringFilter<"SecurityEvent"> | string
    ipAddress?: StringNullableFilter<"SecurityEvent"> | string | null
    location?: StringNullableFilter<"SecurityEvent"> | string | null
    status?: EnumEventStatusFilter<"SecurityEvent"> | $Enums.EventStatus
    assignedTo?: StringNullableFilter<"SecurityEvent"> | string | null
    resolvedAt?: DateTimeNullableFilter<"SecurityEvent"> | Date | string | null
    resolution?: StringNullableFilter<"SecurityEvent"> | string | null
    metadata?: JsonNullableFilter<"SecurityEvent">
    createdAt?: DateTimeFilter<"SecurityEvent"> | Date | string
    updatedAt?: DateTimeFilter<"SecurityEvent"> | Date | string
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }

  export type SecurityEventOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    description?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    status?: SortOrder
    assignedTo?: SortOrderInput | SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolution?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserProfileOrderByWithRelationInput
  }

  export type SecurityEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SecurityEventWhereInput | SecurityEventWhereInput[]
    OR?: SecurityEventWhereInput[]
    NOT?: SecurityEventWhereInput | SecurityEventWhereInput[]
    userId?: StringFilter<"SecurityEvent"> | string
    eventType?: StringFilter<"SecurityEvent"> | string
    severity?: EnumEventSeverityFilter<"SecurityEvent"> | $Enums.EventSeverity
    category?: StringFilter<"SecurityEvent"> | string
    description?: StringFilter<"SecurityEvent"> | string
    source?: StringFilter<"SecurityEvent"> | string
    ipAddress?: StringNullableFilter<"SecurityEvent"> | string | null
    location?: StringNullableFilter<"SecurityEvent"> | string | null
    status?: EnumEventStatusFilter<"SecurityEvent"> | $Enums.EventStatus
    assignedTo?: StringNullableFilter<"SecurityEvent"> | string | null
    resolvedAt?: DateTimeNullableFilter<"SecurityEvent"> | Date | string | null
    resolution?: StringNullableFilter<"SecurityEvent"> | string | null
    metadata?: JsonNullableFilter<"SecurityEvent">
    createdAt?: DateTimeFilter<"SecurityEvent"> | Date | string
    updatedAt?: DateTimeFilter<"SecurityEvent"> | Date | string
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }, "id">

  export type SecurityEventOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    description?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    status?: SortOrder
    assignedTo?: SortOrderInput | SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolution?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SecurityEventCountOrderByAggregateInput
    _max?: SecurityEventMaxOrderByAggregateInput
    _min?: SecurityEventMinOrderByAggregateInput
  }

  export type SecurityEventScalarWhereWithAggregatesInput = {
    AND?: SecurityEventScalarWhereWithAggregatesInput | SecurityEventScalarWhereWithAggregatesInput[]
    OR?: SecurityEventScalarWhereWithAggregatesInput[]
    NOT?: SecurityEventScalarWhereWithAggregatesInput | SecurityEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SecurityEvent"> | string
    userId?: StringWithAggregatesFilter<"SecurityEvent"> | string
    eventType?: StringWithAggregatesFilter<"SecurityEvent"> | string
    severity?: EnumEventSeverityWithAggregatesFilter<"SecurityEvent"> | $Enums.EventSeverity
    category?: StringWithAggregatesFilter<"SecurityEvent"> | string
    description?: StringWithAggregatesFilter<"SecurityEvent"> | string
    source?: StringWithAggregatesFilter<"SecurityEvent"> | string
    ipAddress?: StringNullableWithAggregatesFilter<"SecurityEvent"> | string | null
    location?: StringNullableWithAggregatesFilter<"SecurityEvent"> | string | null
    status?: EnumEventStatusWithAggregatesFilter<"SecurityEvent"> | $Enums.EventStatus
    assignedTo?: StringNullableWithAggregatesFilter<"SecurityEvent"> | string | null
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"SecurityEvent"> | Date | string | null
    resolution?: StringNullableWithAggregatesFilter<"SecurityEvent"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"SecurityEvent">
    createdAt?: DateTimeWithAggregatesFilter<"SecurityEvent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SecurityEvent"> | Date | string
  }

  export type TrainingRecordWhereInput = {
    AND?: TrainingRecordWhereInput | TrainingRecordWhereInput[]
    OR?: TrainingRecordWhereInput[]
    NOT?: TrainingRecordWhereInput | TrainingRecordWhereInput[]
    id?: StringFilter<"TrainingRecord"> | string
    userId?: StringFilter<"TrainingRecord"> | string
    courseId?: StringFilter<"TrainingRecord"> | string
    courseName?: StringFilter<"TrainingRecord"> | string
    courseCategory?: StringNullableFilter<"TrainingRecord"> | string | null
    provider?: StringNullableFilter<"TrainingRecord"> | string | null
    status?: EnumTrainingStatusFilter<"TrainingRecord"> | $Enums.TrainingStatus
    startedAt?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    score?: IntNullableFilter<"TrainingRecord"> | number | null
    isRequired?: BoolFilter<"TrainingRecord"> | boolean
    dueDate?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    metadata?: JsonNullableFilter<"TrainingRecord">
    createdAt?: DateTimeFilter<"TrainingRecord"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingRecord"> | Date | string
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }

  export type TrainingRecordOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    courseId?: SortOrder
    courseName?: SortOrder
    courseCategory?: SortOrderInput | SortOrder
    provider?: SortOrderInput | SortOrder
    status?: SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    score?: SortOrderInput | SortOrder
    isRequired?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserProfileOrderByWithRelationInput
  }

  export type TrainingRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_courseId?: TrainingRecordUserIdCourseIdCompoundUniqueInput
    AND?: TrainingRecordWhereInput | TrainingRecordWhereInput[]
    OR?: TrainingRecordWhereInput[]
    NOT?: TrainingRecordWhereInput | TrainingRecordWhereInput[]
    userId?: StringFilter<"TrainingRecord"> | string
    courseId?: StringFilter<"TrainingRecord"> | string
    courseName?: StringFilter<"TrainingRecord"> | string
    courseCategory?: StringNullableFilter<"TrainingRecord"> | string | null
    provider?: StringNullableFilter<"TrainingRecord"> | string | null
    status?: EnumTrainingStatusFilter<"TrainingRecord"> | $Enums.TrainingStatus
    startedAt?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    score?: IntNullableFilter<"TrainingRecord"> | number | null
    isRequired?: BoolFilter<"TrainingRecord"> | boolean
    dueDate?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    metadata?: JsonNullableFilter<"TrainingRecord">
    createdAt?: DateTimeFilter<"TrainingRecord"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingRecord"> | Date | string
    user?: XOR<UserProfileScalarRelationFilter, UserProfileWhereInput>
  }, "id" | "userId_courseId">

  export type TrainingRecordOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    courseId?: SortOrder
    courseName?: SortOrder
    courseCategory?: SortOrderInput | SortOrder
    provider?: SortOrderInput | SortOrder
    status?: SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    score?: SortOrderInput | SortOrder
    isRequired?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TrainingRecordCountOrderByAggregateInput
    _avg?: TrainingRecordAvgOrderByAggregateInput
    _max?: TrainingRecordMaxOrderByAggregateInput
    _min?: TrainingRecordMinOrderByAggregateInput
    _sum?: TrainingRecordSumOrderByAggregateInput
  }

  export type TrainingRecordScalarWhereWithAggregatesInput = {
    AND?: TrainingRecordScalarWhereWithAggregatesInput | TrainingRecordScalarWhereWithAggregatesInput[]
    OR?: TrainingRecordScalarWhereWithAggregatesInput[]
    NOT?: TrainingRecordScalarWhereWithAggregatesInput | TrainingRecordScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrainingRecord"> | string
    userId?: StringWithAggregatesFilter<"TrainingRecord"> | string
    courseId?: StringWithAggregatesFilter<"TrainingRecord"> | string
    courseName?: StringWithAggregatesFilter<"TrainingRecord"> | string
    courseCategory?: StringNullableWithAggregatesFilter<"TrainingRecord"> | string | null
    provider?: StringNullableWithAggregatesFilter<"TrainingRecord"> | string | null
    status?: EnumTrainingStatusWithAggregatesFilter<"TrainingRecord"> | $Enums.TrainingStatus
    startedAt?: DateTimeNullableWithAggregatesFilter<"TrainingRecord"> | Date | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter<"TrainingRecord"> | Date | string | null
    expiresAt?: DateTimeNullableWithAggregatesFilter<"TrainingRecord"> | Date | string | null
    score?: IntNullableWithAggregatesFilter<"TrainingRecord"> | number | null
    isRequired?: BoolWithAggregatesFilter<"TrainingRecord"> | boolean
    dueDate?: DateTimeNullableWithAggregatesFilter<"TrainingRecord"> | Date | string | null
    metadata?: JsonNullableWithAggregatesFilter<"TrainingRecord">
    createdAt?: DateTimeWithAggregatesFilter<"TrainingRecord"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TrainingRecord"> | Date | string
  }

  export type UserProfileCreateInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    manager?: UserProfileCreateNestedOneWithoutDirectReportsInput
    directReports?: UserProfileCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentCreateNestedManyWithoutUserInput
    tickets?: UserTicketCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordCreateNestedManyWithoutUserInput
  }

  export type UserProfileUncheckedCreateInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    managerId?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    directReports?: UserProfileUncheckedCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountUncheckedCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentUncheckedCreateNestedManyWithoutUserInput
    tickets?: UserTicketUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventUncheckedCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    manager?: UserProfileUpdateOneWithoutDirectReportsNestedInput
    directReports?: UserProfileUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    directReports?: UserProfileUncheckedUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUncheckedUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUncheckedUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUncheckedUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserProfileCreateManyInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    managerId?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
  }

  export type UserProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
  }

  export type UserProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
  }

  export type LinkedAccountCreateInput = {
    id?: string
    platform: string
    platformUserId: string
    platformUsername?: string | null
    accountEmail?: string | null
    accountStatus?: string
    accountType?: string | null
    lastSyncAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserProfileCreateNestedOneWithoutLinkedAccountsInput
  }

  export type LinkedAccountUncheckedCreateInput = {
    id?: string
    userId: string
    platform: string
    platformUserId: string
    platformUsername?: string | null
    accountEmail?: string | null
    accountStatus?: string
    accountType?: string | null
    lastSyncAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LinkedAccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platformUserId?: StringFieldUpdateOperationsInput | string
    platformUsername?: NullableStringFieldUpdateOperationsInput | string | null
    accountEmail?: NullableStringFieldUpdateOperationsInput | string | null
    accountStatus?: StringFieldUpdateOperationsInput | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserProfileUpdateOneRequiredWithoutLinkedAccountsNestedInput
  }

  export type LinkedAccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platformUserId?: StringFieldUpdateOperationsInput | string
    platformUsername?: NullableStringFieldUpdateOperationsInput | string | null
    accountEmail?: NullableStringFieldUpdateOperationsInput | string | null
    accountStatus?: StringFieldUpdateOperationsInput | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LinkedAccountCreateManyInput = {
    id?: string
    userId: string
    platform: string
    platformUserId: string
    platformUsername?: string | null
    accountEmail?: string | null
    accountStatus?: string
    accountType?: string | null
    lastSyncAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LinkedAccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platformUserId?: StringFieldUpdateOperationsInput | string
    platformUsername?: NullableStringFieldUpdateOperationsInput | string | null
    accountEmail?: NullableStringFieldUpdateOperationsInput | string | null
    accountStatus?: StringFieldUpdateOperationsInput | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LinkedAccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platformUserId?: StringFieldUpdateOperationsInput | string
    platformUsername?: NullableStringFieldUpdateOperationsInput | string | null
    accountEmail?: NullableStringFieldUpdateOperationsInput | string | null
    accountStatus?: StringFieldUpdateOperationsInput | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetAssignmentCreateInput = {
    id?: string
    assetId: string
    assetType: $Enums.AssetType
    assetName: string
    assetCategory?: string | null
    assignedAt?: Date | string
    assignedBy: string
    unassignedAt?: Date | string | null
    unassignedBy?: string | null
    status?: $Enums.AssetStatus
    complianceStatus?: $Enums.ComplianceStatus
    lastCheckAt?: Date | string | null
    notes?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    user: UserProfileCreateNestedOneWithoutAssetsInput
  }

  export type AssetAssignmentUncheckedCreateInput = {
    id?: string
    userId: string
    assetId: string
    assetType: $Enums.AssetType
    assetName: string
    assetCategory?: string | null
    assignedAt?: Date | string
    assignedBy: string
    unassignedAt?: Date | string | null
    unassignedBy?: string | null
    status?: $Enums.AssetStatus
    complianceStatus?: $Enums.ComplianceStatus
    lastCheckAt?: Date | string | null
    notes?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type AssetAssignmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    assetName?: StringFieldUpdateOperationsInput | string
    assetCategory?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedBy?: StringFieldUpdateOperationsInput | string
    unassignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    unassignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssetStatusFieldUpdateOperationsInput | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFieldUpdateOperationsInput | $Enums.ComplianceStatus
    lastCheckAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    user?: UserProfileUpdateOneRequiredWithoutAssetsNestedInput
  }

  export type AssetAssignmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    assetName?: StringFieldUpdateOperationsInput | string
    assetCategory?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedBy?: StringFieldUpdateOperationsInput | string
    unassignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    unassignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssetStatusFieldUpdateOperationsInput | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFieldUpdateOperationsInput | $Enums.ComplianceStatus
    lastCheckAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type AssetAssignmentCreateManyInput = {
    id?: string
    userId: string
    assetId: string
    assetType: $Enums.AssetType
    assetName: string
    assetCategory?: string | null
    assignedAt?: Date | string
    assignedBy: string
    unassignedAt?: Date | string | null
    unassignedBy?: string | null
    status?: $Enums.AssetStatus
    complianceStatus?: $Enums.ComplianceStatus
    lastCheckAt?: Date | string | null
    notes?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type AssetAssignmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    assetName?: StringFieldUpdateOperationsInput | string
    assetCategory?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedBy?: StringFieldUpdateOperationsInput | string
    unassignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    unassignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssetStatusFieldUpdateOperationsInput | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFieldUpdateOperationsInput | $Enums.ComplianceStatus
    lastCheckAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type AssetAssignmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    assetName?: StringFieldUpdateOperationsInput | string
    assetCategory?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedBy?: StringFieldUpdateOperationsInput | string
    unassignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    unassignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssetStatusFieldUpdateOperationsInput | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFieldUpdateOperationsInput | $Enums.ComplianceStatus
    lastCheckAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserTicketCreateInput = {
    id?: string
    ticketId: string
    ticketNumber: string
    relationship: $Enums.TicketRelationship
    title: string
    status: string
    priority: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserProfileCreateNestedOneWithoutTicketsInput
  }

  export type UserTicketUncheckedCreateInput = {
    id?: string
    userId: string
    ticketId: string
    ticketNumber: string
    relationship: $Enums.TicketRelationship
    title: string
    status: string
    priority: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserTicketUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    ticketNumber?: StringFieldUpdateOperationsInput | string
    relationship?: EnumTicketRelationshipFieldUpdateOperationsInput | $Enums.TicketRelationship
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserProfileUpdateOneRequiredWithoutTicketsNestedInput
  }

  export type UserTicketUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    ticketNumber?: StringFieldUpdateOperationsInput | string
    relationship?: EnumTicketRelationshipFieldUpdateOperationsInput | $Enums.TicketRelationship
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTicketCreateManyInput = {
    id?: string
    userId: string
    ticketId: string
    ticketNumber: string
    relationship: $Enums.TicketRelationship
    title: string
    status: string
    priority: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserTicketUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    ticketNumber?: StringFieldUpdateOperationsInput | string
    relationship?: EnumTicketRelationshipFieldUpdateOperationsInput | $Enums.TicketRelationship
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTicketUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    ticketNumber?: StringFieldUpdateOperationsInput | string
    relationship?: EnumTicketRelationshipFieldUpdateOperationsInput | $Enums.TicketRelationship
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogCreateInput = {
    id?: string
    activity: string
    source: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: $Enums.ActivityOutcome
    riskScore?: number | null
    sessionId?: string | null
    correlationId?: string | null
    timestamp?: Date | string
    retentionDate?: Date | string | null
    user: UserProfileCreateNestedOneWithoutActivityLogsInput
  }

  export type ActivityLogUncheckedCreateInput = {
    id?: string
    userId: string
    activity: string
    source: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: $Enums.ActivityOutcome
    riskScore?: number | null
    sessionId?: string | null
    correlationId?: string | null
    timestamp?: Date | string
    retentionDate?: Date | string | null
  }

  export type ActivityLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    activity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: EnumActivityOutcomeFieldUpdateOperationsInput | $Enums.ActivityOutcome
    riskScore?: NullableIntFieldUpdateOperationsInput | number | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserProfileUpdateOneRequiredWithoutActivityLogsNestedInput
  }

  export type ActivityLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    activity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: EnumActivityOutcomeFieldUpdateOperationsInput | $Enums.ActivityOutcome
    riskScore?: NullableIntFieldUpdateOperationsInput | number | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ActivityLogCreateManyInput = {
    id?: string
    userId: string
    activity: string
    source: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: $Enums.ActivityOutcome
    riskScore?: number | null
    sessionId?: string | null
    correlationId?: string | null
    timestamp?: Date | string
    retentionDate?: Date | string | null
  }

  export type ActivityLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    activity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: EnumActivityOutcomeFieldUpdateOperationsInput | $Enums.ActivityOutcome
    riskScore?: NullableIntFieldUpdateOperationsInput | number | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ActivityLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    activity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: EnumActivityOutcomeFieldUpdateOperationsInput | $Enums.ActivityOutcome
    riskScore?: NullableIntFieldUpdateOperationsInput | number | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SecurityEventCreateInput = {
    id?: string
    eventType: string
    severity?: $Enums.EventSeverity
    category: string
    description: string
    source: string
    ipAddress?: string | null
    location?: string | null
    status?: $Enums.EventStatus
    assignedTo?: string | null
    resolvedAt?: Date | string | null
    resolution?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserProfileCreateNestedOneWithoutSecurityEventsInput
  }

  export type SecurityEventUncheckedCreateInput = {
    id?: string
    userId: string
    eventType: string
    severity?: $Enums.EventSeverity
    category: string
    description: string
    source: string
    ipAddress?: string | null
    location?: string | null
    status?: $Enums.EventStatus
    assignedTo?: string | null
    resolvedAt?: Date | string | null
    resolution?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SecurityEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: EnumEventSeverityFieldUpdateOperationsInput | $Enums.EventSeverity
    category?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserProfileUpdateOneRequiredWithoutSecurityEventsNestedInput
  }

  export type SecurityEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: EnumEventSeverityFieldUpdateOperationsInput | $Enums.EventSeverity
    category?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SecurityEventCreateManyInput = {
    id?: string
    userId: string
    eventType: string
    severity?: $Enums.EventSeverity
    category: string
    description: string
    source: string
    ipAddress?: string | null
    location?: string | null
    status?: $Enums.EventStatus
    assignedTo?: string | null
    resolvedAt?: Date | string | null
    resolution?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SecurityEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: EnumEventSeverityFieldUpdateOperationsInput | $Enums.EventSeverity
    category?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SecurityEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: EnumEventSeverityFieldUpdateOperationsInput | $Enums.EventSeverity
    category?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingRecordCreateInput = {
    id?: string
    courseId: string
    courseName: string
    courseCategory?: string | null
    provider?: string | null
    status?: $Enums.TrainingStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    expiresAt?: Date | string | null
    score?: number | null
    isRequired?: boolean
    dueDate?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserProfileCreateNestedOneWithoutTrainingRecordsInput
  }

  export type TrainingRecordUncheckedCreateInput = {
    id?: string
    userId: string
    courseId: string
    courseName: string
    courseCategory?: string | null
    provider?: string | null
    status?: $Enums.TrainingStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    expiresAt?: Date | string | null
    score?: number | null
    isRequired?: boolean
    dueDate?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingRecordUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    courseName?: StringFieldUpdateOperationsInput | string
    courseCategory?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTrainingStatusFieldUpdateOperationsInput | $Enums.TrainingStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserProfileUpdateOneRequiredWithoutTrainingRecordsNestedInput
  }

  export type TrainingRecordUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    courseName?: StringFieldUpdateOperationsInput | string
    courseCategory?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTrainingStatusFieldUpdateOperationsInput | $Enums.TrainingStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingRecordCreateManyInput = {
    id?: string
    userId: string
    courseId: string
    courseName: string
    courseCategory?: string | null
    provider?: string | null
    status?: $Enums.TrainingStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    expiresAt?: Date | string | null
    score?: number | null
    isRequired?: boolean
    dueDate?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingRecordUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    courseName?: StringFieldUpdateOperationsInput | string
    courseCategory?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTrainingStatusFieldUpdateOperationsInput | $Enums.TrainingStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingRecordUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    courseName?: StringFieldUpdateOperationsInput | string
    courseCategory?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTrainingStatusFieldUpdateOperationsInput | $Enums.TrainingStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumRiskLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelFilter<$PrismaModel> | $Enums.RiskLevel
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type UserProfileNullableScalarRelationFilter = {
    is?: UserProfileWhereInput | null
    isNot?: UserProfileWhereInput | null
  }

  export type UserProfileListRelationFilter = {
    every?: UserProfileWhereInput
    some?: UserProfileWhereInput
    none?: UserProfileWhereInput
  }

  export type LinkedAccountListRelationFilter = {
    every?: LinkedAccountWhereInput
    some?: LinkedAccountWhereInput
    none?: LinkedAccountWhereInput
  }

  export type AssetAssignmentListRelationFilter = {
    every?: AssetAssignmentWhereInput
    some?: AssetAssignmentWhereInput
    none?: AssetAssignmentWhereInput
  }

  export type UserTicketListRelationFilter = {
    every?: UserTicketWhereInput
    some?: UserTicketWhereInput
    none?: UserTicketWhereInput
  }

  export type ActivityLogListRelationFilter = {
    every?: ActivityLogWhereInput
    some?: ActivityLogWhereInput
    none?: ActivityLogWhereInput
  }

  export type SecurityEventListRelationFilter = {
    every?: SecurityEventWhereInput
    some?: SecurityEventWhereInput
    none?: SecurityEventWhereInput
  }

  export type TrainingRecordListRelationFilter = {
    every?: TrainingRecordWhereInput
    some?: TrainingRecordWhereInput
    none?: TrainingRecordWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserProfileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LinkedAccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssetAssignmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserTicketOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ActivityLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SecurityEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrainingRecordOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserProfileCountOrderByAggregateInput = {
    id?: SortOrder
    helixUid?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    employeeId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    displayName?: SortOrder
    preferredName?: SortOrder
    profilePicture?: SortOrder
    phoneNumber?: SortOrder
    mobileNumber?: SortOrder
    department?: SortOrder
    jobTitle?: SortOrder
    managerId?: SortOrder
    location?: SortOrder
    timezone?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    lastLoginAt?: SortOrder
    lastActiveAt?: SortOrder
    isServiceAccount?: SortOrder
    securityScore?: SortOrder
    riskLevel?: SortOrder
    mfaEnabled?: SortOrder
    tenantId?: SortOrder
    roles?: SortOrder
    permissions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    lastUpdatedBy?: SortOrder
    dataVersion?: SortOrder
  }

  export type UserProfileAvgOrderByAggregateInput = {
    securityScore?: SortOrder
    dataVersion?: SortOrder
  }

  export type UserProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    helixUid?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    employeeId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    displayName?: SortOrder
    preferredName?: SortOrder
    profilePicture?: SortOrder
    phoneNumber?: SortOrder
    mobileNumber?: SortOrder
    department?: SortOrder
    jobTitle?: SortOrder
    managerId?: SortOrder
    location?: SortOrder
    timezone?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    lastLoginAt?: SortOrder
    lastActiveAt?: SortOrder
    isServiceAccount?: SortOrder
    securityScore?: SortOrder
    riskLevel?: SortOrder
    mfaEnabled?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    lastUpdatedBy?: SortOrder
    dataVersion?: SortOrder
  }

  export type UserProfileMinOrderByAggregateInput = {
    id?: SortOrder
    helixUid?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    employeeId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    displayName?: SortOrder
    preferredName?: SortOrder
    profilePicture?: SortOrder
    phoneNumber?: SortOrder
    mobileNumber?: SortOrder
    department?: SortOrder
    jobTitle?: SortOrder
    managerId?: SortOrder
    location?: SortOrder
    timezone?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    lastLoginAt?: SortOrder
    lastActiveAt?: SortOrder
    isServiceAccount?: SortOrder
    securityScore?: SortOrder
    riskLevel?: SortOrder
    mfaEnabled?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    lastUpdatedBy?: SortOrder
    dataVersion?: SortOrder
  }

  export type UserProfileSumOrderByAggregateInput = {
    securityScore?: SortOrder
    dataVersion?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumRiskLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskLevelFilter<$PrismaModel>
    _max?: NestedEnumRiskLevelFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserProfileScalarRelationFilter = {
    is?: UserProfileWhereInput
    isNot?: UserProfileWhereInput
  }

  export type LinkedAccountPlatformPlatformUserIdCompoundUniqueInput = {
    platform: string
    platformUserId: string
  }

  export type LinkedAccountCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    platform?: SortOrder
    platformUserId?: SortOrder
    platformUsername?: SortOrder
    accountEmail?: SortOrder
    accountStatus?: SortOrder
    accountType?: SortOrder
    lastSyncAt?: SortOrder
    metadata?: SortOrder
    syncEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LinkedAccountMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    platform?: SortOrder
    platformUserId?: SortOrder
    platformUsername?: SortOrder
    accountEmail?: SortOrder
    accountStatus?: SortOrder
    accountType?: SortOrder
    lastSyncAt?: SortOrder
    syncEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LinkedAccountMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    platform?: SortOrder
    platformUserId?: SortOrder
    platformUsername?: SortOrder
    accountEmail?: SortOrder
    accountStatus?: SortOrder
    accountType?: SortOrder
    lastSyncAt?: SortOrder
    syncEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType
  }

  export type EnumAssetStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetStatus | EnumAssetStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssetStatus[] | ListEnumAssetStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetStatus[] | ListEnumAssetStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetStatusFilter<$PrismaModel> | $Enums.AssetStatus
  }

  export type EnumComplianceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ComplianceStatus | EnumComplianceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ComplianceStatus[] | ListEnumComplianceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ComplianceStatus[] | ListEnumComplianceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumComplianceStatusFilter<$PrismaModel> | $Enums.ComplianceStatus
  }

  export type AssetAssignmentCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    assetType?: SortOrder
    assetName?: SortOrder
    assetCategory?: SortOrder
    assignedAt?: SortOrder
    assignedBy?: SortOrder
    unassignedAt?: SortOrder
    unassignedBy?: SortOrder
    status?: SortOrder
    complianceStatus?: SortOrder
    lastCheckAt?: SortOrder
    notes?: SortOrder
    metadata?: SortOrder
  }

  export type AssetAssignmentMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    assetType?: SortOrder
    assetName?: SortOrder
    assetCategory?: SortOrder
    assignedAt?: SortOrder
    assignedBy?: SortOrder
    unassignedAt?: SortOrder
    unassignedBy?: SortOrder
    status?: SortOrder
    complianceStatus?: SortOrder
    lastCheckAt?: SortOrder
    notes?: SortOrder
  }

  export type AssetAssignmentMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    assetType?: SortOrder
    assetName?: SortOrder
    assetCategory?: SortOrder
    assignedAt?: SortOrder
    assignedBy?: SortOrder
    unassignedAt?: SortOrder
    unassignedBy?: SortOrder
    status?: SortOrder
    complianceStatus?: SortOrder
    lastCheckAt?: SortOrder
    notes?: SortOrder
  }

  export type EnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetTypeFilter<$PrismaModel>
    _max?: NestedEnumAssetTypeFilter<$PrismaModel>
  }

  export type EnumAssetStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetStatus | EnumAssetStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssetStatus[] | ListEnumAssetStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetStatus[] | ListEnumAssetStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssetStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetStatusFilter<$PrismaModel>
    _max?: NestedEnumAssetStatusFilter<$PrismaModel>
  }

  export type EnumComplianceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ComplianceStatus | EnumComplianceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ComplianceStatus[] | ListEnumComplianceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ComplianceStatus[] | ListEnumComplianceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumComplianceStatusWithAggregatesFilter<$PrismaModel> | $Enums.ComplianceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumComplianceStatusFilter<$PrismaModel>
    _max?: NestedEnumComplianceStatusFilter<$PrismaModel>
  }

  export type EnumTicketRelationshipFilter<$PrismaModel = never> = {
    equals?: $Enums.TicketRelationship | EnumTicketRelationshipFieldRefInput<$PrismaModel>
    in?: $Enums.TicketRelationship[] | ListEnumTicketRelationshipFieldRefInput<$PrismaModel>
    notIn?: $Enums.TicketRelationship[] | ListEnumTicketRelationshipFieldRefInput<$PrismaModel>
    not?: NestedEnumTicketRelationshipFilter<$PrismaModel> | $Enums.TicketRelationship
  }

  export type UserTicketUserIdTicketIdRelationshipCompoundUniqueInput = {
    userId: string
    ticketId: string
    relationship: $Enums.TicketRelationship
  }

  export type UserTicketCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    ticketId?: SortOrder
    ticketNumber?: SortOrder
    relationship?: SortOrder
    title?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserTicketMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    ticketId?: SortOrder
    ticketNumber?: SortOrder
    relationship?: SortOrder
    title?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserTicketMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    ticketId?: SortOrder
    ticketNumber?: SortOrder
    relationship?: SortOrder
    title?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumTicketRelationshipWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TicketRelationship | EnumTicketRelationshipFieldRefInput<$PrismaModel>
    in?: $Enums.TicketRelationship[] | ListEnumTicketRelationshipFieldRefInput<$PrismaModel>
    notIn?: $Enums.TicketRelationship[] | ListEnumTicketRelationshipFieldRefInput<$PrismaModel>
    not?: NestedEnumTicketRelationshipWithAggregatesFilter<$PrismaModel> | $Enums.TicketRelationship
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTicketRelationshipFilter<$PrismaModel>
    _max?: NestedEnumTicketRelationshipFilter<$PrismaModel>
  }

  export type EnumActivityOutcomeFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityOutcome | EnumActivityOutcomeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityOutcome[] | ListEnumActivityOutcomeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityOutcome[] | ListEnumActivityOutcomeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityOutcomeFilter<$PrismaModel> | $Enums.ActivityOutcome
  }

  export type ActivityLogCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    activity?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    location?: SortOrder
    details?: SortOrder
    outcome?: SortOrder
    riskScore?: SortOrder
    sessionId?: SortOrder
    correlationId?: SortOrder
    timestamp?: SortOrder
    retentionDate?: SortOrder
  }

  export type ActivityLogAvgOrderByAggregateInput = {
    riskScore?: SortOrder
  }

  export type ActivityLogMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    activity?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    location?: SortOrder
    outcome?: SortOrder
    riskScore?: SortOrder
    sessionId?: SortOrder
    correlationId?: SortOrder
    timestamp?: SortOrder
    retentionDate?: SortOrder
  }

  export type ActivityLogMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    activity?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    location?: SortOrder
    outcome?: SortOrder
    riskScore?: SortOrder
    sessionId?: SortOrder
    correlationId?: SortOrder
    timestamp?: SortOrder
    retentionDate?: SortOrder
  }

  export type ActivityLogSumOrderByAggregateInput = {
    riskScore?: SortOrder
  }

  export type EnumActivityOutcomeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityOutcome | EnumActivityOutcomeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityOutcome[] | ListEnumActivityOutcomeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityOutcome[] | ListEnumActivityOutcomeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityOutcomeWithAggregatesFilter<$PrismaModel> | $Enums.ActivityOutcome
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityOutcomeFilter<$PrismaModel>
    _max?: NestedEnumActivityOutcomeFilter<$PrismaModel>
  }

  export type EnumEventSeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.EventSeverity | EnumEventSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.EventSeverity[] | ListEnumEventSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventSeverity[] | ListEnumEventSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumEventSeverityFilter<$PrismaModel> | $Enums.EventSeverity
  }

  export type EnumEventStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EventStatus | EnumEventStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEventStatusFilter<$PrismaModel> | $Enums.EventStatus
  }

  export type SecurityEventCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    description?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrder
    location?: SortOrder
    status?: SortOrder
    assignedTo?: SortOrder
    resolvedAt?: SortOrder
    resolution?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SecurityEventMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    description?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrder
    location?: SortOrder
    status?: SortOrder
    assignedTo?: SortOrder
    resolvedAt?: SortOrder
    resolution?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SecurityEventMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    description?: SortOrder
    source?: SortOrder
    ipAddress?: SortOrder
    location?: SortOrder
    status?: SortOrder
    assignedTo?: SortOrder
    resolvedAt?: SortOrder
    resolution?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumEventSeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EventSeverity | EnumEventSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.EventSeverity[] | ListEnumEventSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventSeverity[] | ListEnumEventSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumEventSeverityWithAggregatesFilter<$PrismaModel> | $Enums.EventSeverity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEventSeverityFilter<$PrismaModel>
    _max?: NestedEnumEventSeverityFilter<$PrismaModel>
  }

  export type EnumEventStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EventStatus | EnumEventStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEventStatusWithAggregatesFilter<$PrismaModel> | $Enums.EventStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEventStatusFilter<$PrismaModel>
    _max?: NestedEnumEventStatusFilter<$PrismaModel>
  }

  export type EnumTrainingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TrainingStatus | EnumTrainingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TrainingStatus[] | ListEnumTrainingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TrainingStatus[] | ListEnumTrainingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTrainingStatusFilter<$PrismaModel> | $Enums.TrainingStatus
  }

  export type TrainingRecordUserIdCourseIdCompoundUniqueInput = {
    userId: string
    courseId: string
  }

  export type TrainingRecordCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    courseId?: SortOrder
    courseName?: SortOrder
    courseCategory?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    expiresAt?: SortOrder
    score?: SortOrder
    isRequired?: SortOrder
    dueDate?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingRecordAvgOrderByAggregateInput = {
    score?: SortOrder
  }

  export type TrainingRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    courseId?: SortOrder
    courseName?: SortOrder
    courseCategory?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    expiresAt?: SortOrder
    score?: SortOrder
    isRequired?: SortOrder
    dueDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingRecordMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    courseId?: SortOrder
    courseName?: SortOrder
    courseCategory?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    expiresAt?: SortOrder
    score?: SortOrder
    isRequired?: SortOrder
    dueDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrainingRecordSumOrderByAggregateInput = {
    score?: SortOrder
  }

  export type EnumTrainingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrainingStatus | EnumTrainingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TrainingStatus[] | ListEnumTrainingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TrainingStatus[] | ListEnumTrainingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTrainingStatusWithAggregatesFilter<$PrismaModel> | $Enums.TrainingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTrainingStatusFilter<$PrismaModel>
    _max?: NestedEnumTrainingStatusFilter<$PrismaModel>
  }

  export type UserProfileCreaterolesInput = {
    set: string[]
  }

  export type UserProfileCreatepermissionsInput = {
    set: string[]
  }

  export type UserProfileCreateNestedOneWithoutDirectReportsInput = {
    create?: XOR<UserProfileCreateWithoutDirectReportsInput, UserProfileUncheckedCreateWithoutDirectReportsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutDirectReportsInput
    connect?: UserProfileWhereUniqueInput
  }

  export type UserProfileCreateNestedManyWithoutManagerInput = {
    create?: XOR<UserProfileCreateWithoutManagerInput, UserProfileUncheckedCreateWithoutManagerInput> | UserProfileCreateWithoutManagerInput[] | UserProfileUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: UserProfileCreateOrConnectWithoutManagerInput | UserProfileCreateOrConnectWithoutManagerInput[]
    createMany?: UserProfileCreateManyManagerInputEnvelope
    connect?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
  }

  export type LinkedAccountCreateNestedManyWithoutUserInput = {
    create?: XOR<LinkedAccountCreateWithoutUserInput, LinkedAccountUncheckedCreateWithoutUserInput> | LinkedAccountCreateWithoutUserInput[] | LinkedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LinkedAccountCreateOrConnectWithoutUserInput | LinkedAccountCreateOrConnectWithoutUserInput[]
    createMany?: LinkedAccountCreateManyUserInputEnvelope
    connect?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
  }

  export type AssetAssignmentCreateNestedManyWithoutUserInput = {
    create?: XOR<AssetAssignmentCreateWithoutUserInput, AssetAssignmentUncheckedCreateWithoutUserInput> | AssetAssignmentCreateWithoutUserInput[] | AssetAssignmentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AssetAssignmentCreateOrConnectWithoutUserInput | AssetAssignmentCreateOrConnectWithoutUserInput[]
    createMany?: AssetAssignmentCreateManyUserInputEnvelope
    connect?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
  }

  export type UserTicketCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTicketCreateWithoutUserInput, UserTicketUncheckedCreateWithoutUserInput> | UserTicketCreateWithoutUserInput[] | UserTicketUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTicketCreateOrConnectWithoutUserInput | UserTicketCreateOrConnectWithoutUserInput[]
    createMany?: UserTicketCreateManyUserInputEnvelope
    connect?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
  }

  export type ActivityLogCreateNestedManyWithoutUserInput = {
    create?: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput> | ActivityLogCreateWithoutUserInput[] | ActivityLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ActivityLogCreateOrConnectWithoutUserInput | ActivityLogCreateOrConnectWithoutUserInput[]
    createMany?: ActivityLogCreateManyUserInputEnvelope
    connect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
  }

  export type SecurityEventCreateNestedManyWithoutUserInput = {
    create?: XOR<SecurityEventCreateWithoutUserInput, SecurityEventUncheckedCreateWithoutUserInput> | SecurityEventCreateWithoutUserInput[] | SecurityEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SecurityEventCreateOrConnectWithoutUserInput | SecurityEventCreateOrConnectWithoutUserInput[]
    createMany?: SecurityEventCreateManyUserInputEnvelope
    connect?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
  }

  export type TrainingRecordCreateNestedManyWithoutUserInput = {
    create?: XOR<TrainingRecordCreateWithoutUserInput, TrainingRecordUncheckedCreateWithoutUserInput> | TrainingRecordCreateWithoutUserInput[] | TrainingRecordUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TrainingRecordCreateOrConnectWithoutUserInput | TrainingRecordCreateOrConnectWithoutUserInput[]
    createMany?: TrainingRecordCreateManyUserInputEnvelope
    connect?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
  }

  export type UserProfileUncheckedCreateNestedManyWithoutManagerInput = {
    create?: XOR<UserProfileCreateWithoutManagerInput, UserProfileUncheckedCreateWithoutManagerInput> | UserProfileCreateWithoutManagerInput[] | UserProfileUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: UserProfileCreateOrConnectWithoutManagerInput | UserProfileCreateOrConnectWithoutManagerInput[]
    createMany?: UserProfileCreateManyManagerInputEnvelope
    connect?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
  }

  export type LinkedAccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<LinkedAccountCreateWithoutUserInput, LinkedAccountUncheckedCreateWithoutUserInput> | LinkedAccountCreateWithoutUserInput[] | LinkedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LinkedAccountCreateOrConnectWithoutUserInput | LinkedAccountCreateOrConnectWithoutUserInput[]
    createMany?: LinkedAccountCreateManyUserInputEnvelope
    connect?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
  }

  export type AssetAssignmentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AssetAssignmentCreateWithoutUserInput, AssetAssignmentUncheckedCreateWithoutUserInput> | AssetAssignmentCreateWithoutUserInput[] | AssetAssignmentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AssetAssignmentCreateOrConnectWithoutUserInput | AssetAssignmentCreateOrConnectWithoutUserInput[]
    createMany?: AssetAssignmentCreateManyUserInputEnvelope
    connect?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
  }

  export type UserTicketUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTicketCreateWithoutUserInput, UserTicketUncheckedCreateWithoutUserInput> | UserTicketCreateWithoutUserInput[] | UserTicketUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTicketCreateOrConnectWithoutUserInput | UserTicketCreateOrConnectWithoutUserInput[]
    createMany?: UserTicketCreateManyUserInputEnvelope
    connect?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
  }

  export type ActivityLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput> | ActivityLogCreateWithoutUserInput[] | ActivityLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ActivityLogCreateOrConnectWithoutUserInput | ActivityLogCreateOrConnectWithoutUserInput[]
    createMany?: ActivityLogCreateManyUserInputEnvelope
    connect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
  }

  export type SecurityEventUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SecurityEventCreateWithoutUserInput, SecurityEventUncheckedCreateWithoutUserInput> | SecurityEventCreateWithoutUserInput[] | SecurityEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SecurityEventCreateOrConnectWithoutUserInput | SecurityEventCreateOrConnectWithoutUserInput[]
    createMany?: SecurityEventCreateManyUserInputEnvelope
    connect?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
  }

  export type TrainingRecordUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<TrainingRecordCreateWithoutUserInput, TrainingRecordUncheckedCreateWithoutUserInput> | TrainingRecordCreateWithoutUserInput[] | TrainingRecordUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TrainingRecordCreateOrConnectWithoutUserInput | TrainingRecordCreateOrConnectWithoutUserInput[]
    createMany?: TrainingRecordCreateManyUserInputEnvelope
    connect?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumUserStatusFieldUpdateOperationsInput = {
    set?: $Enums.UserStatus
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumRiskLevelFieldUpdateOperationsInput = {
    set?: $Enums.RiskLevel
  }

  export type UserProfileUpdaterolesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserProfileUpdatepermissionsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserProfileUpdateOneWithoutDirectReportsNestedInput = {
    create?: XOR<UserProfileCreateWithoutDirectReportsInput, UserProfileUncheckedCreateWithoutDirectReportsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutDirectReportsInput
    upsert?: UserProfileUpsertWithoutDirectReportsInput
    disconnect?: UserProfileWhereInput | boolean
    delete?: UserProfileWhereInput | boolean
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutDirectReportsInput, UserProfileUpdateWithoutDirectReportsInput>, UserProfileUncheckedUpdateWithoutDirectReportsInput>
  }

  export type UserProfileUpdateManyWithoutManagerNestedInput = {
    create?: XOR<UserProfileCreateWithoutManagerInput, UserProfileUncheckedCreateWithoutManagerInput> | UserProfileCreateWithoutManagerInput[] | UserProfileUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: UserProfileCreateOrConnectWithoutManagerInput | UserProfileCreateOrConnectWithoutManagerInput[]
    upsert?: UserProfileUpsertWithWhereUniqueWithoutManagerInput | UserProfileUpsertWithWhereUniqueWithoutManagerInput[]
    createMany?: UserProfileCreateManyManagerInputEnvelope
    set?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
    disconnect?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
    delete?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
    connect?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
    update?: UserProfileUpdateWithWhereUniqueWithoutManagerInput | UserProfileUpdateWithWhereUniqueWithoutManagerInput[]
    updateMany?: UserProfileUpdateManyWithWhereWithoutManagerInput | UserProfileUpdateManyWithWhereWithoutManagerInput[]
    deleteMany?: UserProfileScalarWhereInput | UserProfileScalarWhereInput[]
  }

  export type LinkedAccountUpdateManyWithoutUserNestedInput = {
    create?: XOR<LinkedAccountCreateWithoutUserInput, LinkedAccountUncheckedCreateWithoutUserInput> | LinkedAccountCreateWithoutUserInput[] | LinkedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LinkedAccountCreateOrConnectWithoutUserInput | LinkedAccountCreateOrConnectWithoutUserInput[]
    upsert?: LinkedAccountUpsertWithWhereUniqueWithoutUserInput | LinkedAccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LinkedAccountCreateManyUserInputEnvelope
    set?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
    disconnect?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
    delete?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
    connect?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
    update?: LinkedAccountUpdateWithWhereUniqueWithoutUserInput | LinkedAccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LinkedAccountUpdateManyWithWhereWithoutUserInput | LinkedAccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LinkedAccountScalarWhereInput | LinkedAccountScalarWhereInput[]
  }

  export type AssetAssignmentUpdateManyWithoutUserNestedInput = {
    create?: XOR<AssetAssignmentCreateWithoutUserInput, AssetAssignmentUncheckedCreateWithoutUserInput> | AssetAssignmentCreateWithoutUserInput[] | AssetAssignmentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AssetAssignmentCreateOrConnectWithoutUserInput | AssetAssignmentCreateOrConnectWithoutUserInput[]
    upsert?: AssetAssignmentUpsertWithWhereUniqueWithoutUserInput | AssetAssignmentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AssetAssignmentCreateManyUserInputEnvelope
    set?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
    disconnect?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
    delete?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
    connect?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
    update?: AssetAssignmentUpdateWithWhereUniqueWithoutUserInput | AssetAssignmentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AssetAssignmentUpdateManyWithWhereWithoutUserInput | AssetAssignmentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AssetAssignmentScalarWhereInput | AssetAssignmentScalarWhereInput[]
  }

  export type UserTicketUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTicketCreateWithoutUserInput, UserTicketUncheckedCreateWithoutUserInput> | UserTicketCreateWithoutUserInput[] | UserTicketUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTicketCreateOrConnectWithoutUserInput | UserTicketCreateOrConnectWithoutUserInput[]
    upsert?: UserTicketUpsertWithWhereUniqueWithoutUserInput | UserTicketUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTicketCreateManyUserInputEnvelope
    set?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
    disconnect?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
    delete?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
    connect?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
    update?: UserTicketUpdateWithWhereUniqueWithoutUserInput | UserTicketUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTicketUpdateManyWithWhereWithoutUserInput | UserTicketUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTicketScalarWhereInput | UserTicketScalarWhereInput[]
  }

  export type ActivityLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput> | ActivityLogCreateWithoutUserInput[] | ActivityLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ActivityLogCreateOrConnectWithoutUserInput | ActivityLogCreateOrConnectWithoutUserInput[]
    upsert?: ActivityLogUpsertWithWhereUniqueWithoutUserInput | ActivityLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ActivityLogCreateManyUserInputEnvelope
    set?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    disconnect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    delete?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    connect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    update?: ActivityLogUpdateWithWhereUniqueWithoutUserInput | ActivityLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ActivityLogUpdateManyWithWhereWithoutUserInput | ActivityLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ActivityLogScalarWhereInput | ActivityLogScalarWhereInput[]
  }

  export type SecurityEventUpdateManyWithoutUserNestedInput = {
    create?: XOR<SecurityEventCreateWithoutUserInput, SecurityEventUncheckedCreateWithoutUserInput> | SecurityEventCreateWithoutUserInput[] | SecurityEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SecurityEventCreateOrConnectWithoutUserInput | SecurityEventCreateOrConnectWithoutUserInput[]
    upsert?: SecurityEventUpsertWithWhereUniqueWithoutUserInput | SecurityEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SecurityEventCreateManyUserInputEnvelope
    set?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
    disconnect?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
    delete?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
    connect?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
    update?: SecurityEventUpdateWithWhereUniqueWithoutUserInput | SecurityEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SecurityEventUpdateManyWithWhereWithoutUserInput | SecurityEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SecurityEventScalarWhereInput | SecurityEventScalarWhereInput[]
  }

  export type TrainingRecordUpdateManyWithoutUserNestedInput = {
    create?: XOR<TrainingRecordCreateWithoutUserInput, TrainingRecordUncheckedCreateWithoutUserInput> | TrainingRecordCreateWithoutUserInput[] | TrainingRecordUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TrainingRecordCreateOrConnectWithoutUserInput | TrainingRecordCreateOrConnectWithoutUserInput[]
    upsert?: TrainingRecordUpsertWithWhereUniqueWithoutUserInput | TrainingRecordUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TrainingRecordCreateManyUserInputEnvelope
    set?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
    disconnect?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
    delete?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
    connect?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
    update?: TrainingRecordUpdateWithWhereUniqueWithoutUserInput | TrainingRecordUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TrainingRecordUpdateManyWithWhereWithoutUserInput | TrainingRecordUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TrainingRecordScalarWhereInput | TrainingRecordScalarWhereInput[]
  }

  export type UserProfileUncheckedUpdateManyWithoutManagerNestedInput = {
    create?: XOR<UserProfileCreateWithoutManagerInput, UserProfileUncheckedCreateWithoutManagerInput> | UserProfileCreateWithoutManagerInput[] | UserProfileUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: UserProfileCreateOrConnectWithoutManagerInput | UserProfileCreateOrConnectWithoutManagerInput[]
    upsert?: UserProfileUpsertWithWhereUniqueWithoutManagerInput | UserProfileUpsertWithWhereUniqueWithoutManagerInput[]
    createMany?: UserProfileCreateManyManagerInputEnvelope
    set?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
    disconnect?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
    delete?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
    connect?: UserProfileWhereUniqueInput | UserProfileWhereUniqueInput[]
    update?: UserProfileUpdateWithWhereUniqueWithoutManagerInput | UserProfileUpdateWithWhereUniqueWithoutManagerInput[]
    updateMany?: UserProfileUpdateManyWithWhereWithoutManagerInput | UserProfileUpdateManyWithWhereWithoutManagerInput[]
    deleteMany?: UserProfileScalarWhereInput | UserProfileScalarWhereInput[]
  }

  export type LinkedAccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<LinkedAccountCreateWithoutUserInput, LinkedAccountUncheckedCreateWithoutUserInput> | LinkedAccountCreateWithoutUserInput[] | LinkedAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LinkedAccountCreateOrConnectWithoutUserInput | LinkedAccountCreateOrConnectWithoutUserInput[]
    upsert?: LinkedAccountUpsertWithWhereUniqueWithoutUserInput | LinkedAccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LinkedAccountCreateManyUserInputEnvelope
    set?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
    disconnect?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
    delete?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
    connect?: LinkedAccountWhereUniqueInput | LinkedAccountWhereUniqueInput[]
    update?: LinkedAccountUpdateWithWhereUniqueWithoutUserInput | LinkedAccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LinkedAccountUpdateManyWithWhereWithoutUserInput | LinkedAccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LinkedAccountScalarWhereInput | LinkedAccountScalarWhereInput[]
  }

  export type AssetAssignmentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AssetAssignmentCreateWithoutUserInput, AssetAssignmentUncheckedCreateWithoutUserInput> | AssetAssignmentCreateWithoutUserInput[] | AssetAssignmentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AssetAssignmentCreateOrConnectWithoutUserInput | AssetAssignmentCreateOrConnectWithoutUserInput[]
    upsert?: AssetAssignmentUpsertWithWhereUniqueWithoutUserInput | AssetAssignmentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AssetAssignmentCreateManyUserInputEnvelope
    set?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
    disconnect?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
    delete?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
    connect?: AssetAssignmentWhereUniqueInput | AssetAssignmentWhereUniqueInput[]
    update?: AssetAssignmentUpdateWithWhereUniqueWithoutUserInput | AssetAssignmentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AssetAssignmentUpdateManyWithWhereWithoutUserInput | AssetAssignmentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AssetAssignmentScalarWhereInput | AssetAssignmentScalarWhereInput[]
  }

  export type UserTicketUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTicketCreateWithoutUserInput, UserTicketUncheckedCreateWithoutUserInput> | UserTicketCreateWithoutUserInput[] | UserTicketUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTicketCreateOrConnectWithoutUserInput | UserTicketCreateOrConnectWithoutUserInput[]
    upsert?: UserTicketUpsertWithWhereUniqueWithoutUserInput | UserTicketUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTicketCreateManyUserInputEnvelope
    set?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
    disconnect?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
    delete?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
    connect?: UserTicketWhereUniqueInput | UserTicketWhereUniqueInput[]
    update?: UserTicketUpdateWithWhereUniqueWithoutUserInput | UserTicketUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTicketUpdateManyWithWhereWithoutUserInput | UserTicketUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTicketScalarWhereInput | UserTicketScalarWhereInput[]
  }

  export type ActivityLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput> | ActivityLogCreateWithoutUserInput[] | ActivityLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ActivityLogCreateOrConnectWithoutUserInput | ActivityLogCreateOrConnectWithoutUserInput[]
    upsert?: ActivityLogUpsertWithWhereUniqueWithoutUserInput | ActivityLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ActivityLogCreateManyUserInputEnvelope
    set?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    disconnect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    delete?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    connect?: ActivityLogWhereUniqueInput | ActivityLogWhereUniqueInput[]
    update?: ActivityLogUpdateWithWhereUniqueWithoutUserInput | ActivityLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ActivityLogUpdateManyWithWhereWithoutUserInput | ActivityLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ActivityLogScalarWhereInput | ActivityLogScalarWhereInput[]
  }

  export type SecurityEventUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SecurityEventCreateWithoutUserInput, SecurityEventUncheckedCreateWithoutUserInput> | SecurityEventCreateWithoutUserInput[] | SecurityEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SecurityEventCreateOrConnectWithoutUserInput | SecurityEventCreateOrConnectWithoutUserInput[]
    upsert?: SecurityEventUpsertWithWhereUniqueWithoutUserInput | SecurityEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SecurityEventCreateManyUserInputEnvelope
    set?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
    disconnect?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
    delete?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
    connect?: SecurityEventWhereUniqueInput | SecurityEventWhereUniqueInput[]
    update?: SecurityEventUpdateWithWhereUniqueWithoutUserInput | SecurityEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SecurityEventUpdateManyWithWhereWithoutUserInput | SecurityEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SecurityEventScalarWhereInput | SecurityEventScalarWhereInput[]
  }

  export type TrainingRecordUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<TrainingRecordCreateWithoutUserInput, TrainingRecordUncheckedCreateWithoutUserInput> | TrainingRecordCreateWithoutUserInput[] | TrainingRecordUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TrainingRecordCreateOrConnectWithoutUserInput | TrainingRecordCreateOrConnectWithoutUserInput[]
    upsert?: TrainingRecordUpsertWithWhereUniqueWithoutUserInput | TrainingRecordUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TrainingRecordCreateManyUserInputEnvelope
    set?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
    disconnect?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
    delete?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
    connect?: TrainingRecordWhereUniqueInput | TrainingRecordWhereUniqueInput[]
    update?: TrainingRecordUpdateWithWhereUniqueWithoutUserInput | TrainingRecordUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TrainingRecordUpdateManyWithWhereWithoutUserInput | TrainingRecordUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TrainingRecordScalarWhereInput | TrainingRecordScalarWhereInput[]
  }

  export type UserProfileCreateNestedOneWithoutLinkedAccountsInput = {
    create?: XOR<UserProfileCreateWithoutLinkedAccountsInput, UserProfileUncheckedCreateWithoutLinkedAccountsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutLinkedAccountsInput
    connect?: UserProfileWhereUniqueInput
  }

  export type UserProfileUpdateOneRequiredWithoutLinkedAccountsNestedInput = {
    create?: XOR<UserProfileCreateWithoutLinkedAccountsInput, UserProfileUncheckedCreateWithoutLinkedAccountsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutLinkedAccountsInput
    upsert?: UserProfileUpsertWithoutLinkedAccountsInput
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutLinkedAccountsInput, UserProfileUpdateWithoutLinkedAccountsInput>, UserProfileUncheckedUpdateWithoutLinkedAccountsInput>
  }

  export type UserProfileCreateNestedOneWithoutAssetsInput = {
    create?: XOR<UserProfileCreateWithoutAssetsInput, UserProfileUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutAssetsInput
    connect?: UserProfileWhereUniqueInput
  }

  export type EnumAssetTypeFieldUpdateOperationsInput = {
    set?: $Enums.AssetType
  }

  export type EnumAssetStatusFieldUpdateOperationsInput = {
    set?: $Enums.AssetStatus
  }

  export type EnumComplianceStatusFieldUpdateOperationsInput = {
    set?: $Enums.ComplianceStatus
  }

  export type UserProfileUpdateOneRequiredWithoutAssetsNestedInput = {
    create?: XOR<UserProfileCreateWithoutAssetsInput, UserProfileUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutAssetsInput
    upsert?: UserProfileUpsertWithoutAssetsInput
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutAssetsInput, UserProfileUpdateWithoutAssetsInput>, UserProfileUncheckedUpdateWithoutAssetsInput>
  }

  export type UserProfileCreateNestedOneWithoutTicketsInput = {
    create?: XOR<UserProfileCreateWithoutTicketsInput, UserProfileUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutTicketsInput
    connect?: UserProfileWhereUniqueInput
  }

  export type EnumTicketRelationshipFieldUpdateOperationsInput = {
    set?: $Enums.TicketRelationship
  }

  export type UserProfileUpdateOneRequiredWithoutTicketsNestedInput = {
    create?: XOR<UserProfileCreateWithoutTicketsInput, UserProfileUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutTicketsInput
    upsert?: UserProfileUpsertWithoutTicketsInput
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutTicketsInput, UserProfileUpdateWithoutTicketsInput>, UserProfileUncheckedUpdateWithoutTicketsInput>
  }

  export type UserProfileCreateNestedOneWithoutActivityLogsInput = {
    create?: XOR<UserProfileCreateWithoutActivityLogsInput, UserProfileUncheckedCreateWithoutActivityLogsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutActivityLogsInput
    connect?: UserProfileWhereUniqueInput
  }

  export type EnumActivityOutcomeFieldUpdateOperationsInput = {
    set?: $Enums.ActivityOutcome
  }

  export type UserProfileUpdateOneRequiredWithoutActivityLogsNestedInput = {
    create?: XOR<UserProfileCreateWithoutActivityLogsInput, UserProfileUncheckedCreateWithoutActivityLogsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutActivityLogsInput
    upsert?: UserProfileUpsertWithoutActivityLogsInput
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutActivityLogsInput, UserProfileUpdateWithoutActivityLogsInput>, UserProfileUncheckedUpdateWithoutActivityLogsInput>
  }

  export type UserProfileCreateNestedOneWithoutSecurityEventsInput = {
    create?: XOR<UserProfileCreateWithoutSecurityEventsInput, UserProfileUncheckedCreateWithoutSecurityEventsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutSecurityEventsInput
    connect?: UserProfileWhereUniqueInput
  }

  export type EnumEventSeverityFieldUpdateOperationsInput = {
    set?: $Enums.EventSeverity
  }

  export type EnumEventStatusFieldUpdateOperationsInput = {
    set?: $Enums.EventStatus
  }

  export type UserProfileUpdateOneRequiredWithoutSecurityEventsNestedInput = {
    create?: XOR<UserProfileCreateWithoutSecurityEventsInput, UserProfileUncheckedCreateWithoutSecurityEventsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutSecurityEventsInput
    upsert?: UserProfileUpsertWithoutSecurityEventsInput
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutSecurityEventsInput, UserProfileUpdateWithoutSecurityEventsInput>, UserProfileUncheckedUpdateWithoutSecurityEventsInput>
  }

  export type UserProfileCreateNestedOneWithoutTrainingRecordsInput = {
    create?: XOR<UserProfileCreateWithoutTrainingRecordsInput, UserProfileUncheckedCreateWithoutTrainingRecordsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutTrainingRecordsInput
    connect?: UserProfileWhereUniqueInput
  }

  export type EnumTrainingStatusFieldUpdateOperationsInput = {
    set?: $Enums.TrainingStatus
  }

  export type UserProfileUpdateOneRequiredWithoutTrainingRecordsNestedInput = {
    create?: XOR<UserProfileCreateWithoutTrainingRecordsInput, UserProfileUncheckedCreateWithoutTrainingRecordsInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutTrainingRecordsInput
    upsert?: UserProfileUpsertWithoutTrainingRecordsInput
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutTrainingRecordsInput, UserProfileUpdateWithoutTrainingRecordsInput>, UserProfileUncheckedUpdateWithoutTrainingRecordsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumRiskLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelFilter<$PrismaModel> | $Enums.RiskLevel
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskLevelFilter<$PrismaModel>
    _max?: NestedEnumRiskLevelFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType
  }

  export type NestedEnumAssetStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetStatus | EnumAssetStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssetStatus[] | ListEnumAssetStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetStatus[] | ListEnumAssetStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetStatusFilter<$PrismaModel> | $Enums.AssetStatus
  }

  export type NestedEnumComplianceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ComplianceStatus | EnumComplianceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ComplianceStatus[] | ListEnumComplianceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ComplianceStatus[] | ListEnumComplianceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumComplianceStatusFilter<$PrismaModel> | $Enums.ComplianceStatus
  }

  export type NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetTypeFilter<$PrismaModel>
    _max?: NestedEnumAssetTypeFilter<$PrismaModel>
  }

  export type NestedEnumAssetStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetStatus | EnumAssetStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssetStatus[] | ListEnumAssetStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetStatus[] | ListEnumAssetStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssetStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetStatusFilter<$PrismaModel>
    _max?: NestedEnumAssetStatusFilter<$PrismaModel>
  }

  export type NestedEnumComplianceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ComplianceStatus | EnumComplianceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ComplianceStatus[] | ListEnumComplianceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ComplianceStatus[] | ListEnumComplianceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumComplianceStatusWithAggregatesFilter<$PrismaModel> | $Enums.ComplianceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumComplianceStatusFilter<$PrismaModel>
    _max?: NestedEnumComplianceStatusFilter<$PrismaModel>
  }

  export type NestedEnumTicketRelationshipFilter<$PrismaModel = never> = {
    equals?: $Enums.TicketRelationship | EnumTicketRelationshipFieldRefInput<$PrismaModel>
    in?: $Enums.TicketRelationship[] | ListEnumTicketRelationshipFieldRefInput<$PrismaModel>
    notIn?: $Enums.TicketRelationship[] | ListEnumTicketRelationshipFieldRefInput<$PrismaModel>
    not?: NestedEnumTicketRelationshipFilter<$PrismaModel> | $Enums.TicketRelationship
  }

  export type NestedEnumTicketRelationshipWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TicketRelationship | EnumTicketRelationshipFieldRefInput<$PrismaModel>
    in?: $Enums.TicketRelationship[] | ListEnumTicketRelationshipFieldRefInput<$PrismaModel>
    notIn?: $Enums.TicketRelationship[] | ListEnumTicketRelationshipFieldRefInput<$PrismaModel>
    not?: NestedEnumTicketRelationshipWithAggregatesFilter<$PrismaModel> | $Enums.TicketRelationship
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTicketRelationshipFilter<$PrismaModel>
    _max?: NestedEnumTicketRelationshipFilter<$PrismaModel>
  }

  export type NestedEnumActivityOutcomeFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityOutcome | EnumActivityOutcomeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityOutcome[] | ListEnumActivityOutcomeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityOutcome[] | ListEnumActivityOutcomeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityOutcomeFilter<$PrismaModel> | $Enums.ActivityOutcome
  }

  export type NestedEnumActivityOutcomeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityOutcome | EnumActivityOutcomeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityOutcome[] | ListEnumActivityOutcomeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityOutcome[] | ListEnumActivityOutcomeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityOutcomeWithAggregatesFilter<$PrismaModel> | $Enums.ActivityOutcome
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityOutcomeFilter<$PrismaModel>
    _max?: NestedEnumActivityOutcomeFilter<$PrismaModel>
  }

  export type NestedEnumEventSeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.EventSeverity | EnumEventSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.EventSeverity[] | ListEnumEventSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventSeverity[] | ListEnumEventSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumEventSeverityFilter<$PrismaModel> | $Enums.EventSeverity
  }

  export type NestedEnumEventStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EventStatus | EnumEventStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEventStatusFilter<$PrismaModel> | $Enums.EventStatus
  }

  export type NestedEnumEventSeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EventSeverity | EnumEventSeverityFieldRefInput<$PrismaModel>
    in?: $Enums.EventSeverity[] | ListEnumEventSeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventSeverity[] | ListEnumEventSeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumEventSeverityWithAggregatesFilter<$PrismaModel> | $Enums.EventSeverity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEventSeverityFilter<$PrismaModel>
    _max?: NestedEnumEventSeverityFilter<$PrismaModel>
  }

  export type NestedEnumEventStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EventStatus | EnumEventStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEventStatusWithAggregatesFilter<$PrismaModel> | $Enums.EventStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEventStatusFilter<$PrismaModel>
    _max?: NestedEnumEventStatusFilter<$PrismaModel>
  }

  export type NestedEnumTrainingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TrainingStatus | EnumTrainingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TrainingStatus[] | ListEnumTrainingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TrainingStatus[] | ListEnumTrainingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTrainingStatusFilter<$PrismaModel> | $Enums.TrainingStatus
  }

  export type NestedEnumTrainingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrainingStatus | EnumTrainingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TrainingStatus[] | ListEnumTrainingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TrainingStatus[] | ListEnumTrainingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTrainingStatusWithAggregatesFilter<$PrismaModel> | $Enums.TrainingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTrainingStatusFilter<$PrismaModel>
    _max?: NestedEnumTrainingStatusFilter<$PrismaModel>
  }

  export type UserProfileCreateWithoutDirectReportsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    manager?: UserProfileCreateNestedOneWithoutDirectReportsInput
    linkedAccounts?: LinkedAccountCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentCreateNestedManyWithoutUserInput
    tickets?: UserTicketCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordCreateNestedManyWithoutUserInput
  }

  export type UserProfileUncheckedCreateWithoutDirectReportsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    managerId?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    linkedAccounts?: LinkedAccountUncheckedCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentUncheckedCreateNestedManyWithoutUserInput
    tickets?: UserTicketUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventUncheckedCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserProfileCreateOrConnectWithoutDirectReportsInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutDirectReportsInput, UserProfileUncheckedCreateWithoutDirectReportsInput>
  }

  export type UserProfileCreateWithoutManagerInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    directReports?: UserProfileCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentCreateNestedManyWithoutUserInput
    tickets?: UserTicketCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordCreateNestedManyWithoutUserInput
  }

  export type UserProfileUncheckedCreateWithoutManagerInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    directReports?: UserProfileUncheckedCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountUncheckedCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentUncheckedCreateNestedManyWithoutUserInput
    tickets?: UserTicketUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventUncheckedCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserProfileCreateOrConnectWithoutManagerInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutManagerInput, UserProfileUncheckedCreateWithoutManagerInput>
  }

  export type UserProfileCreateManyManagerInputEnvelope = {
    data: UserProfileCreateManyManagerInput | UserProfileCreateManyManagerInput[]
    skipDuplicates?: boolean
  }

  export type LinkedAccountCreateWithoutUserInput = {
    id?: string
    platform: string
    platformUserId: string
    platformUsername?: string | null
    accountEmail?: string | null
    accountStatus?: string
    accountType?: string | null
    lastSyncAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LinkedAccountUncheckedCreateWithoutUserInput = {
    id?: string
    platform: string
    platformUserId: string
    platformUsername?: string | null
    accountEmail?: string | null
    accountStatus?: string
    accountType?: string | null
    lastSyncAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LinkedAccountCreateOrConnectWithoutUserInput = {
    where: LinkedAccountWhereUniqueInput
    create: XOR<LinkedAccountCreateWithoutUserInput, LinkedAccountUncheckedCreateWithoutUserInput>
  }

  export type LinkedAccountCreateManyUserInputEnvelope = {
    data: LinkedAccountCreateManyUserInput | LinkedAccountCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AssetAssignmentCreateWithoutUserInput = {
    id?: string
    assetId: string
    assetType: $Enums.AssetType
    assetName: string
    assetCategory?: string | null
    assignedAt?: Date | string
    assignedBy: string
    unassignedAt?: Date | string | null
    unassignedBy?: string | null
    status?: $Enums.AssetStatus
    complianceStatus?: $Enums.ComplianceStatus
    lastCheckAt?: Date | string | null
    notes?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type AssetAssignmentUncheckedCreateWithoutUserInput = {
    id?: string
    assetId: string
    assetType: $Enums.AssetType
    assetName: string
    assetCategory?: string | null
    assignedAt?: Date | string
    assignedBy: string
    unassignedAt?: Date | string | null
    unassignedBy?: string | null
    status?: $Enums.AssetStatus
    complianceStatus?: $Enums.ComplianceStatus
    lastCheckAt?: Date | string | null
    notes?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type AssetAssignmentCreateOrConnectWithoutUserInput = {
    where: AssetAssignmentWhereUniqueInput
    create: XOR<AssetAssignmentCreateWithoutUserInput, AssetAssignmentUncheckedCreateWithoutUserInput>
  }

  export type AssetAssignmentCreateManyUserInputEnvelope = {
    data: AssetAssignmentCreateManyUserInput | AssetAssignmentCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserTicketCreateWithoutUserInput = {
    id?: string
    ticketId: string
    ticketNumber: string
    relationship: $Enums.TicketRelationship
    title: string
    status: string
    priority: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserTicketUncheckedCreateWithoutUserInput = {
    id?: string
    ticketId: string
    ticketNumber: string
    relationship: $Enums.TicketRelationship
    title: string
    status: string
    priority: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserTicketCreateOrConnectWithoutUserInput = {
    where: UserTicketWhereUniqueInput
    create: XOR<UserTicketCreateWithoutUserInput, UserTicketUncheckedCreateWithoutUserInput>
  }

  export type UserTicketCreateManyUserInputEnvelope = {
    data: UserTicketCreateManyUserInput | UserTicketCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ActivityLogCreateWithoutUserInput = {
    id?: string
    activity: string
    source: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: $Enums.ActivityOutcome
    riskScore?: number | null
    sessionId?: string | null
    correlationId?: string | null
    timestamp?: Date | string
    retentionDate?: Date | string | null
  }

  export type ActivityLogUncheckedCreateWithoutUserInput = {
    id?: string
    activity: string
    source: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: $Enums.ActivityOutcome
    riskScore?: number | null
    sessionId?: string | null
    correlationId?: string | null
    timestamp?: Date | string
    retentionDate?: Date | string | null
  }

  export type ActivityLogCreateOrConnectWithoutUserInput = {
    where: ActivityLogWhereUniqueInput
    create: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput>
  }

  export type ActivityLogCreateManyUserInputEnvelope = {
    data: ActivityLogCreateManyUserInput | ActivityLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SecurityEventCreateWithoutUserInput = {
    id?: string
    eventType: string
    severity?: $Enums.EventSeverity
    category: string
    description: string
    source: string
    ipAddress?: string | null
    location?: string | null
    status?: $Enums.EventStatus
    assignedTo?: string | null
    resolvedAt?: Date | string | null
    resolution?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SecurityEventUncheckedCreateWithoutUserInput = {
    id?: string
    eventType: string
    severity?: $Enums.EventSeverity
    category: string
    description: string
    source: string
    ipAddress?: string | null
    location?: string | null
    status?: $Enums.EventStatus
    assignedTo?: string | null
    resolvedAt?: Date | string | null
    resolution?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SecurityEventCreateOrConnectWithoutUserInput = {
    where: SecurityEventWhereUniqueInput
    create: XOR<SecurityEventCreateWithoutUserInput, SecurityEventUncheckedCreateWithoutUserInput>
  }

  export type SecurityEventCreateManyUserInputEnvelope = {
    data: SecurityEventCreateManyUserInput | SecurityEventCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type TrainingRecordCreateWithoutUserInput = {
    id?: string
    courseId: string
    courseName: string
    courseCategory?: string | null
    provider?: string | null
    status?: $Enums.TrainingStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    expiresAt?: Date | string | null
    score?: number | null
    isRequired?: boolean
    dueDate?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingRecordUncheckedCreateWithoutUserInput = {
    id?: string
    courseId: string
    courseName: string
    courseCategory?: string | null
    provider?: string | null
    status?: $Enums.TrainingStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    expiresAt?: Date | string | null
    score?: number | null
    isRequired?: boolean
    dueDate?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingRecordCreateOrConnectWithoutUserInput = {
    where: TrainingRecordWhereUniqueInput
    create: XOR<TrainingRecordCreateWithoutUserInput, TrainingRecordUncheckedCreateWithoutUserInput>
  }

  export type TrainingRecordCreateManyUserInputEnvelope = {
    data: TrainingRecordCreateManyUserInput | TrainingRecordCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserProfileUpsertWithoutDirectReportsInput = {
    update: XOR<UserProfileUpdateWithoutDirectReportsInput, UserProfileUncheckedUpdateWithoutDirectReportsInput>
    create: XOR<UserProfileCreateWithoutDirectReportsInput, UserProfileUncheckedCreateWithoutDirectReportsInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutDirectReportsInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutDirectReportsInput, UserProfileUncheckedUpdateWithoutDirectReportsInput>
  }

  export type UserProfileUpdateWithoutDirectReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    manager?: UserProfileUpdateOneWithoutDirectReportsNestedInput
    linkedAccounts?: LinkedAccountUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateWithoutDirectReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    linkedAccounts?: LinkedAccountUncheckedUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUncheckedUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUncheckedUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUpsertWithWhereUniqueWithoutManagerInput = {
    where: UserProfileWhereUniqueInput
    update: XOR<UserProfileUpdateWithoutManagerInput, UserProfileUncheckedUpdateWithoutManagerInput>
    create: XOR<UserProfileCreateWithoutManagerInput, UserProfileUncheckedCreateWithoutManagerInput>
  }

  export type UserProfileUpdateWithWhereUniqueWithoutManagerInput = {
    where: UserProfileWhereUniqueInput
    data: XOR<UserProfileUpdateWithoutManagerInput, UserProfileUncheckedUpdateWithoutManagerInput>
  }

  export type UserProfileUpdateManyWithWhereWithoutManagerInput = {
    where: UserProfileScalarWhereInput
    data: XOR<UserProfileUpdateManyMutationInput, UserProfileUncheckedUpdateManyWithoutManagerInput>
  }

  export type UserProfileScalarWhereInput = {
    AND?: UserProfileScalarWhereInput | UserProfileScalarWhereInput[]
    OR?: UserProfileScalarWhereInput[]
    NOT?: UserProfileScalarWhereInput | UserProfileScalarWhereInput[]
    id?: StringFilter<"UserProfile"> | string
    helixUid?: StringFilter<"UserProfile"> | string
    email?: StringFilter<"UserProfile"> | string
    emailCanonical?: StringFilter<"UserProfile"> | string
    employeeId?: StringNullableFilter<"UserProfile"> | string | null
    firstName?: StringFilter<"UserProfile"> | string
    lastName?: StringFilter<"UserProfile"> | string
    displayName?: StringNullableFilter<"UserProfile"> | string | null
    preferredName?: StringNullableFilter<"UserProfile"> | string | null
    profilePicture?: StringNullableFilter<"UserProfile"> | string | null
    phoneNumber?: StringNullableFilter<"UserProfile"> | string | null
    mobileNumber?: StringNullableFilter<"UserProfile"> | string | null
    department?: StringNullableFilter<"UserProfile"> | string | null
    jobTitle?: StringNullableFilter<"UserProfile"> | string | null
    managerId?: StringNullableFilter<"UserProfile"> | string | null
    location?: StringNullableFilter<"UserProfile"> | string | null
    timezone?: StringNullableFilter<"UserProfile"> | string | null
    startDate?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    endDate?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    status?: EnumUserStatusFilter<"UserProfile"> | $Enums.UserStatus
    lastLoginAt?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    lastActiveAt?: DateTimeNullableFilter<"UserProfile"> | Date | string | null
    isServiceAccount?: BoolFilter<"UserProfile"> | boolean
    securityScore?: IntNullableFilter<"UserProfile"> | number | null
    riskLevel?: EnumRiskLevelFilter<"UserProfile"> | $Enums.RiskLevel
    mfaEnabled?: BoolFilter<"UserProfile"> | boolean
    tenantId?: StringFilter<"UserProfile"> | string
    roles?: StringNullableListFilter<"UserProfile">
    permissions?: StringNullableListFilter<"UserProfile">
    createdAt?: DateTimeFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeFilter<"UserProfile"> | Date | string
    createdBy?: StringNullableFilter<"UserProfile"> | string | null
    lastUpdatedBy?: StringNullableFilter<"UserProfile"> | string | null
    dataVersion?: IntFilter<"UserProfile"> | number
  }

  export type LinkedAccountUpsertWithWhereUniqueWithoutUserInput = {
    where: LinkedAccountWhereUniqueInput
    update: XOR<LinkedAccountUpdateWithoutUserInput, LinkedAccountUncheckedUpdateWithoutUserInput>
    create: XOR<LinkedAccountCreateWithoutUserInput, LinkedAccountUncheckedCreateWithoutUserInput>
  }

  export type LinkedAccountUpdateWithWhereUniqueWithoutUserInput = {
    where: LinkedAccountWhereUniqueInput
    data: XOR<LinkedAccountUpdateWithoutUserInput, LinkedAccountUncheckedUpdateWithoutUserInput>
  }

  export type LinkedAccountUpdateManyWithWhereWithoutUserInput = {
    where: LinkedAccountScalarWhereInput
    data: XOR<LinkedAccountUpdateManyMutationInput, LinkedAccountUncheckedUpdateManyWithoutUserInput>
  }

  export type LinkedAccountScalarWhereInput = {
    AND?: LinkedAccountScalarWhereInput | LinkedAccountScalarWhereInput[]
    OR?: LinkedAccountScalarWhereInput[]
    NOT?: LinkedAccountScalarWhereInput | LinkedAccountScalarWhereInput[]
    id?: StringFilter<"LinkedAccount"> | string
    userId?: StringFilter<"LinkedAccount"> | string
    platform?: StringFilter<"LinkedAccount"> | string
    platformUserId?: StringFilter<"LinkedAccount"> | string
    platformUsername?: StringNullableFilter<"LinkedAccount"> | string | null
    accountEmail?: StringNullableFilter<"LinkedAccount"> | string | null
    accountStatus?: StringFilter<"LinkedAccount"> | string
    accountType?: StringNullableFilter<"LinkedAccount"> | string | null
    lastSyncAt?: DateTimeNullableFilter<"LinkedAccount"> | Date | string | null
    metadata?: JsonNullableFilter<"LinkedAccount">
    syncEnabled?: BoolFilter<"LinkedAccount"> | boolean
    createdAt?: DateTimeFilter<"LinkedAccount"> | Date | string
    updatedAt?: DateTimeFilter<"LinkedAccount"> | Date | string
  }

  export type AssetAssignmentUpsertWithWhereUniqueWithoutUserInput = {
    where: AssetAssignmentWhereUniqueInput
    update: XOR<AssetAssignmentUpdateWithoutUserInput, AssetAssignmentUncheckedUpdateWithoutUserInput>
    create: XOR<AssetAssignmentCreateWithoutUserInput, AssetAssignmentUncheckedCreateWithoutUserInput>
  }

  export type AssetAssignmentUpdateWithWhereUniqueWithoutUserInput = {
    where: AssetAssignmentWhereUniqueInput
    data: XOR<AssetAssignmentUpdateWithoutUserInput, AssetAssignmentUncheckedUpdateWithoutUserInput>
  }

  export type AssetAssignmentUpdateManyWithWhereWithoutUserInput = {
    where: AssetAssignmentScalarWhereInput
    data: XOR<AssetAssignmentUpdateManyMutationInput, AssetAssignmentUncheckedUpdateManyWithoutUserInput>
  }

  export type AssetAssignmentScalarWhereInput = {
    AND?: AssetAssignmentScalarWhereInput | AssetAssignmentScalarWhereInput[]
    OR?: AssetAssignmentScalarWhereInput[]
    NOT?: AssetAssignmentScalarWhereInput | AssetAssignmentScalarWhereInput[]
    id?: StringFilter<"AssetAssignment"> | string
    userId?: StringFilter<"AssetAssignment"> | string
    assetId?: StringFilter<"AssetAssignment"> | string
    assetType?: EnumAssetTypeFilter<"AssetAssignment"> | $Enums.AssetType
    assetName?: StringFilter<"AssetAssignment"> | string
    assetCategory?: StringNullableFilter<"AssetAssignment"> | string | null
    assignedAt?: DateTimeFilter<"AssetAssignment"> | Date | string
    assignedBy?: StringFilter<"AssetAssignment"> | string
    unassignedAt?: DateTimeNullableFilter<"AssetAssignment"> | Date | string | null
    unassignedBy?: StringNullableFilter<"AssetAssignment"> | string | null
    status?: EnumAssetStatusFilter<"AssetAssignment"> | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFilter<"AssetAssignment"> | $Enums.ComplianceStatus
    lastCheckAt?: DateTimeNullableFilter<"AssetAssignment"> | Date | string | null
    notes?: StringNullableFilter<"AssetAssignment"> | string | null
    metadata?: JsonNullableFilter<"AssetAssignment">
  }

  export type UserTicketUpsertWithWhereUniqueWithoutUserInput = {
    where: UserTicketWhereUniqueInput
    update: XOR<UserTicketUpdateWithoutUserInput, UserTicketUncheckedUpdateWithoutUserInput>
    create: XOR<UserTicketCreateWithoutUserInput, UserTicketUncheckedCreateWithoutUserInput>
  }

  export type UserTicketUpdateWithWhereUniqueWithoutUserInput = {
    where: UserTicketWhereUniqueInput
    data: XOR<UserTicketUpdateWithoutUserInput, UserTicketUncheckedUpdateWithoutUserInput>
  }

  export type UserTicketUpdateManyWithWhereWithoutUserInput = {
    where: UserTicketScalarWhereInput
    data: XOR<UserTicketUpdateManyMutationInput, UserTicketUncheckedUpdateManyWithoutUserInput>
  }

  export type UserTicketScalarWhereInput = {
    AND?: UserTicketScalarWhereInput | UserTicketScalarWhereInput[]
    OR?: UserTicketScalarWhereInput[]
    NOT?: UserTicketScalarWhereInput | UserTicketScalarWhereInput[]
    id?: StringFilter<"UserTicket"> | string
    userId?: StringFilter<"UserTicket"> | string
    ticketId?: StringFilter<"UserTicket"> | string
    ticketNumber?: StringFilter<"UserTicket"> | string
    relationship?: EnumTicketRelationshipFilter<"UserTicket"> | $Enums.TicketRelationship
    title?: StringFilter<"UserTicket"> | string
    status?: StringFilter<"UserTicket"> | string
    priority?: StringFilter<"UserTicket"> | string
    category?: StringNullableFilter<"UserTicket"> | string | null
    createdAt?: DateTimeFilter<"UserTicket"> | Date | string
    updatedAt?: DateTimeFilter<"UserTicket"> | Date | string
  }

  export type ActivityLogUpsertWithWhereUniqueWithoutUserInput = {
    where: ActivityLogWhereUniqueInput
    update: XOR<ActivityLogUpdateWithoutUserInput, ActivityLogUncheckedUpdateWithoutUserInput>
    create: XOR<ActivityLogCreateWithoutUserInput, ActivityLogUncheckedCreateWithoutUserInput>
  }

  export type ActivityLogUpdateWithWhereUniqueWithoutUserInput = {
    where: ActivityLogWhereUniqueInput
    data: XOR<ActivityLogUpdateWithoutUserInput, ActivityLogUncheckedUpdateWithoutUserInput>
  }

  export type ActivityLogUpdateManyWithWhereWithoutUserInput = {
    where: ActivityLogScalarWhereInput
    data: XOR<ActivityLogUpdateManyMutationInput, ActivityLogUncheckedUpdateManyWithoutUserInput>
  }

  export type ActivityLogScalarWhereInput = {
    AND?: ActivityLogScalarWhereInput | ActivityLogScalarWhereInput[]
    OR?: ActivityLogScalarWhereInput[]
    NOT?: ActivityLogScalarWhereInput | ActivityLogScalarWhereInput[]
    id?: StringFilter<"ActivityLog"> | string
    userId?: StringFilter<"ActivityLog"> | string
    activity?: StringFilter<"ActivityLog"> | string
    source?: StringFilter<"ActivityLog"> | string
    ipAddress?: StringNullableFilter<"ActivityLog"> | string | null
    userAgent?: StringNullableFilter<"ActivityLog"> | string | null
    location?: StringNullableFilter<"ActivityLog"> | string | null
    details?: JsonNullableFilter<"ActivityLog">
    outcome?: EnumActivityOutcomeFilter<"ActivityLog"> | $Enums.ActivityOutcome
    riskScore?: IntNullableFilter<"ActivityLog"> | number | null
    sessionId?: StringNullableFilter<"ActivityLog"> | string | null
    correlationId?: StringNullableFilter<"ActivityLog"> | string | null
    timestamp?: DateTimeFilter<"ActivityLog"> | Date | string
    retentionDate?: DateTimeNullableFilter<"ActivityLog"> | Date | string | null
  }

  export type SecurityEventUpsertWithWhereUniqueWithoutUserInput = {
    where: SecurityEventWhereUniqueInput
    update: XOR<SecurityEventUpdateWithoutUserInput, SecurityEventUncheckedUpdateWithoutUserInput>
    create: XOR<SecurityEventCreateWithoutUserInput, SecurityEventUncheckedCreateWithoutUserInput>
  }

  export type SecurityEventUpdateWithWhereUniqueWithoutUserInput = {
    where: SecurityEventWhereUniqueInput
    data: XOR<SecurityEventUpdateWithoutUserInput, SecurityEventUncheckedUpdateWithoutUserInput>
  }

  export type SecurityEventUpdateManyWithWhereWithoutUserInput = {
    where: SecurityEventScalarWhereInput
    data: XOR<SecurityEventUpdateManyMutationInput, SecurityEventUncheckedUpdateManyWithoutUserInput>
  }

  export type SecurityEventScalarWhereInput = {
    AND?: SecurityEventScalarWhereInput | SecurityEventScalarWhereInput[]
    OR?: SecurityEventScalarWhereInput[]
    NOT?: SecurityEventScalarWhereInput | SecurityEventScalarWhereInput[]
    id?: StringFilter<"SecurityEvent"> | string
    userId?: StringFilter<"SecurityEvent"> | string
    eventType?: StringFilter<"SecurityEvent"> | string
    severity?: EnumEventSeverityFilter<"SecurityEvent"> | $Enums.EventSeverity
    category?: StringFilter<"SecurityEvent"> | string
    description?: StringFilter<"SecurityEvent"> | string
    source?: StringFilter<"SecurityEvent"> | string
    ipAddress?: StringNullableFilter<"SecurityEvent"> | string | null
    location?: StringNullableFilter<"SecurityEvent"> | string | null
    status?: EnumEventStatusFilter<"SecurityEvent"> | $Enums.EventStatus
    assignedTo?: StringNullableFilter<"SecurityEvent"> | string | null
    resolvedAt?: DateTimeNullableFilter<"SecurityEvent"> | Date | string | null
    resolution?: StringNullableFilter<"SecurityEvent"> | string | null
    metadata?: JsonNullableFilter<"SecurityEvent">
    createdAt?: DateTimeFilter<"SecurityEvent"> | Date | string
    updatedAt?: DateTimeFilter<"SecurityEvent"> | Date | string
  }

  export type TrainingRecordUpsertWithWhereUniqueWithoutUserInput = {
    where: TrainingRecordWhereUniqueInput
    update: XOR<TrainingRecordUpdateWithoutUserInput, TrainingRecordUncheckedUpdateWithoutUserInput>
    create: XOR<TrainingRecordCreateWithoutUserInput, TrainingRecordUncheckedCreateWithoutUserInput>
  }

  export type TrainingRecordUpdateWithWhereUniqueWithoutUserInput = {
    where: TrainingRecordWhereUniqueInput
    data: XOR<TrainingRecordUpdateWithoutUserInput, TrainingRecordUncheckedUpdateWithoutUserInput>
  }

  export type TrainingRecordUpdateManyWithWhereWithoutUserInput = {
    where: TrainingRecordScalarWhereInput
    data: XOR<TrainingRecordUpdateManyMutationInput, TrainingRecordUncheckedUpdateManyWithoutUserInput>
  }

  export type TrainingRecordScalarWhereInput = {
    AND?: TrainingRecordScalarWhereInput | TrainingRecordScalarWhereInput[]
    OR?: TrainingRecordScalarWhereInput[]
    NOT?: TrainingRecordScalarWhereInput | TrainingRecordScalarWhereInput[]
    id?: StringFilter<"TrainingRecord"> | string
    userId?: StringFilter<"TrainingRecord"> | string
    courseId?: StringFilter<"TrainingRecord"> | string
    courseName?: StringFilter<"TrainingRecord"> | string
    courseCategory?: StringNullableFilter<"TrainingRecord"> | string | null
    provider?: StringNullableFilter<"TrainingRecord"> | string | null
    status?: EnumTrainingStatusFilter<"TrainingRecord"> | $Enums.TrainingStatus
    startedAt?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    score?: IntNullableFilter<"TrainingRecord"> | number | null
    isRequired?: BoolFilter<"TrainingRecord"> | boolean
    dueDate?: DateTimeNullableFilter<"TrainingRecord"> | Date | string | null
    metadata?: JsonNullableFilter<"TrainingRecord">
    createdAt?: DateTimeFilter<"TrainingRecord"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingRecord"> | Date | string
  }

  export type UserProfileCreateWithoutLinkedAccountsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    manager?: UserProfileCreateNestedOneWithoutDirectReportsInput
    directReports?: UserProfileCreateNestedManyWithoutManagerInput
    assets?: AssetAssignmentCreateNestedManyWithoutUserInput
    tickets?: UserTicketCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordCreateNestedManyWithoutUserInput
  }

  export type UserProfileUncheckedCreateWithoutLinkedAccountsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    managerId?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    directReports?: UserProfileUncheckedCreateNestedManyWithoutManagerInput
    assets?: AssetAssignmentUncheckedCreateNestedManyWithoutUserInput
    tickets?: UserTicketUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventUncheckedCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserProfileCreateOrConnectWithoutLinkedAccountsInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutLinkedAccountsInput, UserProfileUncheckedCreateWithoutLinkedAccountsInput>
  }

  export type UserProfileUpsertWithoutLinkedAccountsInput = {
    update: XOR<UserProfileUpdateWithoutLinkedAccountsInput, UserProfileUncheckedUpdateWithoutLinkedAccountsInput>
    create: XOR<UserProfileCreateWithoutLinkedAccountsInput, UserProfileUncheckedCreateWithoutLinkedAccountsInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutLinkedAccountsInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutLinkedAccountsInput, UserProfileUncheckedUpdateWithoutLinkedAccountsInput>
  }

  export type UserProfileUpdateWithoutLinkedAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    manager?: UserProfileUpdateOneWithoutDirectReportsNestedInput
    directReports?: UserProfileUpdateManyWithoutManagerNestedInput
    assets?: AssetAssignmentUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateWithoutLinkedAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    directReports?: UserProfileUncheckedUpdateManyWithoutManagerNestedInput
    assets?: AssetAssignmentUncheckedUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUncheckedUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserProfileCreateWithoutAssetsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    manager?: UserProfileCreateNestedOneWithoutDirectReportsInput
    directReports?: UserProfileCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountCreateNestedManyWithoutUserInput
    tickets?: UserTicketCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordCreateNestedManyWithoutUserInput
  }

  export type UserProfileUncheckedCreateWithoutAssetsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    managerId?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    directReports?: UserProfileUncheckedCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountUncheckedCreateNestedManyWithoutUserInput
    tickets?: UserTicketUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventUncheckedCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserProfileCreateOrConnectWithoutAssetsInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutAssetsInput, UserProfileUncheckedCreateWithoutAssetsInput>
  }

  export type UserProfileUpsertWithoutAssetsInput = {
    update: XOR<UserProfileUpdateWithoutAssetsInput, UserProfileUncheckedUpdateWithoutAssetsInput>
    create: XOR<UserProfileCreateWithoutAssetsInput, UserProfileUncheckedCreateWithoutAssetsInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutAssetsInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutAssetsInput, UserProfileUncheckedUpdateWithoutAssetsInput>
  }

  export type UserProfileUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    manager?: UserProfileUpdateOneWithoutDirectReportsNestedInput
    directReports?: UserProfileUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    directReports?: UserProfileUncheckedUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUncheckedUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUncheckedUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserProfileCreateWithoutTicketsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    manager?: UserProfileCreateNestedOneWithoutDirectReportsInput
    directReports?: UserProfileCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordCreateNestedManyWithoutUserInput
  }

  export type UserProfileUncheckedCreateWithoutTicketsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    managerId?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    directReports?: UserProfileUncheckedCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountUncheckedCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventUncheckedCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserProfileCreateOrConnectWithoutTicketsInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutTicketsInput, UserProfileUncheckedCreateWithoutTicketsInput>
  }

  export type UserProfileUpsertWithoutTicketsInput = {
    update: XOR<UserProfileUpdateWithoutTicketsInput, UserProfileUncheckedUpdateWithoutTicketsInput>
    create: XOR<UserProfileCreateWithoutTicketsInput, UserProfileUncheckedCreateWithoutTicketsInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutTicketsInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutTicketsInput, UserProfileUncheckedUpdateWithoutTicketsInput>
  }

  export type UserProfileUpdateWithoutTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    manager?: UserProfileUpdateOneWithoutDirectReportsNestedInput
    directReports?: UserProfileUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateWithoutTicketsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    directReports?: UserProfileUncheckedUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUncheckedUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUncheckedUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserProfileCreateWithoutActivityLogsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    manager?: UserProfileCreateNestedOneWithoutDirectReportsInput
    directReports?: UserProfileCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentCreateNestedManyWithoutUserInput
    tickets?: UserTicketCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordCreateNestedManyWithoutUserInput
  }

  export type UserProfileUncheckedCreateWithoutActivityLogsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    managerId?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    directReports?: UserProfileUncheckedCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountUncheckedCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentUncheckedCreateNestedManyWithoutUserInput
    tickets?: UserTicketUncheckedCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventUncheckedCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserProfileCreateOrConnectWithoutActivityLogsInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutActivityLogsInput, UserProfileUncheckedCreateWithoutActivityLogsInput>
  }

  export type UserProfileUpsertWithoutActivityLogsInput = {
    update: XOR<UserProfileUpdateWithoutActivityLogsInput, UserProfileUncheckedUpdateWithoutActivityLogsInput>
    create: XOR<UserProfileCreateWithoutActivityLogsInput, UserProfileUncheckedCreateWithoutActivityLogsInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutActivityLogsInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutActivityLogsInput, UserProfileUncheckedUpdateWithoutActivityLogsInput>
  }

  export type UserProfileUpdateWithoutActivityLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    manager?: UserProfileUpdateOneWithoutDirectReportsNestedInput
    directReports?: UserProfileUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateWithoutActivityLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    directReports?: UserProfileUncheckedUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUncheckedUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUncheckedUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUncheckedUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUncheckedUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserProfileCreateWithoutSecurityEventsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    manager?: UserProfileCreateNestedOneWithoutDirectReportsInput
    directReports?: UserProfileCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentCreateNestedManyWithoutUserInput
    tickets?: UserTicketCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordCreateNestedManyWithoutUserInput
  }

  export type UserProfileUncheckedCreateWithoutSecurityEventsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    managerId?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    directReports?: UserProfileUncheckedCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountUncheckedCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentUncheckedCreateNestedManyWithoutUserInput
    tickets?: UserTicketUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
    trainingRecords?: TrainingRecordUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserProfileCreateOrConnectWithoutSecurityEventsInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutSecurityEventsInput, UserProfileUncheckedCreateWithoutSecurityEventsInput>
  }

  export type UserProfileUpsertWithoutSecurityEventsInput = {
    update: XOR<UserProfileUpdateWithoutSecurityEventsInput, UserProfileUncheckedUpdateWithoutSecurityEventsInput>
    create: XOR<UserProfileCreateWithoutSecurityEventsInput, UserProfileUncheckedCreateWithoutSecurityEventsInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutSecurityEventsInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutSecurityEventsInput, UserProfileUncheckedUpdateWithoutSecurityEventsInput>
  }

  export type UserProfileUpdateWithoutSecurityEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    manager?: UserProfileUpdateOneWithoutDirectReportsNestedInput
    directReports?: UserProfileUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateWithoutSecurityEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    directReports?: UserProfileUncheckedUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUncheckedUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUncheckedUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserProfileCreateWithoutTrainingRecordsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    manager?: UserProfileCreateNestedOneWithoutDirectReportsInput
    directReports?: UserProfileCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentCreateNestedManyWithoutUserInput
    tickets?: UserTicketCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventCreateNestedManyWithoutUserInput
  }

  export type UserProfileUncheckedCreateWithoutTrainingRecordsInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    managerId?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
    directReports?: UserProfileUncheckedCreateNestedManyWithoutManagerInput
    linkedAccounts?: LinkedAccountUncheckedCreateNestedManyWithoutUserInput
    assets?: AssetAssignmentUncheckedCreateNestedManyWithoutUserInput
    tickets?: UserTicketUncheckedCreateNestedManyWithoutUserInput
    activityLogs?: ActivityLogUncheckedCreateNestedManyWithoutUserInput
    securityEvents?: SecurityEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserProfileCreateOrConnectWithoutTrainingRecordsInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutTrainingRecordsInput, UserProfileUncheckedCreateWithoutTrainingRecordsInput>
  }

  export type UserProfileUpsertWithoutTrainingRecordsInput = {
    update: XOR<UserProfileUpdateWithoutTrainingRecordsInput, UserProfileUncheckedUpdateWithoutTrainingRecordsInput>
    create: XOR<UserProfileCreateWithoutTrainingRecordsInput, UserProfileUncheckedCreateWithoutTrainingRecordsInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutTrainingRecordsInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutTrainingRecordsInput, UserProfileUncheckedUpdateWithoutTrainingRecordsInput>
  }

  export type UserProfileUpdateWithoutTrainingRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    manager?: UserProfileUpdateOneWithoutDirectReportsNestedInput
    directReports?: UserProfileUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateWithoutTrainingRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    directReports?: UserProfileUncheckedUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUncheckedUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUncheckedUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserProfileCreateManyManagerInput = {
    id?: string
    helixUid: string
    email: string
    emailCanonical: string
    employeeId?: string | null
    firstName: string
    lastName: string
    displayName?: string | null
    preferredName?: string | null
    profilePicture?: string | null
    phoneNumber?: string | null
    mobileNumber?: string | null
    department?: string | null
    jobTitle?: string | null
    location?: string | null
    timezone?: string | null
    startDate?: Date | string | null
    endDate?: Date | string | null
    status?: $Enums.UserStatus
    lastLoginAt?: Date | string | null
    lastActiveAt?: Date | string | null
    isServiceAccount?: boolean
    securityScore?: number | null
    riskLevel?: $Enums.RiskLevel
    mfaEnabled?: boolean
    tenantId: string
    roles?: UserProfileCreaterolesInput | string[]
    permissions?: UserProfileCreatepermissionsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string | null
    lastUpdatedBy?: string | null
    dataVersion?: number
  }

  export type LinkedAccountCreateManyUserInput = {
    id?: string
    platform: string
    platformUserId: string
    platformUsername?: string | null
    accountEmail?: string | null
    accountStatus?: string
    accountType?: string | null
    lastSyncAt?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssetAssignmentCreateManyUserInput = {
    id?: string
    assetId: string
    assetType: $Enums.AssetType
    assetName: string
    assetCategory?: string | null
    assignedAt?: Date | string
    assignedBy: string
    unassignedAt?: Date | string | null
    unassignedBy?: string | null
    status?: $Enums.AssetStatus
    complianceStatus?: $Enums.ComplianceStatus
    lastCheckAt?: Date | string | null
    notes?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserTicketCreateManyUserInput = {
    id?: string
    ticketId: string
    ticketNumber: string
    relationship: $Enums.TicketRelationship
    title: string
    status: string
    priority: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ActivityLogCreateManyUserInput = {
    id?: string
    activity: string
    source: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: $Enums.ActivityOutcome
    riskScore?: number | null
    sessionId?: string | null
    correlationId?: string | null
    timestamp?: Date | string
    retentionDate?: Date | string | null
  }

  export type SecurityEventCreateManyUserInput = {
    id?: string
    eventType: string
    severity?: $Enums.EventSeverity
    category: string
    description: string
    source: string
    ipAddress?: string | null
    location?: string | null
    status?: $Enums.EventStatus
    assignedTo?: string | null
    resolvedAt?: Date | string | null
    resolution?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrainingRecordCreateManyUserInput = {
    id?: string
    courseId: string
    courseName: string
    courseCategory?: string | null
    provider?: string | null
    status?: $Enums.TrainingStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    expiresAt?: Date | string | null
    score?: number | null
    isRequired?: boolean
    dueDate?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProfileUpdateWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    directReports?: UserProfileUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
    directReports?: UserProfileUncheckedUpdateManyWithoutManagerNestedInput
    linkedAccounts?: LinkedAccountUncheckedUpdateManyWithoutUserNestedInput
    assets?: AssetAssignmentUncheckedUpdateManyWithoutUserNestedInput
    tickets?: UserTicketUncheckedUpdateManyWithoutUserNestedInput
    activityLogs?: ActivityLogUncheckedUpdateManyWithoutUserNestedInput
    securityEvents?: SecurityEventUncheckedUpdateManyWithoutUserNestedInput
    trainingRecords?: TrainingRecordUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserProfileUncheckedUpdateManyWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    helixUid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    employeeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    preferredName?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    mobileNumber?: NullableStringFieldUpdateOperationsInput | string | null
    department?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActiveAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isServiceAccount?: BoolFieldUpdateOperationsInput | boolean
    securityScore?: NullableIntFieldUpdateOperationsInput | number | null
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    tenantId?: StringFieldUpdateOperationsInput | string
    roles?: UserProfileUpdaterolesInput | string[]
    permissions?: UserProfileUpdatepermissionsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    lastUpdatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    dataVersion?: IntFieldUpdateOperationsInput | number
  }

  export type LinkedAccountUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platformUserId?: StringFieldUpdateOperationsInput | string
    platformUsername?: NullableStringFieldUpdateOperationsInput | string | null
    accountEmail?: NullableStringFieldUpdateOperationsInput | string | null
    accountStatus?: StringFieldUpdateOperationsInput | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LinkedAccountUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platformUserId?: StringFieldUpdateOperationsInput | string
    platformUsername?: NullableStringFieldUpdateOperationsInput | string | null
    accountEmail?: NullableStringFieldUpdateOperationsInput | string | null
    accountStatus?: StringFieldUpdateOperationsInput | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LinkedAccountUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platformUserId?: StringFieldUpdateOperationsInput | string
    platformUsername?: NullableStringFieldUpdateOperationsInput | string | null
    accountEmail?: NullableStringFieldUpdateOperationsInput | string | null
    accountStatus?: StringFieldUpdateOperationsInput | string
    accountType?: NullableStringFieldUpdateOperationsInput | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetAssignmentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    assetName?: StringFieldUpdateOperationsInput | string
    assetCategory?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedBy?: StringFieldUpdateOperationsInput | string
    unassignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    unassignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssetStatusFieldUpdateOperationsInput | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFieldUpdateOperationsInput | $Enums.ComplianceStatus
    lastCheckAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type AssetAssignmentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    assetName?: StringFieldUpdateOperationsInput | string
    assetCategory?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedBy?: StringFieldUpdateOperationsInput | string
    unassignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    unassignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssetStatusFieldUpdateOperationsInput | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFieldUpdateOperationsInput | $Enums.ComplianceStatus
    lastCheckAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type AssetAssignmentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    assetName?: StringFieldUpdateOperationsInput | string
    assetCategory?: NullableStringFieldUpdateOperationsInput | string | null
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignedBy?: StringFieldUpdateOperationsInput | string
    unassignedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    unassignedBy?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssetStatusFieldUpdateOperationsInput | $Enums.AssetStatus
    complianceStatus?: EnumComplianceStatusFieldUpdateOperationsInput | $Enums.ComplianceStatus
    lastCheckAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserTicketUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    ticketNumber?: StringFieldUpdateOperationsInput | string
    relationship?: EnumTicketRelationshipFieldUpdateOperationsInput | $Enums.TicketRelationship
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTicketUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    ticketNumber?: StringFieldUpdateOperationsInput | string
    relationship?: EnumTicketRelationshipFieldUpdateOperationsInput | $Enums.TicketRelationship
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTicketUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticketId?: StringFieldUpdateOperationsInput | string
    ticketNumber?: StringFieldUpdateOperationsInput | string
    relationship?: EnumTicketRelationshipFieldUpdateOperationsInput | $Enums.TicketRelationship
    title?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    activity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: EnumActivityOutcomeFieldUpdateOperationsInput | $Enums.ActivityOutcome
    riskScore?: NullableIntFieldUpdateOperationsInput | number | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ActivityLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    activity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: EnumActivityOutcomeFieldUpdateOperationsInput | $Enums.ActivityOutcome
    riskScore?: NullableIntFieldUpdateOperationsInput | number | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ActivityLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    activity?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableJsonNullValueInput | InputJsonValue
    outcome?: EnumActivityOutcomeFieldUpdateOperationsInput | $Enums.ActivityOutcome
    riskScore?: NullableIntFieldUpdateOperationsInput | number | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SecurityEventUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: EnumEventSeverityFieldUpdateOperationsInput | $Enums.EventSeverity
    category?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SecurityEventUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: EnumEventSeverityFieldUpdateOperationsInput | $Enums.EventSeverity
    category?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SecurityEventUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: EnumEventSeverityFieldUpdateOperationsInput | $Enums.EventSeverity
    category?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolution?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingRecordUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    courseName?: StringFieldUpdateOperationsInput | string
    courseCategory?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTrainingStatusFieldUpdateOperationsInput | $Enums.TrainingStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingRecordUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    courseName?: StringFieldUpdateOperationsInput | string
    courseCategory?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTrainingStatusFieldUpdateOperationsInput | $Enums.TrainingStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrainingRecordUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    courseName?: StringFieldUpdateOperationsInput | string
    courseCategory?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTrainingStatusFieldUpdateOperationsInput | $Enums.TrainingStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: NullableIntFieldUpdateOperationsInput | number | null
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}