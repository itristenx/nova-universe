
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
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>
/**
 * Model SecurityEvent
 * 
 */
export type SecurityEvent = $Result.DefaultSelection<Prisma.$SecurityEventPayload>
/**
 * Model SystemLog
 * 
 */
export type SystemLog = $Result.DefaultSelection<Prisma.$SystemLogPayload>
/**
 * Model ActivityTrace
 * 
 */
export type ActivityTrace = $Result.DefaultSelection<Prisma.$ActivityTracePayload>
/**
 * Model ComplianceLog
 * 
 */
export type ComplianceLog = $Result.DefaultSelection<Prisma.$ComplianceLogPayload>
/**
 * Model PerformanceMetric
 * 
 */
export type PerformanceMetric = $Result.DefaultSelection<Prisma.$PerformanceMetricPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more AuditLogs
 * const auditLogs = await prisma.auditLog.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
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
   * // Fetch zero or more AuditLogs
   * const auditLogs = await prisma.auditLog.findMany()
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
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;

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
   * `prisma.systemLog`: Exposes CRUD operations for the **SystemLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemLogs
    * const systemLogs = await prisma.systemLog.findMany()
    * ```
    */
  get systemLog(): Prisma.SystemLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.activityTrace`: Exposes CRUD operations for the **ActivityTrace** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ActivityTraces
    * const activityTraces = await prisma.activityTrace.findMany()
    * ```
    */
  get activityTrace(): Prisma.ActivityTraceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.complianceLog`: Exposes CRUD operations for the **ComplianceLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ComplianceLogs
    * const complianceLogs = await prisma.complianceLog.findMany()
    * ```
    */
  get complianceLog(): Prisma.ComplianceLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.performanceMetric`: Exposes CRUD operations for the **PerformanceMetric** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PerformanceMetrics
    * const performanceMetrics = await prisma.performanceMetric.findMany()
    * ```
    */
  get performanceMetric(): Prisma.PerformanceMetricDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.14.0
   * Query Engine version: 717184b7b35ea05dfa71a3236b7af656013e1e49
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
    AuditLog: 'AuditLog',
    SecurityEvent: 'SecurityEvent',
    SystemLog: 'SystemLog',
    ActivityTrace: 'ActivityTrace',
    ComplianceLog: 'ComplianceLog',
    PerformanceMetric: 'PerformanceMetric'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    audit_db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "auditLog" | "securityEvent" | "systemLog" | "activityTrace" | "complianceLog" | "performanceMetric"
      txIsolationLevel: never
    }
    model: {
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.AuditLogFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.AuditLogAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
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
          findRaw: {
            args: Prisma.SecurityEventFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.SecurityEventAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.SecurityEventCountArgs<ExtArgs>
            result: $Utils.Optional<SecurityEventCountAggregateOutputType> | number
          }
        }
      }
      SystemLog: {
        payload: Prisma.$SystemLogPayload<ExtArgs>
        fields: Prisma.SystemLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          findFirst: {
            args: Prisma.SystemLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          findMany: {
            args: Prisma.SystemLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>[]
          }
          create: {
            args: Prisma.SystemLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          createMany: {
            args: Prisma.SystemLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.SystemLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          update: {
            args: Prisma.SystemLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          deleteMany: {
            args: Prisma.SystemLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SystemLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          aggregate: {
            args: Prisma.SystemLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemLog>
          }
          groupBy: {
            args: Prisma.SystemLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemLogGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.SystemLogFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.SystemLogAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.SystemLogCountArgs<ExtArgs>
            result: $Utils.Optional<SystemLogCountAggregateOutputType> | number
          }
        }
      }
      ActivityTrace: {
        payload: Prisma.$ActivityTracePayload<ExtArgs>
        fields: Prisma.ActivityTraceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ActivityTraceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityTracePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ActivityTraceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityTracePayload>
          }
          findFirst: {
            args: Prisma.ActivityTraceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityTracePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ActivityTraceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityTracePayload>
          }
          findMany: {
            args: Prisma.ActivityTraceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityTracePayload>[]
          }
          create: {
            args: Prisma.ActivityTraceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityTracePayload>
          }
          createMany: {
            args: Prisma.ActivityTraceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ActivityTraceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityTracePayload>
          }
          update: {
            args: Prisma.ActivityTraceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityTracePayload>
          }
          deleteMany: {
            args: Prisma.ActivityTraceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ActivityTraceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ActivityTraceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityTracePayload>
          }
          aggregate: {
            args: Prisma.ActivityTraceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateActivityTrace>
          }
          groupBy: {
            args: Prisma.ActivityTraceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ActivityTraceGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ActivityTraceFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ActivityTraceAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ActivityTraceCountArgs<ExtArgs>
            result: $Utils.Optional<ActivityTraceCountAggregateOutputType> | number
          }
        }
      }
      ComplianceLog: {
        payload: Prisma.$ComplianceLogPayload<ExtArgs>
        fields: Prisma.ComplianceLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ComplianceLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComplianceLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ComplianceLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComplianceLogPayload>
          }
          findFirst: {
            args: Prisma.ComplianceLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComplianceLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ComplianceLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComplianceLogPayload>
          }
          findMany: {
            args: Prisma.ComplianceLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComplianceLogPayload>[]
          }
          create: {
            args: Prisma.ComplianceLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComplianceLogPayload>
          }
          createMany: {
            args: Prisma.ComplianceLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ComplianceLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComplianceLogPayload>
          }
          update: {
            args: Prisma.ComplianceLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComplianceLogPayload>
          }
          deleteMany: {
            args: Prisma.ComplianceLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ComplianceLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ComplianceLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ComplianceLogPayload>
          }
          aggregate: {
            args: Prisma.ComplianceLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateComplianceLog>
          }
          groupBy: {
            args: Prisma.ComplianceLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ComplianceLogGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ComplianceLogFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ComplianceLogAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ComplianceLogCountArgs<ExtArgs>
            result: $Utils.Optional<ComplianceLogCountAggregateOutputType> | number
          }
        }
      }
      PerformanceMetric: {
        payload: Prisma.$PerformanceMetricPayload<ExtArgs>
        fields: Prisma.PerformanceMetricFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PerformanceMetricFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PerformanceMetricFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          findFirst: {
            args: Prisma.PerformanceMetricFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PerformanceMetricFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          findMany: {
            args: Prisma.PerformanceMetricFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>[]
          }
          create: {
            args: Prisma.PerformanceMetricCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          createMany: {
            args: Prisma.PerformanceMetricCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PerformanceMetricDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          update: {
            args: Prisma.PerformanceMetricUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          deleteMany: {
            args: Prisma.PerformanceMetricDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PerformanceMetricUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PerformanceMetricUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          aggregate: {
            args: Prisma.PerformanceMetricAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePerformanceMetric>
          }
          groupBy: {
            args: Prisma.PerformanceMetricGroupByArgs<ExtArgs>
            result: $Utils.Optional<PerformanceMetricGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.PerformanceMetricFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.PerformanceMetricAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.PerformanceMetricCountArgs<ExtArgs>
            result: $Utils.Optional<PerformanceMetricCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
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
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
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
    auditLog?: AuditLogOmit
    securityEvent?: SecurityEventOmit
    systemLog?: SystemLogOmit
    activityTrace?: ActivityTraceOmit
    complianceLog?: ComplianceLogOmit
    performanceMetric?: PerformanceMetricOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

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
   * Models
   */

  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _avg: AuditLogAvgAggregateOutputType | null
    _sum: AuditLogSumAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogAvgAggregateOutputType = {
    duration: number | null
  }

  export type AuditLogSumAggregateOutputType = {
    duration: number | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    eventType: string | null
    action: string | null
    resource: string | null
    resourceId: string | null
    userId: string | null
    sessionId: string | null
    ipAddress: string | null
    userAgent: string | null
    method: string | null
    path: string | null
    severity: string | null
    category: string | null
    source: string | null
    correlation: string | null
    timestamp: Date | null
    duration: number | null
    retentionDate: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    eventType: string | null
    action: string | null
    resource: string | null
    resourceId: string | null
    userId: string | null
    sessionId: string | null
    ipAddress: string | null
    userAgent: string | null
    method: string | null
    path: string | null
    severity: string | null
    category: string | null
    source: string | null
    correlation: string | null
    timestamp: Date | null
    duration: number | null
    retentionDate: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    eventType: number
    action: number
    resource: number
    resourceId: number
    userId: number
    sessionId: number
    ipAddress: number
    userAgent: number
    method: number
    path: number
    oldValues: number
    newValues: number
    changes: number
    severity: number
    category: number
    source: number
    correlation: number
    metadata: number
    tags: number
    timestamp: number
    duration: number
    retentionDate: number
    complianceFlags: number
    _all: number
  }


  export type AuditLogAvgAggregateInputType = {
    duration?: true
  }

  export type AuditLogSumAggregateInputType = {
    duration?: true
  }

  export type AuditLogMinAggregateInputType = {
    id?: true
    eventType?: true
    action?: true
    resource?: true
    resourceId?: true
    userId?: true
    sessionId?: true
    ipAddress?: true
    userAgent?: true
    method?: true
    path?: true
    severity?: true
    category?: true
    source?: true
    correlation?: true
    timestamp?: true
    duration?: true
    retentionDate?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    eventType?: true
    action?: true
    resource?: true
    resourceId?: true
    userId?: true
    sessionId?: true
    ipAddress?: true
    userAgent?: true
    method?: true
    path?: true
    severity?: true
    category?: true
    source?: true
    correlation?: true
    timestamp?: true
    duration?: true
    retentionDate?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    eventType?: true
    action?: true
    resource?: true
    resourceId?: true
    userId?: true
    sessionId?: true
    ipAddress?: true
    userAgent?: true
    method?: true
    path?: true
    oldValues?: true
    newValues?: true
    changes?: true
    severity?: true
    category?: true
    source?: true
    correlation?: true
    metadata?: true
    tags?: true
    timestamp?: true
    duration?: true
    retentionDate?: true
    complianceFlags?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AuditLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AuditLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _avg?: AuditLogAvgAggregateInputType
    _sum?: AuditLogSumAggregateInputType
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    eventType: string
    action: string
    resource: string | null
    resourceId: string | null
    userId: string | null
    sessionId: string | null
    ipAddress: string | null
    userAgent: string | null
    method: string | null
    path: string | null
    oldValues: JsonValue | null
    newValues: JsonValue | null
    changes: JsonValue | null
    severity: string
    category: string | null
    source: string | null
    correlation: string | null
    metadata: JsonValue | null
    tags: string[]
    timestamp: Date
    duration: number | null
    retentionDate: Date | null
    complianceFlags: string[]
    _count: AuditLogCountAggregateOutputType | null
    _avg: AuditLogAvgAggregateOutputType | null
    _sum: AuditLogSumAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventType?: boolean
    action?: boolean
    resource?: boolean
    resourceId?: boolean
    userId?: boolean
    sessionId?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    method?: boolean
    path?: boolean
    oldValues?: boolean
    newValues?: boolean
    changes?: boolean
    severity?: boolean
    category?: boolean
    source?: boolean
    correlation?: boolean
    metadata?: boolean
    tags?: boolean
    timestamp?: boolean
    duration?: boolean
    retentionDate?: boolean
    complianceFlags?: boolean
  }, ExtArgs["result"]["auditLog"]>



  export type AuditLogSelectScalar = {
    id?: boolean
    eventType?: boolean
    action?: boolean
    resource?: boolean
    resourceId?: boolean
    userId?: boolean
    sessionId?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    method?: boolean
    path?: boolean
    oldValues?: boolean
    newValues?: boolean
    changes?: boolean
    severity?: boolean
    category?: boolean
    source?: boolean
    correlation?: boolean
    metadata?: boolean
    tags?: boolean
    timestamp?: boolean
    duration?: boolean
    retentionDate?: boolean
    complianceFlags?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "eventType" | "action" | "resource" | "resourceId" | "userId" | "sessionId" | "ipAddress" | "userAgent" | "method" | "path" | "oldValues" | "newValues" | "changes" | "severity" | "category" | "source" | "correlation" | "metadata" | "tags" | "timestamp" | "duration" | "retentionDate" | "complianceFlags", ExtArgs["result"]["auditLog"]>

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      eventType: string
      action: string
      resource: string | null
      resourceId: string | null
      userId: string | null
      sessionId: string | null
      ipAddress: string | null
      userAgent: string | null
      method: string | null
      path: string | null
      oldValues: Prisma.JsonValue | null
      newValues: Prisma.JsonValue | null
      changes: Prisma.JsonValue | null
      severity: string
      category: string | null
      source: string | null
      correlation: string | null
      metadata: Prisma.JsonValue | null
      tags: string[]
      timestamp: Date
      duration: number | null
      retentionDate: Date | null
      complianceFlags: string[]
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * @param {AuditLogFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const auditLog = await prisma.auditLog.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: AuditLogFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a AuditLog.
     * @param {AuditLogAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const auditLog = await prisma.auditLog.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: AuditLogAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
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
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly eventType: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly resource: FieldRef<"AuditLog", 'String'>
    readonly resourceId: FieldRef<"AuditLog", 'String'>
    readonly userId: FieldRef<"AuditLog", 'String'>
    readonly sessionId: FieldRef<"AuditLog", 'String'>
    readonly ipAddress: FieldRef<"AuditLog", 'String'>
    readonly userAgent: FieldRef<"AuditLog", 'String'>
    readonly method: FieldRef<"AuditLog", 'String'>
    readonly path: FieldRef<"AuditLog", 'String'>
    readonly oldValues: FieldRef<"AuditLog", 'Json'>
    readonly newValues: FieldRef<"AuditLog", 'Json'>
    readonly changes: FieldRef<"AuditLog", 'Json'>
    readonly severity: FieldRef<"AuditLog", 'String'>
    readonly category: FieldRef<"AuditLog", 'String'>
    readonly source: FieldRef<"AuditLog", 'String'>
    readonly correlation: FieldRef<"AuditLog", 'String'>
    readonly metadata: FieldRef<"AuditLog", 'Json'>
    readonly tags: FieldRef<"AuditLog", 'String[]'>
    readonly timestamp: FieldRef<"AuditLog", 'DateTime'>
    readonly duration: FieldRef<"AuditLog", 'Int'>
    readonly retentionDate: FieldRef<"AuditLog", 'DateTime'>
    readonly complianceFlags: FieldRef<"AuditLog", 'String[]'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog findRaw
   */
  export type AuditLogFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * AuditLog aggregateRaw
   */
  export type AuditLogAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
  }


  /**
   * Model SecurityEvent
   */

  export type AggregateSecurityEvent = {
    _count: SecurityEventCountAggregateOutputType | null
    _avg: SecurityEventAvgAggregateOutputType | null
    _sum: SecurityEventSumAggregateOutputType | null
    _min: SecurityEventMinAggregateOutputType | null
    _max: SecurityEventMaxAggregateOutputType | null
  }

  export type SecurityEventAvgAggregateOutputType = {
    confidence: number | null
  }

  export type SecurityEventSumAggregateOutputType = {
    confidence: number | null
  }

  export type SecurityEventMinAggregateOutputType = {
    id: string | null
    eventType: string | null
    severity: string | null
    userId: string | null
    description: string | null
    ipAddress: string | null
    userAgent: string | null
    threatLevel: string | null
    confidence: number | null
    status: string | null
    assignedTo: string | null
    timestamp: Date | null
    firstSeen: Date | null
    lastSeen: Date | null
    resolvedAt: Date | null
  }

  export type SecurityEventMaxAggregateOutputType = {
    id: string | null
    eventType: string | null
    severity: string | null
    userId: string | null
    description: string | null
    ipAddress: string | null
    userAgent: string | null
    threatLevel: string | null
    confidence: number | null
    status: string | null
    assignedTo: string | null
    timestamp: Date | null
    firstSeen: Date | null
    lastSeen: Date | null
    resolvedAt: Date | null
  }

  export type SecurityEventCountAggregateOutputType = {
    id: number
    eventType: number
    severity: number
    userId: number
    description: number
    ipAddress: number
    userAgent: number
    location: number
    threatLevel: number
    confidence: number
    indicators: number
    status: number
    assignedTo: number
    response: number
    timestamp: number
    firstSeen: number
    lastSeen: number
    resolvedAt: number
    metadata: number
    tags: number
    _all: number
  }


  export type SecurityEventAvgAggregateInputType = {
    confidence?: true
  }

  export type SecurityEventSumAggregateInputType = {
    confidence?: true
  }

  export type SecurityEventMinAggregateInputType = {
    id?: true
    eventType?: true
    severity?: true
    userId?: true
    description?: true
    ipAddress?: true
    userAgent?: true
    threatLevel?: true
    confidence?: true
    status?: true
    assignedTo?: true
    timestamp?: true
    firstSeen?: true
    lastSeen?: true
    resolvedAt?: true
  }

  export type SecurityEventMaxAggregateInputType = {
    id?: true
    eventType?: true
    severity?: true
    userId?: true
    description?: true
    ipAddress?: true
    userAgent?: true
    threatLevel?: true
    confidence?: true
    status?: true
    assignedTo?: true
    timestamp?: true
    firstSeen?: true
    lastSeen?: true
    resolvedAt?: true
  }

  export type SecurityEventCountAggregateInputType = {
    id?: true
    eventType?: true
    severity?: true
    userId?: true
    description?: true
    ipAddress?: true
    userAgent?: true
    location?: true
    threatLevel?: true
    confidence?: true
    indicators?: true
    status?: true
    assignedTo?: true
    response?: true
    timestamp?: true
    firstSeen?: true
    lastSeen?: true
    resolvedAt?: true
    metadata?: true
    tags?: true
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
     * Select which fields to average
    **/
    _avg?: SecurityEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SecurityEventSumAggregateInputType
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
    _avg?: SecurityEventAvgAggregateInputType
    _sum?: SecurityEventSumAggregateInputType
    _min?: SecurityEventMinAggregateInputType
    _max?: SecurityEventMaxAggregateInputType
  }

  export type SecurityEventGroupByOutputType = {
    id: string
    eventType: string
    severity: string
    userId: string | null
    description: string
    ipAddress: string | null
    userAgent: string | null
    location: JsonValue | null
    threatLevel: string | null
    confidence: number | null
    indicators: JsonValue | null
    status: string
    assignedTo: string | null
    response: JsonValue | null
    timestamp: Date
    firstSeen: Date | null
    lastSeen: Date | null
    resolvedAt: Date | null
    metadata: JsonValue | null
    tags: string[]
    _count: SecurityEventCountAggregateOutputType | null
    _avg: SecurityEventAvgAggregateOutputType | null
    _sum: SecurityEventSumAggregateOutputType | null
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
    eventType?: boolean
    severity?: boolean
    userId?: boolean
    description?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    location?: boolean
    threatLevel?: boolean
    confidence?: boolean
    indicators?: boolean
    status?: boolean
    assignedTo?: boolean
    response?: boolean
    timestamp?: boolean
    firstSeen?: boolean
    lastSeen?: boolean
    resolvedAt?: boolean
    metadata?: boolean
    tags?: boolean
  }, ExtArgs["result"]["securityEvent"]>



  export type SecurityEventSelectScalar = {
    id?: boolean
    eventType?: boolean
    severity?: boolean
    userId?: boolean
    description?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    location?: boolean
    threatLevel?: boolean
    confidence?: boolean
    indicators?: boolean
    status?: boolean
    assignedTo?: boolean
    response?: boolean
    timestamp?: boolean
    firstSeen?: boolean
    lastSeen?: boolean
    resolvedAt?: boolean
    metadata?: boolean
    tags?: boolean
  }

  export type SecurityEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "eventType" | "severity" | "userId" | "description" | "ipAddress" | "userAgent" | "location" | "threatLevel" | "confidence" | "indicators" | "status" | "assignedTo" | "response" | "timestamp" | "firstSeen" | "lastSeen" | "resolvedAt" | "metadata" | "tags", ExtArgs["result"]["securityEvent"]>

  export type $SecurityEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SecurityEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      eventType: string
      severity: string
      userId: string | null
      description: string
      ipAddress: string | null
      userAgent: string | null
      location: Prisma.JsonValue | null
      threatLevel: string | null
      confidence: number | null
      indicators: Prisma.JsonValue | null
      status: string
      assignedTo: string | null
      response: Prisma.JsonValue | null
      timestamp: Date
      firstSeen: Date | null
      lastSeen: Date | null
      resolvedAt: Date | null
      metadata: Prisma.JsonValue | null
      tags: string[]
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
     * Find zero or more SecurityEvents that matches the filter.
     * @param {SecurityEventFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const securityEvent = await prisma.securityEvent.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: SecurityEventFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a SecurityEvent.
     * @param {SecurityEventAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const securityEvent = await prisma.securityEvent.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: SecurityEventAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


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
    readonly eventType: FieldRef<"SecurityEvent", 'String'>
    readonly severity: FieldRef<"SecurityEvent", 'String'>
    readonly userId: FieldRef<"SecurityEvent", 'String'>
    readonly description: FieldRef<"SecurityEvent", 'String'>
    readonly ipAddress: FieldRef<"SecurityEvent", 'String'>
    readonly userAgent: FieldRef<"SecurityEvent", 'String'>
    readonly location: FieldRef<"SecurityEvent", 'Json'>
    readonly threatLevel: FieldRef<"SecurityEvent", 'String'>
    readonly confidence: FieldRef<"SecurityEvent", 'Float'>
    readonly indicators: FieldRef<"SecurityEvent", 'Json'>
    readonly status: FieldRef<"SecurityEvent", 'String'>
    readonly assignedTo: FieldRef<"SecurityEvent", 'String'>
    readonly response: FieldRef<"SecurityEvent", 'Json'>
    readonly timestamp: FieldRef<"SecurityEvent", 'DateTime'>
    readonly firstSeen: FieldRef<"SecurityEvent", 'DateTime'>
    readonly lastSeen: FieldRef<"SecurityEvent", 'DateTime'>
    readonly resolvedAt: FieldRef<"SecurityEvent", 'DateTime'>
    readonly metadata: FieldRef<"SecurityEvent", 'Json'>
    readonly tags: FieldRef<"SecurityEvent", 'String[]'>
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
   * SecurityEvent findRaw
   */
  export type SecurityEventFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * SecurityEvent aggregateRaw
   */
  export type SecurityEventAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
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
  }


  /**
   * Model SystemLog
   */

  export type AggregateSystemLog = {
    _count: SystemLogCountAggregateOutputType | null
    _avg: SystemLogAvgAggregateOutputType | null
    _sum: SystemLogSumAggregateOutputType | null
    _min: SystemLogMinAggregateOutputType | null
    _max: SystemLogMaxAggregateOutputType | null
  }

  export type SystemLogAvgAggregateOutputType = {
    duration: number | null
  }

  export type SystemLogSumAggregateOutputType = {
    duration: number | null
  }

  export type SystemLogMinAggregateOutputType = {
    id: string | null
    level: string | null
    message: string | null
    source: string | null
    component: string | null
    stackTrace: string | null
    requestId: string | null
    sessionId: string | null
    userId: string | null
    duration: number | null
    timestamp: Date | null
    indexed: boolean | null
    archived: boolean | null
  }

  export type SystemLogMaxAggregateOutputType = {
    id: string | null
    level: string | null
    message: string | null
    source: string | null
    component: string | null
    stackTrace: string | null
    requestId: string | null
    sessionId: string | null
    userId: string | null
    duration: number | null
    timestamp: Date | null
    indexed: boolean | null
    archived: boolean | null
  }

  export type SystemLogCountAggregateOutputType = {
    id: number
    level: number
    message: number
    source: number
    component: number
    error: number
    stackTrace: number
    requestId: number
    sessionId: number
    userId: number
    duration: number
    memory: number
    metadata: number
    tags: number
    timestamp: number
    indexed: number
    archived: number
    _all: number
  }


  export type SystemLogAvgAggregateInputType = {
    duration?: true
  }

  export type SystemLogSumAggregateInputType = {
    duration?: true
  }

  export type SystemLogMinAggregateInputType = {
    id?: true
    level?: true
    message?: true
    source?: true
    component?: true
    stackTrace?: true
    requestId?: true
    sessionId?: true
    userId?: true
    duration?: true
    timestamp?: true
    indexed?: true
    archived?: true
  }

  export type SystemLogMaxAggregateInputType = {
    id?: true
    level?: true
    message?: true
    source?: true
    component?: true
    stackTrace?: true
    requestId?: true
    sessionId?: true
    userId?: true
    duration?: true
    timestamp?: true
    indexed?: true
    archived?: true
  }

  export type SystemLogCountAggregateInputType = {
    id?: true
    level?: true
    message?: true
    source?: true
    component?: true
    error?: true
    stackTrace?: true
    requestId?: true
    sessionId?: true
    userId?: true
    duration?: true
    memory?: true
    metadata?: true
    tags?: true
    timestamp?: true
    indexed?: true
    archived?: true
    _all?: true
  }

  export type SystemLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemLog to aggregate.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemLogs
    **/
    _count?: true | SystemLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SystemLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SystemLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemLogMaxAggregateInputType
  }

  export type GetSystemLogAggregateType<T extends SystemLogAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemLog[P]>
      : GetScalarType<T[P], AggregateSystemLog[P]>
  }




  export type SystemLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemLogWhereInput
    orderBy?: SystemLogOrderByWithAggregationInput | SystemLogOrderByWithAggregationInput[]
    by: SystemLogScalarFieldEnum[] | SystemLogScalarFieldEnum
    having?: SystemLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemLogCountAggregateInputType | true
    _avg?: SystemLogAvgAggregateInputType
    _sum?: SystemLogSumAggregateInputType
    _min?: SystemLogMinAggregateInputType
    _max?: SystemLogMaxAggregateInputType
  }

  export type SystemLogGroupByOutputType = {
    id: string
    level: string
    message: string
    source: string
    component: string | null
    error: JsonValue | null
    stackTrace: string | null
    requestId: string | null
    sessionId: string | null
    userId: string | null
    duration: number | null
    memory: JsonValue | null
    metadata: JsonValue | null
    tags: string[]
    timestamp: Date
    indexed: boolean
    archived: boolean
    _count: SystemLogCountAggregateOutputType | null
    _avg: SystemLogAvgAggregateOutputType | null
    _sum: SystemLogSumAggregateOutputType | null
    _min: SystemLogMinAggregateOutputType | null
    _max: SystemLogMaxAggregateOutputType | null
  }

  type GetSystemLogGroupByPayload<T extends SystemLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemLogGroupByOutputType[P]>
            : GetScalarType<T[P], SystemLogGroupByOutputType[P]>
        }
      >
    >


  export type SystemLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    level?: boolean
    message?: boolean
    source?: boolean
    component?: boolean
    error?: boolean
    stackTrace?: boolean
    requestId?: boolean
    sessionId?: boolean
    userId?: boolean
    duration?: boolean
    memory?: boolean
    metadata?: boolean
    tags?: boolean
    timestamp?: boolean
    indexed?: boolean
    archived?: boolean
  }, ExtArgs["result"]["systemLog"]>



  export type SystemLogSelectScalar = {
    id?: boolean
    level?: boolean
    message?: boolean
    source?: boolean
    component?: boolean
    error?: boolean
    stackTrace?: boolean
    requestId?: boolean
    sessionId?: boolean
    userId?: boolean
    duration?: boolean
    memory?: boolean
    metadata?: boolean
    tags?: boolean
    timestamp?: boolean
    indexed?: boolean
    archived?: boolean
  }

  export type SystemLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "level" | "message" | "source" | "component" | "error" | "stackTrace" | "requestId" | "sessionId" | "userId" | "duration" | "memory" | "metadata" | "tags" | "timestamp" | "indexed" | "archived", ExtArgs["result"]["systemLog"]>

  export type $SystemLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      level: string
      message: string
      source: string
      component: string | null
      error: Prisma.JsonValue | null
      stackTrace: string | null
      requestId: string | null
      sessionId: string | null
      userId: string | null
      duration: number | null
      memory: Prisma.JsonValue | null
      metadata: Prisma.JsonValue | null
      tags: string[]
      timestamp: Date
      indexed: boolean
      archived: boolean
    }, ExtArgs["result"]["systemLog"]>
    composites: {}
  }

  type SystemLogGetPayload<S extends boolean | null | undefined | SystemLogDefaultArgs> = $Result.GetResult<Prisma.$SystemLogPayload, S>

  type SystemLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SystemLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SystemLogCountAggregateInputType | true
    }

  export interface SystemLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemLog'], meta: { name: 'SystemLog' } }
    /**
     * Find zero or one SystemLog that matches the filter.
     * @param {SystemLogFindUniqueArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemLogFindUniqueArgs>(args: SelectSubset<T, SystemLogFindUniqueArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SystemLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SystemLogFindUniqueOrThrowArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemLogFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogFindFirstArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemLogFindFirstArgs>(args?: SelectSubset<T, SystemLogFindFirstArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogFindFirstOrThrowArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemLogFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SystemLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemLogs
     * const systemLogs = await prisma.systemLog.findMany()
     * 
     * // Get first 10 SystemLogs
     * const systemLogs = await prisma.systemLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const systemLogWithIdOnly = await prisma.systemLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SystemLogFindManyArgs>(args?: SelectSubset<T, SystemLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SystemLog.
     * @param {SystemLogCreateArgs} args - Arguments to create a SystemLog.
     * @example
     * // Create one SystemLog
     * const SystemLog = await prisma.systemLog.create({
     *   data: {
     *     // ... data to create a SystemLog
     *   }
     * })
     * 
     */
    create<T extends SystemLogCreateArgs>(args: SelectSubset<T, SystemLogCreateArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SystemLogs.
     * @param {SystemLogCreateManyArgs} args - Arguments to create many SystemLogs.
     * @example
     * // Create many SystemLogs
     * const systemLog = await prisma.systemLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemLogCreateManyArgs>(args?: SelectSubset<T, SystemLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a SystemLog.
     * @param {SystemLogDeleteArgs} args - Arguments to delete one SystemLog.
     * @example
     * // Delete one SystemLog
     * const SystemLog = await prisma.systemLog.delete({
     *   where: {
     *     // ... filter to delete one SystemLog
     *   }
     * })
     * 
     */
    delete<T extends SystemLogDeleteArgs>(args: SelectSubset<T, SystemLogDeleteArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SystemLog.
     * @param {SystemLogUpdateArgs} args - Arguments to update one SystemLog.
     * @example
     * // Update one SystemLog
     * const systemLog = await prisma.systemLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemLogUpdateArgs>(args: SelectSubset<T, SystemLogUpdateArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SystemLogs.
     * @param {SystemLogDeleteManyArgs} args - Arguments to filter SystemLogs to delete.
     * @example
     * // Delete a few SystemLogs
     * const { count } = await prisma.systemLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemLogDeleteManyArgs>(args?: SelectSubset<T, SystemLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemLogs
     * const systemLog = await prisma.systemLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemLogUpdateManyArgs>(args: SelectSubset<T, SystemLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SystemLog.
     * @param {SystemLogUpsertArgs} args - Arguments to update or create a SystemLog.
     * @example
     * // Update or create a SystemLog
     * const systemLog = await prisma.systemLog.upsert({
     *   create: {
     *     // ... data to create a SystemLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemLog we want to update
     *   }
     * })
     */
    upsert<T extends SystemLogUpsertArgs>(args: SelectSubset<T, SystemLogUpsertArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SystemLogs that matches the filter.
     * @param {SystemLogFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const systemLog = await prisma.systemLog.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: SystemLogFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a SystemLog.
     * @param {SystemLogAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const systemLog = await prisma.systemLog.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: SystemLogAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of SystemLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogCountArgs} args - Arguments to filter SystemLogs to count.
     * @example
     * // Count the number of SystemLogs
     * const count = await prisma.systemLog.count({
     *   where: {
     *     // ... the filter for the SystemLogs we want to count
     *   }
     * })
    **/
    count<T extends SystemLogCountArgs>(
      args?: Subset<T, SystemLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SystemLogAggregateArgs>(args: Subset<T, SystemLogAggregateArgs>): Prisma.PrismaPromise<GetSystemLogAggregateType<T>>

    /**
     * Group by SystemLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogGroupByArgs} args - Group by arguments.
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
      T extends SystemLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemLogGroupByArgs['orderBy'] }
        : { orderBy?: SystemLogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SystemLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemLog model
   */
  readonly fields: SystemLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the SystemLog model
   */
  interface SystemLogFieldRefs {
    readonly id: FieldRef<"SystemLog", 'String'>
    readonly level: FieldRef<"SystemLog", 'String'>
    readonly message: FieldRef<"SystemLog", 'String'>
    readonly source: FieldRef<"SystemLog", 'String'>
    readonly component: FieldRef<"SystemLog", 'String'>
    readonly error: FieldRef<"SystemLog", 'Json'>
    readonly stackTrace: FieldRef<"SystemLog", 'String'>
    readonly requestId: FieldRef<"SystemLog", 'String'>
    readonly sessionId: FieldRef<"SystemLog", 'String'>
    readonly userId: FieldRef<"SystemLog", 'String'>
    readonly duration: FieldRef<"SystemLog", 'Int'>
    readonly memory: FieldRef<"SystemLog", 'Json'>
    readonly metadata: FieldRef<"SystemLog", 'Json'>
    readonly tags: FieldRef<"SystemLog", 'String[]'>
    readonly timestamp: FieldRef<"SystemLog", 'DateTime'>
    readonly indexed: FieldRef<"SystemLog", 'Boolean'>
    readonly archived: FieldRef<"SystemLog", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * SystemLog findUnique
   */
  export type SystemLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog findUniqueOrThrow
   */
  export type SystemLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog findFirst
   */
  export type SystemLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemLogs.
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemLogs.
     */
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * SystemLog findFirstOrThrow
   */
  export type SystemLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemLogs.
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemLogs.
     */
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * SystemLog findMany
   */
  export type SystemLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLogs to fetch.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemLogs.
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * SystemLog create
   */
  export type SystemLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * The data needed to create a SystemLog.
     */
    data: XOR<SystemLogCreateInput, SystemLogUncheckedCreateInput>
  }

  /**
   * SystemLog createMany
   */
  export type SystemLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemLogs.
     */
    data: SystemLogCreateManyInput | SystemLogCreateManyInput[]
  }

  /**
   * SystemLog update
   */
  export type SystemLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * The data needed to update a SystemLog.
     */
    data: XOR<SystemLogUpdateInput, SystemLogUncheckedUpdateInput>
    /**
     * Choose, which SystemLog to update.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog updateMany
   */
  export type SystemLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemLogs.
     */
    data: XOR<SystemLogUpdateManyMutationInput, SystemLogUncheckedUpdateManyInput>
    /**
     * Filter which SystemLogs to update
     */
    where?: SystemLogWhereInput
    /**
     * Limit how many SystemLogs to update.
     */
    limit?: number
  }

  /**
   * SystemLog upsert
   */
  export type SystemLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * The filter to search for the SystemLog to update in case it exists.
     */
    where: SystemLogWhereUniqueInput
    /**
     * In case the SystemLog found by the `where` argument doesn't exist, create a new SystemLog with this data.
     */
    create: XOR<SystemLogCreateInput, SystemLogUncheckedCreateInput>
    /**
     * In case the SystemLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemLogUpdateInput, SystemLogUncheckedUpdateInput>
  }

  /**
   * SystemLog delete
   */
  export type SystemLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter which SystemLog to delete.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog deleteMany
   */
  export type SystemLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemLogs to delete
     */
    where?: SystemLogWhereInput
    /**
     * Limit how many SystemLogs to delete.
     */
    limit?: number
  }

  /**
   * SystemLog findRaw
   */
  export type SystemLogFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * SystemLog aggregateRaw
   */
  export type SystemLogAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * SystemLog without action
   */
  export type SystemLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
  }


  /**
   * Model ActivityTrace
   */

  export type AggregateActivityTrace = {
    _count: ActivityTraceCountAggregateOutputType | null
    _avg: ActivityTraceAvgAggregateOutputType | null
    _sum: ActivityTraceSumAggregateOutputType | null
    _min: ActivityTraceMinAggregateOutputType | null
    _max: ActivityTraceMaxAggregateOutputType | null
  }

  export type ActivityTraceAvgAggregateOutputType = {
    duration: number | null
    statusCode: number | null
    cpu: number | null
    memory: number | null
    ioOperations: number | null
  }

  export type ActivityTraceSumAggregateOutputType = {
    duration: number | null
    statusCode: number | null
    cpu: number | null
    memory: number | null
    ioOperations: number | null
  }

  export type ActivityTraceMinAggregateOutputType = {
    id: string | null
    traceId: string | null
    spanId: string | null
    parentSpanId: string | null
    operation: string | null
    service: string | null
    method: string | null
    path: string | null
    startTime: Date | null
    endTime: Date | null
    duration: number | null
    status: string | null
    statusCode: number | null
    userId: string | null
    sessionId: string | null
    cpu: number | null
    memory: number | null
    ioOperations: number | null
  }

  export type ActivityTraceMaxAggregateOutputType = {
    id: string | null
    traceId: string | null
    spanId: string | null
    parentSpanId: string | null
    operation: string | null
    service: string | null
    method: string | null
    path: string | null
    startTime: Date | null
    endTime: Date | null
    duration: number | null
    status: string | null
    statusCode: number | null
    userId: string | null
    sessionId: string | null
    cpu: number | null
    memory: number | null
    ioOperations: number | null
  }

  export type ActivityTraceCountAggregateOutputType = {
    id: number
    traceId: number
    spanId: number
    parentSpanId: number
    operation: number
    service: number
    method: number
    path: number
    startTime: number
    endTime: number
    duration: number
    status: number
    statusCode: number
    userId: number
    sessionId: number
    cpu: number
    memory: number
    ioOperations: number
    tags: number
    metadata: number
    _all: number
  }


  export type ActivityTraceAvgAggregateInputType = {
    duration?: true
    statusCode?: true
    cpu?: true
    memory?: true
    ioOperations?: true
  }

  export type ActivityTraceSumAggregateInputType = {
    duration?: true
    statusCode?: true
    cpu?: true
    memory?: true
    ioOperations?: true
  }

  export type ActivityTraceMinAggregateInputType = {
    id?: true
    traceId?: true
    spanId?: true
    parentSpanId?: true
    operation?: true
    service?: true
    method?: true
    path?: true
    startTime?: true
    endTime?: true
    duration?: true
    status?: true
    statusCode?: true
    userId?: true
    sessionId?: true
    cpu?: true
    memory?: true
    ioOperations?: true
  }

  export type ActivityTraceMaxAggregateInputType = {
    id?: true
    traceId?: true
    spanId?: true
    parentSpanId?: true
    operation?: true
    service?: true
    method?: true
    path?: true
    startTime?: true
    endTime?: true
    duration?: true
    status?: true
    statusCode?: true
    userId?: true
    sessionId?: true
    cpu?: true
    memory?: true
    ioOperations?: true
  }

  export type ActivityTraceCountAggregateInputType = {
    id?: true
    traceId?: true
    spanId?: true
    parentSpanId?: true
    operation?: true
    service?: true
    method?: true
    path?: true
    startTime?: true
    endTime?: true
    duration?: true
    status?: true
    statusCode?: true
    userId?: true
    sessionId?: true
    cpu?: true
    memory?: true
    ioOperations?: true
    tags?: true
    metadata?: true
    _all?: true
  }

  export type ActivityTraceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityTrace to aggregate.
     */
    where?: ActivityTraceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityTraces to fetch.
     */
    orderBy?: ActivityTraceOrderByWithRelationInput | ActivityTraceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ActivityTraceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityTraces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityTraces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ActivityTraces
    **/
    _count?: true | ActivityTraceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ActivityTraceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ActivityTraceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ActivityTraceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ActivityTraceMaxAggregateInputType
  }

  export type GetActivityTraceAggregateType<T extends ActivityTraceAggregateArgs> = {
        [P in keyof T & keyof AggregateActivityTrace]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateActivityTrace[P]>
      : GetScalarType<T[P], AggregateActivityTrace[P]>
  }




  export type ActivityTraceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityTraceWhereInput
    orderBy?: ActivityTraceOrderByWithAggregationInput | ActivityTraceOrderByWithAggregationInput[]
    by: ActivityTraceScalarFieldEnum[] | ActivityTraceScalarFieldEnum
    having?: ActivityTraceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ActivityTraceCountAggregateInputType | true
    _avg?: ActivityTraceAvgAggregateInputType
    _sum?: ActivityTraceSumAggregateInputType
    _min?: ActivityTraceMinAggregateInputType
    _max?: ActivityTraceMaxAggregateInputType
  }

  export type ActivityTraceGroupByOutputType = {
    id: string
    traceId: string
    spanId: string
    parentSpanId: string | null
    operation: string
    service: string
    method: string | null
    path: string | null
    startTime: Date
    endTime: Date | null
    duration: number | null
    status: string
    statusCode: number | null
    userId: string | null
    sessionId: string | null
    cpu: number | null
    memory: number | null
    ioOperations: number | null
    tags: JsonValue | null
    metadata: JsonValue | null
    _count: ActivityTraceCountAggregateOutputType | null
    _avg: ActivityTraceAvgAggregateOutputType | null
    _sum: ActivityTraceSumAggregateOutputType | null
    _min: ActivityTraceMinAggregateOutputType | null
    _max: ActivityTraceMaxAggregateOutputType | null
  }

  type GetActivityTraceGroupByPayload<T extends ActivityTraceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ActivityTraceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ActivityTraceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ActivityTraceGroupByOutputType[P]>
            : GetScalarType<T[P], ActivityTraceGroupByOutputType[P]>
        }
      >
    >


  export type ActivityTraceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traceId?: boolean
    spanId?: boolean
    parentSpanId?: boolean
    operation?: boolean
    service?: boolean
    method?: boolean
    path?: boolean
    startTime?: boolean
    endTime?: boolean
    duration?: boolean
    status?: boolean
    statusCode?: boolean
    userId?: boolean
    sessionId?: boolean
    cpu?: boolean
    memory?: boolean
    ioOperations?: boolean
    tags?: boolean
    metadata?: boolean
  }, ExtArgs["result"]["activityTrace"]>



  export type ActivityTraceSelectScalar = {
    id?: boolean
    traceId?: boolean
    spanId?: boolean
    parentSpanId?: boolean
    operation?: boolean
    service?: boolean
    method?: boolean
    path?: boolean
    startTime?: boolean
    endTime?: boolean
    duration?: boolean
    status?: boolean
    statusCode?: boolean
    userId?: boolean
    sessionId?: boolean
    cpu?: boolean
    memory?: boolean
    ioOperations?: boolean
    tags?: boolean
    metadata?: boolean
  }

  export type ActivityTraceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "traceId" | "spanId" | "parentSpanId" | "operation" | "service" | "method" | "path" | "startTime" | "endTime" | "duration" | "status" | "statusCode" | "userId" | "sessionId" | "cpu" | "memory" | "ioOperations" | "tags" | "metadata", ExtArgs["result"]["activityTrace"]>

  export type $ActivityTracePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ActivityTrace"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      traceId: string
      spanId: string
      parentSpanId: string | null
      operation: string
      service: string
      method: string | null
      path: string | null
      startTime: Date
      endTime: Date | null
      duration: number | null
      status: string
      statusCode: number | null
      userId: string | null
      sessionId: string | null
      cpu: number | null
      memory: number | null
      ioOperations: number | null
      tags: Prisma.JsonValue | null
      metadata: Prisma.JsonValue | null
    }, ExtArgs["result"]["activityTrace"]>
    composites: {}
  }

  type ActivityTraceGetPayload<S extends boolean | null | undefined | ActivityTraceDefaultArgs> = $Result.GetResult<Prisma.$ActivityTracePayload, S>

  type ActivityTraceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ActivityTraceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ActivityTraceCountAggregateInputType | true
    }

  export interface ActivityTraceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ActivityTrace'], meta: { name: 'ActivityTrace' } }
    /**
     * Find zero or one ActivityTrace that matches the filter.
     * @param {ActivityTraceFindUniqueArgs} args - Arguments to find a ActivityTrace
     * @example
     * // Get one ActivityTrace
     * const activityTrace = await prisma.activityTrace.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActivityTraceFindUniqueArgs>(args: SelectSubset<T, ActivityTraceFindUniqueArgs<ExtArgs>>): Prisma__ActivityTraceClient<$Result.GetResult<Prisma.$ActivityTracePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ActivityTrace that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ActivityTraceFindUniqueOrThrowArgs} args - Arguments to find a ActivityTrace
     * @example
     * // Get one ActivityTrace
     * const activityTrace = await prisma.activityTrace.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActivityTraceFindUniqueOrThrowArgs>(args: SelectSubset<T, ActivityTraceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ActivityTraceClient<$Result.GetResult<Prisma.$ActivityTracePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityTrace that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityTraceFindFirstArgs} args - Arguments to find a ActivityTrace
     * @example
     * // Get one ActivityTrace
     * const activityTrace = await prisma.activityTrace.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActivityTraceFindFirstArgs>(args?: SelectSubset<T, ActivityTraceFindFirstArgs<ExtArgs>>): Prisma__ActivityTraceClient<$Result.GetResult<Prisma.$ActivityTracePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityTrace that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityTraceFindFirstOrThrowArgs} args - Arguments to find a ActivityTrace
     * @example
     * // Get one ActivityTrace
     * const activityTrace = await prisma.activityTrace.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActivityTraceFindFirstOrThrowArgs>(args?: SelectSubset<T, ActivityTraceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ActivityTraceClient<$Result.GetResult<Prisma.$ActivityTracePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ActivityTraces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityTraceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ActivityTraces
     * const activityTraces = await prisma.activityTrace.findMany()
     * 
     * // Get first 10 ActivityTraces
     * const activityTraces = await prisma.activityTrace.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const activityTraceWithIdOnly = await prisma.activityTrace.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ActivityTraceFindManyArgs>(args?: SelectSubset<T, ActivityTraceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityTracePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ActivityTrace.
     * @param {ActivityTraceCreateArgs} args - Arguments to create a ActivityTrace.
     * @example
     * // Create one ActivityTrace
     * const ActivityTrace = await prisma.activityTrace.create({
     *   data: {
     *     // ... data to create a ActivityTrace
     *   }
     * })
     * 
     */
    create<T extends ActivityTraceCreateArgs>(args: SelectSubset<T, ActivityTraceCreateArgs<ExtArgs>>): Prisma__ActivityTraceClient<$Result.GetResult<Prisma.$ActivityTracePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ActivityTraces.
     * @param {ActivityTraceCreateManyArgs} args - Arguments to create many ActivityTraces.
     * @example
     * // Create many ActivityTraces
     * const activityTrace = await prisma.activityTrace.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ActivityTraceCreateManyArgs>(args?: SelectSubset<T, ActivityTraceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ActivityTrace.
     * @param {ActivityTraceDeleteArgs} args - Arguments to delete one ActivityTrace.
     * @example
     * // Delete one ActivityTrace
     * const ActivityTrace = await prisma.activityTrace.delete({
     *   where: {
     *     // ... filter to delete one ActivityTrace
     *   }
     * })
     * 
     */
    delete<T extends ActivityTraceDeleteArgs>(args: SelectSubset<T, ActivityTraceDeleteArgs<ExtArgs>>): Prisma__ActivityTraceClient<$Result.GetResult<Prisma.$ActivityTracePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ActivityTrace.
     * @param {ActivityTraceUpdateArgs} args - Arguments to update one ActivityTrace.
     * @example
     * // Update one ActivityTrace
     * const activityTrace = await prisma.activityTrace.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ActivityTraceUpdateArgs>(args: SelectSubset<T, ActivityTraceUpdateArgs<ExtArgs>>): Prisma__ActivityTraceClient<$Result.GetResult<Prisma.$ActivityTracePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ActivityTraces.
     * @param {ActivityTraceDeleteManyArgs} args - Arguments to filter ActivityTraces to delete.
     * @example
     * // Delete a few ActivityTraces
     * const { count } = await prisma.activityTrace.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ActivityTraceDeleteManyArgs>(args?: SelectSubset<T, ActivityTraceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivityTraces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityTraceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ActivityTraces
     * const activityTrace = await prisma.activityTrace.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ActivityTraceUpdateManyArgs>(args: SelectSubset<T, ActivityTraceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ActivityTrace.
     * @param {ActivityTraceUpsertArgs} args - Arguments to update or create a ActivityTrace.
     * @example
     * // Update or create a ActivityTrace
     * const activityTrace = await prisma.activityTrace.upsert({
     *   create: {
     *     // ... data to create a ActivityTrace
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ActivityTrace we want to update
     *   }
     * })
     */
    upsert<T extends ActivityTraceUpsertArgs>(args: SelectSubset<T, ActivityTraceUpsertArgs<ExtArgs>>): Prisma__ActivityTraceClient<$Result.GetResult<Prisma.$ActivityTracePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ActivityTraces that matches the filter.
     * @param {ActivityTraceFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const activityTrace = await prisma.activityTrace.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: ActivityTraceFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a ActivityTrace.
     * @param {ActivityTraceAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const activityTrace = await prisma.activityTrace.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ActivityTraceAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of ActivityTraces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityTraceCountArgs} args - Arguments to filter ActivityTraces to count.
     * @example
     * // Count the number of ActivityTraces
     * const count = await prisma.activityTrace.count({
     *   where: {
     *     // ... the filter for the ActivityTraces we want to count
     *   }
     * })
    **/
    count<T extends ActivityTraceCountArgs>(
      args?: Subset<T, ActivityTraceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ActivityTraceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ActivityTrace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityTraceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ActivityTraceAggregateArgs>(args: Subset<T, ActivityTraceAggregateArgs>): Prisma.PrismaPromise<GetActivityTraceAggregateType<T>>

    /**
     * Group by ActivityTrace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityTraceGroupByArgs} args - Group by arguments.
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
      T extends ActivityTraceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ActivityTraceGroupByArgs['orderBy'] }
        : { orderBy?: ActivityTraceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ActivityTraceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActivityTraceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ActivityTrace model
   */
  readonly fields: ActivityTraceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ActivityTrace.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ActivityTraceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ActivityTrace model
   */
  interface ActivityTraceFieldRefs {
    readonly id: FieldRef<"ActivityTrace", 'String'>
    readonly traceId: FieldRef<"ActivityTrace", 'String'>
    readonly spanId: FieldRef<"ActivityTrace", 'String'>
    readonly parentSpanId: FieldRef<"ActivityTrace", 'String'>
    readonly operation: FieldRef<"ActivityTrace", 'String'>
    readonly service: FieldRef<"ActivityTrace", 'String'>
    readonly method: FieldRef<"ActivityTrace", 'String'>
    readonly path: FieldRef<"ActivityTrace", 'String'>
    readonly startTime: FieldRef<"ActivityTrace", 'DateTime'>
    readonly endTime: FieldRef<"ActivityTrace", 'DateTime'>
    readonly duration: FieldRef<"ActivityTrace", 'Int'>
    readonly status: FieldRef<"ActivityTrace", 'String'>
    readonly statusCode: FieldRef<"ActivityTrace", 'Int'>
    readonly userId: FieldRef<"ActivityTrace", 'String'>
    readonly sessionId: FieldRef<"ActivityTrace", 'String'>
    readonly cpu: FieldRef<"ActivityTrace", 'Float'>
    readonly memory: FieldRef<"ActivityTrace", 'Int'>
    readonly ioOperations: FieldRef<"ActivityTrace", 'Int'>
    readonly tags: FieldRef<"ActivityTrace", 'Json'>
    readonly metadata: FieldRef<"ActivityTrace", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * ActivityTrace findUnique
   */
  export type ActivityTraceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
    /**
     * Filter, which ActivityTrace to fetch.
     */
    where: ActivityTraceWhereUniqueInput
  }

  /**
   * ActivityTrace findUniqueOrThrow
   */
  export type ActivityTraceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
    /**
     * Filter, which ActivityTrace to fetch.
     */
    where: ActivityTraceWhereUniqueInput
  }

  /**
   * ActivityTrace findFirst
   */
  export type ActivityTraceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
    /**
     * Filter, which ActivityTrace to fetch.
     */
    where?: ActivityTraceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityTraces to fetch.
     */
    orderBy?: ActivityTraceOrderByWithRelationInput | ActivityTraceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityTraces.
     */
    cursor?: ActivityTraceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityTraces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityTraces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityTraces.
     */
    distinct?: ActivityTraceScalarFieldEnum | ActivityTraceScalarFieldEnum[]
  }

  /**
   * ActivityTrace findFirstOrThrow
   */
  export type ActivityTraceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
    /**
     * Filter, which ActivityTrace to fetch.
     */
    where?: ActivityTraceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityTraces to fetch.
     */
    orderBy?: ActivityTraceOrderByWithRelationInput | ActivityTraceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityTraces.
     */
    cursor?: ActivityTraceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityTraces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityTraces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityTraces.
     */
    distinct?: ActivityTraceScalarFieldEnum | ActivityTraceScalarFieldEnum[]
  }

  /**
   * ActivityTrace findMany
   */
  export type ActivityTraceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
    /**
     * Filter, which ActivityTraces to fetch.
     */
    where?: ActivityTraceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityTraces to fetch.
     */
    orderBy?: ActivityTraceOrderByWithRelationInput | ActivityTraceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ActivityTraces.
     */
    cursor?: ActivityTraceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityTraces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityTraces.
     */
    skip?: number
    distinct?: ActivityTraceScalarFieldEnum | ActivityTraceScalarFieldEnum[]
  }

  /**
   * ActivityTrace create
   */
  export type ActivityTraceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
    /**
     * The data needed to create a ActivityTrace.
     */
    data: XOR<ActivityTraceCreateInput, ActivityTraceUncheckedCreateInput>
  }

  /**
   * ActivityTrace createMany
   */
  export type ActivityTraceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ActivityTraces.
     */
    data: ActivityTraceCreateManyInput | ActivityTraceCreateManyInput[]
  }

  /**
   * ActivityTrace update
   */
  export type ActivityTraceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
    /**
     * The data needed to update a ActivityTrace.
     */
    data: XOR<ActivityTraceUpdateInput, ActivityTraceUncheckedUpdateInput>
    /**
     * Choose, which ActivityTrace to update.
     */
    where: ActivityTraceWhereUniqueInput
  }

  /**
   * ActivityTrace updateMany
   */
  export type ActivityTraceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ActivityTraces.
     */
    data: XOR<ActivityTraceUpdateManyMutationInput, ActivityTraceUncheckedUpdateManyInput>
    /**
     * Filter which ActivityTraces to update
     */
    where?: ActivityTraceWhereInput
    /**
     * Limit how many ActivityTraces to update.
     */
    limit?: number
  }

  /**
   * ActivityTrace upsert
   */
  export type ActivityTraceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
    /**
     * The filter to search for the ActivityTrace to update in case it exists.
     */
    where: ActivityTraceWhereUniqueInput
    /**
     * In case the ActivityTrace found by the `where` argument doesn't exist, create a new ActivityTrace with this data.
     */
    create: XOR<ActivityTraceCreateInput, ActivityTraceUncheckedCreateInput>
    /**
     * In case the ActivityTrace was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ActivityTraceUpdateInput, ActivityTraceUncheckedUpdateInput>
  }

  /**
   * ActivityTrace delete
   */
  export type ActivityTraceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
    /**
     * Filter which ActivityTrace to delete.
     */
    where: ActivityTraceWhereUniqueInput
  }

  /**
   * ActivityTrace deleteMany
   */
  export type ActivityTraceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityTraces to delete
     */
    where?: ActivityTraceWhereInput
    /**
     * Limit how many ActivityTraces to delete.
     */
    limit?: number
  }

  /**
   * ActivityTrace findRaw
   */
  export type ActivityTraceFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ActivityTrace aggregateRaw
   */
  export type ActivityTraceAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ActivityTrace without action
   */
  export type ActivityTraceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityTrace
     */
    select?: ActivityTraceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityTrace
     */
    omit?: ActivityTraceOmit<ExtArgs> | null
  }


  /**
   * Model ComplianceLog
   */

  export type AggregateComplianceLog = {
    _count: ComplianceLogCountAggregateOutputType | null
    _avg: ComplianceLogAvgAggregateOutputType | null
    _sum: ComplianceLogSumAggregateOutputType | null
    _min: ComplianceLogMinAggregateOutputType | null
    _max: ComplianceLogMaxAggregateOutputType | null
  }

  export type ComplianceLogAvgAggregateOutputType = {
    retentionPeriod: number | null
  }

  export type ComplianceLogSumAggregateOutputType = {
    retentionPeriod: number | null
  }

  export type ComplianceLogMinAggregateOutputType = {
    id: string | null
    regulation: string | null
    eventType: string | null
    dataCategory: string | null
    dataSubjectId: string | null
    dataSubjectType: string | null
    action: string | null
    purpose: string | null
    legalBasis: string | null
    processor: string | null
    controller: string | null
    consentId: string | null
    consentStatus: string | null
    retentionPeriod: number | null
    disposalDate: Date | null
    userId: string | null
    ipAddress: string | null
    timestamp: Date | null
  }

  export type ComplianceLogMaxAggregateOutputType = {
    id: string | null
    regulation: string | null
    eventType: string | null
    dataCategory: string | null
    dataSubjectId: string | null
    dataSubjectType: string | null
    action: string | null
    purpose: string | null
    legalBasis: string | null
    processor: string | null
    controller: string | null
    consentId: string | null
    consentStatus: string | null
    retentionPeriod: number | null
    disposalDate: Date | null
    userId: string | null
    ipAddress: string | null
    timestamp: Date | null
  }

  export type ComplianceLogCountAggregateOutputType = {
    id: number
    regulation: number
    eventType: number
    dataCategory: number
    dataSubjectId: number
    dataSubjectType: number
    action: number
    purpose: number
    legalBasis: number
    dataFields: number
    processor: number
    controller: number
    consentId: number
    consentStatus: number
    retentionPeriod: number
    disposalDate: number
    userId: number
    ipAddress: number
    timestamp: number
    metadata: number
    _all: number
  }


  export type ComplianceLogAvgAggregateInputType = {
    retentionPeriod?: true
  }

  export type ComplianceLogSumAggregateInputType = {
    retentionPeriod?: true
  }

  export type ComplianceLogMinAggregateInputType = {
    id?: true
    regulation?: true
    eventType?: true
    dataCategory?: true
    dataSubjectId?: true
    dataSubjectType?: true
    action?: true
    purpose?: true
    legalBasis?: true
    processor?: true
    controller?: true
    consentId?: true
    consentStatus?: true
    retentionPeriod?: true
    disposalDate?: true
    userId?: true
    ipAddress?: true
    timestamp?: true
  }

  export type ComplianceLogMaxAggregateInputType = {
    id?: true
    regulation?: true
    eventType?: true
    dataCategory?: true
    dataSubjectId?: true
    dataSubjectType?: true
    action?: true
    purpose?: true
    legalBasis?: true
    processor?: true
    controller?: true
    consentId?: true
    consentStatus?: true
    retentionPeriod?: true
    disposalDate?: true
    userId?: true
    ipAddress?: true
    timestamp?: true
  }

  export type ComplianceLogCountAggregateInputType = {
    id?: true
    regulation?: true
    eventType?: true
    dataCategory?: true
    dataSubjectId?: true
    dataSubjectType?: true
    action?: true
    purpose?: true
    legalBasis?: true
    dataFields?: true
    processor?: true
    controller?: true
    consentId?: true
    consentStatus?: true
    retentionPeriod?: true
    disposalDate?: true
    userId?: true
    ipAddress?: true
    timestamp?: true
    metadata?: true
    _all?: true
  }

  export type ComplianceLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ComplianceLog to aggregate.
     */
    where?: ComplianceLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ComplianceLogs to fetch.
     */
    orderBy?: ComplianceLogOrderByWithRelationInput | ComplianceLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ComplianceLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ComplianceLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ComplianceLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ComplianceLogs
    **/
    _count?: true | ComplianceLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ComplianceLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ComplianceLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ComplianceLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ComplianceLogMaxAggregateInputType
  }

  export type GetComplianceLogAggregateType<T extends ComplianceLogAggregateArgs> = {
        [P in keyof T & keyof AggregateComplianceLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateComplianceLog[P]>
      : GetScalarType<T[P], AggregateComplianceLog[P]>
  }




  export type ComplianceLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ComplianceLogWhereInput
    orderBy?: ComplianceLogOrderByWithAggregationInput | ComplianceLogOrderByWithAggregationInput[]
    by: ComplianceLogScalarFieldEnum[] | ComplianceLogScalarFieldEnum
    having?: ComplianceLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ComplianceLogCountAggregateInputType | true
    _avg?: ComplianceLogAvgAggregateInputType
    _sum?: ComplianceLogSumAggregateInputType
    _min?: ComplianceLogMinAggregateInputType
    _max?: ComplianceLogMaxAggregateInputType
  }

  export type ComplianceLogGroupByOutputType = {
    id: string
    regulation: string
    eventType: string
    dataCategory: string
    dataSubjectId: string | null
    dataSubjectType: string | null
    action: string
    purpose: string | null
    legalBasis: string | null
    dataFields: string[]
    processor: string | null
    controller: string | null
    consentId: string | null
    consentStatus: string | null
    retentionPeriod: number | null
    disposalDate: Date | null
    userId: string | null
    ipAddress: string | null
    timestamp: Date
    metadata: JsonValue | null
    _count: ComplianceLogCountAggregateOutputType | null
    _avg: ComplianceLogAvgAggregateOutputType | null
    _sum: ComplianceLogSumAggregateOutputType | null
    _min: ComplianceLogMinAggregateOutputType | null
    _max: ComplianceLogMaxAggregateOutputType | null
  }

  type GetComplianceLogGroupByPayload<T extends ComplianceLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ComplianceLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ComplianceLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ComplianceLogGroupByOutputType[P]>
            : GetScalarType<T[P], ComplianceLogGroupByOutputType[P]>
        }
      >
    >


  export type ComplianceLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    regulation?: boolean
    eventType?: boolean
    dataCategory?: boolean
    dataSubjectId?: boolean
    dataSubjectType?: boolean
    action?: boolean
    purpose?: boolean
    legalBasis?: boolean
    dataFields?: boolean
    processor?: boolean
    controller?: boolean
    consentId?: boolean
    consentStatus?: boolean
    retentionPeriod?: boolean
    disposalDate?: boolean
    userId?: boolean
    ipAddress?: boolean
    timestamp?: boolean
    metadata?: boolean
  }, ExtArgs["result"]["complianceLog"]>



  export type ComplianceLogSelectScalar = {
    id?: boolean
    regulation?: boolean
    eventType?: boolean
    dataCategory?: boolean
    dataSubjectId?: boolean
    dataSubjectType?: boolean
    action?: boolean
    purpose?: boolean
    legalBasis?: boolean
    dataFields?: boolean
    processor?: boolean
    controller?: boolean
    consentId?: boolean
    consentStatus?: boolean
    retentionPeriod?: boolean
    disposalDate?: boolean
    userId?: boolean
    ipAddress?: boolean
    timestamp?: boolean
    metadata?: boolean
  }

  export type ComplianceLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "regulation" | "eventType" | "dataCategory" | "dataSubjectId" | "dataSubjectType" | "action" | "purpose" | "legalBasis" | "dataFields" | "processor" | "controller" | "consentId" | "consentStatus" | "retentionPeriod" | "disposalDate" | "userId" | "ipAddress" | "timestamp" | "metadata", ExtArgs["result"]["complianceLog"]>

  export type $ComplianceLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ComplianceLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      regulation: string
      eventType: string
      dataCategory: string
      dataSubjectId: string | null
      dataSubjectType: string | null
      action: string
      purpose: string | null
      legalBasis: string | null
      dataFields: string[]
      processor: string | null
      controller: string | null
      consentId: string | null
      consentStatus: string | null
      retentionPeriod: number | null
      disposalDate: Date | null
      userId: string | null
      ipAddress: string | null
      timestamp: Date
      metadata: Prisma.JsonValue | null
    }, ExtArgs["result"]["complianceLog"]>
    composites: {}
  }

  type ComplianceLogGetPayload<S extends boolean | null | undefined | ComplianceLogDefaultArgs> = $Result.GetResult<Prisma.$ComplianceLogPayload, S>

  type ComplianceLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ComplianceLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ComplianceLogCountAggregateInputType | true
    }

  export interface ComplianceLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ComplianceLog'], meta: { name: 'ComplianceLog' } }
    /**
     * Find zero or one ComplianceLog that matches the filter.
     * @param {ComplianceLogFindUniqueArgs} args - Arguments to find a ComplianceLog
     * @example
     * // Get one ComplianceLog
     * const complianceLog = await prisma.complianceLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ComplianceLogFindUniqueArgs>(args: SelectSubset<T, ComplianceLogFindUniqueArgs<ExtArgs>>): Prisma__ComplianceLogClient<$Result.GetResult<Prisma.$ComplianceLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ComplianceLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ComplianceLogFindUniqueOrThrowArgs} args - Arguments to find a ComplianceLog
     * @example
     * // Get one ComplianceLog
     * const complianceLog = await prisma.complianceLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ComplianceLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ComplianceLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ComplianceLogClient<$Result.GetResult<Prisma.$ComplianceLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ComplianceLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComplianceLogFindFirstArgs} args - Arguments to find a ComplianceLog
     * @example
     * // Get one ComplianceLog
     * const complianceLog = await prisma.complianceLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ComplianceLogFindFirstArgs>(args?: SelectSubset<T, ComplianceLogFindFirstArgs<ExtArgs>>): Prisma__ComplianceLogClient<$Result.GetResult<Prisma.$ComplianceLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ComplianceLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComplianceLogFindFirstOrThrowArgs} args - Arguments to find a ComplianceLog
     * @example
     * // Get one ComplianceLog
     * const complianceLog = await prisma.complianceLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ComplianceLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ComplianceLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ComplianceLogClient<$Result.GetResult<Prisma.$ComplianceLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ComplianceLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComplianceLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ComplianceLogs
     * const complianceLogs = await prisma.complianceLog.findMany()
     * 
     * // Get first 10 ComplianceLogs
     * const complianceLogs = await prisma.complianceLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const complianceLogWithIdOnly = await prisma.complianceLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ComplianceLogFindManyArgs>(args?: SelectSubset<T, ComplianceLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ComplianceLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ComplianceLog.
     * @param {ComplianceLogCreateArgs} args - Arguments to create a ComplianceLog.
     * @example
     * // Create one ComplianceLog
     * const ComplianceLog = await prisma.complianceLog.create({
     *   data: {
     *     // ... data to create a ComplianceLog
     *   }
     * })
     * 
     */
    create<T extends ComplianceLogCreateArgs>(args: SelectSubset<T, ComplianceLogCreateArgs<ExtArgs>>): Prisma__ComplianceLogClient<$Result.GetResult<Prisma.$ComplianceLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ComplianceLogs.
     * @param {ComplianceLogCreateManyArgs} args - Arguments to create many ComplianceLogs.
     * @example
     * // Create many ComplianceLogs
     * const complianceLog = await prisma.complianceLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ComplianceLogCreateManyArgs>(args?: SelectSubset<T, ComplianceLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ComplianceLog.
     * @param {ComplianceLogDeleteArgs} args - Arguments to delete one ComplianceLog.
     * @example
     * // Delete one ComplianceLog
     * const ComplianceLog = await prisma.complianceLog.delete({
     *   where: {
     *     // ... filter to delete one ComplianceLog
     *   }
     * })
     * 
     */
    delete<T extends ComplianceLogDeleteArgs>(args: SelectSubset<T, ComplianceLogDeleteArgs<ExtArgs>>): Prisma__ComplianceLogClient<$Result.GetResult<Prisma.$ComplianceLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ComplianceLog.
     * @param {ComplianceLogUpdateArgs} args - Arguments to update one ComplianceLog.
     * @example
     * // Update one ComplianceLog
     * const complianceLog = await prisma.complianceLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ComplianceLogUpdateArgs>(args: SelectSubset<T, ComplianceLogUpdateArgs<ExtArgs>>): Prisma__ComplianceLogClient<$Result.GetResult<Prisma.$ComplianceLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ComplianceLogs.
     * @param {ComplianceLogDeleteManyArgs} args - Arguments to filter ComplianceLogs to delete.
     * @example
     * // Delete a few ComplianceLogs
     * const { count } = await prisma.complianceLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ComplianceLogDeleteManyArgs>(args?: SelectSubset<T, ComplianceLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ComplianceLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComplianceLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ComplianceLogs
     * const complianceLog = await prisma.complianceLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ComplianceLogUpdateManyArgs>(args: SelectSubset<T, ComplianceLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ComplianceLog.
     * @param {ComplianceLogUpsertArgs} args - Arguments to update or create a ComplianceLog.
     * @example
     * // Update or create a ComplianceLog
     * const complianceLog = await prisma.complianceLog.upsert({
     *   create: {
     *     // ... data to create a ComplianceLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ComplianceLog we want to update
     *   }
     * })
     */
    upsert<T extends ComplianceLogUpsertArgs>(args: SelectSubset<T, ComplianceLogUpsertArgs<ExtArgs>>): Prisma__ComplianceLogClient<$Result.GetResult<Prisma.$ComplianceLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ComplianceLogs that matches the filter.
     * @param {ComplianceLogFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const complianceLog = await prisma.complianceLog.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: ComplianceLogFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a ComplianceLog.
     * @param {ComplianceLogAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const complianceLog = await prisma.complianceLog.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ComplianceLogAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of ComplianceLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComplianceLogCountArgs} args - Arguments to filter ComplianceLogs to count.
     * @example
     * // Count the number of ComplianceLogs
     * const count = await prisma.complianceLog.count({
     *   where: {
     *     // ... the filter for the ComplianceLogs we want to count
     *   }
     * })
    **/
    count<T extends ComplianceLogCountArgs>(
      args?: Subset<T, ComplianceLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ComplianceLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ComplianceLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComplianceLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ComplianceLogAggregateArgs>(args: Subset<T, ComplianceLogAggregateArgs>): Prisma.PrismaPromise<GetComplianceLogAggregateType<T>>

    /**
     * Group by ComplianceLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ComplianceLogGroupByArgs} args - Group by arguments.
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
      T extends ComplianceLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ComplianceLogGroupByArgs['orderBy'] }
        : { orderBy?: ComplianceLogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ComplianceLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetComplianceLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ComplianceLog model
   */
  readonly fields: ComplianceLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ComplianceLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ComplianceLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ComplianceLog model
   */
  interface ComplianceLogFieldRefs {
    readonly id: FieldRef<"ComplianceLog", 'String'>
    readonly regulation: FieldRef<"ComplianceLog", 'String'>
    readonly eventType: FieldRef<"ComplianceLog", 'String'>
    readonly dataCategory: FieldRef<"ComplianceLog", 'String'>
    readonly dataSubjectId: FieldRef<"ComplianceLog", 'String'>
    readonly dataSubjectType: FieldRef<"ComplianceLog", 'String'>
    readonly action: FieldRef<"ComplianceLog", 'String'>
    readonly purpose: FieldRef<"ComplianceLog", 'String'>
    readonly legalBasis: FieldRef<"ComplianceLog", 'String'>
    readonly dataFields: FieldRef<"ComplianceLog", 'String[]'>
    readonly processor: FieldRef<"ComplianceLog", 'String'>
    readonly controller: FieldRef<"ComplianceLog", 'String'>
    readonly consentId: FieldRef<"ComplianceLog", 'String'>
    readonly consentStatus: FieldRef<"ComplianceLog", 'String'>
    readonly retentionPeriod: FieldRef<"ComplianceLog", 'Int'>
    readonly disposalDate: FieldRef<"ComplianceLog", 'DateTime'>
    readonly userId: FieldRef<"ComplianceLog", 'String'>
    readonly ipAddress: FieldRef<"ComplianceLog", 'String'>
    readonly timestamp: FieldRef<"ComplianceLog", 'DateTime'>
    readonly metadata: FieldRef<"ComplianceLog", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * ComplianceLog findUnique
   */
  export type ComplianceLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
    /**
     * Filter, which ComplianceLog to fetch.
     */
    where: ComplianceLogWhereUniqueInput
  }

  /**
   * ComplianceLog findUniqueOrThrow
   */
  export type ComplianceLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
    /**
     * Filter, which ComplianceLog to fetch.
     */
    where: ComplianceLogWhereUniqueInput
  }

  /**
   * ComplianceLog findFirst
   */
  export type ComplianceLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
    /**
     * Filter, which ComplianceLog to fetch.
     */
    where?: ComplianceLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ComplianceLogs to fetch.
     */
    orderBy?: ComplianceLogOrderByWithRelationInput | ComplianceLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ComplianceLogs.
     */
    cursor?: ComplianceLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ComplianceLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ComplianceLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ComplianceLogs.
     */
    distinct?: ComplianceLogScalarFieldEnum | ComplianceLogScalarFieldEnum[]
  }

  /**
   * ComplianceLog findFirstOrThrow
   */
  export type ComplianceLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
    /**
     * Filter, which ComplianceLog to fetch.
     */
    where?: ComplianceLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ComplianceLogs to fetch.
     */
    orderBy?: ComplianceLogOrderByWithRelationInput | ComplianceLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ComplianceLogs.
     */
    cursor?: ComplianceLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ComplianceLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ComplianceLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ComplianceLogs.
     */
    distinct?: ComplianceLogScalarFieldEnum | ComplianceLogScalarFieldEnum[]
  }

  /**
   * ComplianceLog findMany
   */
  export type ComplianceLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
    /**
     * Filter, which ComplianceLogs to fetch.
     */
    where?: ComplianceLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ComplianceLogs to fetch.
     */
    orderBy?: ComplianceLogOrderByWithRelationInput | ComplianceLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ComplianceLogs.
     */
    cursor?: ComplianceLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ComplianceLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ComplianceLogs.
     */
    skip?: number
    distinct?: ComplianceLogScalarFieldEnum | ComplianceLogScalarFieldEnum[]
  }

  /**
   * ComplianceLog create
   */
  export type ComplianceLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
    /**
     * The data needed to create a ComplianceLog.
     */
    data: XOR<ComplianceLogCreateInput, ComplianceLogUncheckedCreateInput>
  }

  /**
   * ComplianceLog createMany
   */
  export type ComplianceLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ComplianceLogs.
     */
    data: ComplianceLogCreateManyInput | ComplianceLogCreateManyInput[]
  }

  /**
   * ComplianceLog update
   */
  export type ComplianceLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
    /**
     * The data needed to update a ComplianceLog.
     */
    data: XOR<ComplianceLogUpdateInput, ComplianceLogUncheckedUpdateInput>
    /**
     * Choose, which ComplianceLog to update.
     */
    where: ComplianceLogWhereUniqueInput
  }

  /**
   * ComplianceLog updateMany
   */
  export type ComplianceLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ComplianceLogs.
     */
    data: XOR<ComplianceLogUpdateManyMutationInput, ComplianceLogUncheckedUpdateManyInput>
    /**
     * Filter which ComplianceLogs to update
     */
    where?: ComplianceLogWhereInput
    /**
     * Limit how many ComplianceLogs to update.
     */
    limit?: number
  }

  /**
   * ComplianceLog upsert
   */
  export type ComplianceLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
    /**
     * The filter to search for the ComplianceLog to update in case it exists.
     */
    where: ComplianceLogWhereUniqueInput
    /**
     * In case the ComplianceLog found by the `where` argument doesn't exist, create a new ComplianceLog with this data.
     */
    create: XOR<ComplianceLogCreateInput, ComplianceLogUncheckedCreateInput>
    /**
     * In case the ComplianceLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ComplianceLogUpdateInput, ComplianceLogUncheckedUpdateInput>
  }

  /**
   * ComplianceLog delete
   */
  export type ComplianceLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
    /**
     * Filter which ComplianceLog to delete.
     */
    where: ComplianceLogWhereUniqueInput
  }

  /**
   * ComplianceLog deleteMany
   */
  export type ComplianceLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ComplianceLogs to delete
     */
    where?: ComplianceLogWhereInput
    /**
     * Limit how many ComplianceLogs to delete.
     */
    limit?: number
  }

  /**
   * ComplianceLog findRaw
   */
  export type ComplianceLogFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ComplianceLog aggregateRaw
   */
  export type ComplianceLogAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ComplianceLog without action
   */
  export type ComplianceLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ComplianceLog
     */
    select?: ComplianceLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ComplianceLog
     */
    omit?: ComplianceLogOmit<ExtArgs> | null
  }


  /**
   * Model PerformanceMetric
   */

  export type AggregatePerformanceMetric = {
    _count: PerformanceMetricCountAggregateOutputType | null
    _avg: PerformanceMetricAvgAggregateOutputType | null
    _sum: PerformanceMetricSumAggregateOutputType | null
    _min: PerformanceMetricMinAggregateOutputType | null
    _max: PerformanceMetricMaxAggregateOutputType | null
  }

  export type PerformanceMetricAvgAggregateOutputType = {
    value: number | null
    statusCode: number | null
    interval: number | null
    count: number | null
    min: number | null
    max: number | null
    avg: number | null
    p50: number | null
    p95: number | null
    p99: number | null
  }

  export type PerformanceMetricSumAggregateOutputType = {
    value: number | null
    statusCode: number | null
    interval: number | null
    count: number | null
    min: number | null
    max: number | null
    avg: number | null
    p50: number | null
    p95: number | null
    p99: number | null
  }

  export type PerformanceMetricMinAggregateOutputType = {
    id: string | null
    metricName: string | null
    metricType: string | null
    value: number | null
    unit: string | null
    service: string | null
    endpoint: string | null
    method: string | null
    statusCode: number | null
    timestamp: Date | null
    interval: number | null
    count: number | null
    min: number | null
    max: number | null
    avg: number | null
    p50: number | null
    p95: number | null
    p99: number | null
  }

  export type PerformanceMetricMaxAggregateOutputType = {
    id: string | null
    metricName: string | null
    metricType: string | null
    value: number | null
    unit: string | null
    service: string | null
    endpoint: string | null
    method: string | null
    statusCode: number | null
    timestamp: Date | null
    interval: number | null
    count: number | null
    min: number | null
    max: number | null
    avg: number | null
    p50: number | null
    p95: number | null
    p99: number | null
  }

  export type PerformanceMetricCountAggregateOutputType = {
    id: number
    metricName: number
    metricType: number
    value: number
    unit: number
    service: number
    endpoint: number
    method: number
    statusCode: number
    dimensions: number
    tags: number
    timestamp: number
    interval: number
    count: number
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
    _all: number
  }


  export type PerformanceMetricAvgAggregateInputType = {
    value?: true
    statusCode?: true
    interval?: true
    count?: true
    min?: true
    max?: true
    avg?: true
    p50?: true
    p95?: true
    p99?: true
  }

  export type PerformanceMetricSumAggregateInputType = {
    value?: true
    statusCode?: true
    interval?: true
    count?: true
    min?: true
    max?: true
    avg?: true
    p50?: true
    p95?: true
    p99?: true
  }

  export type PerformanceMetricMinAggregateInputType = {
    id?: true
    metricName?: true
    metricType?: true
    value?: true
    unit?: true
    service?: true
    endpoint?: true
    method?: true
    statusCode?: true
    timestamp?: true
    interval?: true
    count?: true
    min?: true
    max?: true
    avg?: true
    p50?: true
    p95?: true
    p99?: true
  }

  export type PerformanceMetricMaxAggregateInputType = {
    id?: true
    metricName?: true
    metricType?: true
    value?: true
    unit?: true
    service?: true
    endpoint?: true
    method?: true
    statusCode?: true
    timestamp?: true
    interval?: true
    count?: true
    min?: true
    max?: true
    avg?: true
    p50?: true
    p95?: true
    p99?: true
  }

  export type PerformanceMetricCountAggregateInputType = {
    id?: true
    metricName?: true
    metricType?: true
    value?: true
    unit?: true
    service?: true
    endpoint?: true
    method?: true
    statusCode?: true
    dimensions?: true
    tags?: true
    timestamp?: true
    interval?: true
    count?: true
    min?: true
    max?: true
    avg?: true
    p50?: true
    p95?: true
    p99?: true
    _all?: true
  }

  export type PerformanceMetricAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PerformanceMetric to aggregate.
     */
    where?: PerformanceMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceMetrics to fetch.
     */
    orderBy?: PerformanceMetricOrderByWithRelationInput | PerformanceMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PerformanceMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PerformanceMetrics
    **/
    _count?: true | PerformanceMetricCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PerformanceMetricAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PerformanceMetricSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PerformanceMetricMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PerformanceMetricMaxAggregateInputType
  }

  export type GetPerformanceMetricAggregateType<T extends PerformanceMetricAggregateArgs> = {
        [P in keyof T & keyof AggregatePerformanceMetric]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePerformanceMetric[P]>
      : GetScalarType<T[P], AggregatePerformanceMetric[P]>
  }




  export type PerformanceMetricGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PerformanceMetricWhereInput
    orderBy?: PerformanceMetricOrderByWithAggregationInput | PerformanceMetricOrderByWithAggregationInput[]
    by: PerformanceMetricScalarFieldEnum[] | PerformanceMetricScalarFieldEnum
    having?: PerformanceMetricScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PerformanceMetricCountAggregateInputType | true
    _avg?: PerformanceMetricAvgAggregateInputType
    _sum?: PerformanceMetricSumAggregateInputType
    _min?: PerformanceMetricMinAggregateInputType
    _max?: PerformanceMetricMaxAggregateInputType
  }

  export type PerformanceMetricGroupByOutputType = {
    id: string
    metricName: string
    metricType: string
    value: number
    unit: string | null
    service: string | null
    endpoint: string | null
    method: string | null
    statusCode: number | null
    dimensions: JsonValue | null
    tags: string[]
    timestamp: Date
    interval: number | null
    count: number | null
    min: number | null
    max: number | null
    avg: number | null
    p50: number | null
    p95: number | null
    p99: number | null
    _count: PerformanceMetricCountAggregateOutputType | null
    _avg: PerformanceMetricAvgAggregateOutputType | null
    _sum: PerformanceMetricSumAggregateOutputType | null
    _min: PerformanceMetricMinAggregateOutputType | null
    _max: PerformanceMetricMaxAggregateOutputType | null
  }

  type GetPerformanceMetricGroupByPayload<T extends PerformanceMetricGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PerformanceMetricGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PerformanceMetricGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PerformanceMetricGroupByOutputType[P]>
            : GetScalarType<T[P], PerformanceMetricGroupByOutputType[P]>
        }
      >
    >


  export type PerformanceMetricSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    metricName?: boolean
    metricType?: boolean
    value?: boolean
    unit?: boolean
    service?: boolean
    endpoint?: boolean
    method?: boolean
    statusCode?: boolean
    dimensions?: boolean
    tags?: boolean
    timestamp?: boolean
    interval?: boolean
    count?: boolean
    min?: boolean
    max?: boolean
    avg?: boolean
    p50?: boolean
    p95?: boolean
    p99?: boolean
  }, ExtArgs["result"]["performanceMetric"]>



  export type PerformanceMetricSelectScalar = {
    id?: boolean
    metricName?: boolean
    metricType?: boolean
    value?: boolean
    unit?: boolean
    service?: boolean
    endpoint?: boolean
    method?: boolean
    statusCode?: boolean
    dimensions?: boolean
    tags?: boolean
    timestamp?: boolean
    interval?: boolean
    count?: boolean
    min?: boolean
    max?: boolean
    avg?: boolean
    p50?: boolean
    p95?: boolean
    p99?: boolean
  }

  export type PerformanceMetricOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "metricName" | "metricType" | "value" | "unit" | "service" | "endpoint" | "method" | "statusCode" | "dimensions" | "tags" | "timestamp" | "interval" | "count" | "min" | "max" | "avg" | "p50" | "p95" | "p99", ExtArgs["result"]["performanceMetric"]>

  export type $PerformanceMetricPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PerformanceMetric"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      metricName: string
      metricType: string
      value: number
      unit: string | null
      service: string | null
      endpoint: string | null
      method: string | null
      statusCode: number | null
      dimensions: Prisma.JsonValue | null
      tags: string[]
      timestamp: Date
      interval: number | null
      count: number | null
      min: number | null
      max: number | null
      avg: number | null
      p50: number | null
      p95: number | null
      p99: number | null
    }, ExtArgs["result"]["performanceMetric"]>
    composites: {}
  }

  type PerformanceMetricGetPayload<S extends boolean | null | undefined | PerformanceMetricDefaultArgs> = $Result.GetResult<Prisma.$PerformanceMetricPayload, S>

  type PerformanceMetricCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PerformanceMetricFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PerformanceMetricCountAggregateInputType | true
    }

  export interface PerformanceMetricDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PerformanceMetric'], meta: { name: 'PerformanceMetric' } }
    /**
     * Find zero or one PerformanceMetric that matches the filter.
     * @param {PerformanceMetricFindUniqueArgs} args - Arguments to find a PerformanceMetric
     * @example
     * // Get one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PerformanceMetricFindUniqueArgs>(args: SelectSubset<T, PerformanceMetricFindUniqueArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PerformanceMetric that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PerformanceMetricFindUniqueOrThrowArgs} args - Arguments to find a PerformanceMetric
     * @example
     * // Get one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PerformanceMetricFindUniqueOrThrowArgs>(args: SelectSubset<T, PerformanceMetricFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PerformanceMetric that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricFindFirstArgs} args - Arguments to find a PerformanceMetric
     * @example
     * // Get one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PerformanceMetricFindFirstArgs>(args?: SelectSubset<T, PerformanceMetricFindFirstArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PerformanceMetric that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricFindFirstOrThrowArgs} args - Arguments to find a PerformanceMetric
     * @example
     * // Get one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PerformanceMetricFindFirstOrThrowArgs>(args?: SelectSubset<T, PerformanceMetricFindFirstOrThrowArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PerformanceMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PerformanceMetrics
     * const performanceMetrics = await prisma.performanceMetric.findMany()
     * 
     * // Get first 10 PerformanceMetrics
     * const performanceMetrics = await prisma.performanceMetric.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const performanceMetricWithIdOnly = await prisma.performanceMetric.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PerformanceMetricFindManyArgs>(args?: SelectSubset<T, PerformanceMetricFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PerformanceMetric.
     * @param {PerformanceMetricCreateArgs} args - Arguments to create a PerformanceMetric.
     * @example
     * // Create one PerformanceMetric
     * const PerformanceMetric = await prisma.performanceMetric.create({
     *   data: {
     *     // ... data to create a PerformanceMetric
     *   }
     * })
     * 
     */
    create<T extends PerformanceMetricCreateArgs>(args: SelectSubset<T, PerformanceMetricCreateArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PerformanceMetrics.
     * @param {PerformanceMetricCreateManyArgs} args - Arguments to create many PerformanceMetrics.
     * @example
     * // Create many PerformanceMetrics
     * const performanceMetric = await prisma.performanceMetric.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PerformanceMetricCreateManyArgs>(args?: SelectSubset<T, PerformanceMetricCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PerformanceMetric.
     * @param {PerformanceMetricDeleteArgs} args - Arguments to delete one PerformanceMetric.
     * @example
     * // Delete one PerformanceMetric
     * const PerformanceMetric = await prisma.performanceMetric.delete({
     *   where: {
     *     // ... filter to delete one PerformanceMetric
     *   }
     * })
     * 
     */
    delete<T extends PerformanceMetricDeleteArgs>(args: SelectSubset<T, PerformanceMetricDeleteArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PerformanceMetric.
     * @param {PerformanceMetricUpdateArgs} args - Arguments to update one PerformanceMetric.
     * @example
     * // Update one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PerformanceMetricUpdateArgs>(args: SelectSubset<T, PerformanceMetricUpdateArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PerformanceMetrics.
     * @param {PerformanceMetricDeleteManyArgs} args - Arguments to filter PerformanceMetrics to delete.
     * @example
     * // Delete a few PerformanceMetrics
     * const { count } = await prisma.performanceMetric.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PerformanceMetricDeleteManyArgs>(args?: SelectSubset<T, PerformanceMetricDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PerformanceMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PerformanceMetrics
     * const performanceMetric = await prisma.performanceMetric.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PerformanceMetricUpdateManyArgs>(args: SelectSubset<T, PerformanceMetricUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PerformanceMetric.
     * @param {PerformanceMetricUpsertArgs} args - Arguments to update or create a PerformanceMetric.
     * @example
     * // Update or create a PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.upsert({
     *   create: {
     *     // ... data to create a PerformanceMetric
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PerformanceMetric we want to update
     *   }
     * })
     */
    upsert<T extends PerformanceMetricUpsertArgs>(args: SelectSubset<T, PerformanceMetricUpsertArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PerformanceMetrics that matches the filter.
     * @param {PerformanceMetricFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const performanceMetric = await prisma.performanceMetric.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: PerformanceMetricFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a PerformanceMetric.
     * @param {PerformanceMetricAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const performanceMetric = await prisma.performanceMetric.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: PerformanceMetricAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of PerformanceMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricCountArgs} args - Arguments to filter PerformanceMetrics to count.
     * @example
     * // Count the number of PerformanceMetrics
     * const count = await prisma.performanceMetric.count({
     *   where: {
     *     // ... the filter for the PerformanceMetrics we want to count
     *   }
     * })
    **/
    count<T extends PerformanceMetricCountArgs>(
      args?: Subset<T, PerformanceMetricCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PerformanceMetricCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PerformanceMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PerformanceMetricAggregateArgs>(args: Subset<T, PerformanceMetricAggregateArgs>): Prisma.PrismaPromise<GetPerformanceMetricAggregateType<T>>

    /**
     * Group by PerformanceMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricGroupByArgs} args - Group by arguments.
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
      T extends PerformanceMetricGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PerformanceMetricGroupByArgs['orderBy'] }
        : { orderBy?: PerformanceMetricGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PerformanceMetricGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPerformanceMetricGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PerformanceMetric model
   */
  readonly fields: PerformanceMetricFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PerformanceMetric.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PerformanceMetricClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the PerformanceMetric model
   */
  interface PerformanceMetricFieldRefs {
    readonly id: FieldRef<"PerformanceMetric", 'String'>
    readonly metricName: FieldRef<"PerformanceMetric", 'String'>
    readonly metricType: FieldRef<"PerformanceMetric", 'String'>
    readonly value: FieldRef<"PerformanceMetric", 'Float'>
    readonly unit: FieldRef<"PerformanceMetric", 'String'>
    readonly service: FieldRef<"PerformanceMetric", 'String'>
    readonly endpoint: FieldRef<"PerformanceMetric", 'String'>
    readonly method: FieldRef<"PerformanceMetric", 'String'>
    readonly statusCode: FieldRef<"PerformanceMetric", 'Int'>
    readonly dimensions: FieldRef<"PerformanceMetric", 'Json'>
    readonly tags: FieldRef<"PerformanceMetric", 'String[]'>
    readonly timestamp: FieldRef<"PerformanceMetric", 'DateTime'>
    readonly interval: FieldRef<"PerformanceMetric", 'Int'>
    readonly count: FieldRef<"PerformanceMetric", 'Int'>
    readonly min: FieldRef<"PerformanceMetric", 'Float'>
    readonly max: FieldRef<"PerformanceMetric", 'Float'>
    readonly avg: FieldRef<"PerformanceMetric", 'Float'>
    readonly p50: FieldRef<"PerformanceMetric", 'Float'>
    readonly p95: FieldRef<"PerformanceMetric", 'Float'>
    readonly p99: FieldRef<"PerformanceMetric", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * PerformanceMetric findUnique
   */
  export type PerformanceMetricFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetric to fetch.
     */
    where: PerformanceMetricWhereUniqueInput
  }

  /**
   * PerformanceMetric findUniqueOrThrow
   */
  export type PerformanceMetricFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetric to fetch.
     */
    where: PerformanceMetricWhereUniqueInput
  }

  /**
   * PerformanceMetric findFirst
   */
  export type PerformanceMetricFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetric to fetch.
     */
    where?: PerformanceMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceMetrics to fetch.
     */
    orderBy?: PerformanceMetricOrderByWithRelationInput | PerformanceMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PerformanceMetrics.
     */
    cursor?: PerformanceMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PerformanceMetrics.
     */
    distinct?: PerformanceMetricScalarFieldEnum | PerformanceMetricScalarFieldEnum[]
  }

  /**
   * PerformanceMetric findFirstOrThrow
   */
  export type PerformanceMetricFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetric to fetch.
     */
    where?: PerformanceMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceMetrics to fetch.
     */
    orderBy?: PerformanceMetricOrderByWithRelationInput | PerformanceMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PerformanceMetrics.
     */
    cursor?: PerformanceMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PerformanceMetrics.
     */
    distinct?: PerformanceMetricScalarFieldEnum | PerformanceMetricScalarFieldEnum[]
  }

  /**
   * PerformanceMetric findMany
   */
  export type PerformanceMetricFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetrics to fetch.
     */
    where?: PerformanceMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceMetrics to fetch.
     */
    orderBy?: PerformanceMetricOrderByWithRelationInput | PerformanceMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PerformanceMetrics.
     */
    cursor?: PerformanceMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceMetrics.
     */
    skip?: number
    distinct?: PerformanceMetricScalarFieldEnum | PerformanceMetricScalarFieldEnum[]
  }

  /**
   * PerformanceMetric create
   */
  export type PerformanceMetricCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * The data needed to create a PerformanceMetric.
     */
    data: XOR<PerformanceMetricCreateInput, PerformanceMetricUncheckedCreateInput>
  }

  /**
   * PerformanceMetric createMany
   */
  export type PerformanceMetricCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PerformanceMetrics.
     */
    data: PerformanceMetricCreateManyInput | PerformanceMetricCreateManyInput[]
  }

  /**
   * PerformanceMetric update
   */
  export type PerformanceMetricUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * The data needed to update a PerformanceMetric.
     */
    data: XOR<PerformanceMetricUpdateInput, PerformanceMetricUncheckedUpdateInput>
    /**
     * Choose, which PerformanceMetric to update.
     */
    where: PerformanceMetricWhereUniqueInput
  }

  /**
   * PerformanceMetric updateMany
   */
  export type PerformanceMetricUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PerformanceMetrics.
     */
    data: XOR<PerformanceMetricUpdateManyMutationInput, PerformanceMetricUncheckedUpdateManyInput>
    /**
     * Filter which PerformanceMetrics to update
     */
    where?: PerformanceMetricWhereInput
    /**
     * Limit how many PerformanceMetrics to update.
     */
    limit?: number
  }

  /**
   * PerformanceMetric upsert
   */
  export type PerformanceMetricUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * The filter to search for the PerformanceMetric to update in case it exists.
     */
    where: PerformanceMetricWhereUniqueInput
    /**
     * In case the PerformanceMetric found by the `where` argument doesn't exist, create a new PerformanceMetric with this data.
     */
    create: XOR<PerformanceMetricCreateInput, PerformanceMetricUncheckedCreateInput>
    /**
     * In case the PerformanceMetric was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PerformanceMetricUpdateInput, PerformanceMetricUncheckedUpdateInput>
  }

  /**
   * PerformanceMetric delete
   */
  export type PerformanceMetricDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter which PerformanceMetric to delete.
     */
    where: PerformanceMetricWhereUniqueInput
  }

  /**
   * PerformanceMetric deleteMany
   */
  export type PerformanceMetricDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PerformanceMetrics to delete
     */
    where?: PerformanceMetricWhereInput
    /**
     * Limit how many PerformanceMetrics to delete.
     */
    limit?: number
  }

  /**
   * PerformanceMetric findRaw
   */
  export type PerformanceMetricFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PerformanceMetric aggregateRaw
   */
  export type PerformanceMetricAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PerformanceMetric without action
   */
  export type PerformanceMetricDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const AuditLogScalarFieldEnum: {
    id: 'id',
    eventType: 'eventType',
    action: 'action',
    resource: 'resource',
    resourceId: 'resourceId',
    userId: 'userId',
    sessionId: 'sessionId',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    method: 'method',
    path: 'path',
    oldValues: 'oldValues',
    newValues: 'newValues',
    changes: 'changes',
    severity: 'severity',
    category: 'category',
    source: 'source',
    correlation: 'correlation',
    metadata: 'metadata',
    tags: 'tags',
    timestamp: 'timestamp',
    duration: 'duration',
    retentionDate: 'retentionDate',
    complianceFlags: 'complianceFlags'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const SecurityEventScalarFieldEnum: {
    id: 'id',
    eventType: 'eventType',
    severity: 'severity',
    userId: 'userId',
    description: 'description',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    location: 'location',
    threatLevel: 'threatLevel',
    confidence: 'confidence',
    indicators: 'indicators',
    status: 'status',
    assignedTo: 'assignedTo',
    response: 'response',
    timestamp: 'timestamp',
    firstSeen: 'firstSeen',
    lastSeen: 'lastSeen',
    resolvedAt: 'resolvedAt',
    metadata: 'metadata',
    tags: 'tags'
  };

  export type SecurityEventScalarFieldEnum = (typeof SecurityEventScalarFieldEnum)[keyof typeof SecurityEventScalarFieldEnum]


  export const SystemLogScalarFieldEnum: {
    id: 'id',
    level: 'level',
    message: 'message',
    source: 'source',
    component: 'component',
    error: 'error',
    stackTrace: 'stackTrace',
    requestId: 'requestId',
    sessionId: 'sessionId',
    userId: 'userId',
    duration: 'duration',
    memory: 'memory',
    metadata: 'metadata',
    tags: 'tags',
    timestamp: 'timestamp',
    indexed: 'indexed',
    archived: 'archived'
  };

  export type SystemLogScalarFieldEnum = (typeof SystemLogScalarFieldEnum)[keyof typeof SystemLogScalarFieldEnum]


  export const ActivityTraceScalarFieldEnum: {
    id: 'id',
    traceId: 'traceId',
    spanId: 'spanId',
    parentSpanId: 'parentSpanId',
    operation: 'operation',
    service: 'service',
    method: 'method',
    path: 'path',
    startTime: 'startTime',
    endTime: 'endTime',
    duration: 'duration',
    status: 'status',
    statusCode: 'statusCode',
    userId: 'userId',
    sessionId: 'sessionId',
    cpu: 'cpu',
    memory: 'memory',
    ioOperations: 'ioOperations',
    tags: 'tags',
    metadata: 'metadata'
  };

  export type ActivityTraceScalarFieldEnum = (typeof ActivityTraceScalarFieldEnum)[keyof typeof ActivityTraceScalarFieldEnum]


  export const ComplianceLogScalarFieldEnum: {
    id: 'id',
    regulation: 'regulation',
    eventType: 'eventType',
    dataCategory: 'dataCategory',
    dataSubjectId: 'dataSubjectId',
    dataSubjectType: 'dataSubjectType',
    action: 'action',
    purpose: 'purpose',
    legalBasis: 'legalBasis',
    dataFields: 'dataFields',
    processor: 'processor',
    controller: 'controller',
    consentId: 'consentId',
    consentStatus: 'consentStatus',
    retentionPeriod: 'retentionPeriod',
    disposalDate: 'disposalDate',
    userId: 'userId',
    ipAddress: 'ipAddress',
    timestamp: 'timestamp',
    metadata: 'metadata'
  };

  export type ComplianceLogScalarFieldEnum = (typeof ComplianceLogScalarFieldEnum)[keyof typeof ComplianceLogScalarFieldEnum]


  export const PerformanceMetricScalarFieldEnum: {
    id: 'id',
    metricName: 'metricName',
    metricType: 'metricType',
    value: 'value',
    unit: 'unit',
    service: 'service',
    endpoint: 'endpoint',
    method: 'method',
    statusCode: 'statusCode',
    dimensions: 'dimensions',
    tags: 'tags',
    timestamp: 'timestamp',
    interval: 'interval',
    count: 'count',
    min: 'min',
    max: 'max',
    avg: 'avg',
    p50: 'p50',
    p95: 'p95',
    p99: 'p99'
  };

  export type PerformanceMetricScalarFieldEnum = (typeof PerformanceMetricScalarFieldEnum)[keyof typeof PerformanceMetricScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


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
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    eventType?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    resource?: StringNullableFilter<"AuditLog"> | string | null
    resourceId?: StringNullableFilter<"AuditLog"> | string | null
    userId?: StringNullableFilter<"AuditLog"> | string | null
    sessionId?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    method?: StringNullableFilter<"AuditLog"> | string | null
    path?: StringNullableFilter<"AuditLog"> | string | null
    oldValues?: JsonNullableFilter<"AuditLog">
    newValues?: JsonNullableFilter<"AuditLog">
    changes?: JsonNullableFilter<"AuditLog">
    severity?: StringFilter<"AuditLog"> | string
    category?: StringNullableFilter<"AuditLog"> | string | null
    source?: StringNullableFilter<"AuditLog"> | string | null
    correlation?: StringNullableFilter<"AuditLog"> | string | null
    metadata?: JsonNullableFilter<"AuditLog">
    tags?: StringNullableListFilter<"AuditLog">
    timestamp?: DateTimeFilter<"AuditLog"> | Date | string
    duration?: IntNullableFilter<"AuditLog"> | number | null
    retentionDate?: DateTimeNullableFilter<"AuditLog"> | Date | string | null
    complianceFlags?: StringNullableListFilter<"AuditLog">
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    eventType?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    resourceId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    method?: SortOrder
    path?: SortOrder
    oldValues?: SortOrder
    newValues?: SortOrder
    changes?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    source?: SortOrder
    correlation?: SortOrder
    metadata?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    duration?: SortOrder
    retentionDate?: SortOrder
    complianceFlags?: SortOrder
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    eventType?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    resource?: StringNullableFilter<"AuditLog"> | string | null
    resourceId?: StringNullableFilter<"AuditLog"> | string | null
    userId?: StringNullableFilter<"AuditLog"> | string | null
    sessionId?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    method?: StringNullableFilter<"AuditLog"> | string | null
    path?: StringNullableFilter<"AuditLog"> | string | null
    oldValues?: JsonNullableFilter<"AuditLog">
    newValues?: JsonNullableFilter<"AuditLog">
    changes?: JsonNullableFilter<"AuditLog">
    severity?: StringFilter<"AuditLog"> | string
    category?: StringNullableFilter<"AuditLog"> | string | null
    source?: StringNullableFilter<"AuditLog"> | string | null
    correlation?: StringNullableFilter<"AuditLog"> | string | null
    metadata?: JsonNullableFilter<"AuditLog">
    tags?: StringNullableListFilter<"AuditLog">
    timestamp?: DateTimeFilter<"AuditLog"> | Date | string
    duration?: IntNullableFilter<"AuditLog"> | number | null
    retentionDate?: DateTimeNullableFilter<"AuditLog"> | Date | string | null
    complianceFlags?: StringNullableListFilter<"AuditLog">
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    eventType?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    resourceId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    method?: SortOrder
    path?: SortOrder
    oldValues?: SortOrder
    newValues?: SortOrder
    changes?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    source?: SortOrder
    correlation?: SortOrder
    metadata?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    duration?: SortOrder
    retentionDate?: SortOrder
    complianceFlags?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _avg?: AuditLogAvgOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
    _sum?: AuditLogSumOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    eventType?: StringWithAggregatesFilter<"AuditLog"> | string
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    resource?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    resourceId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    userId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    sessionId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    method?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    path?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    oldValues?: JsonNullableWithAggregatesFilter<"AuditLog">
    newValues?: JsonNullableWithAggregatesFilter<"AuditLog">
    changes?: JsonNullableWithAggregatesFilter<"AuditLog">
    severity?: StringWithAggregatesFilter<"AuditLog"> | string
    category?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    source?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    correlation?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"AuditLog">
    tags?: StringNullableListFilter<"AuditLog">
    timestamp?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
    duration?: IntNullableWithAggregatesFilter<"AuditLog"> | number | null
    retentionDate?: DateTimeNullableWithAggregatesFilter<"AuditLog"> | Date | string | null
    complianceFlags?: StringNullableListFilter<"AuditLog">
  }

  export type SecurityEventWhereInput = {
    AND?: SecurityEventWhereInput | SecurityEventWhereInput[]
    OR?: SecurityEventWhereInput[]
    NOT?: SecurityEventWhereInput | SecurityEventWhereInput[]
    id?: StringFilter<"SecurityEvent"> | string
    eventType?: StringFilter<"SecurityEvent"> | string
    severity?: StringFilter<"SecurityEvent"> | string
    userId?: StringNullableFilter<"SecurityEvent"> | string | null
    description?: StringFilter<"SecurityEvent"> | string
    ipAddress?: StringNullableFilter<"SecurityEvent"> | string | null
    userAgent?: StringNullableFilter<"SecurityEvent"> | string | null
    location?: JsonNullableFilter<"SecurityEvent">
    threatLevel?: StringNullableFilter<"SecurityEvent"> | string | null
    confidence?: FloatNullableFilter<"SecurityEvent"> | number | null
    indicators?: JsonNullableFilter<"SecurityEvent">
    status?: StringFilter<"SecurityEvent"> | string
    assignedTo?: StringNullableFilter<"SecurityEvent"> | string | null
    response?: JsonNullableFilter<"SecurityEvent">
    timestamp?: DateTimeFilter<"SecurityEvent"> | Date | string
    firstSeen?: DateTimeNullableFilter<"SecurityEvent"> | Date | string | null
    lastSeen?: DateTimeNullableFilter<"SecurityEvent"> | Date | string | null
    resolvedAt?: DateTimeNullableFilter<"SecurityEvent"> | Date | string | null
    metadata?: JsonNullableFilter<"SecurityEvent">
    tags?: StringNullableListFilter<"SecurityEvent">
  }

  export type SecurityEventOrderByWithRelationInput = {
    id?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    userId?: SortOrder
    description?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    location?: SortOrder
    threatLevel?: SortOrder
    confidence?: SortOrder
    indicators?: SortOrder
    status?: SortOrder
    assignedTo?: SortOrder
    response?: SortOrder
    timestamp?: SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    resolvedAt?: SortOrder
    metadata?: SortOrder
    tags?: SortOrder
  }

  export type SecurityEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SecurityEventWhereInput | SecurityEventWhereInput[]
    OR?: SecurityEventWhereInput[]
    NOT?: SecurityEventWhereInput | SecurityEventWhereInput[]
    eventType?: StringFilter<"SecurityEvent"> | string
    severity?: StringFilter<"SecurityEvent"> | string
    userId?: StringNullableFilter<"SecurityEvent"> | string | null
    description?: StringFilter<"SecurityEvent"> | string
    ipAddress?: StringNullableFilter<"SecurityEvent"> | string | null
    userAgent?: StringNullableFilter<"SecurityEvent"> | string | null
    location?: JsonNullableFilter<"SecurityEvent">
    threatLevel?: StringNullableFilter<"SecurityEvent"> | string | null
    confidence?: FloatNullableFilter<"SecurityEvent"> | number | null
    indicators?: JsonNullableFilter<"SecurityEvent">
    status?: StringFilter<"SecurityEvent"> | string
    assignedTo?: StringNullableFilter<"SecurityEvent"> | string | null
    response?: JsonNullableFilter<"SecurityEvent">
    timestamp?: DateTimeFilter<"SecurityEvent"> | Date | string
    firstSeen?: DateTimeNullableFilter<"SecurityEvent"> | Date | string | null
    lastSeen?: DateTimeNullableFilter<"SecurityEvent"> | Date | string | null
    resolvedAt?: DateTimeNullableFilter<"SecurityEvent"> | Date | string | null
    metadata?: JsonNullableFilter<"SecurityEvent">
    tags?: StringNullableListFilter<"SecurityEvent">
  }, "id">

  export type SecurityEventOrderByWithAggregationInput = {
    id?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    userId?: SortOrder
    description?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    location?: SortOrder
    threatLevel?: SortOrder
    confidence?: SortOrder
    indicators?: SortOrder
    status?: SortOrder
    assignedTo?: SortOrder
    response?: SortOrder
    timestamp?: SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    resolvedAt?: SortOrder
    metadata?: SortOrder
    tags?: SortOrder
    _count?: SecurityEventCountOrderByAggregateInput
    _avg?: SecurityEventAvgOrderByAggregateInput
    _max?: SecurityEventMaxOrderByAggregateInput
    _min?: SecurityEventMinOrderByAggregateInput
    _sum?: SecurityEventSumOrderByAggregateInput
  }

  export type SecurityEventScalarWhereWithAggregatesInput = {
    AND?: SecurityEventScalarWhereWithAggregatesInput | SecurityEventScalarWhereWithAggregatesInput[]
    OR?: SecurityEventScalarWhereWithAggregatesInput[]
    NOT?: SecurityEventScalarWhereWithAggregatesInput | SecurityEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SecurityEvent"> | string
    eventType?: StringWithAggregatesFilter<"SecurityEvent"> | string
    severity?: StringWithAggregatesFilter<"SecurityEvent"> | string
    userId?: StringNullableWithAggregatesFilter<"SecurityEvent"> | string | null
    description?: StringWithAggregatesFilter<"SecurityEvent"> | string
    ipAddress?: StringNullableWithAggregatesFilter<"SecurityEvent"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"SecurityEvent"> | string | null
    location?: JsonNullableWithAggregatesFilter<"SecurityEvent">
    threatLevel?: StringNullableWithAggregatesFilter<"SecurityEvent"> | string | null
    confidence?: FloatNullableWithAggregatesFilter<"SecurityEvent"> | number | null
    indicators?: JsonNullableWithAggregatesFilter<"SecurityEvent">
    status?: StringWithAggregatesFilter<"SecurityEvent"> | string
    assignedTo?: StringNullableWithAggregatesFilter<"SecurityEvent"> | string | null
    response?: JsonNullableWithAggregatesFilter<"SecurityEvent">
    timestamp?: DateTimeWithAggregatesFilter<"SecurityEvent"> | Date | string
    firstSeen?: DateTimeNullableWithAggregatesFilter<"SecurityEvent"> | Date | string | null
    lastSeen?: DateTimeNullableWithAggregatesFilter<"SecurityEvent"> | Date | string | null
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"SecurityEvent"> | Date | string | null
    metadata?: JsonNullableWithAggregatesFilter<"SecurityEvent">
    tags?: StringNullableListFilter<"SecurityEvent">
  }

  export type SystemLogWhereInput = {
    AND?: SystemLogWhereInput | SystemLogWhereInput[]
    OR?: SystemLogWhereInput[]
    NOT?: SystemLogWhereInput | SystemLogWhereInput[]
    id?: StringFilter<"SystemLog"> | string
    level?: StringFilter<"SystemLog"> | string
    message?: StringFilter<"SystemLog"> | string
    source?: StringFilter<"SystemLog"> | string
    component?: StringNullableFilter<"SystemLog"> | string | null
    error?: JsonNullableFilter<"SystemLog">
    stackTrace?: StringNullableFilter<"SystemLog"> | string | null
    requestId?: StringNullableFilter<"SystemLog"> | string | null
    sessionId?: StringNullableFilter<"SystemLog"> | string | null
    userId?: StringNullableFilter<"SystemLog"> | string | null
    duration?: IntNullableFilter<"SystemLog"> | number | null
    memory?: JsonNullableFilter<"SystemLog">
    metadata?: JsonNullableFilter<"SystemLog">
    tags?: StringNullableListFilter<"SystemLog">
    timestamp?: DateTimeFilter<"SystemLog"> | Date | string
    indexed?: BoolFilter<"SystemLog"> | boolean
    archived?: BoolFilter<"SystemLog"> | boolean
  }

  export type SystemLogOrderByWithRelationInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    source?: SortOrder
    component?: SortOrder
    error?: SortOrder
    stackTrace?: SortOrder
    requestId?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    duration?: SortOrder
    memory?: SortOrder
    metadata?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    indexed?: SortOrder
    archived?: SortOrder
  }

  export type SystemLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SystemLogWhereInput | SystemLogWhereInput[]
    OR?: SystemLogWhereInput[]
    NOT?: SystemLogWhereInput | SystemLogWhereInput[]
    level?: StringFilter<"SystemLog"> | string
    message?: StringFilter<"SystemLog"> | string
    source?: StringFilter<"SystemLog"> | string
    component?: StringNullableFilter<"SystemLog"> | string | null
    error?: JsonNullableFilter<"SystemLog">
    stackTrace?: StringNullableFilter<"SystemLog"> | string | null
    requestId?: StringNullableFilter<"SystemLog"> | string | null
    sessionId?: StringNullableFilter<"SystemLog"> | string | null
    userId?: StringNullableFilter<"SystemLog"> | string | null
    duration?: IntNullableFilter<"SystemLog"> | number | null
    memory?: JsonNullableFilter<"SystemLog">
    metadata?: JsonNullableFilter<"SystemLog">
    tags?: StringNullableListFilter<"SystemLog">
    timestamp?: DateTimeFilter<"SystemLog"> | Date | string
    indexed?: BoolFilter<"SystemLog"> | boolean
    archived?: BoolFilter<"SystemLog"> | boolean
  }, "id">

  export type SystemLogOrderByWithAggregationInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    source?: SortOrder
    component?: SortOrder
    error?: SortOrder
    stackTrace?: SortOrder
    requestId?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    duration?: SortOrder
    memory?: SortOrder
    metadata?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    indexed?: SortOrder
    archived?: SortOrder
    _count?: SystemLogCountOrderByAggregateInput
    _avg?: SystemLogAvgOrderByAggregateInput
    _max?: SystemLogMaxOrderByAggregateInput
    _min?: SystemLogMinOrderByAggregateInput
    _sum?: SystemLogSumOrderByAggregateInput
  }

  export type SystemLogScalarWhereWithAggregatesInput = {
    AND?: SystemLogScalarWhereWithAggregatesInput | SystemLogScalarWhereWithAggregatesInput[]
    OR?: SystemLogScalarWhereWithAggregatesInput[]
    NOT?: SystemLogScalarWhereWithAggregatesInput | SystemLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SystemLog"> | string
    level?: StringWithAggregatesFilter<"SystemLog"> | string
    message?: StringWithAggregatesFilter<"SystemLog"> | string
    source?: StringWithAggregatesFilter<"SystemLog"> | string
    component?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    error?: JsonNullableWithAggregatesFilter<"SystemLog">
    stackTrace?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    requestId?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    sessionId?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    userId?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    duration?: IntNullableWithAggregatesFilter<"SystemLog"> | number | null
    memory?: JsonNullableWithAggregatesFilter<"SystemLog">
    metadata?: JsonNullableWithAggregatesFilter<"SystemLog">
    tags?: StringNullableListFilter<"SystemLog">
    timestamp?: DateTimeWithAggregatesFilter<"SystemLog"> | Date | string
    indexed?: BoolWithAggregatesFilter<"SystemLog"> | boolean
    archived?: BoolWithAggregatesFilter<"SystemLog"> | boolean
  }

  export type ActivityTraceWhereInput = {
    AND?: ActivityTraceWhereInput | ActivityTraceWhereInput[]
    OR?: ActivityTraceWhereInput[]
    NOT?: ActivityTraceWhereInput | ActivityTraceWhereInput[]
    id?: StringFilter<"ActivityTrace"> | string
    traceId?: StringFilter<"ActivityTrace"> | string
    spanId?: StringFilter<"ActivityTrace"> | string
    parentSpanId?: StringNullableFilter<"ActivityTrace"> | string | null
    operation?: StringFilter<"ActivityTrace"> | string
    service?: StringFilter<"ActivityTrace"> | string
    method?: StringNullableFilter<"ActivityTrace"> | string | null
    path?: StringNullableFilter<"ActivityTrace"> | string | null
    startTime?: DateTimeFilter<"ActivityTrace"> | Date | string
    endTime?: DateTimeNullableFilter<"ActivityTrace"> | Date | string | null
    duration?: IntNullableFilter<"ActivityTrace"> | number | null
    status?: StringFilter<"ActivityTrace"> | string
    statusCode?: IntNullableFilter<"ActivityTrace"> | number | null
    userId?: StringNullableFilter<"ActivityTrace"> | string | null
    sessionId?: StringNullableFilter<"ActivityTrace"> | string | null
    cpu?: FloatNullableFilter<"ActivityTrace"> | number | null
    memory?: IntNullableFilter<"ActivityTrace"> | number | null
    ioOperations?: IntNullableFilter<"ActivityTrace"> | number | null
    tags?: JsonNullableFilter<"ActivityTrace">
    metadata?: JsonNullableFilter<"ActivityTrace">
  }

  export type ActivityTraceOrderByWithRelationInput = {
    id?: SortOrder
    traceId?: SortOrder
    spanId?: SortOrder
    parentSpanId?: SortOrder
    operation?: SortOrder
    service?: SortOrder
    method?: SortOrder
    path?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    duration?: SortOrder
    status?: SortOrder
    statusCode?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    cpu?: SortOrder
    memory?: SortOrder
    ioOperations?: SortOrder
    tags?: SortOrder
    metadata?: SortOrder
  }

  export type ActivityTraceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ActivityTraceWhereInput | ActivityTraceWhereInput[]
    OR?: ActivityTraceWhereInput[]
    NOT?: ActivityTraceWhereInput | ActivityTraceWhereInput[]
    traceId?: StringFilter<"ActivityTrace"> | string
    spanId?: StringFilter<"ActivityTrace"> | string
    parentSpanId?: StringNullableFilter<"ActivityTrace"> | string | null
    operation?: StringFilter<"ActivityTrace"> | string
    service?: StringFilter<"ActivityTrace"> | string
    method?: StringNullableFilter<"ActivityTrace"> | string | null
    path?: StringNullableFilter<"ActivityTrace"> | string | null
    startTime?: DateTimeFilter<"ActivityTrace"> | Date | string
    endTime?: DateTimeNullableFilter<"ActivityTrace"> | Date | string | null
    duration?: IntNullableFilter<"ActivityTrace"> | number | null
    status?: StringFilter<"ActivityTrace"> | string
    statusCode?: IntNullableFilter<"ActivityTrace"> | number | null
    userId?: StringNullableFilter<"ActivityTrace"> | string | null
    sessionId?: StringNullableFilter<"ActivityTrace"> | string | null
    cpu?: FloatNullableFilter<"ActivityTrace"> | number | null
    memory?: IntNullableFilter<"ActivityTrace"> | number | null
    ioOperations?: IntNullableFilter<"ActivityTrace"> | number | null
    tags?: JsonNullableFilter<"ActivityTrace">
    metadata?: JsonNullableFilter<"ActivityTrace">
  }, "id">

  export type ActivityTraceOrderByWithAggregationInput = {
    id?: SortOrder
    traceId?: SortOrder
    spanId?: SortOrder
    parentSpanId?: SortOrder
    operation?: SortOrder
    service?: SortOrder
    method?: SortOrder
    path?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    duration?: SortOrder
    status?: SortOrder
    statusCode?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    cpu?: SortOrder
    memory?: SortOrder
    ioOperations?: SortOrder
    tags?: SortOrder
    metadata?: SortOrder
    _count?: ActivityTraceCountOrderByAggregateInput
    _avg?: ActivityTraceAvgOrderByAggregateInput
    _max?: ActivityTraceMaxOrderByAggregateInput
    _min?: ActivityTraceMinOrderByAggregateInput
    _sum?: ActivityTraceSumOrderByAggregateInput
  }

  export type ActivityTraceScalarWhereWithAggregatesInput = {
    AND?: ActivityTraceScalarWhereWithAggregatesInput | ActivityTraceScalarWhereWithAggregatesInput[]
    OR?: ActivityTraceScalarWhereWithAggregatesInput[]
    NOT?: ActivityTraceScalarWhereWithAggregatesInput | ActivityTraceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ActivityTrace"> | string
    traceId?: StringWithAggregatesFilter<"ActivityTrace"> | string
    spanId?: StringWithAggregatesFilter<"ActivityTrace"> | string
    parentSpanId?: StringNullableWithAggregatesFilter<"ActivityTrace"> | string | null
    operation?: StringWithAggregatesFilter<"ActivityTrace"> | string
    service?: StringWithAggregatesFilter<"ActivityTrace"> | string
    method?: StringNullableWithAggregatesFilter<"ActivityTrace"> | string | null
    path?: StringNullableWithAggregatesFilter<"ActivityTrace"> | string | null
    startTime?: DateTimeWithAggregatesFilter<"ActivityTrace"> | Date | string
    endTime?: DateTimeNullableWithAggregatesFilter<"ActivityTrace"> | Date | string | null
    duration?: IntNullableWithAggregatesFilter<"ActivityTrace"> | number | null
    status?: StringWithAggregatesFilter<"ActivityTrace"> | string
    statusCode?: IntNullableWithAggregatesFilter<"ActivityTrace"> | number | null
    userId?: StringNullableWithAggregatesFilter<"ActivityTrace"> | string | null
    sessionId?: StringNullableWithAggregatesFilter<"ActivityTrace"> | string | null
    cpu?: FloatNullableWithAggregatesFilter<"ActivityTrace"> | number | null
    memory?: IntNullableWithAggregatesFilter<"ActivityTrace"> | number | null
    ioOperations?: IntNullableWithAggregatesFilter<"ActivityTrace"> | number | null
    tags?: JsonNullableWithAggregatesFilter<"ActivityTrace">
    metadata?: JsonNullableWithAggregatesFilter<"ActivityTrace">
  }

  export type ComplianceLogWhereInput = {
    AND?: ComplianceLogWhereInput | ComplianceLogWhereInput[]
    OR?: ComplianceLogWhereInput[]
    NOT?: ComplianceLogWhereInput | ComplianceLogWhereInput[]
    id?: StringFilter<"ComplianceLog"> | string
    regulation?: StringFilter<"ComplianceLog"> | string
    eventType?: StringFilter<"ComplianceLog"> | string
    dataCategory?: StringFilter<"ComplianceLog"> | string
    dataSubjectId?: StringNullableFilter<"ComplianceLog"> | string | null
    dataSubjectType?: StringNullableFilter<"ComplianceLog"> | string | null
    action?: StringFilter<"ComplianceLog"> | string
    purpose?: StringNullableFilter<"ComplianceLog"> | string | null
    legalBasis?: StringNullableFilter<"ComplianceLog"> | string | null
    dataFields?: StringNullableListFilter<"ComplianceLog">
    processor?: StringNullableFilter<"ComplianceLog"> | string | null
    controller?: StringNullableFilter<"ComplianceLog"> | string | null
    consentId?: StringNullableFilter<"ComplianceLog"> | string | null
    consentStatus?: StringNullableFilter<"ComplianceLog"> | string | null
    retentionPeriod?: IntNullableFilter<"ComplianceLog"> | number | null
    disposalDate?: DateTimeNullableFilter<"ComplianceLog"> | Date | string | null
    userId?: StringNullableFilter<"ComplianceLog"> | string | null
    ipAddress?: StringNullableFilter<"ComplianceLog"> | string | null
    timestamp?: DateTimeFilter<"ComplianceLog"> | Date | string
    metadata?: JsonNullableFilter<"ComplianceLog">
  }

  export type ComplianceLogOrderByWithRelationInput = {
    id?: SortOrder
    regulation?: SortOrder
    eventType?: SortOrder
    dataCategory?: SortOrder
    dataSubjectId?: SortOrder
    dataSubjectType?: SortOrder
    action?: SortOrder
    purpose?: SortOrder
    legalBasis?: SortOrder
    dataFields?: SortOrder
    processor?: SortOrder
    controller?: SortOrder
    consentId?: SortOrder
    consentStatus?: SortOrder
    retentionPeriod?: SortOrder
    disposalDate?: SortOrder
    userId?: SortOrder
    ipAddress?: SortOrder
    timestamp?: SortOrder
    metadata?: SortOrder
  }

  export type ComplianceLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ComplianceLogWhereInput | ComplianceLogWhereInput[]
    OR?: ComplianceLogWhereInput[]
    NOT?: ComplianceLogWhereInput | ComplianceLogWhereInput[]
    regulation?: StringFilter<"ComplianceLog"> | string
    eventType?: StringFilter<"ComplianceLog"> | string
    dataCategory?: StringFilter<"ComplianceLog"> | string
    dataSubjectId?: StringNullableFilter<"ComplianceLog"> | string | null
    dataSubjectType?: StringNullableFilter<"ComplianceLog"> | string | null
    action?: StringFilter<"ComplianceLog"> | string
    purpose?: StringNullableFilter<"ComplianceLog"> | string | null
    legalBasis?: StringNullableFilter<"ComplianceLog"> | string | null
    dataFields?: StringNullableListFilter<"ComplianceLog">
    processor?: StringNullableFilter<"ComplianceLog"> | string | null
    controller?: StringNullableFilter<"ComplianceLog"> | string | null
    consentId?: StringNullableFilter<"ComplianceLog"> | string | null
    consentStatus?: StringNullableFilter<"ComplianceLog"> | string | null
    retentionPeriod?: IntNullableFilter<"ComplianceLog"> | number | null
    disposalDate?: DateTimeNullableFilter<"ComplianceLog"> | Date | string | null
    userId?: StringNullableFilter<"ComplianceLog"> | string | null
    ipAddress?: StringNullableFilter<"ComplianceLog"> | string | null
    timestamp?: DateTimeFilter<"ComplianceLog"> | Date | string
    metadata?: JsonNullableFilter<"ComplianceLog">
  }, "id">

  export type ComplianceLogOrderByWithAggregationInput = {
    id?: SortOrder
    regulation?: SortOrder
    eventType?: SortOrder
    dataCategory?: SortOrder
    dataSubjectId?: SortOrder
    dataSubjectType?: SortOrder
    action?: SortOrder
    purpose?: SortOrder
    legalBasis?: SortOrder
    dataFields?: SortOrder
    processor?: SortOrder
    controller?: SortOrder
    consentId?: SortOrder
    consentStatus?: SortOrder
    retentionPeriod?: SortOrder
    disposalDate?: SortOrder
    userId?: SortOrder
    ipAddress?: SortOrder
    timestamp?: SortOrder
    metadata?: SortOrder
    _count?: ComplianceLogCountOrderByAggregateInput
    _avg?: ComplianceLogAvgOrderByAggregateInput
    _max?: ComplianceLogMaxOrderByAggregateInput
    _min?: ComplianceLogMinOrderByAggregateInput
    _sum?: ComplianceLogSumOrderByAggregateInput
  }

  export type ComplianceLogScalarWhereWithAggregatesInput = {
    AND?: ComplianceLogScalarWhereWithAggregatesInput | ComplianceLogScalarWhereWithAggregatesInput[]
    OR?: ComplianceLogScalarWhereWithAggregatesInput[]
    NOT?: ComplianceLogScalarWhereWithAggregatesInput | ComplianceLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ComplianceLog"> | string
    regulation?: StringWithAggregatesFilter<"ComplianceLog"> | string
    eventType?: StringWithAggregatesFilter<"ComplianceLog"> | string
    dataCategory?: StringWithAggregatesFilter<"ComplianceLog"> | string
    dataSubjectId?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    dataSubjectType?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    action?: StringWithAggregatesFilter<"ComplianceLog"> | string
    purpose?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    legalBasis?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    dataFields?: StringNullableListFilter<"ComplianceLog">
    processor?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    controller?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    consentId?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    consentStatus?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    retentionPeriod?: IntNullableWithAggregatesFilter<"ComplianceLog"> | number | null
    disposalDate?: DateTimeNullableWithAggregatesFilter<"ComplianceLog"> | Date | string | null
    userId?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"ComplianceLog"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"ComplianceLog"> | Date | string
    metadata?: JsonNullableWithAggregatesFilter<"ComplianceLog">
  }

  export type PerformanceMetricWhereInput = {
    AND?: PerformanceMetricWhereInput | PerformanceMetricWhereInput[]
    OR?: PerformanceMetricWhereInput[]
    NOT?: PerformanceMetricWhereInput | PerformanceMetricWhereInput[]
    id?: StringFilter<"PerformanceMetric"> | string
    metricName?: StringFilter<"PerformanceMetric"> | string
    metricType?: StringFilter<"PerformanceMetric"> | string
    value?: FloatFilter<"PerformanceMetric"> | number
    unit?: StringNullableFilter<"PerformanceMetric"> | string | null
    service?: StringNullableFilter<"PerformanceMetric"> | string | null
    endpoint?: StringNullableFilter<"PerformanceMetric"> | string | null
    method?: StringNullableFilter<"PerformanceMetric"> | string | null
    statusCode?: IntNullableFilter<"PerformanceMetric"> | number | null
    dimensions?: JsonNullableFilter<"PerformanceMetric">
    tags?: StringNullableListFilter<"PerformanceMetric">
    timestamp?: DateTimeFilter<"PerformanceMetric"> | Date | string
    interval?: IntNullableFilter<"PerformanceMetric"> | number | null
    count?: IntNullableFilter<"PerformanceMetric"> | number | null
    min?: FloatNullableFilter<"PerformanceMetric"> | number | null
    max?: FloatNullableFilter<"PerformanceMetric"> | number | null
    avg?: FloatNullableFilter<"PerformanceMetric"> | number | null
    p50?: FloatNullableFilter<"PerformanceMetric"> | number | null
    p95?: FloatNullableFilter<"PerformanceMetric"> | number | null
    p99?: FloatNullableFilter<"PerformanceMetric"> | number | null
  }

  export type PerformanceMetricOrderByWithRelationInput = {
    id?: SortOrder
    metricName?: SortOrder
    metricType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    service?: SortOrder
    endpoint?: SortOrder
    method?: SortOrder
    statusCode?: SortOrder
    dimensions?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrder
    count?: SortOrder
    min?: SortOrder
    max?: SortOrder
    avg?: SortOrder
    p50?: SortOrder
    p95?: SortOrder
    p99?: SortOrder
  }

  export type PerformanceMetricWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PerformanceMetricWhereInput | PerformanceMetricWhereInput[]
    OR?: PerformanceMetricWhereInput[]
    NOT?: PerformanceMetricWhereInput | PerformanceMetricWhereInput[]
    metricName?: StringFilter<"PerformanceMetric"> | string
    metricType?: StringFilter<"PerformanceMetric"> | string
    value?: FloatFilter<"PerformanceMetric"> | number
    unit?: StringNullableFilter<"PerformanceMetric"> | string | null
    service?: StringNullableFilter<"PerformanceMetric"> | string | null
    endpoint?: StringNullableFilter<"PerformanceMetric"> | string | null
    method?: StringNullableFilter<"PerformanceMetric"> | string | null
    statusCode?: IntNullableFilter<"PerformanceMetric"> | number | null
    dimensions?: JsonNullableFilter<"PerformanceMetric">
    tags?: StringNullableListFilter<"PerformanceMetric">
    timestamp?: DateTimeFilter<"PerformanceMetric"> | Date | string
    interval?: IntNullableFilter<"PerformanceMetric"> | number | null
    count?: IntNullableFilter<"PerformanceMetric"> | number | null
    min?: FloatNullableFilter<"PerformanceMetric"> | number | null
    max?: FloatNullableFilter<"PerformanceMetric"> | number | null
    avg?: FloatNullableFilter<"PerformanceMetric"> | number | null
    p50?: FloatNullableFilter<"PerformanceMetric"> | number | null
    p95?: FloatNullableFilter<"PerformanceMetric"> | number | null
    p99?: FloatNullableFilter<"PerformanceMetric"> | number | null
  }, "id">

  export type PerformanceMetricOrderByWithAggregationInput = {
    id?: SortOrder
    metricName?: SortOrder
    metricType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    service?: SortOrder
    endpoint?: SortOrder
    method?: SortOrder
    statusCode?: SortOrder
    dimensions?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrder
    count?: SortOrder
    min?: SortOrder
    max?: SortOrder
    avg?: SortOrder
    p50?: SortOrder
    p95?: SortOrder
    p99?: SortOrder
    _count?: PerformanceMetricCountOrderByAggregateInput
    _avg?: PerformanceMetricAvgOrderByAggregateInput
    _max?: PerformanceMetricMaxOrderByAggregateInput
    _min?: PerformanceMetricMinOrderByAggregateInput
    _sum?: PerformanceMetricSumOrderByAggregateInput
  }

  export type PerformanceMetricScalarWhereWithAggregatesInput = {
    AND?: PerformanceMetricScalarWhereWithAggregatesInput | PerformanceMetricScalarWhereWithAggregatesInput[]
    OR?: PerformanceMetricScalarWhereWithAggregatesInput[]
    NOT?: PerformanceMetricScalarWhereWithAggregatesInput | PerformanceMetricScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PerformanceMetric"> | string
    metricName?: StringWithAggregatesFilter<"PerformanceMetric"> | string
    metricType?: StringWithAggregatesFilter<"PerformanceMetric"> | string
    value?: FloatWithAggregatesFilter<"PerformanceMetric"> | number
    unit?: StringNullableWithAggregatesFilter<"PerformanceMetric"> | string | null
    service?: StringNullableWithAggregatesFilter<"PerformanceMetric"> | string | null
    endpoint?: StringNullableWithAggregatesFilter<"PerformanceMetric"> | string | null
    method?: StringNullableWithAggregatesFilter<"PerformanceMetric"> | string | null
    statusCode?: IntNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
    dimensions?: JsonNullableWithAggregatesFilter<"PerformanceMetric">
    tags?: StringNullableListFilter<"PerformanceMetric">
    timestamp?: DateTimeWithAggregatesFilter<"PerformanceMetric"> | Date | string
    interval?: IntNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
    count?: IntNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
    min?: FloatNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
    max?: FloatNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
    avg?: FloatNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
    p50?: FloatNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
    p95?: FloatNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
    p99?: FloatNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
  }

  export type AuditLogCreateInput = {
    id?: string
    eventType: string
    action: string
    resource?: string | null
    resourceId?: string | null
    userId?: string | null
    sessionId?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    method?: string | null
    path?: string | null
    oldValues?: InputJsonValue | null
    newValues?: InputJsonValue | null
    changes?: InputJsonValue | null
    severity?: string
    category?: string | null
    source?: string | null
    correlation?: string | null
    metadata?: InputJsonValue | null
    tags?: AuditLogCreatetagsInput | string[]
    timestamp?: Date | string
    duration?: number | null
    retentionDate?: Date | string | null
    complianceFlags?: AuditLogCreatecomplianceFlagsInput | string[]
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    eventType: string
    action: string
    resource?: string | null
    resourceId?: string | null
    userId?: string | null
    sessionId?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    method?: string | null
    path?: string | null
    oldValues?: InputJsonValue | null
    newValues?: InputJsonValue | null
    changes?: InputJsonValue | null
    severity?: string
    category?: string | null
    source?: string | null
    correlation?: string | null
    metadata?: InputJsonValue | null
    tags?: AuditLogCreatetagsInput | string[]
    timestamp?: Date | string
    duration?: number | null
    retentionDate?: Date | string | null
    complianceFlags?: AuditLogCreatecomplianceFlagsInput | string[]
  }

  export type AuditLogUpdateInput = {
    eventType?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    method?: NullableStringFieldUpdateOperationsInput | string | null
    path?: NullableStringFieldUpdateOperationsInput | string | null
    oldValues?: InputJsonValue | InputJsonValue | null
    newValues?: InputJsonValue | InputJsonValue | null
    changes?: InputJsonValue | InputJsonValue | null
    severity?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    correlation?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: AuditLogUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    complianceFlags?: AuditLogUpdatecomplianceFlagsInput | string[]
  }

  export type AuditLogUncheckedUpdateInput = {
    eventType?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    method?: NullableStringFieldUpdateOperationsInput | string | null
    path?: NullableStringFieldUpdateOperationsInput | string | null
    oldValues?: InputJsonValue | InputJsonValue | null
    newValues?: InputJsonValue | InputJsonValue | null
    changes?: InputJsonValue | InputJsonValue | null
    severity?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    correlation?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: AuditLogUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    complianceFlags?: AuditLogUpdatecomplianceFlagsInput | string[]
  }

  export type AuditLogCreateManyInput = {
    id?: string
    eventType: string
    action: string
    resource?: string | null
    resourceId?: string | null
    userId?: string | null
    sessionId?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    method?: string | null
    path?: string | null
    oldValues?: InputJsonValue | null
    newValues?: InputJsonValue | null
    changes?: InputJsonValue | null
    severity?: string
    category?: string | null
    source?: string | null
    correlation?: string | null
    metadata?: InputJsonValue | null
    tags?: AuditLogCreatetagsInput | string[]
    timestamp?: Date | string
    duration?: number | null
    retentionDate?: Date | string | null
    complianceFlags?: AuditLogCreatecomplianceFlagsInput | string[]
  }

  export type AuditLogUpdateManyMutationInput = {
    eventType?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    method?: NullableStringFieldUpdateOperationsInput | string | null
    path?: NullableStringFieldUpdateOperationsInput | string | null
    oldValues?: InputJsonValue | InputJsonValue | null
    newValues?: InputJsonValue | InputJsonValue | null
    changes?: InputJsonValue | InputJsonValue | null
    severity?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    correlation?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: AuditLogUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    complianceFlags?: AuditLogUpdatecomplianceFlagsInput | string[]
  }

  export type AuditLogUncheckedUpdateManyInput = {
    eventType?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    resourceId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    method?: NullableStringFieldUpdateOperationsInput | string | null
    path?: NullableStringFieldUpdateOperationsInput | string | null
    oldValues?: InputJsonValue | InputJsonValue | null
    newValues?: InputJsonValue | InputJsonValue | null
    changes?: InputJsonValue | InputJsonValue | null
    severity?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    correlation?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: AuditLogUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    retentionDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    complianceFlags?: AuditLogUpdatecomplianceFlagsInput | string[]
  }

  export type SecurityEventCreateInput = {
    id?: string
    eventType: string
    severity?: string
    userId?: string | null
    description: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: InputJsonValue | null
    threatLevel?: string | null
    confidence?: number | null
    indicators?: InputJsonValue | null
    status?: string
    assignedTo?: string | null
    response?: InputJsonValue | null
    timestamp?: Date | string
    firstSeen?: Date | string | null
    lastSeen?: Date | string | null
    resolvedAt?: Date | string | null
    metadata?: InputJsonValue | null
    tags?: SecurityEventCreatetagsInput | string[]
  }

  export type SecurityEventUncheckedCreateInput = {
    id?: string
    eventType: string
    severity?: string
    userId?: string | null
    description: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: InputJsonValue | null
    threatLevel?: string | null
    confidence?: number | null
    indicators?: InputJsonValue | null
    status?: string
    assignedTo?: string | null
    response?: InputJsonValue | null
    timestamp?: Date | string
    firstSeen?: Date | string | null
    lastSeen?: Date | string | null
    resolvedAt?: Date | string | null
    metadata?: InputJsonValue | null
    tags?: SecurityEventCreatetagsInput | string[]
  }

  export type SecurityEventUpdateInput = {
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    description?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue | null
    threatLevel?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    indicators?: InputJsonValue | InputJsonValue | null
    status?: StringFieldUpdateOperationsInput | string
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    response?: InputJsonValue | InputJsonValue | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    firstSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: SecurityEventUpdatetagsInput | string[]
  }

  export type SecurityEventUncheckedUpdateInput = {
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    description?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue | null
    threatLevel?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    indicators?: InputJsonValue | InputJsonValue | null
    status?: StringFieldUpdateOperationsInput | string
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    response?: InputJsonValue | InputJsonValue | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    firstSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: SecurityEventUpdatetagsInput | string[]
  }

  export type SecurityEventCreateManyInput = {
    id?: string
    eventType: string
    severity?: string
    userId?: string | null
    description: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: InputJsonValue | null
    threatLevel?: string | null
    confidence?: number | null
    indicators?: InputJsonValue | null
    status?: string
    assignedTo?: string | null
    response?: InputJsonValue | null
    timestamp?: Date | string
    firstSeen?: Date | string | null
    lastSeen?: Date | string | null
    resolvedAt?: Date | string | null
    metadata?: InputJsonValue | null
    tags?: SecurityEventCreatetagsInput | string[]
  }

  export type SecurityEventUpdateManyMutationInput = {
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    description?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue | null
    threatLevel?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    indicators?: InputJsonValue | InputJsonValue | null
    status?: StringFieldUpdateOperationsInput | string
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    response?: InputJsonValue | InputJsonValue | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    firstSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: SecurityEventUpdatetagsInput | string[]
  }

  export type SecurityEventUncheckedUpdateManyInput = {
    eventType?: StringFieldUpdateOperationsInput | string
    severity?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    description?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    location?: InputJsonValue | InputJsonValue | null
    threatLevel?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    indicators?: InputJsonValue | InputJsonValue | null
    status?: StringFieldUpdateOperationsInput | string
    assignedTo?: NullableStringFieldUpdateOperationsInput | string | null
    response?: InputJsonValue | InputJsonValue | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    firstSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: SecurityEventUpdatetagsInput | string[]
  }

  export type SystemLogCreateInput = {
    id?: string
    level: string
    message: string
    source: string
    component?: string | null
    error?: InputJsonValue | null
    stackTrace?: string | null
    requestId?: string | null
    sessionId?: string | null
    userId?: string | null
    duration?: number | null
    memory?: InputJsonValue | null
    metadata?: InputJsonValue | null
    tags?: SystemLogCreatetagsInput | string[]
    timestamp?: Date | string
    indexed?: boolean
    archived?: boolean
  }

  export type SystemLogUncheckedCreateInput = {
    id?: string
    level: string
    message: string
    source: string
    component?: string | null
    error?: InputJsonValue | null
    stackTrace?: string | null
    requestId?: string | null
    sessionId?: string | null
    userId?: string | null
    duration?: number | null
    memory?: InputJsonValue | null
    metadata?: InputJsonValue | null
    tags?: SystemLogCreatetagsInput | string[]
    timestamp?: Date | string
    indexed?: boolean
    archived?: boolean
  }

  export type SystemLogUpdateInput = {
    level?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    component?: NullableStringFieldUpdateOperationsInput | string | null
    error?: InputJsonValue | InputJsonValue | null
    stackTrace?: NullableStringFieldUpdateOperationsInput | string | null
    requestId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    memory?: InputJsonValue | InputJsonValue | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: SystemLogUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    indexed?: BoolFieldUpdateOperationsInput | boolean
    archived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SystemLogUncheckedUpdateInput = {
    level?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    component?: NullableStringFieldUpdateOperationsInput | string | null
    error?: InputJsonValue | InputJsonValue | null
    stackTrace?: NullableStringFieldUpdateOperationsInput | string | null
    requestId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    memory?: InputJsonValue | InputJsonValue | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: SystemLogUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    indexed?: BoolFieldUpdateOperationsInput | boolean
    archived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SystemLogCreateManyInput = {
    id?: string
    level: string
    message: string
    source: string
    component?: string | null
    error?: InputJsonValue | null
    stackTrace?: string | null
    requestId?: string | null
    sessionId?: string | null
    userId?: string | null
    duration?: number | null
    memory?: InputJsonValue | null
    metadata?: InputJsonValue | null
    tags?: SystemLogCreatetagsInput | string[]
    timestamp?: Date | string
    indexed?: boolean
    archived?: boolean
  }

  export type SystemLogUpdateManyMutationInput = {
    level?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    component?: NullableStringFieldUpdateOperationsInput | string | null
    error?: InputJsonValue | InputJsonValue | null
    stackTrace?: NullableStringFieldUpdateOperationsInput | string | null
    requestId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    memory?: InputJsonValue | InputJsonValue | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: SystemLogUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    indexed?: BoolFieldUpdateOperationsInput | boolean
    archived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SystemLogUncheckedUpdateManyInput = {
    level?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    component?: NullableStringFieldUpdateOperationsInput | string | null
    error?: InputJsonValue | InputJsonValue | null
    stackTrace?: NullableStringFieldUpdateOperationsInput | string | null
    requestId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    memory?: InputJsonValue | InputJsonValue | null
    metadata?: InputJsonValue | InputJsonValue | null
    tags?: SystemLogUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    indexed?: BoolFieldUpdateOperationsInput | boolean
    archived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ActivityTraceCreateInput = {
    id?: string
    traceId: string
    spanId: string
    parentSpanId?: string | null
    operation: string
    service: string
    method?: string | null
    path?: string | null
    startTime: Date | string
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    statusCode?: number | null
    userId?: string | null
    sessionId?: string | null
    cpu?: number | null
    memory?: number | null
    ioOperations?: number | null
    tags?: InputJsonValue | null
    metadata?: InputJsonValue | null
  }

  export type ActivityTraceUncheckedCreateInput = {
    id?: string
    traceId: string
    spanId: string
    parentSpanId?: string | null
    operation: string
    service: string
    method?: string | null
    path?: string | null
    startTime: Date | string
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    statusCode?: number | null
    userId?: string | null
    sessionId?: string | null
    cpu?: number | null
    memory?: number | null
    ioOperations?: number | null
    tags?: InputJsonValue | null
    metadata?: InputJsonValue | null
  }

  export type ActivityTraceUpdateInput = {
    traceId?: StringFieldUpdateOperationsInput | string
    spanId?: StringFieldUpdateOperationsInput | string
    parentSpanId?: NullableStringFieldUpdateOperationsInput | string | null
    operation?: StringFieldUpdateOperationsInput | string
    service?: StringFieldUpdateOperationsInput | string
    method?: NullableStringFieldUpdateOperationsInput | string | null
    path?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    cpu?: NullableFloatFieldUpdateOperationsInput | number | null
    memory?: NullableIntFieldUpdateOperationsInput | number | null
    ioOperations?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: InputJsonValue | InputJsonValue | null
    metadata?: InputJsonValue | InputJsonValue | null
  }

  export type ActivityTraceUncheckedUpdateInput = {
    traceId?: StringFieldUpdateOperationsInput | string
    spanId?: StringFieldUpdateOperationsInput | string
    parentSpanId?: NullableStringFieldUpdateOperationsInput | string | null
    operation?: StringFieldUpdateOperationsInput | string
    service?: StringFieldUpdateOperationsInput | string
    method?: NullableStringFieldUpdateOperationsInput | string | null
    path?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    cpu?: NullableFloatFieldUpdateOperationsInput | number | null
    memory?: NullableIntFieldUpdateOperationsInput | number | null
    ioOperations?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: InputJsonValue | InputJsonValue | null
    metadata?: InputJsonValue | InputJsonValue | null
  }

  export type ActivityTraceCreateManyInput = {
    id?: string
    traceId: string
    spanId: string
    parentSpanId?: string | null
    operation: string
    service: string
    method?: string | null
    path?: string | null
    startTime: Date | string
    endTime?: Date | string | null
    duration?: number | null
    status?: string
    statusCode?: number | null
    userId?: string | null
    sessionId?: string | null
    cpu?: number | null
    memory?: number | null
    ioOperations?: number | null
    tags?: InputJsonValue | null
    metadata?: InputJsonValue | null
  }

  export type ActivityTraceUpdateManyMutationInput = {
    traceId?: StringFieldUpdateOperationsInput | string
    spanId?: StringFieldUpdateOperationsInput | string
    parentSpanId?: NullableStringFieldUpdateOperationsInput | string | null
    operation?: StringFieldUpdateOperationsInput | string
    service?: StringFieldUpdateOperationsInput | string
    method?: NullableStringFieldUpdateOperationsInput | string | null
    path?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    cpu?: NullableFloatFieldUpdateOperationsInput | number | null
    memory?: NullableIntFieldUpdateOperationsInput | number | null
    ioOperations?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: InputJsonValue | InputJsonValue | null
    metadata?: InputJsonValue | InputJsonValue | null
  }

  export type ActivityTraceUncheckedUpdateManyInput = {
    traceId?: StringFieldUpdateOperationsInput | string
    spanId?: StringFieldUpdateOperationsInput | string
    parentSpanId?: NullableStringFieldUpdateOperationsInput | string | null
    operation?: StringFieldUpdateOperationsInput | string
    service?: StringFieldUpdateOperationsInput | string
    method?: NullableStringFieldUpdateOperationsInput | string | null
    path?: NullableStringFieldUpdateOperationsInput | string | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    cpu?: NullableFloatFieldUpdateOperationsInput | number | null
    memory?: NullableIntFieldUpdateOperationsInput | number | null
    ioOperations?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: InputJsonValue | InputJsonValue | null
    metadata?: InputJsonValue | InputJsonValue | null
  }

  export type ComplianceLogCreateInput = {
    id?: string
    regulation: string
    eventType: string
    dataCategory: string
    dataSubjectId?: string | null
    dataSubjectType?: string | null
    action: string
    purpose?: string | null
    legalBasis?: string | null
    dataFields?: ComplianceLogCreatedataFieldsInput | string[]
    processor?: string | null
    controller?: string | null
    consentId?: string | null
    consentStatus?: string | null
    retentionPeriod?: number | null
    disposalDate?: Date | string | null
    userId?: string | null
    ipAddress?: string | null
    timestamp?: Date | string
    metadata?: InputJsonValue | null
  }

  export type ComplianceLogUncheckedCreateInput = {
    id?: string
    regulation: string
    eventType: string
    dataCategory: string
    dataSubjectId?: string | null
    dataSubjectType?: string | null
    action: string
    purpose?: string | null
    legalBasis?: string | null
    dataFields?: ComplianceLogCreatedataFieldsInput | string[]
    processor?: string | null
    controller?: string | null
    consentId?: string | null
    consentStatus?: string | null
    retentionPeriod?: number | null
    disposalDate?: Date | string | null
    userId?: string | null
    ipAddress?: string | null
    timestamp?: Date | string
    metadata?: InputJsonValue | null
  }

  export type ComplianceLogUpdateInput = {
    regulation?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    dataCategory?: StringFieldUpdateOperationsInput | string
    dataSubjectId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSubjectType?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    purpose?: NullableStringFieldUpdateOperationsInput | string | null
    legalBasis?: NullableStringFieldUpdateOperationsInput | string | null
    dataFields?: ComplianceLogUpdatedataFieldsInput | string[]
    processor?: NullableStringFieldUpdateOperationsInput | string | null
    controller?: NullableStringFieldUpdateOperationsInput | string | null
    consentId?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    retentionPeriod?: NullableIntFieldUpdateOperationsInput | number | null
    disposalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: InputJsonValue | InputJsonValue | null
  }

  export type ComplianceLogUncheckedUpdateInput = {
    regulation?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    dataCategory?: StringFieldUpdateOperationsInput | string
    dataSubjectId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSubjectType?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    purpose?: NullableStringFieldUpdateOperationsInput | string | null
    legalBasis?: NullableStringFieldUpdateOperationsInput | string | null
    dataFields?: ComplianceLogUpdatedataFieldsInput | string[]
    processor?: NullableStringFieldUpdateOperationsInput | string | null
    controller?: NullableStringFieldUpdateOperationsInput | string | null
    consentId?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    retentionPeriod?: NullableIntFieldUpdateOperationsInput | number | null
    disposalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: InputJsonValue | InputJsonValue | null
  }

  export type ComplianceLogCreateManyInput = {
    id?: string
    regulation: string
    eventType: string
    dataCategory: string
    dataSubjectId?: string | null
    dataSubjectType?: string | null
    action: string
    purpose?: string | null
    legalBasis?: string | null
    dataFields?: ComplianceLogCreatedataFieldsInput | string[]
    processor?: string | null
    controller?: string | null
    consentId?: string | null
    consentStatus?: string | null
    retentionPeriod?: number | null
    disposalDate?: Date | string | null
    userId?: string | null
    ipAddress?: string | null
    timestamp?: Date | string
    metadata?: InputJsonValue | null
  }

  export type ComplianceLogUpdateManyMutationInput = {
    regulation?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    dataCategory?: StringFieldUpdateOperationsInput | string
    dataSubjectId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSubjectType?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    purpose?: NullableStringFieldUpdateOperationsInput | string | null
    legalBasis?: NullableStringFieldUpdateOperationsInput | string | null
    dataFields?: ComplianceLogUpdatedataFieldsInput | string[]
    processor?: NullableStringFieldUpdateOperationsInput | string | null
    controller?: NullableStringFieldUpdateOperationsInput | string | null
    consentId?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    retentionPeriod?: NullableIntFieldUpdateOperationsInput | number | null
    disposalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: InputJsonValue | InputJsonValue | null
  }

  export type ComplianceLogUncheckedUpdateManyInput = {
    regulation?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    dataCategory?: StringFieldUpdateOperationsInput | string
    dataSubjectId?: NullableStringFieldUpdateOperationsInput | string | null
    dataSubjectType?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    purpose?: NullableStringFieldUpdateOperationsInput | string | null
    legalBasis?: NullableStringFieldUpdateOperationsInput | string | null
    dataFields?: ComplianceLogUpdatedataFieldsInput | string[]
    processor?: NullableStringFieldUpdateOperationsInput | string | null
    controller?: NullableStringFieldUpdateOperationsInput | string | null
    consentId?: NullableStringFieldUpdateOperationsInput | string | null
    consentStatus?: NullableStringFieldUpdateOperationsInput | string | null
    retentionPeriod?: NullableIntFieldUpdateOperationsInput | number | null
    disposalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: InputJsonValue | InputJsonValue | null
  }

  export type PerformanceMetricCreateInput = {
    id?: string
    metricName: string
    metricType: string
    value: number
    unit?: string | null
    service?: string | null
    endpoint?: string | null
    method?: string | null
    statusCode?: number | null
    dimensions?: InputJsonValue | null
    tags?: PerformanceMetricCreatetagsInput | string[]
    timestamp?: Date | string
    interval?: number | null
    count?: number | null
    min?: number | null
    max?: number | null
    avg?: number | null
    p50?: number | null
    p95?: number | null
    p99?: number | null
  }

  export type PerformanceMetricUncheckedCreateInput = {
    id?: string
    metricName: string
    metricType: string
    value: number
    unit?: string | null
    service?: string | null
    endpoint?: string | null
    method?: string | null
    statusCode?: number | null
    dimensions?: InputJsonValue | null
    tags?: PerformanceMetricCreatetagsInput | string[]
    timestamp?: Date | string
    interval?: number | null
    count?: number | null
    min?: number | null
    max?: number | null
    avg?: number | null
    p50?: number | null
    p95?: number | null
    p99?: number | null
  }

  export type PerformanceMetricUpdateInput = {
    metricName?: StringFieldUpdateOperationsInput | string
    metricType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    service?: NullableStringFieldUpdateOperationsInput | string | null
    endpoint?: NullableStringFieldUpdateOperationsInput | string | null
    method?: NullableStringFieldUpdateOperationsInput | string | null
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    dimensions?: InputJsonValue | InputJsonValue | null
    tags?: PerformanceMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
    count?: NullableIntFieldUpdateOperationsInput | number | null
    min?: NullableFloatFieldUpdateOperationsInput | number | null
    max?: NullableFloatFieldUpdateOperationsInput | number | null
    avg?: NullableFloatFieldUpdateOperationsInput | number | null
    p50?: NullableFloatFieldUpdateOperationsInput | number | null
    p95?: NullableFloatFieldUpdateOperationsInput | number | null
    p99?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type PerformanceMetricUncheckedUpdateInput = {
    metricName?: StringFieldUpdateOperationsInput | string
    metricType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    service?: NullableStringFieldUpdateOperationsInput | string | null
    endpoint?: NullableStringFieldUpdateOperationsInput | string | null
    method?: NullableStringFieldUpdateOperationsInput | string | null
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    dimensions?: InputJsonValue | InputJsonValue | null
    tags?: PerformanceMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
    count?: NullableIntFieldUpdateOperationsInput | number | null
    min?: NullableFloatFieldUpdateOperationsInput | number | null
    max?: NullableFloatFieldUpdateOperationsInput | number | null
    avg?: NullableFloatFieldUpdateOperationsInput | number | null
    p50?: NullableFloatFieldUpdateOperationsInput | number | null
    p95?: NullableFloatFieldUpdateOperationsInput | number | null
    p99?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type PerformanceMetricCreateManyInput = {
    id?: string
    metricName: string
    metricType: string
    value: number
    unit?: string | null
    service?: string | null
    endpoint?: string | null
    method?: string | null
    statusCode?: number | null
    dimensions?: InputJsonValue | null
    tags?: PerformanceMetricCreatetagsInput | string[]
    timestamp?: Date | string
    interval?: number | null
    count?: number | null
    min?: number | null
    max?: number | null
    avg?: number | null
    p50?: number | null
    p95?: number | null
    p99?: number | null
  }

  export type PerformanceMetricUpdateManyMutationInput = {
    metricName?: StringFieldUpdateOperationsInput | string
    metricType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    service?: NullableStringFieldUpdateOperationsInput | string | null
    endpoint?: NullableStringFieldUpdateOperationsInput | string | null
    method?: NullableStringFieldUpdateOperationsInput | string | null
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    dimensions?: InputJsonValue | InputJsonValue | null
    tags?: PerformanceMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
    count?: NullableIntFieldUpdateOperationsInput | number | null
    min?: NullableFloatFieldUpdateOperationsInput | number | null
    max?: NullableFloatFieldUpdateOperationsInput | number | null
    avg?: NullableFloatFieldUpdateOperationsInput | number | null
    p50?: NullableFloatFieldUpdateOperationsInput | number | null
    p95?: NullableFloatFieldUpdateOperationsInput | number | null
    p99?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type PerformanceMetricUncheckedUpdateManyInput = {
    metricName?: StringFieldUpdateOperationsInput | string
    metricType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    service?: NullableStringFieldUpdateOperationsInput | string | null
    endpoint?: NullableStringFieldUpdateOperationsInput | string | null
    method?: NullableStringFieldUpdateOperationsInput | string | null
    statusCode?: NullableIntFieldUpdateOperationsInput | number | null
    dimensions?: InputJsonValue | InputJsonValue | null
    tags?: PerformanceMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
    count?: NullableIntFieldUpdateOperationsInput | number | null
    min?: NullableFloatFieldUpdateOperationsInput | number | null
    max?: NullableFloatFieldUpdateOperationsInput | number | null
    avg?: NullableFloatFieldUpdateOperationsInput | number | null
    p50?: NullableFloatFieldUpdateOperationsInput | number | null
    p95?: NullableFloatFieldUpdateOperationsInput | number | null
    p99?: NullableFloatFieldUpdateOperationsInput | number | null
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
    isSet?: boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
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

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
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
    isSet?: boolean
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    eventType?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    resourceId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    method?: SortOrder
    path?: SortOrder
    oldValues?: SortOrder
    newValues?: SortOrder
    changes?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    source?: SortOrder
    correlation?: SortOrder
    metadata?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    duration?: SortOrder
    retentionDate?: SortOrder
    complianceFlags?: SortOrder
  }

  export type AuditLogAvgOrderByAggregateInput = {
    duration?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    eventType?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    resourceId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    method?: SortOrder
    path?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    source?: SortOrder
    correlation?: SortOrder
    timestamp?: SortOrder
    duration?: SortOrder
    retentionDate?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    eventType?: SortOrder
    action?: SortOrder
    resource?: SortOrder
    resourceId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    method?: SortOrder
    path?: SortOrder
    severity?: SortOrder
    category?: SortOrder
    source?: SortOrder
    correlation?: SortOrder
    timestamp?: SortOrder
    duration?: SortOrder
    retentionDate?: SortOrder
  }

  export type AuditLogSumOrderByAggregateInput = {
    duration?: SortOrder
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
    isSet?: boolean
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
    isSet?: boolean
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
    isSet?: boolean
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
    isSet?: boolean
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }

  export type SecurityEventCountOrderByAggregateInput = {
    id?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    userId?: SortOrder
    description?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    location?: SortOrder
    threatLevel?: SortOrder
    confidence?: SortOrder
    indicators?: SortOrder
    status?: SortOrder
    assignedTo?: SortOrder
    response?: SortOrder
    timestamp?: SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    resolvedAt?: SortOrder
    metadata?: SortOrder
    tags?: SortOrder
  }

  export type SecurityEventAvgOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type SecurityEventMaxOrderByAggregateInput = {
    id?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    userId?: SortOrder
    description?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    threatLevel?: SortOrder
    confidence?: SortOrder
    status?: SortOrder
    assignedTo?: SortOrder
    timestamp?: SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    resolvedAt?: SortOrder
  }

  export type SecurityEventMinOrderByAggregateInput = {
    id?: SortOrder
    eventType?: SortOrder
    severity?: SortOrder
    userId?: SortOrder
    description?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    threatLevel?: SortOrder
    confidence?: SortOrder
    status?: SortOrder
    assignedTo?: SortOrder
    timestamp?: SortOrder
    firstSeen?: SortOrder
    lastSeen?: SortOrder
    resolvedAt?: SortOrder
  }

  export type SecurityEventSumOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type SystemLogCountOrderByAggregateInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    source?: SortOrder
    component?: SortOrder
    error?: SortOrder
    stackTrace?: SortOrder
    requestId?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    duration?: SortOrder
    memory?: SortOrder
    metadata?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    indexed?: SortOrder
    archived?: SortOrder
  }

  export type SystemLogAvgOrderByAggregateInput = {
    duration?: SortOrder
  }

  export type SystemLogMaxOrderByAggregateInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    source?: SortOrder
    component?: SortOrder
    stackTrace?: SortOrder
    requestId?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    duration?: SortOrder
    timestamp?: SortOrder
    indexed?: SortOrder
    archived?: SortOrder
  }

  export type SystemLogMinOrderByAggregateInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    source?: SortOrder
    component?: SortOrder
    stackTrace?: SortOrder
    requestId?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    duration?: SortOrder
    timestamp?: SortOrder
    indexed?: SortOrder
    archived?: SortOrder
  }

  export type SystemLogSumOrderByAggregateInput = {
    duration?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ActivityTraceCountOrderByAggregateInput = {
    id?: SortOrder
    traceId?: SortOrder
    spanId?: SortOrder
    parentSpanId?: SortOrder
    operation?: SortOrder
    service?: SortOrder
    method?: SortOrder
    path?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    duration?: SortOrder
    status?: SortOrder
    statusCode?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    cpu?: SortOrder
    memory?: SortOrder
    ioOperations?: SortOrder
    tags?: SortOrder
    metadata?: SortOrder
  }

  export type ActivityTraceAvgOrderByAggregateInput = {
    duration?: SortOrder
    statusCode?: SortOrder
    cpu?: SortOrder
    memory?: SortOrder
    ioOperations?: SortOrder
  }

  export type ActivityTraceMaxOrderByAggregateInput = {
    id?: SortOrder
    traceId?: SortOrder
    spanId?: SortOrder
    parentSpanId?: SortOrder
    operation?: SortOrder
    service?: SortOrder
    method?: SortOrder
    path?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    duration?: SortOrder
    status?: SortOrder
    statusCode?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    cpu?: SortOrder
    memory?: SortOrder
    ioOperations?: SortOrder
  }

  export type ActivityTraceMinOrderByAggregateInput = {
    id?: SortOrder
    traceId?: SortOrder
    spanId?: SortOrder
    parentSpanId?: SortOrder
    operation?: SortOrder
    service?: SortOrder
    method?: SortOrder
    path?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    duration?: SortOrder
    status?: SortOrder
    statusCode?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    cpu?: SortOrder
    memory?: SortOrder
    ioOperations?: SortOrder
  }

  export type ActivityTraceSumOrderByAggregateInput = {
    duration?: SortOrder
    statusCode?: SortOrder
    cpu?: SortOrder
    memory?: SortOrder
    ioOperations?: SortOrder
  }

  export type ComplianceLogCountOrderByAggregateInput = {
    id?: SortOrder
    regulation?: SortOrder
    eventType?: SortOrder
    dataCategory?: SortOrder
    dataSubjectId?: SortOrder
    dataSubjectType?: SortOrder
    action?: SortOrder
    purpose?: SortOrder
    legalBasis?: SortOrder
    dataFields?: SortOrder
    processor?: SortOrder
    controller?: SortOrder
    consentId?: SortOrder
    consentStatus?: SortOrder
    retentionPeriod?: SortOrder
    disposalDate?: SortOrder
    userId?: SortOrder
    ipAddress?: SortOrder
    timestamp?: SortOrder
    metadata?: SortOrder
  }

  export type ComplianceLogAvgOrderByAggregateInput = {
    retentionPeriod?: SortOrder
  }

  export type ComplianceLogMaxOrderByAggregateInput = {
    id?: SortOrder
    regulation?: SortOrder
    eventType?: SortOrder
    dataCategory?: SortOrder
    dataSubjectId?: SortOrder
    dataSubjectType?: SortOrder
    action?: SortOrder
    purpose?: SortOrder
    legalBasis?: SortOrder
    processor?: SortOrder
    controller?: SortOrder
    consentId?: SortOrder
    consentStatus?: SortOrder
    retentionPeriod?: SortOrder
    disposalDate?: SortOrder
    userId?: SortOrder
    ipAddress?: SortOrder
    timestamp?: SortOrder
  }

  export type ComplianceLogMinOrderByAggregateInput = {
    id?: SortOrder
    regulation?: SortOrder
    eventType?: SortOrder
    dataCategory?: SortOrder
    dataSubjectId?: SortOrder
    dataSubjectType?: SortOrder
    action?: SortOrder
    purpose?: SortOrder
    legalBasis?: SortOrder
    processor?: SortOrder
    controller?: SortOrder
    consentId?: SortOrder
    consentStatus?: SortOrder
    retentionPeriod?: SortOrder
    disposalDate?: SortOrder
    userId?: SortOrder
    ipAddress?: SortOrder
    timestamp?: SortOrder
  }

  export type ComplianceLogSumOrderByAggregateInput = {
    retentionPeriod?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type PerformanceMetricCountOrderByAggregateInput = {
    id?: SortOrder
    metricName?: SortOrder
    metricType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    service?: SortOrder
    endpoint?: SortOrder
    method?: SortOrder
    statusCode?: SortOrder
    dimensions?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrder
    count?: SortOrder
    min?: SortOrder
    max?: SortOrder
    avg?: SortOrder
    p50?: SortOrder
    p95?: SortOrder
    p99?: SortOrder
  }

  export type PerformanceMetricAvgOrderByAggregateInput = {
    value?: SortOrder
    statusCode?: SortOrder
    interval?: SortOrder
    count?: SortOrder
    min?: SortOrder
    max?: SortOrder
    avg?: SortOrder
    p50?: SortOrder
    p95?: SortOrder
    p99?: SortOrder
  }

  export type PerformanceMetricMaxOrderByAggregateInput = {
    id?: SortOrder
    metricName?: SortOrder
    metricType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    service?: SortOrder
    endpoint?: SortOrder
    method?: SortOrder
    statusCode?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrder
    count?: SortOrder
    min?: SortOrder
    max?: SortOrder
    avg?: SortOrder
    p50?: SortOrder
    p95?: SortOrder
    p99?: SortOrder
  }

  export type PerformanceMetricMinOrderByAggregateInput = {
    id?: SortOrder
    metricName?: SortOrder
    metricType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    service?: SortOrder
    endpoint?: SortOrder
    method?: SortOrder
    statusCode?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrder
    count?: SortOrder
    min?: SortOrder
    max?: SortOrder
    avg?: SortOrder
    p50?: SortOrder
    p95?: SortOrder
    p99?: SortOrder
  }

  export type PerformanceMetricSumOrderByAggregateInput = {
    value?: SortOrder
    statusCode?: SortOrder
    interval?: SortOrder
    count?: SortOrder
    min?: SortOrder
    max?: SortOrder
    avg?: SortOrder
    p50?: SortOrder
    p95?: SortOrder
    p99?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type AuditLogCreatetagsInput = {
    set: string[]
  }

  export type AuditLogCreatecomplianceFlagsInput = {
    set: string[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type AuditLogUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
    unset?: boolean
  }

  export type AuditLogUpdatecomplianceFlagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type SecurityEventCreatetagsInput = {
    set: string[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type SecurityEventUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type SystemLogCreatetagsInput = {
    set: string[]
  }

  export type SystemLogUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ComplianceLogCreatedataFieldsInput = {
    set: string[]
  }

  export type ComplianceLogUpdatedataFieldsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type PerformanceMetricCreatetagsInput = {
    set: string[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PerformanceMetricUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
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
    isSet?: boolean
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

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
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
    isSet?: boolean
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
    isSet?: boolean
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    isSet?: boolean
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
    isSet?: boolean
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
    isSet?: boolean
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
    isSet?: boolean
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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