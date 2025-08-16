
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
 * Model Connector
 * 
 */
export type Connector = $Result.DefaultSelection<Prisma.$ConnectorPayload>
/**
 * Model SyncJob
 * 
 */
export type SyncJob = $Result.DefaultSelection<Prisma.$SyncJobPayload>
/**
 * Model IdentityMapping
 * 
 */
export type IdentityMapping = $Result.DefaultSelection<Prisma.$IdentityMappingPayload>
/**
 * Model TransformationRule
 * 
 */
export type TransformationRule = $Result.DefaultSelection<Prisma.$TransformationRulePayload>
/**
 * Model IntegrationEvent
 * 
 */
export type IntegrationEvent = $Result.DefaultSelection<Prisma.$IntegrationEventPayload>
/**
 * Model ConnectorMetric
 * 
 */
export type ConnectorMetric = $Result.DefaultSelection<Prisma.$ConnectorMetricPayload>
/**
 * Model DataQualityCheck
 * 
 */
export type DataQualityCheck = $Result.DefaultSelection<Prisma.$DataQualityCheckPayload>
/**
 * Model IntegrationPolicy
 * 
 */
export type IntegrationPolicy = $Result.DefaultSelection<Prisma.$IntegrationPolicyPayload>
/**
 * Model ConnectorTemplate
 * 
 */
export type ConnectorTemplate = $Result.DefaultSelection<Prisma.$ConnectorTemplatePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ConnectorType: {
  IDENTITY_PROVIDER: 'IDENTITY_PROVIDER',
  DEVICE_MANAGEMENT: 'DEVICE_MANAGEMENT',
  SECURITY_PLATFORM: 'SECURITY_PLATFORM',
  COLLABORATION: 'COLLABORATION',
  HR_SYSTEM: 'HR_SYSTEM',
  MONITORING: 'MONITORING',
  PROJECT_MANAGEMENT: 'PROJECT_MANAGEMENT',
  TICKETING: 'TICKETING',
  CUSTOM: 'CUSTOM'
};

export type ConnectorType = (typeof ConnectorType)[keyof typeof ConnectorType]


export const ConnectorStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ERROR: 'ERROR',
  MAINTENANCE: 'MAINTENANCE',
  DEPRECATED: 'DEPRECATED'
};

export type ConnectorStatus = (typeof ConnectorStatus)[keyof typeof ConnectorStatus]


export const HealthStatus: {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  UNHEALTHY: 'UNHEALTHY',
  UNKNOWN: 'UNKNOWN'
};

export type HealthStatus = (typeof HealthStatus)[keyof typeof HealthStatus]


export const SyncStrategy: {
  POLLING: 'POLLING',
  WEBHOOK: 'WEBHOOK',
  EVENT_STREAM: 'EVENT_STREAM',
  HYBRID: 'HYBRID'
};

export type SyncStrategy = (typeof SyncStrategy)[keyof typeof SyncStrategy]


export const SyncJobType: {
  FULL_SYNC: 'FULL_SYNC',
  INCREMENTAL_SYNC: 'INCREMENTAL_SYNC',
  DELTA_SYNC: 'DELTA_SYNC',
  VALIDATION_SYNC: 'VALIDATION_SYNC',
  HEALTH_CHECK: 'HEALTH_CHECK'
};

export type SyncJobType = (typeof SyncJobType)[keyof typeof SyncJobType]


export const JobStatus: {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  TIMEOUT: 'TIMEOUT'
};

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]


export const TriggerType: {
  SCHEDULED: 'SCHEDULED',
  MANUAL: 'MANUAL',
  WEBHOOK: 'WEBHOOK',
  EVENT_DRIVEN: 'EVENT_DRIVEN',
  DEPENDENCY: 'DEPENDENCY'
};

export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType]


export const MappingStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  CONFLICTED: 'CONFLICTED',
  PENDING_REVIEW: 'PENDING_REVIEW'
};

export type MappingStatus = (typeof MappingStatus)[keyof typeof MappingStatus]


export const TransformationType: {
  DIRECT_MAPPING: 'DIRECT_MAPPING',
  FORMAT_CONVERSION: 'FORMAT_CONVERSION',
  DATA_ENRICHMENT: 'DATA_ENRICHMENT',
  AGGREGATION: 'AGGREGATION',
  VALIDATION: 'VALIDATION',
  CUSTOM_FUNCTION: 'CUSTOM_FUNCTION'
};

export type TransformationType = (typeof TransformationType)[keyof typeof TransformationType]


export const EventCategory: {
  USER_EVENT: 'USER_EVENT',
  DEVICE_EVENT: 'DEVICE_EVENT',
  SECURITY_EVENT: 'SECURITY_EVENT',
  SYSTEM_EVENT: 'SYSTEM_EVENT',
  AUDIT_EVENT: 'AUDIT_EVENT'
};

export type EventCategory = (typeof EventCategory)[keyof typeof EventCategory]


export const EventStatus: {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  RETRY: 'RETRY',
  DEAD_LETTER: 'DEAD_LETTER'
};

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]


export const MetricType: {
  COUNTER: 'COUNTER',
  GAUGE: 'GAUGE',
  HISTOGRAM: 'HISTOGRAM',
  SUMMARY: 'SUMMARY'
};

export type MetricType = (typeof MetricType)[keyof typeof MetricType]


export const QualityCheckType: {
  COMPLETENESS: 'COMPLETENESS',
  ACCURACY: 'ACCURACY',
  CONSISTENCY: 'CONSISTENCY',
  VALIDITY: 'VALIDITY',
  UNIQUENESS: 'UNIQUENESS',
  TIMELINESS: 'TIMELINESS'
};

export type QualityCheckType = (typeof QualityCheckType)[keyof typeof QualityCheckType]


export const QualityStatus: {
  PENDING: 'PENDING',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  WARNING: 'WARNING'
};

export type QualityStatus = (typeof QualityStatus)[keyof typeof QualityStatus]


export const QualitySeverity: {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export type QualitySeverity = (typeof QualitySeverity)[keyof typeof QualitySeverity]


export const PolicyType: {
  DATA_GOVERNANCE: 'DATA_GOVERNANCE',
  SECURITY_POLICY: 'SECURITY_POLICY',
  COMPLIANCE_RULE: 'COMPLIANCE_RULE',
  BUSINESS_RULE: 'BUSINESS_RULE',
  TECHNICAL_POLICY: 'TECHNICAL_POLICY'
};

export type PolicyType = (typeof PolicyType)[keyof typeof PolicyType]


export const EnforcementMode: {
  ADVISORY: 'ADVISORY',
  BLOCKING: 'BLOCKING',
  QUARANTINE: 'QUARANTINE'
};

export type EnforcementMode = (typeof EnforcementMode)[keyof typeof EnforcementMode]

}

export type ConnectorType = $Enums.ConnectorType

export const ConnectorType: typeof $Enums.ConnectorType

export type ConnectorStatus = $Enums.ConnectorStatus

export const ConnectorStatus: typeof $Enums.ConnectorStatus

export type HealthStatus = $Enums.HealthStatus

export const HealthStatus: typeof $Enums.HealthStatus

export type SyncStrategy = $Enums.SyncStrategy

export const SyncStrategy: typeof $Enums.SyncStrategy

export type SyncJobType = $Enums.SyncJobType

export const SyncJobType: typeof $Enums.SyncJobType

export type JobStatus = $Enums.JobStatus

export const JobStatus: typeof $Enums.JobStatus

export type TriggerType = $Enums.TriggerType

export const TriggerType: typeof $Enums.TriggerType

export type MappingStatus = $Enums.MappingStatus

export const MappingStatus: typeof $Enums.MappingStatus

export type TransformationType = $Enums.TransformationType

export const TransformationType: typeof $Enums.TransformationType

export type EventCategory = $Enums.EventCategory

export const EventCategory: typeof $Enums.EventCategory

export type EventStatus = $Enums.EventStatus

export const EventStatus: typeof $Enums.EventStatus

export type MetricType = $Enums.MetricType

export const MetricType: typeof $Enums.MetricType

export type QualityCheckType = $Enums.QualityCheckType

export const QualityCheckType: typeof $Enums.QualityCheckType

export type QualityStatus = $Enums.QualityStatus

export const QualityStatus: typeof $Enums.QualityStatus

export type QualitySeverity = $Enums.QualitySeverity

export const QualitySeverity: typeof $Enums.QualitySeverity

export type PolicyType = $Enums.PolicyType

export const PolicyType: typeof $Enums.PolicyType

export type EnforcementMode = $Enums.EnforcementMode

export const EnforcementMode: typeof $Enums.EnforcementMode

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Connectors
 * const connectors = await prisma.connector.findMany()
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
   * // Fetch zero or more Connectors
   * const connectors = await prisma.connector.findMany()
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
   * `prisma.connector`: Exposes CRUD operations for the **Connector** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Connectors
    * const connectors = await prisma.connector.findMany()
    * ```
    */
  get connector(): Prisma.ConnectorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.syncJob`: Exposes CRUD operations for the **SyncJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SyncJobs
    * const syncJobs = await prisma.syncJob.findMany()
    * ```
    */
  get syncJob(): Prisma.SyncJobDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.identityMapping`: Exposes CRUD operations for the **IdentityMapping** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IdentityMappings
    * const identityMappings = await prisma.identityMapping.findMany()
    * ```
    */
  get identityMapping(): Prisma.IdentityMappingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transformationRule`: Exposes CRUD operations for the **TransformationRule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TransformationRules
    * const transformationRules = await prisma.transformationRule.findMany()
    * ```
    */
  get transformationRule(): Prisma.TransformationRuleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.integrationEvent`: Exposes CRUD operations for the **IntegrationEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntegrationEvents
    * const integrationEvents = await prisma.integrationEvent.findMany()
    * ```
    */
  get integrationEvent(): Prisma.IntegrationEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.connectorMetric`: Exposes CRUD operations for the **ConnectorMetric** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConnectorMetrics
    * const connectorMetrics = await prisma.connectorMetric.findMany()
    * ```
    */
  get connectorMetric(): Prisma.ConnectorMetricDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dataQualityCheck`: Exposes CRUD operations for the **DataQualityCheck** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DataQualityChecks
    * const dataQualityChecks = await prisma.dataQualityCheck.findMany()
    * ```
    */
  get dataQualityCheck(): Prisma.DataQualityCheckDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.integrationPolicy`: Exposes CRUD operations for the **IntegrationPolicy** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IntegrationPolicies
    * const integrationPolicies = await prisma.integrationPolicy.findMany()
    * ```
    */
  get integrationPolicy(): Prisma.IntegrationPolicyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.connectorTemplate`: Exposes CRUD operations for the **ConnectorTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConnectorTemplates
    * const connectorTemplates = await prisma.connectorTemplate.findMany()
    * ```
    */
  get connectorTemplate(): Prisma.ConnectorTemplateDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.13.0
   * Query Engine version: 361e86d0ea4987e9f53a565309b3eed797a6bcbd
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
    Connector: 'Connector',
    SyncJob: 'SyncJob',
    IdentityMapping: 'IdentityMapping',
    TransformationRule: 'TransformationRule',
    IntegrationEvent: 'IntegrationEvent',
    ConnectorMetric: 'ConnectorMetric',
    DataQualityCheck: 'DataQualityCheck',
    IntegrationPolicy: 'IntegrationPolicy',
    ConnectorTemplate: 'ConnectorTemplate'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    integration_db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "connector" | "syncJob" | "identityMapping" | "transformationRule" | "integrationEvent" | "connectorMetric" | "dataQualityCheck" | "integrationPolicy" | "connectorTemplate"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Connector: {
        payload: Prisma.$ConnectorPayload<ExtArgs>
        fields: Prisma.ConnectorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConnectorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConnectorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload>
          }
          findFirst: {
            args: Prisma.ConnectorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConnectorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload>
          }
          findMany: {
            args: Prisma.ConnectorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload>[]
          }
          create: {
            args: Prisma.ConnectorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload>
          }
          createMany: {
            args: Prisma.ConnectorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConnectorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload>[]
          }
          delete: {
            args: Prisma.ConnectorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload>
          }
          update: {
            args: Prisma.ConnectorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload>
          }
          deleteMany: {
            args: Prisma.ConnectorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConnectorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConnectorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload>[]
          }
          upsert: {
            args: Prisma.ConnectorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorPayload>
          }
          aggregate: {
            args: Prisma.ConnectorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConnector>
          }
          groupBy: {
            args: Prisma.ConnectorGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConnectorGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConnectorCountArgs<ExtArgs>
            result: $Utils.Optional<ConnectorCountAggregateOutputType> | number
          }
        }
      }
      SyncJob: {
        payload: Prisma.$SyncJobPayload<ExtArgs>
        fields: Prisma.SyncJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SyncJobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SyncJobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload>
          }
          findFirst: {
            args: Prisma.SyncJobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SyncJobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload>
          }
          findMany: {
            args: Prisma.SyncJobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload>[]
          }
          create: {
            args: Prisma.SyncJobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload>
          }
          createMany: {
            args: Prisma.SyncJobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SyncJobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload>[]
          }
          delete: {
            args: Prisma.SyncJobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload>
          }
          update: {
            args: Prisma.SyncJobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload>
          }
          deleteMany: {
            args: Prisma.SyncJobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SyncJobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SyncJobUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload>[]
          }
          upsert: {
            args: Prisma.SyncJobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SyncJobPayload>
          }
          aggregate: {
            args: Prisma.SyncJobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSyncJob>
          }
          groupBy: {
            args: Prisma.SyncJobGroupByArgs<ExtArgs>
            result: $Utils.Optional<SyncJobGroupByOutputType>[]
          }
          count: {
            args: Prisma.SyncJobCountArgs<ExtArgs>
            result: $Utils.Optional<SyncJobCountAggregateOutputType> | number
          }
        }
      }
      IdentityMapping: {
        payload: Prisma.$IdentityMappingPayload<ExtArgs>
        fields: Prisma.IdentityMappingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IdentityMappingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IdentityMappingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload>
          }
          findFirst: {
            args: Prisma.IdentityMappingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IdentityMappingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload>
          }
          findMany: {
            args: Prisma.IdentityMappingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload>[]
          }
          create: {
            args: Prisma.IdentityMappingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload>
          }
          createMany: {
            args: Prisma.IdentityMappingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IdentityMappingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload>[]
          }
          delete: {
            args: Prisma.IdentityMappingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload>
          }
          update: {
            args: Prisma.IdentityMappingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload>
          }
          deleteMany: {
            args: Prisma.IdentityMappingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IdentityMappingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IdentityMappingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload>[]
          }
          upsert: {
            args: Prisma.IdentityMappingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityMappingPayload>
          }
          aggregate: {
            args: Prisma.IdentityMappingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIdentityMapping>
          }
          groupBy: {
            args: Prisma.IdentityMappingGroupByArgs<ExtArgs>
            result: $Utils.Optional<IdentityMappingGroupByOutputType>[]
          }
          count: {
            args: Prisma.IdentityMappingCountArgs<ExtArgs>
            result: $Utils.Optional<IdentityMappingCountAggregateOutputType> | number
          }
        }
      }
      TransformationRule: {
        payload: Prisma.$TransformationRulePayload<ExtArgs>
        fields: Prisma.TransformationRuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransformationRuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransformationRuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload>
          }
          findFirst: {
            args: Prisma.TransformationRuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransformationRuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload>
          }
          findMany: {
            args: Prisma.TransformationRuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload>[]
          }
          create: {
            args: Prisma.TransformationRuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload>
          }
          createMany: {
            args: Prisma.TransformationRuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransformationRuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload>[]
          }
          delete: {
            args: Prisma.TransformationRuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload>
          }
          update: {
            args: Prisma.TransformationRuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload>
          }
          deleteMany: {
            args: Prisma.TransformationRuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransformationRuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransformationRuleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload>[]
          }
          upsert: {
            args: Prisma.TransformationRuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransformationRulePayload>
          }
          aggregate: {
            args: Prisma.TransformationRuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransformationRule>
          }
          groupBy: {
            args: Prisma.TransformationRuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransformationRuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransformationRuleCountArgs<ExtArgs>
            result: $Utils.Optional<TransformationRuleCountAggregateOutputType> | number
          }
        }
      }
      IntegrationEvent: {
        payload: Prisma.$IntegrationEventPayload<ExtArgs>
        fields: Prisma.IntegrationEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntegrationEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntegrationEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload>
          }
          findFirst: {
            args: Prisma.IntegrationEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntegrationEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload>
          }
          findMany: {
            args: Prisma.IntegrationEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload>[]
          }
          create: {
            args: Prisma.IntegrationEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload>
          }
          createMany: {
            args: Prisma.IntegrationEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntegrationEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload>[]
          }
          delete: {
            args: Prisma.IntegrationEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload>
          }
          update: {
            args: Prisma.IntegrationEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload>
          }
          deleteMany: {
            args: Prisma.IntegrationEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntegrationEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IntegrationEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload>[]
          }
          upsert: {
            args: Prisma.IntegrationEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationEventPayload>
          }
          aggregate: {
            args: Prisma.IntegrationEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntegrationEvent>
          }
          groupBy: {
            args: Prisma.IntegrationEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntegrationEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntegrationEventCountArgs<ExtArgs>
            result: $Utils.Optional<IntegrationEventCountAggregateOutputType> | number
          }
        }
      }
      ConnectorMetric: {
        payload: Prisma.$ConnectorMetricPayload<ExtArgs>
        fields: Prisma.ConnectorMetricFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConnectorMetricFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConnectorMetricFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload>
          }
          findFirst: {
            args: Prisma.ConnectorMetricFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConnectorMetricFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload>
          }
          findMany: {
            args: Prisma.ConnectorMetricFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload>[]
          }
          create: {
            args: Prisma.ConnectorMetricCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload>
          }
          createMany: {
            args: Prisma.ConnectorMetricCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConnectorMetricCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload>[]
          }
          delete: {
            args: Prisma.ConnectorMetricDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload>
          }
          update: {
            args: Prisma.ConnectorMetricUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload>
          }
          deleteMany: {
            args: Prisma.ConnectorMetricDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConnectorMetricUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConnectorMetricUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload>[]
          }
          upsert: {
            args: Prisma.ConnectorMetricUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorMetricPayload>
          }
          aggregate: {
            args: Prisma.ConnectorMetricAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConnectorMetric>
          }
          groupBy: {
            args: Prisma.ConnectorMetricGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConnectorMetricGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConnectorMetricCountArgs<ExtArgs>
            result: $Utils.Optional<ConnectorMetricCountAggregateOutputType> | number
          }
        }
      }
      DataQualityCheck: {
        payload: Prisma.$DataQualityCheckPayload<ExtArgs>
        fields: Prisma.DataQualityCheckFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DataQualityCheckFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DataQualityCheckFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload>
          }
          findFirst: {
            args: Prisma.DataQualityCheckFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DataQualityCheckFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload>
          }
          findMany: {
            args: Prisma.DataQualityCheckFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload>[]
          }
          create: {
            args: Prisma.DataQualityCheckCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload>
          }
          createMany: {
            args: Prisma.DataQualityCheckCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DataQualityCheckCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload>[]
          }
          delete: {
            args: Prisma.DataQualityCheckDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload>
          }
          update: {
            args: Prisma.DataQualityCheckUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload>
          }
          deleteMany: {
            args: Prisma.DataQualityCheckDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DataQualityCheckUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DataQualityCheckUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload>[]
          }
          upsert: {
            args: Prisma.DataQualityCheckUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataQualityCheckPayload>
          }
          aggregate: {
            args: Prisma.DataQualityCheckAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDataQualityCheck>
          }
          groupBy: {
            args: Prisma.DataQualityCheckGroupByArgs<ExtArgs>
            result: $Utils.Optional<DataQualityCheckGroupByOutputType>[]
          }
          count: {
            args: Prisma.DataQualityCheckCountArgs<ExtArgs>
            result: $Utils.Optional<DataQualityCheckCountAggregateOutputType> | number
          }
        }
      }
      IntegrationPolicy: {
        payload: Prisma.$IntegrationPolicyPayload<ExtArgs>
        fields: Prisma.IntegrationPolicyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IntegrationPolicyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IntegrationPolicyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload>
          }
          findFirst: {
            args: Prisma.IntegrationPolicyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IntegrationPolicyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload>
          }
          findMany: {
            args: Prisma.IntegrationPolicyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload>[]
          }
          create: {
            args: Prisma.IntegrationPolicyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload>
          }
          createMany: {
            args: Prisma.IntegrationPolicyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IntegrationPolicyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload>[]
          }
          delete: {
            args: Prisma.IntegrationPolicyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload>
          }
          update: {
            args: Prisma.IntegrationPolicyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload>
          }
          deleteMany: {
            args: Prisma.IntegrationPolicyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IntegrationPolicyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IntegrationPolicyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload>[]
          }
          upsert: {
            args: Prisma.IntegrationPolicyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IntegrationPolicyPayload>
          }
          aggregate: {
            args: Prisma.IntegrationPolicyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntegrationPolicy>
          }
          groupBy: {
            args: Prisma.IntegrationPolicyGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntegrationPolicyGroupByOutputType>[]
          }
          count: {
            args: Prisma.IntegrationPolicyCountArgs<ExtArgs>
            result: $Utils.Optional<IntegrationPolicyCountAggregateOutputType> | number
          }
        }
      }
      ConnectorTemplate: {
        payload: Prisma.$ConnectorTemplatePayload<ExtArgs>
        fields: Prisma.ConnectorTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConnectorTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConnectorTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload>
          }
          findFirst: {
            args: Prisma.ConnectorTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConnectorTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload>
          }
          findMany: {
            args: Prisma.ConnectorTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload>[]
          }
          create: {
            args: Prisma.ConnectorTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload>
          }
          createMany: {
            args: Prisma.ConnectorTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConnectorTemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload>[]
          }
          delete: {
            args: Prisma.ConnectorTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload>
          }
          update: {
            args: Prisma.ConnectorTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload>
          }
          deleteMany: {
            args: Prisma.ConnectorTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConnectorTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConnectorTemplateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload>[]
          }
          upsert: {
            args: Prisma.ConnectorTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConnectorTemplatePayload>
          }
          aggregate: {
            args: Prisma.ConnectorTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConnectorTemplate>
          }
          groupBy: {
            args: Prisma.ConnectorTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConnectorTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConnectorTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<ConnectorTemplateCountAggregateOutputType> | number
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
    connector?: ConnectorOmit
    syncJob?: SyncJobOmit
    identityMapping?: IdentityMappingOmit
    transformationRule?: TransformationRuleOmit
    integrationEvent?: IntegrationEventOmit
    connectorMetric?: ConnectorMetricOmit
    dataQualityCheck?: DataQualityCheckOmit
    integrationPolicy?: IntegrationPolicyOmit
    connectorTemplate?: ConnectorTemplateOmit
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
   * Count Type ConnectorCountOutputType
   */

  export type ConnectorCountOutputType = {
    syncJobs: number
    events: number
    metrics: number
  }

  export type ConnectorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    syncJobs?: boolean | ConnectorCountOutputTypeCountSyncJobsArgs
    events?: boolean | ConnectorCountOutputTypeCountEventsArgs
    metrics?: boolean | ConnectorCountOutputTypeCountMetricsArgs
  }

  // Custom InputTypes
  /**
   * ConnectorCountOutputType without action
   */
  export type ConnectorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorCountOutputType
     */
    select?: ConnectorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ConnectorCountOutputType without action
   */
  export type ConnectorCountOutputTypeCountSyncJobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SyncJobWhereInput
  }

  /**
   * ConnectorCountOutputType without action
   */
  export type ConnectorCountOutputTypeCountEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntegrationEventWhereInput
  }

  /**
   * ConnectorCountOutputType without action
   */
  export type ConnectorCountOutputTypeCountMetricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConnectorMetricWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Connector
   */

  export type AggregateConnector = {
    _count: ConnectorCountAggregateOutputType | null
    _avg: ConnectorAvgAggregateOutputType | null
    _sum: ConnectorSumAggregateOutputType | null
    _min: ConnectorMinAggregateOutputType | null
    _max: ConnectorMaxAggregateOutputType | null
  }

  export type ConnectorAvgAggregateOutputType = {
    syncInterval: number | null
    rateLimitPerMin: number | null
    rateLimitPerHour: number | null
  }

  export type ConnectorSumAggregateOutputType = {
    syncInterval: number | null
    rateLimitPerMin: number | null
    rateLimitPerHour: number | null
  }

  export type ConnectorMinAggregateOutputType = {
    id: string | null
    name: string | null
    type: $Enums.ConnectorType | null
    version: string | null
    provider: string | null
    status: $Enums.ConnectorStatus | null
    health: $Enums.HealthStatus | null
    lastHealthCheck: Date | null
    lastSync: Date | null
    nextSync: Date | null
    syncEnabled: boolean | null
    syncInterval: number | null
    syncStrategy: $Enums.SyncStrategy | null
    rateLimitPerMin: number | null
    rateLimitPerHour: number | null
    encryptionKey: string | null
    certificate: string | null
    tenantId: string | null
    createdBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConnectorMaxAggregateOutputType = {
    id: string | null
    name: string | null
    type: $Enums.ConnectorType | null
    version: string | null
    provider: string | null
    status: $Enums.ConnectorStatus | null
    health: $Enums.HealthStatus | null
    lastHealthCheck: Date | null
    lastSync: Date | null
    nextSync: Date | null
    syncEnabled: boolean | null
    syncInterval: number | null
    syncStrategy: $Enums.SyncStrategy | null
    rateLimitPerMin: number | null
    rateLimitPerHour: number | null
    encryptionKey: string | null
    certificate: string | null
    tenantId: string | null
    createdBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConnectorCountAggregateOutputType = {
    id: number
    name: number
    type: number
    version: number
    provider: number
    config: number
    capabilities: number
    status: number
    health: number
    lastHealthCheck: number
    lastSync: number
    nextSync: number
    syncEnabled: number
    syncInterval: number
    syncStrategy: number
    rateLimitPerMin: number
    rateLimitPerHour: number
    encryptionKey: number
    certificate: number
    tenantId: number
    createdBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ConnectorAvgAggregateInputType = {
    syncInterval?: true
    rateLimitPerMin?: true
    rateLimitPerHour?: true
  }

  export type ConnectorSumAggregateInputType = {
    syncInterval?: true
    rateLimitPerMin?: true
    rateLimitPerHour?: true
  }

  export type ConnectorMinAggregateInputType = {
    id?: true
    name?: true
    type?: true
    version?: true
    provider?: true
    status?: true
    health?: true
    lastHealthCheck?: true
    lastSync?: true
    nextSync?: true
    syncEnabled?: true
    syncInterval?: true
    syncStrategy?: true
    rateLimitPerMin?: true
    rateLimitPerHour?: true
    encryptionKey?: true
    certificate?: true
    tenantId?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConnectorMaxAggregateInputType = {
    id?: true
    name?: true
    type?: true
    version?: true
    provider?: true
    status?: true
    health?: true
    lastHealthCheck?: true
    lastSync?: true
    nextSync?: true
    syncEnabled?: true
    syncInterval?: true
    syncStrategy?: true
    rateLimitPerMin?: true
    rateLimitPerHour?: true
    encryptionKey?: true
    certificate?: true
    tenantId?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConnectorCountAggregateInputType = {
    id?: true
    name?: true
    type?: true
    version?: true
    provider?: true
    config?: true
    capabilities?: true
    status?: true
    health?: true
    lastHealthCheck?: true
    lastSync?: true
    nextSync?: true
    syncEnabled?: true
    syncInterval?: true
    syncStrategy?: true
    rateLimitPerMin?: true
    rateLimitPerHour?: true
    encryptionKey?: true
    certificate?: true
    tenantId?: true
    createdBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ConnectorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Connector to aggregate.
     */
    where?: ConnectorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Connectors to fetch.
     */
    orderBy?: ConnectorOrderByWithRelationInput | ConnectorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConnectorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Connectors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Connectors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Connectors
    **/
    _count?: true | ConnectorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ConnectorAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ConnectorSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConnectorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConnectorMaxAggregateInputType
  }

  export type GetConnectorAggregateType<T extends ConnectorAggregateArgs> = {
        [P in keyof T & keyof AggregateConnector]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConnector[P]>
      : GetScalarType<T[P], AggregateConnector[P]>
  }




  export type ConnectorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConnectorWhereInput
    orderBy?: ConnectorOrderByWithAggregationInput | ConnectorOrderByWithAggregationInput[]
    by: ConnectorScalarFieldEnum[] | ConnectorScalarFieldEnum
    having?: ConnectorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConnectorCountAggregateInputType | true
    _avg?: ConnectorAvgAggregateInputType
    _sum?: ConnectorSumAggregateInputType
    _min?: ConnectorMinAggregateInputType
    _max?: ConnectorMaxAggregateInputType
  }

  export type ConnectorGroupByOutputType = {
    id: string
    name: string
    type: $Enums.ConnectorType
    version: string
    provider: string
    config: JsonValue
    capabilities: JsonValue
    status: $Enums.ConnectorStatus
    health: $Enums.HealthStatus
    lastHealthCheck: Date | null
    lastSync: Date | null
    nextSync: Date | null
    syncEnabled: boolean
    syncInterval: number
    syncStrategy: $Enums.SyncStrategy
    rateLimitPerMin: number
    rateLimitPerHour: number
    encryptionKey: string | null
    certificate: string | null
    tenantId: string
    createdBy: string
    createdAt: Date
    updatedAt: Date
    _count: ConnectorCountAggregateOutputType | null
    _avg: ConnectorAvgAggregateOutputType | null
    _sum: ConnectorSumAggregateOutputType | null
    _min: ConnectorMinAggregateOutputType | null
    _max: ConnectorMaxAggregateOutputType | null
  }

  type GetConnectorGroupByPayload<T extends ConnectorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConnectorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConnectorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConnectorGroupByOutputType[P]>
            : GetScalarType<T[P], ConnectorGroupByOutputType[P]>
        }
      >
    >


  export type ConnectorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    version?: boolean
    provider?: boolean
    config?: boolean
    capabilities?: boolean
    status?: boolean
    health?: boolean
    lastHealthCheck?: boolean
    lastSync?: boolean
    nextSync?: boolean
    syncEnabled?: boolean
    syncInterval?: boolean
    syncStrategy?: boolean
    rateLimitPerMin?: boolean
    rateLimitPerHour?: boolean
    encryptionKey?: boolean
    certificate?: boolean
    tenantId?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    syncJobs?: boolean | Connector$syncJobsArgs<ExtArgs>
    events?: boolean | Connector$eventsArgs<ExtArgs>
    metrics?: boolean | Connector$metricsArgs<ExtArgs>
    _count?: boolean | ConnectorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["connector"]>

  export type ConnectorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    version?: boolean
    provider?: boolean
    config?: boolean
    capabilities?: boolean
    status?: boolean
    health?: boolean
    lastHealthCheck?: boolean
    lastSync?: boolean
    nextSync?: boolean
    syncEnabled?: boolean
    syncInterval?: boolean
    syncStrategy?: boolean
    rateLimitPerMin?: boolean
    rateLimitPerHour?: boolean
    encryptionKey?: boolean
    certificate?: boolean
    tenantId?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["connector"]>

  export type ConnectorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    version?: boolean
    provider?: boolean
    config?: boolean
    capabilities?: boolean
    status?: boolean
    health?: boolean
    lastHealthCheck?: boolean
    lastSync?: boolean
    nextSync?: boolean
    syncEnabled?: boolean
    syncInterval?: boolean
    syncStrategy?: boolean
    rateLimitPerMin?: boolean
    rateLimitPerHour?: boolean
    encryptionKey?: boolean
    certificate?: boolean
    tenantId?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["connector"]>

  export type ConnectorSelectScalar = {
    id?: boolean
    name?: boolean
    type?: boolean
    version?: boolean
    provider?: boolean
    config?: boolean
    capabilities?: boolean
    status?: boolean
    health?: boolean
    lastHealthCheck?: boolean
    lastSync?: boolean
    nextSync?: boolean
    syncEnabled?: boolean
    syncInterval?: boolean
    syncStrategy?: boolean
    rateLimitPerMin?: boolean
    rateLimitPerHour?: boolean
    encryptionKey?: boolean
    certificate?: boolean
    tenantId?: boolean
    createdBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ConnectorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "type" | "version" | "provider" | "config" | "capabilities" | "status" | "health" | "lastHealthCheck" | "lastSync" | "nextSync" | "syncEnabled" | "syncInterval" | "syncStrategy" | "rateLimitPerMin" | "rateLimitPerHour" | "encryptionKey" | "certificate" | "tenantId" | "createdBy" | "createdAt" | "updatedAt", ExtArgs["result"]["connector"]>
  export type ConnectorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    syncJobs?: boolean | Connector$syncJobsArgs<ExtArgs>
    events?: boolean | Connector$eventsArgs<ExtArgs>
    metrics?: boolean | Connector$metricsArgs<ExtArgs>
    _count?: boolean | ConnectorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ConnectorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ConnectorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ConnectorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Connector"
    objects: {
      syncJobs: Prisma.$SyncJobPayload<ExtArgs>[]
      events: Prisma.$IntegrationEventPayload<ExtArgs>[]
      metrics: Prisma.$ConnectorMetricPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      type: $Enums.ConnectorType
      version: string
      provider: string
      config: Prisma.JsonValue
      capabilities: Prisma.JsonValue
      status: $Enums.ConnectorStatus
      health: $Enums.HealthStatus
      lastHealthCheck: Date | null
      lastSync: Date | null
      nextSync: Date | null
      syncEnabled: boolean
      syncInterval: number
      syncStrategy: $Enums.SyncStrategy
      rateLimitPerMin: number
      rateLimitPerHour: number
      encryptionKey: string | null
      certificate: string | null
      tenantId: string
      createdBy: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["connector"]>
    composites: {}
  }

  type ConnectorGetPayload<S extends boolean | null | undefined | ConnectorDefaultArgs> = $Result.GetResult<Prisma.$ConnectorPayload, S>

  type ConnectorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConnectorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConnectorCountAggregateInputType | true
    }

  export interface ConnectorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Connector'], meta: { name: 'Connector' } }
    /**
     * Find zero or one Connector that matches the filter.
     * @param {ConnectorFindUniqueArgs} args - Arguments to find a Connector
     * @example
     * // Get one Connector
     * const connector = await prisma.connector.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConnectorFindUniqueArgs>(args: SelectSubset<T, ConnectorFindUniqueArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Connector that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConnectorFindUniqueOrThrowArgs} args - Arguments to find a Connector
     * @example
     * // Get one Connector
     * const connector = await prisma.connector.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConnectorFindUniqueOrThrowArgs>(args: SelectSubset<T, ConnectorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Connector that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorFindFirstArgs} args - Arguments to find a Connector
     * @example
     * // Get one Connector
     * const connector = await prisma.connector.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConnectorFindFirstArgs>(args?: SelectSubset<T, ConnectorFindFirstArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Connector that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorFindFirstOrThrowArgs} args - Arguments to find a Connector
     * @example
     * // Get one Connector
     * const connector = await prisma.connector.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConnectorFindFirstOrThrowArgs>(args?: SelectSubset<T, ConnectorFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Connectors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Connectors
     * const connectors = await prisma.connector.findMany()
     * 
     * // Get first 10 Connectors
     * const connectors = await prisma.connector.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const connectorWithIdOnly = await prisma.connector.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConnectorFindManyArgs>(args?: SelectSubset<T, ConnectorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Connector.
     * @param {ConnectorCreateArgs} args - Arguments to create a Connector.
     * @example
     * // Create one Connector
     * const Connector = await prisma.connector.create({
     *   data: {
     *     // ... data to create a Connector
     *   }
     * })
     * 
     */
    create<T extends ConnectorCreateArgs>(args: SelectSubset<T, ConnectorCreateArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Connectors.
     * @param {ConnectorCreateManyArgs} args - Arguments to create many Connectors.
     * @example
     * // Create many Connectors
     * const connector = await prisma.connector.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConnectorCreateManyArgs>(args?: SelectSubset<T, ConnectorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Connectors and returns the data saved in the database.
     * @param {ConnectorCreateManyAndReturnArgs} args - Arguments to create many Connectors.
     * @example
     * // Create many Connectors
     * const connector = await prisma.connector.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Connectors and only return the `id`
     * const connectorWithIdOnly = await prisma.connector.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConnectorCreateManyAndReturnArgs>(args?: SelectSubset<T, ConnectorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Connector.
     * @param {ConnectorDeleteArgs} args - Arguments to delete one Connector.
     * @example
     * // Delete one Connector
     * const Connector = await prisma.connector.delete({
     *   where: {
     *     // ... filter to delete one Connector
     *   }
     * })
     * 
     */
    delete<T extends ConnectorDeleteArgs>(args: SelectSubset<T, ConnectorDeleteArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Connector.
     * @param {ConnectorUpdateArgs} args - Arguments to update one Connector.
     * @example
     * // Update one Connector
     * const connector = await prisma.connector.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConnectorUpdateArgs>(args: SelectSubset<T, ConnectorUpdateArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Connectors.
     * @param {ConnectorDeleteManyArgs} args - Arguments to filter Connectors to delete.
     * @example
     * // Delete a few Connectors
     * const { count } = await prisma.connector.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConnectorDeleteManyArgs>(args?: SelectSubset<T, ConnectorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Connectors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Connectors
     * const connector = await prisma.connector.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConnectorUpdateManyArgs>(args: SelectSubset<T, ConnectorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Connectors and returns the data updated in the database.
     * @param {ConnectorUpdateManyAndReturnArgs} args - Arguments to update many Connectors.
     * @example
     * // Update many Connectors
     * const connector = await prisma.connector.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Connectors and only return the `id`
     * const connectorWithIdOnly = await prisma.connector.updateManyAndReturn({
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
    updateManyAndReturn<T extends ConnectorUpdateManyAndReturnArgs>(args: SelectSubset<T, ConnectorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Connector.
     * @param {ConnectorUpsertArgs} args - Arguments to update or create a Connector.
     * @example
     * // Update or create a Connector
     * const connector = await prisma.connector.upsert({
     *   create: {
     *     // ... data to create a Connector
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Connector we want to update
     *   }
     * })
     */
    upsert<T extends ConnectorUpsertArgs>(args: SelectSubset<T, ConnectorUpsertArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Connectors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorCountArgs} args - Arguments to filter Connectors to count.
     * @example
     * // Count the number of Connectors
     * const count = await prisma.connector.count({
     *   where: {
     *     // ... the filter for the Connectors we want to count
     *   }
     * })
    **/
    count<T extends ConnectorCountArgs>(
      args?: Subset<T, ConnectorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConnectorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Connector.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConnectorAggregateArgs>(args: Subset<T, ConnectorAggregateArgs>): Prisma.PrismaPromise<GetConnectorAggregateType<T>>

    /**
     * Group by Connector.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorGroupByArgs} args - Group by arguments.
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
      T extends ConnectorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConnectorGroupByArgs['orderBy'] }
        : { orderBy?: ConnectorGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConnectorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConnectorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Connector model
   */
  readonly fields: ConnectorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Connector.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConnectorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    syncJobs<T extends Connector$syncJobsArgs<ExtArgs> = {}>(args?: Subset<T, Connector$syncJobsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    events<T extends Connector$eventsArgs<ExtArgs> = {}>(args?: Subset<T, Connector$eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    metrics<T extends Connector$metricsArgs<ExtArgs> = {}>(args?: Subset<T, Connector$metricsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Connector model
   */
  interface ConnectorFieldRefs {
    readonly id: FieldRef<"Connector", 'String'>
    readonly name: FieldRef<"Connector", 'String'>
    readonly type: FieldRef<"Connector", 'ConnectorType'>
    readonly version: FieldRef<"Connector", 'String'>
    readonly provider: FieldRef<"Connector", 'String'>
    readonly config: FieldRef<"Connector", 'Json'>
    readonly capabilities: FieldRef<"Connector", 'Json'>
    readonly status: FieldRef<"Connector", 'ConnectorStatus'>
    readonly health: FieldRef<"Connector", 'HealthStatus'>
    readonly lastHealthCheck: FieldRef<"Connector", 'DateTime'>
    readonly lastSync: FieldRef<"Connector", 'DateTime'>
    readonly nextSync: FieldRef<"Connector", 'DateTime'>
    readonly syncEnabled: FieldRef<"Connector", 'Boolean'>
    readonly syncInterval: FieldRef<"Connector", 'Int'>
    readonly syncStrategy: FieldRef<"Connector", 'SyncStrategy'>
    readonly rateLimitPerMin: FieldRef<"Connector", 'Int'>
    readonly rateLimitPerHour: FieldRef<"Connector", 'Int'>
    readonly encryptionKey: FieldRef<"Connector", 'String'>
    readonly certificate: FieldRef<"Connector", 'String'>
    readonly tenantId: FieldRef<"Connector", 'String'>
    readonly createdBy: FieldRef<"Connector", 'String'>
    readonly createdAt: FieldRef<"Connector", 'DateTime'>
    readonly updatedAt: FieldRef<"Connector", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Connector findUnique
   */
  export type ConnectorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    /**
     * Filter, which Connector to fetch.
     */
    where: ConnectorWhereUniqueInput
  }

  /**
   * Connector findUniqueOrThrow
   */
  export type ConnectorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    /**
     * Filter, which Connector to fetch.
     */
    where: ConnectorWhereUniqueInput
  }

  /**
   * Connector findFirst
   */
  export type ConnectorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    /**
     * Filter, which Connector to fetch.
     */
    where?: ConnectorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Connectors to fetch.
     */
    orderBy?: ConnectorOrderByWithRelationInput | ConnectorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Connectors.
     */
    cursor?: ConnectorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Connectors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Connectors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Connectors.
     */
    distinct?: ConnectorScalarFieldEnum | ConnectorScalarFieldEnum[]
  }

  /**
   * Connector findFirstOrThrow
   */
  export type ConnectorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    /**
     * Filter, which Connector to fetch.
     */
    where?: ConnectorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Connectors to fetch.
     */
    orderBy?: ConnectorOrderByWithRelationInput | ConnectorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Connectors.
     */
    cursor?: ConnectorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Connectors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Connectors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Connectors.
     */
    distinct?: ConnectorScalarFieldEnum | ConnectorScalarFieldEnum[]
  }

  /**
   * Connector findMany
   */
  export type ConnectorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    /**
     * Filter, which Connectors to fetch.
     */
    where?: ConnectorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Connectors to fetch.
     */
    orderBy?: ConnectorOrderByWithRelationInput | ConnectorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Connectors.
     */
    cursor?: ConnectorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Connectors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Connectors.
     */
    skip?: number
    distinct?: ConnectorScalarFieldEnum | ConnectorScalarFieldEnum[]
  }

  /**
   * Connector create
   */
  export type ConnectorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    /**
     * The data needed to create a Connector.
     */
    data: XOR<ConnectorCreateInput, ConnectorUncheckedCreateInput>
  }

  /**
   * Connector createMany
   */
  export type ConnectorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Connectors.
     */
    data: ConnectorCreateManyInput | ConnectorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Connector createManyAndReturn
   */
  export type ConnectorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * The data used to create many Connectors.
     */
    data: ConnectorCreateManyInput | ConnectorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Connector update
   */
  export type ConnectorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    /**
     * The data needed to update a Connector.
     */
    data: XOR<ConnectorUpdateInput, ConnectorUncheckedUpdateInput>
    /**
     * Choose, which Connector to update.
     */
    where: ConnectorWhereUniqueInput
  }

  /**
   * Connector updateMany
   */
  export type ConnectorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Connectors.
     */
    data: XOR<ConnectorUpdateManyMutationInput, ConnectorUncheckedUpdateManyInput>
    /**
     * Filter which Connectors to update
     */
    where?: ConnectorWhereInput
    /**
     * Limit how many Connectors to update.
     */
    limit?: number
  }

  /**
   * Connector updateManyAndReturn
   */
  export type ConnectorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * The data used to update Connectors.
     */
    data: XOR<ConnectorUpdateManyMutationInput, ConnectorUncheckedUpdateManyInput>
    /**
     * Filter which Connectors to update
     */
    where?: ConnectorWhereInput
    /**
     * Limit how many Connectors to update.
     */
    limit?: number
  }

  /**
   * Connector upsert
   */
  export type ConnectorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    /**
     * The filter to search for the Connector to update in case it exists.
     */
    where: ConnectorWhereUniqueInput
    /**
     * In case the Connector found by the `where` argument doesn't exist, create a new Connector with this data.
     */
    create: XOR<ConnectorCreateInput, ConnectorUncheckedCreateInput>
    /**
     * In case the Connector was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConnectorUpdateInput, ConnectorUncheckedUpdateInput>
  }

  /**
   * Connector delete
   */
  export type ConnectorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    /**
     * Filter which Connector to delete.
     */
    where: ConnectorWhereUniqueInput
  }

  /**
   * Connector deleteMany
   */
  export type ConnectorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Connectors to delete
     */
    where?: ConnectorWhereInput
    /**
     * Limit how many Connectors to delete.
     */
    limit?: number
  }

  /**
   * Connector.syncJobs
   */
  export type Connector$syncJobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    where?: SyncJobWhereInput
    orderBy?: SyncJobOrderByWithRelationInput | SyncJobOrderByWithRelationInput[]
    cursor?: SyncJobWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SyncJobScalarFieldEnum | SyncJobScalarFieldEnum[]
  }

  /**
   * Connector.events
   */
  export type Connector$eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    where?: IntegrationEventWhereInput
    orderBy?: IntegrationEventOrderByWithRelationInput | IntegrationEventOrderByWithRelationInput[]
    cursor?: IntegrationEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IntegrationEventScalarFieldEnum | IntegrationEventScalarFieldEnum[]
  }

  /**
   * Connector.metrics
   */
  export type Connector$metricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    where?: ConnectorMetricWhereInput
    orderBy?: ConnectorMetricOrderByWithRelationInput | ConnectorMetricOrderByWithRelationInput[]
    cursor?: ConnectorMetricWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConnectorMetricScalarFieldEnum | ConnectorMetricScalarFieldEnum[]
  }

  /**
   * Connector without action
   */
  export type ConnectorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
  }


  /**
   * Model SyncJob
   */

  export type AggregateSyncJob = {
    _count: SyncJobCountAggregateOutputType | null
    _avg: SyncJobAvgAggregateOutputType | null
    _sum: SyncJobSumAggregateOutputType | null
    _min: SyncJobMinAggregateOutputType | null
    _max: SyncJobMaxAggregateOutputType | null
  }

  export type SyncJobAvgAggregateOutputType = {
    duration: number | null
    recordsProcessed: number | null
    recordsSucceeded: number | null
    recordsFailed: number | null
  }

  export type SyncJobSumAggregateOutputType = {
    duration: number | null
    recordsProcessed: number | null
    recordsSucceeded: number | null
    recordsFailed: number | null
  }

  export type SyncJobMinAggregateOutputType = {
    id: string | null
    connectorId: string | null
    jobType: $Enums.SyncJobType | null
    strategy: $Enums.SyncStrategy | null
    status: $Enums.JobStatus | null
    startedAt: Date | null
    completedAt: Date | null
    duration: number | null
    recordsProcessed: number | null
    recordsSucceeded: number | null
    recordsFailed: number | null
    errorMessage: string | null
    correlationId: string | null
    triggerType: $Enums.TriggerType | null
    triggeredBy: string | null
    createdAt: Date | null
  }

  export type SyncJobMaxAggregateOutputType = {
    id: string | null
    connectorId: string | null
    jobType: $Enums.SyncJobType | null
    strategy: $Enums.SyncStrategy | null
    status: $Enums.JobStatus | null
    startedAt: Date | null
    completedAt: Date | null
    duration: number | null
    recordsProcessed: number | null
    recordsSucceeded: number | null
    recordsFailed: number | null
    errorMessage: string | null
    correlationId: string | null
    triggerType: $Enums.TriggerType | null
    triggeredBy: string | null
    createdAt: Date | null
  }

  export type SyncJobCountAggregateOutputType = {
    id: number
    connectorId: number
    jobType: number
    strategy: number
    options: number
    status: number
    startedAt: number
    completedAt: number
    duration: number
    recordsProcessed: number
    recordsSucceeded: number
    recordsFailed: number
    errorMessage: number
    errorDetails: number
    correlationId: number
    triggerType: number
    triggeredBy: number
    createdAt: number
    _all: number
  }


  export type SyncJobAvgAggregateInputType = {
    duration?: true
    recordsProcessed?: true
    recordsSucceeded?: true
    recordsFailed?: true
  }

  export type SyncJobSumAggregateInputType = {
    duration?: true
    recordsProcessed?: true
    recordsSucceeded?: true
    recordsFailed?: true
  }

  export type SyncJobMinAggregateInputType = {
    id?: true
    connectorId?: true
    jobType?: true
    strategy?: true
    status?: true
    startedAt?: true
    completedAt?: true
    duration?: true
    recordsProcessed?: true
    recordsSucceeded?: true
    recordsFailed?: true
    errorMessage?: true
    correlationId?: true
    triggerType?: true
    triggeredBy?: true
    createdAt?: true
  }

  export type SyncJobMaxAggregateInputType = {
    id?: true
    connectorId?: true
    jobType?: true
    strategy?: true
    status?: true
    startedAt?: true
    completedAt?: true
    duration?: true
    recordsProcessed?: true
    recordsSucceeded?: true
    recordsFailed?: true
    errorMessage?: true
    correlationId?: true
    triggerType?: true
    triggeredBy?: true
    createdAt?: true
  }

  export type SyncJobCountAggregateInputType = {
    id?: true
    connectorId?: true
    jobType?: true
    strategy?: true
    options?: true
    status?: true
    startedAt?: true
    completedAt?: true
    duration?: true
    recordsProcessed?: true
    recordsSucceeded?: true
    recordsFailed?: true
    errorMessage?: true
    errorDetails?: true
    correlationId?: true
    triggerType?: true
    triggeredBy?: true
    createdAt?: true
    _all?: true
  }

  export type SyncJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SyncJob to aggregate.
     */
    where?: SyncJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SyncJobs to fetch.
     */
    orderBy?: SyncJobOrderByWithRelationInput | SyncJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SyncJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SyncJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SyncJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SyncJobs
    **/
    _count?: true | SyncJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SyncJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SyncJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SyncJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SyncJobMaxAggregateInputType
  }

  export type GetSyncJobAggregateType<T extends SyncJobAggregateArgs> = {
        [P in keyof T & keyof AggregateSyncJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSyncJob[P]>
      : GetScalarType<T[P], AggregateSyncJob[P]>
  }




  export type SyncJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SyncJobWhereInput
    orderBy?: SyncJobOrderByWithAggregationInput | SyncJobOrderByWithAggregationInput[]
    by: SyncJobScalarFieldEnum[] | SyncJobScalarFieldEnum
    having?: SyncJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SyncJobCountAggregateInputType | true
    _avg?: SyncJobAvgAggregateInputType
    _sum?: SyncJobSumAggregateInputType
    _min?: SyncJobMinAggregateInputType
    _max?: SyncJobMaxAggregateInputType
  }

  export type SyncJobGroupByOutputType = {
    id: string
    connectorId: string
    jobType: $Enums.SyncJobType
    strategy: $Enums.SyncStrategy
    options: JsonValue | null
    status: $Enums.JobStatus
    startedAt: Date | null
    completedAt: Date | null
    duration: number | null
    recordsProcessed: number
    recordsSucceeded: number
    recordsFailed: number
    errorMessage: string | null
    errorDetails: JsonValue | null
    correlationId: string | null
    triggerType: $Enums.TriggerType
    triggeredBy: string | null
    createdAt: Date
    _count: SyncJobCountAggregateOutputType | null
    _avg: SyncJobAvgAggregateOutputType | null
    _sum: SyncJobSumAggregateOutputType | null
    _min: SyncJobMinAggregateOutputType | null
    _max: SyncJobMaxAggregateOutputType | null
  }

  type GetSyncJobGroupByPayload<T extends SyncJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SyncJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SyncJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SyncJobGroupByOutputType[P]>
            : GetScalarType<T[P], SyncJobGroupByOutputType[P]>
        }
      >
    >


  export type SyncJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    connectorId?: boolean
    jobType?: boolean
    strategy?: boolean
    options?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    duration?: boolean
    recordsProcessed?: boolean
    recordsSucceeded?: boolean
    recordsFailed?: boolean
    errorMessage?: boolean
    errorDetails?: boolean
    correlationId?: boolean
    triggerType?: boolean
    triggeredBy?: boolean
    createdAt?: boolean
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["syncJob"]>

  export type SyncJobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    connectorId?: boolean
    jobType?: boolean
    strategy?: boolean
    options?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    duration?: boolean
    recordsProcessed?: boolean
    recordsSucceeded?: boolean
    recordsFailed?: boolean
    errorMessage?: boolean
    errorDetails?: boolean
    correlationId?: boolean
    triggerType?: boolean
    triggeredBy?: boolean
    createdAt?: boolean
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["syncJob"]>

  export type SyncJobSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    connectorId?: boolean
    jobType?: boolean
    strategy?: boolean
    options?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    duration?: boolean
    recordsProcessed?: boolean
    recordsSucceeded?: boolean
    recordsFailed?: boolean
    errorMessage?: boolean
    errorDetails?: boolean
    correlationId?: boolean
    triggerType?: boolean
    triggeredBy?: boolean
    createdAt?: boolean
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["syncJob"]>

  export type SyncJobSelectScalar = {
    id?: boolean
    connectorId?: boolean
    jobType?: boolean
    strategy?: boolean
    options?: boolean
    status?: boolean
    startedAt?: boolean
    completedAt?: boolean
    duration?: boolean
    recordsProcessed?: boolean
    recordsSucceeded?: boolean
    recordsFailed?: boolean
    errorMessage?: boolean
    errorDetails?: boolean
    correlationId?: boolean
    triggerType?: boolean
    triggeredBy?: boolean
    createdAt?: boolean
  }

  export type SyncJobOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "connectorId" | "jobType" | "strategy" | "options" | "status" | "startedAt" | "completedAt" | "duration" | "recordsProcessed" | "recordsSucceeded" | "recordsFailed" | "errorMessage" | "errorDetails" | "correlationId" | "triggerType" | "triggeredBy" | "createdAt", ExtArgs["result"]["syncJob"]>
  export type SyncJobInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }
  export type SyncJobIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }
  export type SyncJobIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }

  export type $SyncJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SyncJob"
    objects: {
      connector: Prisma.$ConnectorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      connectorId: string
      jobType: $Enums.SyncJobType
      strategy: $Enums.SyncStrategy
      options: Prisma.JsonValue | null
      status: $Enums.JobStatus
      startedAt: Date | null
      completedAt: Date | null
      duration: number | null
      recordsProcessed: number
      recordsSucceeded: number
      recordsFailed: number
      errorMessage: string | null
      errorDetails: Prisma.JsonValue | null
      correlationId: string | null
      triggerType: $Enums.TriggerType
      triggeredBy: string | null
      createdAt: Date
    }, ExtArgs["result"]["syncJob"]>
    composites: {}
  }

  type SyncJobGetPayload<S extends boolean | null | undefined | SyncJobDefaultArgs> = $Result.GetResult<Prisma.$SyncJobPayload, S>

  type SyncJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SyncJobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SyncJobCountAggregateInputType | true
    }

  export interface SyncJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SyncJob'], meta: { name: 'SyncJob' } }
    /**
     * Find zero or one SyncJob that matches the filter.
     * @param {SyncJobFindUniqueArgs} args - Arguments to find a SyncJob
     * @example
     * // Get one SyncJob
     * const syncJob = await prisma.syncJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SyncJobFindUniqueArgs>(args: SelectSubset<T, SyncJobFindUniqueArgs<ExtArgs>>): Prisma__SyncJobClient<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SyncJob that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SyncJobFindUniqueOrThrowArgs} args - Arguments to find a SyncJob
     * @example
     * // Get one SyncJob
     * const syncJob = await prisma.syncJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SyncJobFindUniqueOrThrowArgs>(args: SelectSubset<T, SyncJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SyncJobClient<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SyncJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncJobFindFirstArgs} args - Arguments to find a SyncJob
     * @example
     * // Get one SyncJob
     * const syncJob = await prisma.syncJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SyncJobFindFirstArgs>(args?: SelectSubset<T, SyncJobFindFirstArgs<ExtArgs>>): Prisma__SyncJobClient<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SyncJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncJobFindFirstOrThrowArgs} args - Arguments to find a SyncJob
     * @example
     * // Get one SyncJob
     * const syncJob = await prisma.syncJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SyncJobFindFirstOrThrowArgs>(args?: SelectSubset<T, SyncJobFindFirstOrThrowArgs<ExtArgs>>): Prisma__SyncJobClient<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SyncJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SyncJobs
     * const syncJobs = await prisma.syncJob.findMany()
     * 
     * // Get first 10 SyncJobs
     * const syncJobs = await prisma.syncJob.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const syncJobWithIdOnly = await prisma.syncJob.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SyncJobFindManyArgs>(args?: SelectSubset<T, SyncJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SyncJob.
     * @param {SyncJobCreateArgs} args - Arguments to create a SyncJob.
     * @example
     * // Create one SyncJob
     * const SyncJob = await prisma.syncJob.create({
     *   data: {
     *     // ... data to create a SyncJob
     *   }
     * })
     * 
     */
    create<T extends SyncJobCreateArgs>(args: SelectSubset<T, SyncJobCreateArgs<ExtArgs>>): Prisma__SyncJobClient<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SyncJobs.
     * @param {SyncJobCreateManyArgs} args - Arguments to create many SyncJobs.
     * @example
     * // Create many SyncJobs
     * const syncJob = await prisma.syncJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SyncJobCreateManyArgs>(args?: SelectSubset<T, SyncJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SyncJobs and returns the data saved in the database.
     * @param {SyncJobCreateManyAndReturnArgs} args - Arguments to create many SyncJobs.
     * @example
     * // Create many SyncJobs
     * const syncJob = await prisma.syncJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SyncJobs and only return the `id`
     * const syncJobWithIdOnly = await prisma.syncJob.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SyncJobCreateManyAndReturnArgs>(args?: SelectSubset<T, SyncJobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SyncJob.
     * @param {SyncJobDeleteArgs} args - Arguments to delete one SyncJob.
     * @example
     * // Delete one SyncJob
     * const SyncJob = await prisma.syncJob.delete({
     *   where: {
     *     // ... filter to delete one SyncJob
     *   }
     * })
     * 
     */
    delete<T extends SyncJobDeleteArgs>(args: SelectSubset<T, SyncJobDeleteArgs<ExtArgs>>): Prisma__SyncJobClient<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SyncJob.
     * @param {SyncJobUpdateArgs} args - Arguments to update one SyncJob.
     * @example
     * // Update one SyncJob
     * const syncJob = await prisma.syncJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SyncJobUpdateArgs>(args: SelectSubset<T, SyncJobUpdateArgs<ExtArgs>>): Prisma__SyncJobClient<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SyncJobs.
     * @param {SyncJobDeleteManyArgs} args - Arguments to filter SyncJobs to delete.
     * @example
     * // Delete a few SyncJobs
     * const { count } = await prisma.syncJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SyncJobDeleteManyArgs>(args?: SelectSubset<T, SyncJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SyncJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SyncJobs
     * const syncJob = await prisma.syncJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SyncJobUpdateManyArgs>(args: SelectSubset<T, SyncJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SyncJobs and returns the data updated in the database.
     * @param {SyncJobUpdateManyAndReturnArgs} args - Arguments to update many SyncJobs.
     * @example
     * // Update many SyncJobs
     * const syncJob = await prisma.syncJob.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SyncJobs and only return the `id`
     * const syncJobWithIdOnly = await prisma.syncJob.updateManyAndReturn({
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
    updateManyAndReturn<T extends SyncJobUpdateManyAndReturnArgs>(args: SelectSubset<T, SyncJobUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SyncJob.
     * @param {SyncJobUpsertArgs} args - Arguments to update or create a SyncJob.
     * @example
     * // Update or create a SyncJob
     * const syncJob = await prisma.syncJob.upsert({
     *   create: {
     *     // ... data to create a SyncJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SyncJob we want to update
     *   }
     * })
     */
    upsert<T extends SyncJobUpsertArgs>(args: SelectSubset<T, SyncJobUpsertArgs<ExtArgs>>): Prisma__SyncJobClient<$Result.GetResult<Prisma.$SyncJobPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SyncJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncJobCountArgs} args - Arguments to filter SyncJobs to count.
     * @example
     * // Count the number of SyncJobs
     * const count = await prisma.syncJob.count({
     *   where: {
     *     // ... the filter for the SyncJobs we want to count
     *   }
     * })
    **/
    count<T extends SyncJobCountArgs>(
      args?: Subset<T, SyncJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SyncJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SyncJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SyncJobAggregateArgs>(args: Subset<T, SyncJobAggregateArgs>): Prisma.PrismaPromise<GetSyncJobAggregateType<T>>

    /**
     * Group by SyncJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SyncJobGroupByArgs} args - Group by arguments.
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
      T extends SyncJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SyncJobGroupByArgs['orderBy'] }
        : { orderBy?: SyncJobGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SyncJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSyncJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SyncJob model
   */
  readonly fields: SyncJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SyncJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SyncJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    connector<T extends ConnectorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ConnectorDefaultArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the SyncJob model
   */
  interface SyncJobFieldRefs {
    readonly id: FieldRef<"SyncJob", 'String'>
    readonly connectorId: FieldRef<"SyncJob", 'String'>
    readonly jobType: FieldRef<"SyncJob", 'SyncJobType'>
    readonly strategy: FieldRef<"SyncJob", 'SyncStrategy'>
    readonly options: FieldRef<"SyncJob", 'Json'>
    readonly status: FieldRef<"SyncJob", 'JobStatus'>
    readonly startedAt: FieldRef<"SyncJob", 'DateTime'>
    readonly completedAt: FieldRef<"SyncJob", 'DateTime'>
    readonly duration: FieldRef<"SyncJob", 'Int'>
    readonly recordsProcessed: FieldRef<"SyncJob", 'Int'>
    readonly recordsSucceeded: FieldRef<"SyncJob", 'Int'>
    readonly recordsFailed: FieldRef<"SyncJob", 'Int'>
    readonly errorMessage: FieldRef<"SyncJob", 'String'>
    readonly errorDetails: FieldRef<"SyncJob", 'Json'>
    readonly correlationId: FieldRef<"SyncJob", 'String'>
    readonly triggerType: FieldRef<"SyncJob", 'TriggerType'>
    readonly triggeredBy: FieldRef<"SyncJob", 'String'>
    readonly createdAt: FieldRef<"SyncJob", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SyncJob findUnique
   */
  export type SyncJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    /**
     * Filter, which SyncJob to fetch.
     */
    where: SyncJobWhereUniqueInput
  }

  /**
   * SyncJob findUniqueOrThrow
   */
  export type SyncJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    /**
     * Filter, which SyncJob to fetch.
     */
    where: SyncJobWhereUniqueInput
  }

  /**
   * SyncJob findFirst
   */
  export type SyncJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    /**
     * Filter, which SyncJob to fetch.
     */
    where?: SyncJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SyncJobs to fetch.
     */
    orderBy?: SyncJobOrderByWithRelationInput | SyncJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SyncJobs.
     */
    cursor?: SyncJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SyncJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SyncJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SyncJobs.
     */
    distinct?: SyncJobScalarFieldEnum | SyncJobScalarFieldEnum[]
  }

  /**
   * SyncJob findFirstOrThrow
   */
  export type SyncJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    /**
     * Filter, which SyncJob to fetch.
     */
    where?: SyncJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SyncJobs to fetch.
     */
    orderBy?: SyncJobOrderByWithRelationInput | SyncJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SyncJobs.
     */
    cursor?: SyncJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SyncJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SyncJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SyncJobs.
     */
    distinct?: SyncJobScalarFieldEnum | SyncJobScalarFieldEnum[]
  }

  /**
   * SyncJob findMany
   */
  export type SyncJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    /**
     * Filter, which SyncJobs to fetch.
     */
    where?: SyncJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SyncJobs to fetch.
     */
    orderBy?: SyncJobOrderByWithRelationInput | SyncJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SyncJobs.
     */
    cursor?: SyncJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SyncJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SyncJobs.
     */
    skip?: number
    distinct?: SyncJobScalarFieldEnum | SyncJobScalarFieldEnum[]
  }

  /**
   * SyncJob create
   */
  export type SyncJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    /**
     * The data needed to create a SyncJob.
     */
    data: XOR<SyncJobCreateInput, SyncJobUncheckedCreateInput>
  }

  /**
   * SyncJob createMany
   */
  export type SyncJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SyncJobs.
     */
    data: SyncJobCreateManyInput | SyncJobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SyncJob createManyAndReturn
   */
  export type SyncJobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * The data used to create many SyncJobs.
     */
    data: SyncJobCreateManyInput | SyncJobCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SyncJob update
   */
  export type SyncJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    /**
     * The data needed to update a SyncJob.
     */
    data: XOR<SyncJobUpdateInput, SyncJobUncheckedUpdateInput>
    /**
     * Choose, which SyncJob to update.
     */
    where: SyncJobWhereUniqueInput
  }

  /**
   * SyncJob updateMany
   */
  export type SyncJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SyncJobs.
     */
    data: XOR<SyncJobUpdateManyMutationInput, SyncJobUncheckedUpdateManyInput>
    /**
     * Filter which SyncJobs to update
     */
    where?: SyncJobWhereInput
    /**
     * Limit how many SyncJobs to update.
     */
    limit?: number
  }

  /**
   * SyncJob updateManyAndReturn
   */
  export type SyncJobUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * The data used to update SyncJobs.
     */
    data: XOR<SyncJobUpdateManyMutationInput, SyncJobUncheckedUpdateManyInput>
    /**
     * Filter which SyncJobs to update
     */
    where?: SyncJobWhereInput
    /**
     * Limit how many SyncJobs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SyncJob upsert
   */
  export type SyncJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    /**
     * The filter to search for the SyncJob to update in case it exists.
     */
    where: SyncJobWhereUniqueInput
    /**
     * In case the SyncJob found by the `where` argument doesn't exist, create a new SyncJob with this data.
     */
    create: XOR<SyncJobCreateInput, SyncJobUncheckedCreateInput>
    /**
     * In case the SyncJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SyncJobUpdateInput, SyncJobUncheckedUpdateInput>
  }

  /**
   * SyncJob delete
   */
  export type SyncJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
    /**
     * Filter which SyncJob to delete.
     */
    where: SyncJobWhereUniqueInput
  }

  /**
   * SyncJob deleteMany
   */
  export type SyncJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SyncJobs to delete
     */
    where?: SyncJobWhereInput
    /**
     * Limit how many SyncJobs to delete.
     */
    limit?: number
  }

  /**
   * SyncJob without action
   */
  export type SyncJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SyncJob
     */
    select?: SyncJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SyncJob
     */
    omit?: SyncJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SyncJobInclude<ExtArgs> | null
  }


  /**
   * Model IdentityMapping
   */

  export type AggregateIdentityMapping = {
    _count: IdentityMappingCountAggregateOutputType | null
    _avg: IdentityMappingAvgAggregateOutputType | null
    _sum: IdentityMappingSumAggregateOutputType | null
    _min: IdentityMappingMinAggregateOutputType | null
    _max: IdentityMappingMaxAggregateOutputType | null
  }

  export type IdentityMappingAvgAggregateOutputType = {
    confidence: number | null
  }

  export type IdentityMappingSumAggregateOutputType = {
    confidence: number | null
  }

  export type IdentityMappingMinAggregateOutputType = {
    id: string | null
    novaUserId: string | null
    email: string | null
    emailCanonical: string | null
    confidence: number | null
    lastVerified: Date | null
    verificationMethod: string | null
    status: $Enums.MappingStatus | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type IdentityMappingMaxAggregateOutputType = {
    id: string | null
    novaUserId: string | null
    email: string | null
    emailCanonical: string | null
    confidence: number | null
    lastVerified: Date | null
    verificationMethod: string | null
    status: $Enums.MappingStatus | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type IdentityMappingCountAggregateOutputType = {
    id: number
    novaUserId: number
    email: number
    emailCanonical: number
    externalMappings: number
    confidence: number
    lastVerified: number
    verificationMethod: number
    status: number
    conflictResolution: number
    createdAt: number
    updatedAt: number
    createdBy: number
    _all: number
  }


  export type IdentityMappingAvgAggregateInputType = {
    confidence?: true
  }

  export type IdentityMappingSumAggregateInputType = {
    confidence?: true
  }

  export type IdentityMappingMinAggregateInputType = {
    id?: true
    novaUserId?: true
    email?: true
    emailCanonical?: true
    confidence?: true
    lastVerified?: true
    verificationMethod?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type IdentityMappingMaxAggregateInputType = {
    id?: true
    novaUserId?: true
    email?: true
    emailCanonical?: true
    confidence?: true
    lastVerified?: true
    verificationMethod?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type IdentityMappingCountAggregateInputType = {
    id?: true
    novaUserId?: true
    email?: true
    emailCanonical?: true
    externalMappings?: true
    confidence?: true
    lastVerified?: true
    verificationMethod?: true
    status?: true
    conflictResolution?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    _all?: true
  }

  export type IdentityMappingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IdentityMapping to aggregate.
     */
    where?: IdentityMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IdentityMappings to fetch.
     */
    orderBy?: IdentityMappingOrderByWithRelationInput | IdentityMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IdentityMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IdentityMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IdentityMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IdentityMappings
    **/
    _count?: true | IdentityMappingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IdentityMappingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IdentityMappingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IdentityMappingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IdentityMappingMaxAggregateInputType
  }

  export type GetIdentityMappingAggregateType<T extends IdentityMappingAggregateArgs> = {
        [P in keyof T & keyof AggregateIdentityMapping]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIdentityMapping[P]>
      : GetScalarType<T[P], AggregateIdentityMapping[P]>
  }




  export type IdentityMappingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IdentityMappingWhereInput
    orderBy?: IdentityMappingOrderByWithAggregationInput | IdentityMappingOrderByWithAggregationInput[]
    by: IdentityMappingScalarFieldEnum[] | IdentityMappingScalarFieldEnum
    having?: IdentityMappingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IdentityMappingCountAggregateInputType | true
    _avg?: IdentityMappingAvgAggregateInputType
    _sum?: IdentityMappingSumAggregateInputType
    _min?: IdentityMappingMinAggregateInputType
    _max?: IdentityMappingMaxAggregateInputType
  }

  export type IdentityMappingGroupByOutputType = {
    id: string
    novaUserId: string
    email: string
    emailCanonical: string
    externalMappings: JsonValue
    confidence: number
    lastVerified: Date | null
    verificationMethod: string | null
    status: $Enums.MappingStatus
    conflictResolution: JsonValue | null
    createdAt: Date
    updatedAt: Date
    createdBy: string
    _count: IdentityMappingCountAggregateOutputType | null
    _avg: IdentityMappingAvgAggregateOutputType | null
    _sum: IdentityMappingSumAggregateOutputType | null
    _min: IdentityMappingMinAggregateOutputType | null
    _max: IdentityMappingMaxAggregateOutputType | null
  }

  type GetIdentityMappingGroupByPayload<T extends IdentityMappingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IdentityMappingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IdentityMappingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IdentityMappingGroupByOutputType[P]>
            : GetScalarType<T[P], IdentityMappingGroupByOutputType[P]>
        }
      >
    >


  export type IdentityMappingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    novaUserId?: boolean
    email?: boolean
    emailCanonical?: boolean
    externalMappings?: boolean
    confidence?: boolean
    lastVerified?: boolean
    verificationMethod?: boolean
    status?: boolean
    conflictResolution?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["identityMapping"]>

  export type IdentityMappingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    novaUserId?: boolean
    email?: boolean
    emailCanonical?: boolean
    externalMappings?: boolean
    confidence?: boolean
    lastVerified?: boolean
    verificationMethod?: boolean
    status?: boolean
    conflictResolution?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["identityMapping"]>

  export type IdentityMappingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    novaUserId?: boolean
    email?: boolean
    emailCanonical?: boolean
    externalMappings?: boolean
    confidence?: boolean
    lastVerified?: boolean
    verificationMethod?: boolean
    status?: boolean
    conflictResolution?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["identityMapping"]>

  export type IdentityMappingSelectScalar = {
    id?: boolean
    novaUserId?: boolean
    email?: boolean
    emailCanonical?: boolean
    externalMappings?: boolean
    confidence?: boolean
    lastVerified?: boolean
    verificationMethod?: boolean
    status?: boolean
    conflictResolution?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }

  export type IdentityMappingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "novaUserId" | "email" | "emailCanonical" | "externalMappings" | "confidence" | "lastVerified" | "verificationMethod" | "status" | "conflictResolution" | "createdAt" | "updatedAt" | "createdBy", ExtArgs["result"]["identityMapping"]>

  export type $IdentityMappingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IdentityMapping"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      novaUserId: string
      email: string
      emailCanonical: string
      externalMappings: Prisma.JsonValue
      confidence: number
      lastVerified: Date | null
      verificationMethod: string | null
      status: $Enums.MappingStatus
      conflictResolution: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
      createdBy: string
    }, ExtArgs["result"]["identityMapping"]>
    composites: {}
  }

  type IdentityMappingGetPayload<S extends boolean | null | undefined | IdentityMappingDefaultArgs> = $Result.GetResult<Prisma.$IdentityMappingPayload, S>

  type IdentityMappingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IdentityMappingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IdentityMappingCountAggregateInputType | true
    }

  export interface IdentityMappingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IdentityMapping'], meta: { name: 'IdentityMapping' } }
    /**
     * Find zero or one IdentityMapping that matches the filter.
     * @param {IdentityMappingFindUniqueArgs} args - Arguments to find a IdentityMapping
     * @example
     * // Get one IdentityMapping
     * const identityMapping = await prisma.identityMapping.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IdentityMappingFindUniqueArgs>(args: SelectSubset<T, IdentityMappingFindUniqueArgs<ExtArgs>>): Prisma__IdentityMappingClient<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one IdentityMapping that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IdentityMappingFindUniqueOrThrowArgs} args - Arguments to find a IdentityMapping
     * @example
     * // Get one IdentityMapping
     * const identityMapping = await prisma.identityMapping.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IdentityMappingFindUniqueOrThrowArgs>(args: SelectSubset<T, IdentityMappingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IdentityMappingClient<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IdentityMapping that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityMappingFindFirstArgs} args - Arguments to find a IdentityMapping
     * @example
     * // Get one IdentityMapping
     * const identityMapping = await prisma.identityMapping.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IdentityMappingFindFirstArgs>(args?: SelectSubset<T, IdentityMappingFindFirstArgs<ExtArgs>>): Prisma__IdentityMappingClient<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IdentityMapping that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityMappingFindFirstOrThrowArgs} args - Arguments to find a IdentityMapping
     * @example
     * // Get one IdentityMapping
     * const identityMapping = await prisma.identityMapping.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IdentityMappingFindFirstOrThrowArgs>(args?: SelectSubset<T, IdentityMappingFindFirstOrThrowArgs<ExtArgs>>): Prisma__IdentityMappingClient<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more IdentityMappings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityMappingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IdentityMappings
     * const identityMappings = await prisma.identityMapping.findMany()
     * 
     * // Get first 10 IdentityMappings
     * const identityMappings = await prisma.identityMapping.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const identityMappingWithIdOnly = await prisma.identityMapping.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IdentityMappingFindManyArgs>(args?: SelectSubset<T, IdentityMappingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a IdentityMapping.
     * @param {IdentityMappingCreateArgs} args - Arguments to create a IdentityMapping.
     * @example
     * // Create one IdentityMapping
     * const IdentityMapping = await prisma.identityMapping.create({
     *   data: {
     *     // ... data to create a IdentityMapping
     *   }
     * })
     * 
     */
    create<T extends IdentityMappingCreateArgs>(args: SelectSubset<T, IdentityMappingCreateArgs<ExtArgs>>): Prisma__IdentityMappingClient<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many IdentityMappings.
     * @param {IdentityMappingCreateManyArgs} args - Arguments to create many IdentityMappings.
     * @example
     * // Create many IdentityMappings
     * const identityMapping = await prisma.identityMapping.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IdentityMappingCreateManyArgs>(args?: SelectSubset<T, IdentityMappingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IdentityMappings and returns the data saved in the database.
     * @param {IdentityMappingCreateManyAndReturnArgs} args - Arguments to create many IdentityMappings.
     * @example
     * // Create many IdentityMappings
     * const identityMapping = await prisma.identityMapping.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IdentityMappings and only return the `id`
     * const identityMappingWithIdOnly = await prisma.identityMapping.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IdentityMappingCreateManyAndReturnArgs>(args?: SelectSubset<T, IdentityMappingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a IdentityMapping.
     * @param {IdentityMappingDeleteArgs} args - Arguments to delete one IdentityMapping.
     * @example
     * // Delete one IdentityMapping
     * const IdentityMapping = await prisma.identityMapping.delete({
     *   where: {
     *     // ... filter to delete one IdentityMapping
     *   }
     * })
     * 
     */
    delete<T extends IdentityMappingDeleteArgs>(args: SelectSubset<T, IdentityMappingDeleteArgs<ExtArgs>>): Prisma__IdentityMappingClient<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one IdentityMapping.
     * @param {IdentityMappingUpdateArgs} args - Arguments to update one IdentityMapping.
     * @example
     * // Update one IdentityMapping
     * const identityMapping = await prisma.identityMapping.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IdentityMappingUpdateArgs>(args: SelectSubset<T, IdentityMappingUpdateArgs<ExtArgs>>): Prisma__IdentityMappingClient<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more IdentityMappings.
     * @param {IdentityMappingDeleteManyArgs} args - Arguments to filter IdentityMappings to delete.
     * @example
     * // Delete a few IdentityMappings
     * const { count } = await prisma.identityMapping.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IdentityMappingDeleteManyArgs>(args?: SelectSubset<T, IdentityMappingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IdentityMappings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityMappingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IdentityMappings
     * const identityMapping = await prisma.identityMapping.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IdentityMappingUpdateManyArgs>(args: SelectSubset<T, IdentityMappingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IdentityMappings and returns the data updated in the database.
     * @param {IdentityMappingUpdateManyAndReturnArgs} args - Arguments to update many IdentityMappings.
     * @example
     * // Update many IdentityMappings
     * const identityMapping = await prisma.identityMapping.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more IdentityMappings and only return the `id`
     * const identityMappingWithIdOnly = await prisma.identityMapping.updateManyAndReturn({
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
    updateManyAndReturn<T extends IdentityMappingUpdateManyAndReturnArgs>(args: SelectSubset<T, IdentityMappingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one IdentityMapping.
     * @param {IdentityMappingUpsertArgs} args - Arguments to update or create a IdentityMapping.
     * @example
     * // Update or create a IdentityMapping
     * const identityMapping = await prisma.identityMapping.upsert({
     *   create: {
     *     // ... data to create a IdentityMapping
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IdentityMapping we want to update
     *   }
     * })
     */
    upsert<T extends IdentityMappingUpsertArgs>(args: SelectSubset<T, IdentityMappingUpsertArgs<ExtArgs>>): Prisma__IdentityMappingClient<$Result.GetResult<Prisma.$IdentityMappingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of IdentityMappings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityMappingCountArgs} args - Arguments to filter IdentityMappings to count.
     * @example
     * // Count the number of IdentityMappings
     * const count = await prisma.identityMapping.count({
     *   where: {
     *     // ... the filter for the IdentityMappings we want to count
     *   }
     * })
    **/
    count<T extends IdentityMappingCountArgs>(
      args?: Subset<T, IdentityMappingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IdentityMappingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IdentityMapping.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityMappingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends IdentityMappingAggregateArgs>(args: Subset<T, IdentityMappingAggregateArgs>): Prisma.PrismaPromise<GetIdentityMappingAggregateType<T>>

    /**
     * Group by IdentityMapping.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityMappingGroupByArgs} args - Group by arguments.
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
      T extends IdentityMappingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IdentityMappingGroupByArgs['orderBy'] }
        : { orderBy?: IdentityMappingGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, IdentityMappingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIdentityMappingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IdentityMapping model
   */
  readonly fields: IdentityMappingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IdentityMapping.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IdentityMappingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the IdentityMapping model
   */
  interface IdentityMappingFieldRefs {
    readonly id: FieldRef<"IdentityMapping", 'String'>
    readonly novaUserId: FieldRef<"IdentityMapping", 'String'>
    readonly email: FieldRef<"IdentityMapping", 'String'>
    readonly emailCanonical: FieldRef<"IdentityMapping", 'String'>
    readonly externalMappings: FieldRef<"IdentityMapping", 'Json'>
    readonly confidence: FieldRef<"IdentityMapping", 'Float'>
    readonly lastVerified: FieldRef<"IdentityMapping", 'DateTime'>
    readonly verificationMethod: FieldRef<"IdentityMapping", 'String'>
    readonly status: FieldRef<"IdentityMapping", 'MappingStatus'>
    readonly conflictResolution: FieldRef<"IdentityMapping", 'Json'>
    readonly createdAt: FieldRef<"IdentityMapping", 'DateTime'>
    readonly updatedAt: FieldRef<"IdentityMapping", 'DateTime'>
    readonly createdBy: FieldRef<"IdentityMapping", 'String'>
  }
    

  // Custom InputTypes
  /**
   * IdentityMapping findUnique
   */
  export type IdentityMappingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * Filter, which IdentityMapping to fetch.
     */
    where: IdentityMappingWhereUniqueInput
  }

  /**
   * IdentityMapping findUniqueOrThrow
   */
  export type IdentityMappingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * Filter, which IdentityMapping to fetch.
     */
    where: IdentityMappingWhereUniqueInput
  }

  /**
   * IdentityMapping findFirst
   */
  export type IdentityMappingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * Filter, which IdentityMapping to fetch.
     */
    where?: IdentityMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IdentityMappings to fetch.
     */
    orderBy?: IdentityMappingOrderByWithRelationInput | IdentityMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IdentityMappings.
     */
    cursor?: IdentityMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IdentityMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IdentityMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IdentityMappings.
     */
    distinct?: IdentityMappingScalarFieldEnum | IdentityMappingScalarFieldEnum[]
  }

  /**
   * IdentityMapping findFirstOrThrow
   */
  export type IdentityMappingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * Filter, which IdentityMapping to fetch.
     */
    where?: IdentityMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IdentityMappings to fetch.
     */
    orderBy?: IdentityMappingOrderByWithRelationInput | IdentityMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IdentityMappings.
     */
    cursor?: IdentityMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IdentityMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IdentityMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IdentityMappings.
     */
    distinct?: IdentityMappingScalarFieldEnum | IdentityMappingScalarFieldEnum[]
  }

  /**
   * IdentityMapping findMany
   */
  export type IdentityMappingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * Filter, which IdentityMappings to fetch.
     */
    where?: IdentityMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IdentityMappings to fetch.
     */
    orderBy?: IdentityMappingOrderByWithRelationInput | IdentityMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IdentityMappings.
     */
    cursor?: IdentityMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IdentityMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IdentityMappings.
     */
    skip?: number
    distinct?: IdentityMappingScalarFieldEnum | IdentityMappingScalarFieldEnum[]
  }

  /**
   * IdentityMapping create
   */
  export type IdentityMappingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * The data needed to create a IdentityMapping.
     */
    data: XOR<IdentityMappingCreateInput, IdentityMappingUncheckedCreateInput>
  }

  /**
   * IdentityMapping createMany
   */
  export type IdentityMappingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IdentityMappings.
     */
    data: IdentityMappingCreateManyInput | IdentityMappingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IdentityMapping createManyAndReturn
   */
  export type IdentityMappingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * The data used to create many IdentityMappings.
     */
    data: IdentityMappingCreateManyInput | IdentityMappingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IdentityMapping update
   */
  export type IdentityMappingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * The data needed to update a IdentityMapping.
     */
    data: XOR<IdentityMappingUpdateInput, IdentityMappingUncheckedUpdateInput>
    /**
     * Choose, which IdentityMapping to update.
     */
    where: IdentityMappingWhereUniqueInput
  }

  /**
   * IdentityMapping updateMany
   */
  export type IdentityMappingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IdentityMappings.
     */
    data: XOR<IdentityMappingUpdateManyMutationInput, IdentityMappingUncheckedUpdateManyInput>
    /**
     * Filter which IdentityMappings to update
     */
    where?: IdentityMappingWhereInput
    /**
     * Limit how many IdentityMappings to update.
     */
    limit?: number
  }

  /**
   * IdentityMapping updateManyAndReturn
   */
  export type IdentityMappingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * The data used to update IdentityMappings.
     */
    data: XOR<IdentityMappingUpdateManyMutationInput, IdentityMappingUncheckedUpdateManyInput>
    /**
     * Filter which IdentityMappings to update
     */
    where?: IdentityMappingWhereInput
    /**
     * Limit how many IdentityMappings to update.
     */
    limit?: number
  }

  /**
   * IdentityMapping upsert
   */
  export type IdentityMappingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * The filter to search for the IdentityMapping to update in case it exists.
     */
    where: IdentityMappingWhereUniqueInput
    /**
     * In case the IdentityMapping found by the `where` argument doesn't exist, create a new IdentityMapping with this data.
     */
    create: XOR<IdentityMappingCreateInput, IdentityMappingUncheckedCreateInput>
    /**
     * In case the IdentityMapping was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IdentityMappingUpdateInput, IdentityMappingUncheckedUpdateInput>
  }

  /**
   * IdentityMapping delete
   */
  export type IdentityMappingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
    /**
     * Filter which IdentityMapping to delete.
     */
    where: IdentityMappingWhereUniqueInput
  }

  /**
   * IdentityMapping deleteMany
   */
  export type IdentityMappingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IdentityMappings to delete
     */
    where?: IdentityMappingWhereInput
    /**
     * Limit how many IdentityMappings to delete.
     */
    limit?: number
  }

  /**
   * IdentityMapping without action
   */
  export type IdentityMappingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityMapping
     */
    select?: IdentityMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityMapping
     */
    omit?: IdentityMappingOmit<ExtArgs> | null
  }


  /**
   * Model TransformationRule
   */

  export type AggregateTransformationRule = {
    _count: TransformationRuleCountAggregateOutputType | null
    _avg: TransformationRuleAvgAggregateOutputType | null
    _sum: TransformationRuleSumAggregateOutputType | null
    _min: TransformationRuleMinAggregateOutputType | null
    _max: TransformationRuleMaxAggregateOutputType | null
  }

  export type TransformationRuleAvgAggregateOutputType = {
    priority: number | null
    successCount: number | null
    errorCount: number | null
  }

  export type TransformationRuleSumAggregateOutputType = {
    priority: number | null
    successCount: number | null
    errorCount: number | null
  }

  export type TransformationRuleMinAggregateOutputType = {
    id: string | null
    name: string | null
    sourceConnector: string | null
    sourceField: string | null
    targetField: string | null
    transformType: $Enums.TransformationType | null
    defaultValue: string | null
    enabled: boolean | null
    priority: number | null
    lastApplied: Date | null
    successCount: number | null
    errorCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type TransformationRuleMaxAggregateOutputType = {
    id: string | null
    name: string | null
    sourceConnector: string | null
    sourceField: string | null
    targetField: string | null
    transformType: $Enums.TransformationType | null
    defaultValue: string | null
    enabled: boolean | null
    priority: number | null
    lastApplied: Date | null
    successCount: number | null
    errorCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type TransformationRuleCountAggregateOutputType = {
    id: number
    name: number
    sourceConnector: number
    sourceField: number
    targetField: number
    transformType: number
    transformConfig: number
    validationRules: number
    defaultValue: number
    enabled: number
    priority: number
    lastApplied: number
    successCount: number
    errorCount: number
    createdAt: number
    updatedAt: number
    createdBy: number
    _all: number
  }


  export type TransformationRuleAvgAggregateInputType = {
    priority?: true
    successCount?: true
    errorCount?: true
  }

  export type TransformationRuleSumAggregateInputType = {
    priority?: true
    successCount?: true
    errorCount?: true
  }

  export type TransformationRuleMinAggregateInputType = {
    id?: true
    name?: true
    sourceConnector?: true
    sourceField?: true
    targetField?: true
    transformType?: true
    defaultValue?: true
    enabled?: true
    priority?: true
    lastApplied?: true
    successCount?: true
    errorCount?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type TransformationRuleMaxAggregateInputType = {
    id?: true
    name?: true
    sourceConnector?: true
    sourceField?: true
    targetField?: true
    transformType?: true
    defaultValue?: true
    enabled?: true
    priority?: true
    lastApplied?: true
    successCount?: true
    errorCount?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type TransformationRuleCountAggregateInputType = {
    id?: true
    name?: true
    sourceConnector?: true
    sourceField?: true
    targetField?: true
    transformType?: true
    transformConfig?: true
    validationRules?: true
    defaultValue?: true
    enabled?: true
    priority?: true
    lastApplied?: true
    successCount?: true
    errorCount?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    _all?: true
  }

  export type TransformationRuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TransformationRule to aggregate.
     */
    where?: TransformationRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransformationRules to fetch.
     */
    orderBy?: TransformationRuleOrderByWithRelationInput | TransformationRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransformationRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransformationRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransformationRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TransformationRules
    **/
    _count?: true | TransformationRuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransformationRuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransformationRuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransformationRuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransformationRuleMaxAggregateInputType
  }

  export type GetTransformationRuleAggregateType<T extends TransformationRuleAggregateArgs> = {
        [P in keyof T & keyof AggregateTransformationRule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransformationRule[P]>
      : GetScalarType<T[P], AggregateTransformationRule[P]>
  }




  export type TransformationRuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransformationRuleWhereInput
    orderBy?: TransformationRuleOrderByWithAggregationInput | TransformationRuleOrderByWithAggregationInput[]
    by: TransformationRuleScalarFieldEnum[] | TransformationRuleScalarFieldEnum
    having?: TransformationRuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransformationRuleCountAggregateInputType | true
    _avg?: TransformationRuleAvgAggregateInputType
    _sum?: TransformationRuleSumAggregateInputType
    _min?: TransformationRuleMinAggregateInputType
    _max?: TransformationRuleMaxAggregateInputType
  }

  export type TransformationRuleGroupByOutputType = {
    id: string
    name: string
    sourceConnector: string
    sourceField: string
    targetField: string
    transformType: $Enums.TransformationType
    transformConfig: JsonValue
    validationRules: JsonValue | null
    defaultValue: string | null
    enabled: boolean
    priority: number
    lastApplied: Date | null
    successCount: number
    errorCount: number
    createdAt: Date
    updatedAt: Date
    createdBy: string
    _count: TransformationRuleCountAggregateOutputType | null
    _avg: TransformationRuleAvgAggregateOutputType | null
    _sum: TransformationRuleSumAggregateOutputType | null
    _min: TransformationRuleMinAggregateOutputType | null
    _max: TransformationRuleMaxAggregateOutputType | null
  }

  type GetTransformationRuleGroupByPayload<T extends TransformationRuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransformationRuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransformationRuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransformationRuleGroupByOutputType[P]>
            : GetScalarType<T[P], TransformationRuleGroupByOutputType[P]>
        }
      >
    >


  export type TransformationRuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sourceConnector?: boolean
    sourceField?: boolean
    targetField?: boolean
    transformType?: boolean
    transformConfig?: boolean
    validationRules?: boolean
    defaultValue?: boolean
    enabled?: boolean
    priority?: boolean
    lastApplied?: boolean
    successCount?: boolean
    errorCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["transformationRule"]>

  export type TransformationRuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sourceConnector?: boolean
    sourceField?: boolean
    targetField?: boolean
    transformType?: boolean
    transformConfig?: boolean
    validationRules?: boolean
    defaultValue?: boolean
    enabled?: boolean
    priority?: boolean
    lastApplied?: boolean
    successCount?: boolean
    errorCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["transformationRule"]>

  export type TransformationRuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sourceConnector?: boolean
    sourceField?: boolean
    targetField?: boolean
    transformType?: boolean
    transformConfig?: boolean
    validationRules?: boolean
    defaultValue?: boolean
    enabled?: boolean
    priority?: boolean
    lastApplied?: boolean
    successCount?: boolean
    errorCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["transformationRule"]>

  export type TransformationRuleSelectScalar = {
    id?: boolean
    name?: boolean
    sourceConnector?: boolean
    sourceField?: boolean
    targetField?: boolean
    transformType?: boolean
    transformConfig?: boolean
    validationRules?: boolean
    defaultValue?: boolean
    enabled?: boolean
    priority?: boolean
    lastApplied?: boolean
    successCount?: boolean
    errorCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }

  export type TransformationRuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "sourceConnector" | "sourceField" | "targetField" | "transformType" | "transformConfig" | "validationRules" | "defaultValue" | "enabled" | "priority" | "lastApplied" | "successCount" | "errorCount" | "createdAt" | "updatedAt" | "createdBy", ExtArgs["result"]["transformationRule"]>

  export type $TransformationRulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TransformationRule"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      sourceConnector: string
      sourceField: string
      targetField: string
      transformType: $Enums.TransformationType
      transformConfig: Prisma.JsonValue
      validationRules: Prisma.JsonValue | null
      defaultValue: string | null
      enabled: boolean
      priority: number
      lastApplied: Date | null
      successCount: number
      errorCount: number
      createdAt: Date
      updatedAt: Date
      createdBy: string
    }, ExtArgs["result"]["transformationRule"]>
    composites: {}
  }

  type TransformationRuleGetPayload<S extends boolean | null | undefined | TransformationRuleDefaultArgs> = $Result.GetResult<Prisma.$TransformationRulePayload, S>

  type TransformationRuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransformationRuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransformationRuleCountAggregateInputType | true
    }

  export interface TransformationRuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TransformationRule'], meta: { name: 'TransformationRule' } }
    /**
     * Find zero or one TransformationRule that matches the filter.
     * @param {TransformationRuleFindUniqueArgs} args - Arguments to find a TransformationRule
     * @example
     * // Get one TransformationRule
     * const transformationRule = await prisma.transformationRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransformationRuleFindUniqueArgs>(args: SelectSubset<T, TransformationRuleFindUniqueArgs<ExtArgs>>): Prisma__TransformationRuleClient<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TransformationRule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransformationRuleFindUniqueOrThrowArgs} args - Arguments to find a TransformationRule
     * @example
     * // Get one TransformationRule
     * const transformationRule = await prisma.transformationRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransformationRuleFindUniqueOrThrowArgs>(args: SelectSubset<T, TransformationRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransformationRuleClient<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TransformationRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransformationRuleFindFirstArgs} args - Arguments to find a TransformationRule
     * @example
     * // Get one TransformationRule
     * const transformationRule = await prisma.transformationRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransformationRuleFindFirstArgs>(args?: SelectSubset<T, TransformationRuleFindFirstArgs<ExtArgs>>): Prisma__TransformationRuleClient<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TransformationRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransformationRuleFindFirstOrThrowArgs} args - Arguments to find a TransformationRule
     * @example
     * // Get one TransformationRule
     * const transformationRule = await prisma.transformationRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransformationRuleFindFirstOrThrowArgs>(args?: SelectSubset<T, TransformationRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransformationRuleClient<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TransformationRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransformationRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TransformationRules
     * const transformationRules = await prisma.transformationRule.findMany()
     * 
     * // Get first 10 TransformationRules
     * const transformationRules = await prisma.transformationRule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transformationRuleWithIdOnly = await prisma.transformationRule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransformationRuleFindManyArgs>(args?: SelectSubset<T, TransformationRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TransformationRule.
     * @param {TransformationRuleCreateArgs} args - Arguments to create a TransformationRule.
     * @example
     * // Create one TransformationRule
     * const TransformationRule = await prisma.transformationRule.create({
     *   data: {
     *     // ... data to create a TransformationRule
     *   }
     * })
     * 
     */
    create<T extends TransformationRuleCreateArgs>(args: SelectSubset<T, TransformationRuleCreateArgs<ExtArgs>>): Prisma__TransformationRuleClient<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TransformationRules.
     * @param {TransformationRuleCreateManyArgs} args - Arguments to create many TransformationRules.
     * @example
     * // Create many TransformationRules
     * const transformationRule = await prisma.transformationRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransformationRuleCreateManyArgs>(args?: SelectSubset<T, TransformationRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TransformationRules and returns the data saved in the database.
     * @param {TransformationRuleCreateManyAndReturnArgs} args - Arguments to create many TransformationRules.
     * @example
     * // Create many TransformationRules
     * const transformationRule = await prisma.transformationRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TransformationRules and only return the `id`
     * const transformationRuleWithIdOnly = await prisma.transformationRule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransformationRuleCreateManyAndReturnArgs>(args?: SelectSubset<T, TransformationRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TransformationRule.
     * @param {TransformationRuleDeleteArgs} args - Arguments to delete one TransformationRule.
     * @example
     * // Delete one TransformationRule
     * const TransformationRule = await prisma.transformationRule.delete({
     *   where: {
     *     // ... filter to delete one TransformationRule
     *   }
     * })
     * 
     */
    delete<T extends TransformationRuleDeleteArgs>(args: SelectSubset<T, TransformationRuleDeleteArgs<ExtArgs>>): Prisma__TransformationRuleClient<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TransformationRule.
     * @param {TransformationRuleUpdateArgs} args - Arguments to update one TransformationRule.
     * @example
     * // Update one TransformationRule
     * const transformationRule = await prisma.transformationRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransformationRuleUpdateArgs>(args: SelectSubset<T, TransformationRuleUpdateArgs<ExtArgs>>): Prisma__TransformationRuleClient<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TransformationRules.
     * @param {TransformationRuleDeleteManyArgs} args - Arguments to filter TransformationRules to delete.
     * @example
     * // Delete a few TransformationRules
     * const { count } = await prisma.transformationRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransformationRuleDeleteManyArgs>(args?: SelectSubset<T, TransformationRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TransformationRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransformationRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TransformationRules
     * const transformationRule = await prisma.transformationRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransformationRuleUpdateManyArgs>(args: SelectSubset<T, TransformationRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TransformationRules and returns the data updated in the database.
     * @param {TransformationRuleUpdateManyAndReturnArgs} args - Arguments to update many TransformationRules.
     * @example
     * // Update many TransformationRules
     * const transformationRule = await prisma.transformationRule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TransformationRules and only return the `id`
     * const transformationRuleWithIdOnly = await prisma.transformationRule.updateManyAndReturn({
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
    updateManyAndReturn<T extends TransformationRuleUpdateManyAndReturnArgs>(args: SelectSubset<T, TransformationRuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TransformationRule.
     * @param {TransformationRuleUpsertArgs} args - Arguments to update or create a TransformationRule.
     * @example
     * // Update or create a TransformationRule
     * const transformationRule = await prisma.transformationRule.upsert({
     *   create: {
     *     // ... data to create a TransformationRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TransformationRule we want to update
     *   }
     * })
     */
    upsert<T extends TransformationRuleUpsertArgs>(args: SelectSubset<T, TransformationRuleUpsertArgs<ExtArgs>>): Prisma__TransformationRuleClient<$Result.GetResult<Prisma.$TransformationRulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TransformationRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransformationRuleCountArgs} args - Arguments to filter TransformationRules to count.
     * @example
     * // Count the number of TransformationRules
     * const count = await prisma.transformationRule.count({
     *   where: {
     *     // ... the filter for the TransformationRules we want to count
     *   }
     * })
    **/
    count<T extends TransformationRuleCountArgs>(
      args?: Subset<T, TransformationRuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransformationRuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TransformationRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransformationRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TransformationRuleAggregateArgs>(args: Subset<T, TransformationRuleAggregateArgs>): Prisma.PrismaPromise<GetTransformationRuleAggregateType<T>>

    /**
     * Group by TransformationRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransformationRuleGroupByArgs} args - Group by arguments.
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
      T extends TransformationRuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransformationRuleGroupByArgs['orderBy'] }
        : { orderBy?: TransformationRuleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TransformationRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransformationRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TransformationRule model
   */
  readonly fields: TransformationRuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TransformationRule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransformationRuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TransformationRule model
   */
  interface TransformationRuleFieldRefs {
    readonly id: FieldRef<"TransformationRule", 'String'>
    readonly name: FieldRef<"TransformationRule", 'String'>
    readonly sourceConnector: FieldRef<"TransformationRule", 'String'>
    readonly sourceField: FieldRef<"TransformationRule", 'String'>
    readonly targetField: FieldRef<"TransformationRule", 'String'>
    readonly transformType: FieldRef<"TransformationRule", 'TransformationType'>
    readonly transformConfig: FieldRef<"TransformationRule", 'Json'>
    readonly validationRules: FieldRef<"TransformationRule", 'Json'>
    readonly defaultValue: FieldRef<"TransformationRule", 'String'>
    readonly enabled: FieldRef<"TransformationRule", 'Boolean'>
    readonly priority: FieldRef<"TransformationRule", 'Int'>
    readonly lastApplied: FieldRef<"TransformationRule", 'DateTime'>
    readonly successCount: FieldRef<"TransformationRule", 'Int'>
    readonly errorCount: FieldRef<"TransformationRule", 'Int'>
    readonly createdAt: FieldRef<"TransformationRule", 'DateTime'>
    readonly updatedAt: FieldRef<"TransformationRule", 'DateTime'>
    readonly createdBy: FieldRef<"TransformationRule", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TransformationRule findUnique
   */
  export type TransformationRuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * Filter, which TransformationRule to fetch.
     */
    where: TransformationRuleWhereUniqueInput
  }

  /**
   * TransformationRule findUniqueOrThrow
   */
  export type TransformationRuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * Filter, which TransformationRule to fetch.
     */
    where: TransformationRuleWhereUniqueInput
  }

  /**
   * TransformationRule findFirst
   */
  export type TransformationRuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * Filter, which TransformationRule to fetch.
     */
    where?: TransformationRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransformationRules to fetch.
     */
    orderBy?: TransformationRuleOrderByWithRelationInput | TransformationRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TransformationRules.
     */
    cursor?: TransformationRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransformationRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransformationRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TransformationRules.
     */
    distinct?: TransformationRuleScalarFieldEnum | TransformationRuleScalarFieldEnum[]
  }

  /**
   * TransformationRule findFirstOrThrow
   */
  export type TransformationRuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * Filter, which TransformationRule to fetch.
     */
    where?: TransformationRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransformationRules to fetch.
     */
    orderBy?: TransformationRuleOrderByWithRelationInput | TransformationRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TransformationRules.
     */
    cursor?: TransformationRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransformationRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransformationRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TransformationRules.
     */
    distinct?: TransformationRuleScalarFieldEnum | TransformationRuleScalarFieldEnum[]
  }

  /**
   * TransformationRule findMany
   */
  export type TransformationRuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * Filter, which TransformationRules to fetch.
     */
    where?: TransformationRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransformationRules to fetch.
     */
    orderBy?: TransformationRuleOrderByWithRelationInput | TransformationRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TransformationRules.
     */
    cursor?: TransformationRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransformationRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransformationRules.
     */
    skip?: number
    distinct?: TransformationRuleScalarFieldEnum | TransformationRuleScalarFieldEnum[]
  }

  /**
   * TransformationRule create
   */
  export type TransformationRuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * The data needed to create a TransformationRule.
     */
    data: XOR<TransformationRuleCreateInput, TransformationRuleUncheckedCreateInput>
  }

  /**
   * TransformationRule createMany
   */
  export type TransformationRuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TransformationRules.
     */
    data: TransformationRuleCreateManyInput | TransformationRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TransformationRule createManyAndReturn
   */
  export type TransformationRuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * The data used to create many TransformationRules.
     */
    data: TransformationRuleCreateManyInput | TransformationRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TransformationRule update
   */
  export type TransformationRuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * The data needed to update a TransformationRule.
     */
    data: XOR<TransformationRuleUpdateInput, TransformationRuleUncheckedUpdateInput>
    /**
     * Choose, which TransformationRule to update.
     */
    where: TransformationRuleWhereUniqueInput
  }

  /**
   * TransformationRule updateMany
   */
  export type TransformationRuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TransformationRules.
     */
    data: XOR<TransformationRuleUpdateManyMutationInput, TransformationRuleUncheckedUpdateManyInput>
    /**
     * Filter which TransformationRules to update
     */
    where?: TransformationRuleWhereInput
    /**
     * Limit how many TransformationRules to update.
     */
    limit?: number
  }

  /**
   * TransformationRule updateManyAndReturn
   */
  export type TransformationRuleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * The data used to update TransformationRules.
     */
    data: XOR<TransformationRuleUpdateManyMutationInput, TransformationRuleUncheckedUpdateManyInput>
    /**
     * Filter which TransformationRules to update
     */
    where?: TransformationRuleWhereInput
    /**
     * Limit how many TransformationRules to update.
     */
    limit?: number
  }

  /**
   * TransformationRule upsert
   */
  export type TransformationRuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * The filter to search for the TransformationRule to update in case it exists.
     */
    where: TransformationRuleWhereUniqueInput
    /**
     * In case the TransformationRule found by the `where` argument doesn't exist, create a new TransformationRule with this data.
     */
    create: XOR<TransformationRuleCreateInput, TransformationRuleUncheckedCreateInput>
    /**
     * In case the TransformationRule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransformationRuleUpdateInput, TransformationRuleUncheckedUpdateInput>
  }

  /**
   * TransformationRule delete
   */
  export type TransformationRuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
    /**
     * Filter which TransformationRule to delete.
     */
    where: TransformationRuleWhereUniqueInput
  }

  /**
   * TransformationRule deleteMany
   */
  export type TransformationRuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TransformationRules to delete
     */
    where?: TransformationRuleWhereInput
    /**
     * Limit how many TransformationRules to delete.
     */
    limit?: number
  }

  /**
   * TransformationRule without action
   */
  export type TransformationRuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransformationRule
     */
    select?: TransformationRuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransformationRule
     */
    omit?: TransformationRuleOmit<ExtArgs> | null
  }


  /**
   * Model IntegrationEvent
   */

  export type AggregateIntegrationEvent = {
    _count: IntegrationEventCountAggregateOutputType | null
    _avg: IntegrationEventAvgAggregateOutputType | null
    _sum: IntegrationEventSumAggregateOutputType | null
    _min: IntegrationEventMinAggregateOutputType | null
    _max: IntegrationEventMaxAggregateOutputType | null
  }

  export type IntegrationEventAvgAggregateOutputType = {
    retryCount: number | null
    maxRetries: number | null
  }

  export type IntegrationEventSumAggregateOutputType = {
    retryCount: number | null
    maxRetries: number | null
  }

  export type IntegrationEventMinAggregateOutputType = {
    id: string | null
    eventType: string | null
    eventCategory: $Enums.EventCategory | null
    source: string | null
    correlationId: string | null
    status: $Enums.EventStatus | null
    processedAt: Date | null
    retryCount: number | null
    maxRetries: number | null
    errorMessage: string | null
    deadLetterQueue: boolean | null
    connectorId: string | null
    timestamp: Date | null
    expiresAt: Date | null
  }

  export type IntegrationEventMaxAggregateOutputType = {
    id: string | null
    eventType: string | null
    eventCategory: $Enums.EventCategory | null
    source: string | null
    correlationId: string | null
    status: $Enums.EventStatus | null
    processedAt: Date | null
    retryCount: number | null
    maxRetries: number | null
    errorMessage: string | null
    deadLetterQueue: boolean | null
    connectorId: string | null
    timestamp: Date | null
    expiresAt: Date | null
  }

  export type IntegrationEventCountAggregateOutputType = {
    id: number
    eventType: number
    eventCategory: number
    source: number
    data: number
    metadata: number
    correlationId: number
    status: number
    processedAt: number
    retryCount: number
    maxRetries: number
    errorMessage: number
    errorDetails: number
    deadLetterQueue: number
    connectorId: number
    timestamp: number
    expiresAt: number
    _all: number
  }


  export type IntegrationEventAvgAggregateInputType = {
    retryCount?: true
    maxRetries?: true
  }

  export type IntegrationEventSumAggregateInputType = {
    retryCount?: true
    maxRetries?: true
  }

  export type IntegrationEventMinAggregateInputType = {
    id?: true
    eventType?: true
    eventCategory?: true
    source?: true
    correlationId?: true
    status?: true
    processedAt?: true
    retryCount?: true
    maxRetries?: true
    errorMessage?: true
    deadLetterQueue?: true
    connectorId?: true
    timestamp?: true
    expiresAt?: true
  }

  export type IntegrationEventMaxAggregateInputType = {
    id?: true
    eventType?: true
    eventCategory?: true
    source?: true
    correlationId?: true
    status?: true
    processedAt?: true
    retryCount?: true
    maxRetries?: true
    errorMessage?: true
    deadLetterQueue?: true
    connectorId?: true
    timestamp?: true
    expiresAt?: true
  }

  export type IntegrationEventCountAggregateInputType = {
    id?: true
    eventType?: true
    eventCategory?: true
    source?: true
    data?: true
    metadata?: true
    correlationId?: true
    status?: true
    processedAt?: true
    retryCount?: true
    maxRetries?: true
    errorMessage?: true
    errorDetails?: true
    deadLetterQueue?: true
    connectorId?: true
    timestamp?: true
    expiresAt?: true
    _all?: true
  }

  export type IntegrationEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntegrationEvent to aggregate.
     */
    where?: IntegrationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntegrationEvents to fetch.
     */
    orderBy?: IntegrationEventOrderByWithRelationInput | IntegrationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntegrationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntegrationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntegrationEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntegrationEvents
    **/
    _count?: true | IntegrationEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IntegrationEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IntegrationEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntegrationEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntegrationEventMaxAggregateInputType
  }

  export type GetIntegrationEventAggregateType<T extends IntegrationEventAggregateArgs> = {
        [P in keyof T & keyof AggregateIntegrationEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntegrationEvent[P]>
      : GetScalarType<T[P], AggregateIntegrationEvent[P]>
  }




  export type IntegrationEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntegrationEventWhereInput
    orderBy?: IntegrationEventOrderByWithAggregationInput | IntegrationEventOrderByWithAggregationInput[]
    by: IntegrationEventScalarFieldEnum[] | IntegrationEventScalarFieldEnum
    having?: IntegrationEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntegrationEventCountAggregateInputType | true
    _avg?: IntegrationEventAvgAggregateInputType
    _sum?: IntegrationEventSumAggregateInputType
    _min?: IntegrationEventMinAggregateInputType
    _max?: IntegrationEventMaxAggregateInputType
  }

  export type IntegrationEventGroupByOutputType = {
    id: string
    eventType: string
    eventCategory: $Enums.EventCategory
    source: string
    data: JsonValue
    metadata: JsonValue | null
    correlationId: string | null
    status: $Enums.EventStatus
    processedAt: Date | null
    retryCount: number
    maxRetries: number
    errorMessage: string | null
    errorDetails: JsonValue | null
    deadLetterQueue: boolean
    connectorId: string | null
    timestamp: Date
    expiresAt: Date | null
    _count: IntegrationEventCountAggregateOutputType | null
    _avg: IntegrationEventAvgAggregateOutputType | null
    _sum: IntegrationEventSumAggregateOutputType | null
    _min: IntegrationEventMinAggregateOutputType | null
    _max: IntegrationEventMaxAggregateOutputType | null
  }

  type GetIntegrationEventGroupByPayload<T extends IntegrationEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntegrationEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntegrationEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntegrationEventGroupByOutputType[P]>
            : GetScalarType<T[P], IntegrationEventGroupByOutputType[P]>
        }
      >
    >


  export type IntegrationEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventType?: boolean
    eventCategory?: boolean
    source?: boolean
    data?: boolean
    metadata?: boolean
    correlationId?: boolean
    status?: boolean
    processedAt?: boolean
    retryCount?: boolean
    maxRetries?: boolean
    errorMessage?: boolean
    errorDetails?: boolean
    deadLetterQueue?: boolean
    connectorId?: boolean
    timestamp?: boolean
    expiresAt?: boolean
    connector?: boolean | IntegrationEvent$connectorArgs<ExtArgs>
  }, ExtArgs["result"]["integrationEvent"]>

  export type IntegrationEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventType?: boolean
    eventCategory?: boolean
    source?: boolean
    data?: boolean
    metadata?: boolean
    correlationId?: boolean
    status?: boolean
    processedAt?: boolean
    retryCount?: boolean
    maxRetries?: boolean
    errorMessage?: boolean
    errorDetails?: boolean
    deadLetterQueue?: boolean
    connectorId?: boolean
    timestamp?: boolean
    expiresAt?: boolean
    connector?: boolean | IntegrationEvent$connectorArgs<ExtArgs>
  }, ExtArgs["result"]["integrationEvent"]>

  export type IntegrationEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventType?: boolean
    eventCategory?: boolean
    source?: boolean
    data?: boolean
    metadata?: boolean
    correlationId?: boolean
    status?: boolean
    processedAt?: boolean
    retryCount?: boolean
    maxRetries?: boolean
    errorMessage?: boolean
    errorDetails?: boolean
    deadLetterQueue?: boolean
    connectorId?: boolean
    timestamp?: boolean
    expiresAt?: boolean
    connector?: boolean | IntegrationEvent$connectorArgs<ExtArgs>
  }, ExtArgs["result"]["integrationEvent"]>

  export type IntegrationEventSelectScalar = {
    id?: boolean
    eventType?: boolean
    eventCategory?: boolean
    source?: boolean
    data?: boolean
    metadata?: boolean
    correlationId?: boolean
    status?: boolean
    processedAt?: boolean
    retryCount?: boolean
    maxRetries?: boolean
    errorMessage?: boolean
    errorDetails?: boolean
    deadLetterQueue?: boolean
    connectorId?: boolean
    timestamp?: boolean
    expiresAt?: boolean
  }

  export type IntegrationEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "eventType" | "eventCategory" | "source" | "data" | "metadata" | "correlationId" | "status" | "processedAt" | "retryCount" | "maxRetries" | "errorMessage" | "errorDetails" | "deadLetterQueue" | "connectorId" | "timestamp" | "expiresAt", ExtArgs["result"]["integrationEvent"]>
  export type IntegrationEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    connector?: boolean | IntegrationEvent$connectorArgs<ExtArgs>
  }
  export type IntegrationEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    connector?: boolean | IntegrationEvent$connectorArgs<ExtArgs>
  }
  export type IntegrationEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    connector?: boolean | IntegrationEvent$connectorArgs<ExtArgs>
  }

  export type $IntegrationEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntegrationEvent"
    objects: {
      connector: Prisma.$ConnectorPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      eventType: string
      eventCategory: $Enums.EventCategory
      source: string
      data: Prisma.JsonValue
      metadata: Prisma.JsonValue | null
      correlationId: string | null
      status: $Enums.EventStatus
      processedAt: Date | null
      retryCount: number
      maxRetries: number
      errorMessage: string | null
      errorDetails: Prisma.JsonValue | null
      deadLetterQueue: boolean
      connectorId: string | null
      timestamp: Date
      expiresAt: Date | null
    }, ExtArgs["result"]["integrationEvent"]>
    composites: {}
  }

  type IntegrationEventGetPayload<S extends boolean | null | undefined | IntegrationEventDefaultArgs> = $Result.GetResult<Prisma.$IntegrationEventPayload, S>

  type IntegrationEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IntegrationEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IntegrationEventCountAggregateInputType | true
    }

  export interface IntegrationEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntegrationEvent'], meta: { name: 'IntegrationEvent' } }
    /**
     * Find zero or one IntegrationEvent that matches the filter.
     * @param {IntegrationEventFindUniqueArgs} args - Arguments to find a IntegrationEvent
     * @example
     * // Get one IntegrationEvent
     * const integrationEvent = await prisma.integrationEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntegrationEventFindUniqueArgs>(args: SelectSubset<T, IntegrationEventFindUniqueArgs<ExtArgs>>): Prisma__IntegrationEventClient<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one IntegrationEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IntegrationEventFindUniqueOrThrowArgs} args - Arguments to find a IntegrationEvent
     * @example
     * // Get one IntegrationEvent
     * const integrationEvent = await prisma.integrationEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntegrationEventFindUniqueOrThrowArgs>(args: SelectSubset<T, IntegrationEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntegrationEventClient<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IntegrationEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationEventFindFirstArgs} args - Arguments to find a IntegrationEvent
     * @example
     * // Get one IntegrationEvent
     * const integrationEvent = await prisma.integrationEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntegrationEventFindFirstArgs>(args?: SelectSubset<T, IntegrationEventFindFirstArgs<ExtArgs>>): Prisma__IntegrationEventClient<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IntegrationEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationEventFindFirstOrThrowArgs} args - Arguments to find a IntegrationEvent
     * @example
     * // Get one IntegrationEvent
     * const integrationEvent = await prisma.integrationEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntegrationEventFindFirstOrThrowArgs>(args?: SelectSubset<T, IntegrationEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntegrationEventClient<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more IntegrationEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntegrationEvents
     * const integrationEvents = await prisma.integrationEvent.findMany()
     * 
     * // Get first 10 IntegrationEvents
     * const integrationEvents = await prisma.integrationEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const integrationEventWithIdOnly = await prisma.integrationEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntegrationEventFindManyArgs>(args?: SelectSubset<T, IntegrationEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a IntegrationEvent.
     * @param {IntegrationEventCreateArgs} args - Arguments to create a IntegrationEvent.
     * @example
     * // Create one IntegrationEvent
     * const IntegrationEvent = await prisma.integrationEvent.create({
     *   data: {
     *     // ... data to create a IntegrationEvent
     *   }
     * })
     * 
     */
    create<T extends IntegrationEventCreateArgs>(args: SelectSubset<T, IntegrationEventCreateArgs<ExtArgs>>): Prisma__IntegrationEventClient<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many IntegrationEvents.
     * @param {IntegrationEventCreateManyArgs} args - Arguments to create many IntegrationEvents.
     * @example
     * // Create many IntegrationEvents
     * const integrationEvent = await prisma.integrationEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntegrationEventCreateManyArgs>(args?: SelectSubset<T, IntegrationEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntegrationEvents and returns the data saved in the database.
     * @param {IntegrationEventCreateManyAndReturnArgs} args - Arguments to create many IntegrationEvents.
     * @example
     * // Create many IntegrationEvents
     * const integrationEvent = await prisma.integrationEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntegrationEvents and only return the `id`
     * const integrationEventWithIdOnly = await prisma.integrationEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntegrationEventCreateManyAndReturnArgs>(args?: SelectSubset<T, IntegrationEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a IntegrationEvent.
     * @param {IntegrationEventDeleteArgs} args - Arguments to delete one IntegrationEvent.
     * @example
     * // Delete one IntegrationEvent
     * const IntegrationEvent = await prisma.integrationEvent.delete({
     *   where: {
     *     // ... filter to delete one IntegrationEvent
     *   }
     * })
     * 
     */
    delete<T extends IntegrationEventDeleteArgs>(args: SelectSubset<T, IntegrationEventDeleteArgs<ExtArgs>>): Prisma__IntegrationEventClient<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one IntegrationEvent.
     * @param {IntegrationEventUpdateArgs} args - Arguments to update one IntegrationEvent.
     * @example
     * // Update one IntegrationEvent
     * const integrationEvent = await prisma.integrationEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntegrationEventUpdateArgs>(args: SelectSubset<T, IntegrationEventUpdateArgs<ExtArgs>>): Prisma__IntegrationEventClient<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more IntegrationEvents.
     * @param {IntegrationEventDeleteManyArgs} args - Arguments to filter IntegrationEvents to delete.
     * @example
     * // Delete a few IntegrationEvents
     * const { count } = await prisma.integrationEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntegrationEventDeleteManyArgs>(args?: SelectSubset<T, IntegrationEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntegrationEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntegrationEvents
     * const integrationEvent = await prisma.integrationEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntegrationEventUpdateManyArgs>(args: SelectSubset<T, IntegrationEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntegrationEvents and returns the data updated in the database.
     * @param {IntegrationEventUpdateManyAndReturnArgs} args - Arguments to update many IntegrationEvents.
     * @example
     * // Update many IntegrationEvents
     * const integrationEvent = await prisma.integrationEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more IntegrationEvents and only return the `id`
     * const integrationEventWithIdOnly = await prisma.integrationEvent.updateManyAndReturn({
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
    updateManyAndReturn<T extends IntegrationEventUpdateManyAndReturnArgs>(args: SelectSubset<T, IntegrationEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one IntegrationEvent.
     * @param {IntegrationEventUpsertArgs} args - Arguments to update or create a IntegrationEvent.
     * @example
     * // Update or create a IntegrationEvent
     * const integrationEvent = await prisma.integrationEvent.upsert({
     *   create: {
     *     // ... data to create a IntegrationEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntegrationEvent we want to update
     *   }
     * })
     */
    upsert<T extends IntegrationEventUpsertArgs>(args: SelectSubset<T, IntegrationEventUpsertArgs<ExtArgs>>): Prisma__IntegrationEventClient<$Result.GetResult<Prisma.$IntegrationEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of IntegrationEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationEventCountArgs} args - Arguments to filter IntegrationEvents to count.
     * @example
     * // Count the number of IntegrationEvents
     * const count = await prisma.integrationEvent.count({
     *   where: {
     *     // ... the filter for the IntegrationEvents we want to count
     *   }
     * })
    **/
    count<T extends IntegrationEventCountArgs>(
      args?: Subset<T, IntegrationEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntegrationEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntegrationEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends IntegrationEventAggregateArgs>(args: Subset<T, IntegrationEventAggregateArgs>): Prisma.PrismaPromise<GetIntegrationEventAggregateType<T>>

    /**
     * Group by IntegrationEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationEventGroupByArgs} args - Group by arguments.
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
      T extends IntegrationEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntegrationEventGroupByArgs['orderBy'] }
        : { orderBy?: IntegrationEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, IntegrationEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntegrationEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntegrationEvent model
   */
  readonly fields: IntegrationEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntegrationEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntegrationEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    connector<T extends IntegrationEvent$connectorArgs<ExtArgs> = {}>(args?: Subset<T, IntegrationEvent$connectorArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the IntegrationEvent model
   */
  interface IntegrationEventFieldRefs {
    readonly id: FieldRef<"IntegrationEvent", 'String'>
    readonly eventType: FieldRef<"IntegrationEvent", 'String'>
    readonly eventCategory: FieldRef<"IntegrationEvent", 'EventCategory'>
    readonly source: FieldRef<"IntegrationEvent", 'String'>
    readonly data: FieldRef<"IntegrationEvent", 'Json'>
    readonly metadata: FieldRef<"IntegrationEvent", 'Json'>
    readonly correlationId: FieldRef<"IntegrationEvent", 'String'>
    readonly status: FieldRef<"IntegrationEvent", 'EventStatus'>
    readonly processedAt: FieldRef<"IntegrationEvent", 'DateTime'>
    readonly retryCount: FieldRef<"IntegrationEvent", 'Int'>
    readonly maxRetries: FieldRef<"IntegrationEvent", 'Int'>
    readonly errorMessage: FieldRef<"IntegrationEvent", 'String'>
    readonly errorDetails: FieldRef<"IntegrationEvent", 'Json'>
    readonly deadLetterQueue: FieldRef<"IntegrationEvent", 'Boolean'>
    readonly connectorId: FieldRef<"IntegrationEvent", 'String'>
    readonly timestamp: FieldRef<"IntegrationEvent", 'DateTime'>
    readonly expiresAt: FieldRef<"IntegrationEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IntegrationEvent findUnique
   */
  export type IntegrationEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    /**
     * Filter, which IntegrationEvent to fetch.
     */
    where: IntegrationEventWhereUniqueInput
  }

  /**
   * IntegrationEvent findUniqueOrThrow
   */
  export type IntegrationEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    /**
     * Filter, which IntegrationEvent to fetch.
     */
    where: IntegrationEventWhereUniqueInput
  }

  /**
   * IntegrationEvent findFirst
   */
  export type IntegrationEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    /**
     * Filter, which IntegrationEvent to fetch.
     */
    where?: IntegrationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntegrationEvents to fetch.
     */
    orderBy?: IntegrationEventOrderByWithRelationInput | IntegrationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntegrationEvents.
     */
    cursor?: IntegrationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntegrationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntegrationEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntegrationEvents.
     */
    distinct?: IntegrationEventScalarFieldEnum | IntegrationEventScalarFieldEnum[]
  }

  /**
   * IntegrationEvent findFirstOrThrow
   */
  export type IntegrationEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    /**
     * Filter, which IntegrationEvent to fetch.
     */
    where?: IntegrationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntegrationEvents to fetch.
     */
    orderBy?: IntegrationEventOrderByWithRelationInput | IntegrationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntegrationEvents.
     */
    cursor?: IntegrationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntegrationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntegrationEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntegrationEvents.
     */
    distinct?: IntegrationEventScalarFieldEnum | IntegrationEventScalarFieldEnum[]
  }

  /**
   * IntegrationEvent findMany
   */
  export type IntegrationEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    /**
     * Filter, which IntegrationEvents to fetch.
     */
    where?: IntegrationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntegrationEvents to fetch.
     */
    orderBy?: IntegrationEventOrderByWithRelationInput | IntegrationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntegrationEvents.
     */
    cursor?: IntegrationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntegrationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntegrationEvents.
     */
    skip?: number
    distinct?: IntegrationEventScalarFieldEnum | IntegrationEventScalarFieldEnum[]
  }

  /**
   * IntegrationEvent create
   */
  export type IntegrationEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    /**
     * The data needed to create a IntegrationEvent.
     */
    data: XOR<IntegrationEventCreateInput, IntegrationEventUncheckedCreateInput>
  }

  /**
   * IntegrationEvent createMany
   */
  export type IntegrationEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntegrationEvents.
     */
    data: IntegrationEventCreateManyInput | IntegrationEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntegrationEvent createManyAndReturn
   */
  export type IntegrationEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * The data used to create many IntegrationEvents.
     */
    data: IntegrationEventCreateManyInput | IntegrationEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * IntegrationEvent update
   */
  export type IntegrationEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    /**
     * The data needed to update a IntegrationEvent.
     */
    data: XOR<IntegrationEventUpdateInput, IntegrationEventUncheckedUpdateInput>
    /**
     * Choose, which IntegrationEvent to update.
     */
    where: IntegrationEventWhereUniqueInput
  }

  /**
   * IntegrationEvent updateMany
   */
  export type IntegrationEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntegrationEvents.
     */
    data: XOR<IntegrationEventUpdateManyMutationInput, IntegrationEventUncheckedUpdateManyInput>
    /**
     * Filter which IntegrationEvents to update
     */
    where?: IntegrationEventWhereInput
    /**
     * Limit how many IntegrationEvents to update.
     */
    limit?: number
  }

  /**
   * IntegrationEvent updateManyAndReturn
   */
  export type IntegrationEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * The data used to update IntegrationEvents.
     */
    data: XOR<IntegrationEventUpdateManyMutationInput, IntegrationEventUncheckedUpdateManyInput>
    /**
     * Filter which IntegrationEvents to update
     */
    where?: IntegrationEventWhereInput
    /**
     * Limit how many IntegrationEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * IntegrationEvent upsert
   */
  export type IntegrationEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    /**
     * The filter to search for the IntegrationEvent to update in case it exists.
     */
    where: IntegrationEventWhereUniqueInput
    /**
     * In case the IntegrationEvent found by the `where` argument doesn't exist, create a new IntegrationEvent with this data.
     */
    create: XOR<IntegrationEventCreateInput, IntegrationEventUncheckedCreateInput>
    /**
     * In case the IntegrationEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntegrationEventUpdateInput, IntegrationEventUncheckedUpdateInput>
  }

  /**
   * IntegrationEvent delete
   */
  export type IntegrationEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
    /**
     * Filter which IntegrationEvent to delete.
     */
    where: IntegrationEventWhereUniqueInput
  }

  /**
   * IntegrationEvent deleteMany
   */
  export type IntegrationEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntegrationEvents to delete
     */
    where?: IntegrationEventWhereInput
    /**
     * Limit how many IntegrationEvents to delete.
     */
    limit?: number
  }

  /**
   * IntegrationEvent.connector
   */
  export type IntegrationEvent$connectorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Connector
     */
    select?: ConnectorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Connector
     */
    omit?: ConnectorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorInclude<ExtArgs> | null
    where?: ConnectorWhereInput
  }

  /**
   * IntegrationEvent without action
   */
  export type IntegrationEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationEvent
     */
    select?: IntegrationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationEvent
     */
    omit?: IntegrationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IntegrationEventInclude<ExtArgs> | null
  }


  /**
   * Model ConnectorMetric
   */

  export type AggregateConnectorMetric = {
    _count: ConnectorMetricCountAggregateOutputType | null
    _avg: ConnectorMetricAvgAggregateOutputType | null
    _sum: ConnectorMetricSumAggregateOutputType | null
    _min: ConnectorMetricMinAggregateOutputType | null
    _max: ConnectorMetricMaxAggregateOutputType | null
  }

  export type ConnectorMetricAvgAggregateOutputType = {
    value: number | null
    interval: number | null
  }

  export type ConnectorMetricSumAggregateOutputType = {
    value: number | null
    interval: number | null
  }

  export type ConnectorMetricMinAggregateOutputType = {
    id: string | null
    connectorId: string | null
    metricType: $Enums.MetricType | null
    metricName: string | null
    value: number | null
    unit: string | null
    timestamp: Date | null
    interval: number | null
  }

  export type ConnectorMetricMaxAggregateOutputType = {
    id: string | null
    connectorId: string | null
    metricType: $Enums.MetricType | null
    metricName: string | null
    value: number | null
    unit: string | null
    timestamp: Date | null
    interval: number | null
  }

  export type ConnectorMetricCountAggregateOutputType = {
    id: number
    connectorId: number
    metricType: number
    metricName: number
    value: number
    unit: number
    dimensions: number
    tags: number
    timestamp: number
    interval: number
    _all: number
  }


  export type ConnectorMetricAvgAggregateInputType = {
    value?: true
    interval?: true
  }

  export type ConnectorMetricSumAggregateInputType = {
    value?: true
    interval?: true
  }

  export type ConnectorMetricMinAggregateInputType = {
    id?: true
    connectorId?: true
    metricType?: true
    metricName?: true
    value?: true
    unit?: true
    timestamp?: true
    interval?: true
  }

  export type ConnectorMetricMaxAggregateInputType = {
    id?: true
    connectorId?: true
    metricType?: true
    metricName?: true
    value?: true
    unit?: true
    timestamp?: true
    interval?: true
  }

  export type ConnectorMetricCountAggregateInputType = {
    id?: true
    connectorId?: true
    metricType?: true
    metricName?: true
    value?: true
    unit?: true
    dimensions?: true
    tags?: true
    timestamp?: true
    interval?: true
    _all?: true
  }

  export type ConnectorMetricAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConnectorMetric to aggregate.
     */
    where?: ConnectorMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectorMetrics to fetch.
     */
    orderBy?: ConnectorMetricOrderByWithRelationInput | ConnectorMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConnectorMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectorMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectorMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConnectorMetrics
    **/
    _count?: true | ConnectorMetricCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ConnectorMetricAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ConnectorMetricSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConnectorMetricMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConnectorMetricMaxAggregateInputType
  }

  export type GetConnectorMetricAggregateType<T extends ConnectorMetricAggregateArgs> = {
        [P in keyof T & keyof AggregateConnectorMetric]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConnectorMetric[P]>
      : GetScalarType<T[P], AggregateConnectorMetric[P]>
  }




  export type ConnectorMetricGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConnectorMetricWhereInput
    orderBy?: ConnectorMetricOrderByWithAggregationInput | ConnectorMetricOrderByWithAggregationInput[]
    by: ConnectorMetricScalarFieldEnum[] | ConnectorMetricScalarFieldEnum
    having?: ConnectorMetricScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConnectorMetricCountAggregateInputType | true
    _avg?: ConnectorMetricAvgAggregateInputType
    _sum?: ConnectorMetricSumAggregateInputType
    _min?: ConnectorMetricMinAggregateInputType
    _max?: ConnectorMetricMaxAggregateInputType
  }

  export type ConnectorMetricGroupByOutputType = {
    id: string
    connectorId: string
    metricType: $Enums.MetricType
    metricName: string
    value: number
    unit: string | null
    dimensions: JsonValue | null
    tags: string[]
    timestamp: Date
    interval: number | null
    _count: ConnectorMetricCountAggregateOutputType | null
    _avg: ConnectorMetricAvgAggregateOutputType | null
    _sum: ConnectorMetricSumAggregateOutputType | null
    _min: ConnectorMetricMinAggregateOutputType | null
    _max: ConnectorMetricMaxAggregateOutputType | null
  }

  type GetConnectorMetricGroupByPayload<T extends ConnectorMetricGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConnectorMetricGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConnectorMetricGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConnectorMetricGroupByOutputType[P]>
            : GetScalarType<T[P], ConnectorMetricGroupByOutputType[P]>
        }
      >
    >


  export type ConnectorMetricSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    connectorId?: boolean
    metricType?: boolean
    metricName?: boolean
    value?: boolean
    unit?: boolean
    dimensions?: boolean
    tags?: boolean
    timestamp?: boolean
    interval?: boolean
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["connectorMetric"]>

  export type ConnectorMetricSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    connectorId?: boolean
    metricType?: boolean
    metricName?: boolean
    value?: boolean
    unit?: boolean
    dimensions?: boolean
    tags?: boolean
    timestamp?: boolean
    interval?: boolean
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["connectorMetric"]>

  export type ConnectorMetricSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    connectorId?: boolean
    metricType?: boolean
    metricName?: boolean
    value?: boolean
    unit?: boolean
    dimensions?: boolean
    tags?: boolean
    timestamp?: boolean
    interval?: boolean
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["connectorMetric"]>

  export type ConnectorMetricSelectScalar = {
    id?: boolean
    connectorId?: boolean
    metricType?: boolean
    metricName?: boolean
    value?: boolean
    unit?: boolean
    dimensions?: boolean
    tags?: boolean
    timestamp?: boolean
    interval?: boolean
  }

  export type ConnectorMetricOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "connectorId" | "metricType" | "metricName" | "value" | "unit" | "dimensions" | "tags" | "timestamp" | "interval", ExtArgs["result"]["connectorMetric"]>
  export type ConnectorMetricInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }
  export type ConnectorMetricIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }
  export type ConnectorMetricIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    connector?: boolean | ConnectorDefaultArgs<ExtArgs>
  }

  export type $ConnectorMetricPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConnectorMetric"
    objects: {
      connector: Prisma.$ConnectorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      connectorId: string
      metricType: $Enums.MetricType
      metricName: string
      value: number
      unit: string | null
      dimensions: Prisma.JsonValue | null
      tags: string[]
      timestamp: Date
      interval: number | null
    }, ExtArgs["result"]["connectorMetric"]>
    composites: {}
  }

  type ConnectorMetricGetPayload<S extends boolean | null | undefined | ConnectorMetricDefaultArgs> = $Result.GetResult<Prisma.$ConnectorMetricPayload, S>

  type ConnectorMetricCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConnectorMetricFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConnectorMetricCountAggregateInputType | true
    }

  export interface ConnectorMetricDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConnectorMetric'], meta: { name: 'ConnectorMetric' } }
    /**
     * Find zero or one ConnectorMetric that matches the filter.
     * @param {ConnectorMetricFindUniqueArgs} args - Arguments to find a ConnectorMetric
     * @example
     * // Get one ConnectorMetric
     * const connectorMetric = await prisma.connectorMetric.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConnectorMetricFindUniqueArgs>(args: SelectSubset<T, ConnectorMetricFindUniqueArgs<ExtArgs>>): Prisma__ConnectorMetricClient<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConnectorMetric that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConnectorMetricFindUniqueOrThrowArgs} args - Arguments to find a ConnectorMetric
     * @example
     * // Get one ConnectorMetric
     * const connectorMetric = await prisma.connectorMetric.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConnectorMetricFindUniqueOrThrowArgs>(args: SelectSubset<T, ConnectorMetricFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConnectorMetricClient<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConnectorMetric that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorMetricFindFirstArgs} args - Arguments to find a ConnectorMetric
     * @example
     * // Get one ConnectorMetric
     * const connectorMetric = await prisma.connectorMetric.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConnectorMetricFindFirstArgs>(args?: SelectSubset<T, ConnectorMetricFindFirstArgs<ExtArgs>>): Prisma__ConnectorMetricClient<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConnectorMetric that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorMetricFindFirstOrThrowArgs} args - Arguments to find a ConnectorMetric
     * @example
     * // Get one ConnectorMetric
     * const connectorMetric = await prisma.connectorMetric.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConnectorMetricFindFirstOrThrowArgs>(args?: SelectSubset<T, ConnectorMetricFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConnectorMetricClient<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConnectorMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorMetricFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConnectorMetrics
     * const connectorMetrics = await prisma.connectorMetric.findMany()
     * 
     * // Get first 10 ConnectorMetrics
     * const connectorMetrics = await prisma.connectorMetric.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const connectorMetricWithIdOnly = await prisma.connectorMetric.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConnectorMetricFindManyArgs>(args?: SelectSubset<T, ConnectorMetricFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConnectorMetric.
     * @param {ConnectorMetricCreateArgs} args - Arguments to create a ConnectorMetric.
     * @example
     * // Create one ConnectorMetric
     * const ConnectorMetric = await prisma.connectorMetric.create({
     *   data: {
     *     // ... data to create a ConnectorMetric
     *   }
     * })
     * 
     */
    create<T extends ConnectorMetricCreateArgs>(args: SelectSubset<T, ConnectorMetricCreateArgs<ExtArgs>>): Prisma__ConnectorMetricClient<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConnectorMetrics.
     * @param {ConnectorMetricCreateManyArgs} args - Arguments to create many ConnectorMetrics.
     * @example
     * // Create many ConnectorMetrics
     * const connectorMetric = await prisma.connectorMetric.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConnectorMetricCreateManyArgs>(args?: SelectSubset<T, ConnectorMetricCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConnectorMetrics and returns the data saved in the database.
     * @param {ConnectorMetricCreateManyAndReturnArgs} args - Arguments to create many ConnectorMetrics.
     * @example
     * // Create many ConnectorMetrics
     * const connectorMetric = await prisma.connectorMetric.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConnectorMetrics and only return the `id`
     * const connectorMetricWithIdOnly = await prisma.connectorMetric.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConnectorMetricCreateManyAndReturnArgs>(args?: SelectSubset<T, ConnectorMetricCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConnectorMetric.
     * @param {ConnectorMetricDeleteArgs} args - Arguments to delete one ConnectorMetric.
     * @example
     * // Delete one ConnectorMetric
     * const ConnectorMetric = await prisma.connectorMetric.delete({
     *   where: {
     *     // ... filter to delete one ConnectorMetric
     *   }
     * })
     * 
     */
    delete<T extends ConnectorMetricDeleteArgs>(args: SelectSubset<T, ConnectorMetricDeleteArgs<ExtArgs>>): Prisma__ConnectorMetricClient<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConnectorMetric.
     * @param {ConnectorMetricUpdateArgs} args - Arguments to update one ConnectorMetric.
     * @example
     * // Update one ConnectorMetric
     * const connectorMetric = await prisma.connectorMetric.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConnectorMetricUpdateArgs>(args: SelectSubset<T, ConnectorMetricUpdateArgs<ExtArgs>>): Prisma__ConnectorMetricClient<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConnectorMetrics.
     * @param {ConnectorMetricDeleteManyArgs} args - Arguments to filter ConnectorMetrics to delete.
     * @example
     * // Delete a few ConnectorMetrics
     * const { count } = await prisma.connectorMetric.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConnectorMetricDeleteManyArgs>(args?: SelectSubset<T, ConnectorMetricDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConnectorMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorMetricUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConnectorMetrics
     * const connectorMetric = await prisma.connectorMetric.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConnectorMetricUpdateManyArgs>(args: SelectSubset<T, ConnectorMetricUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConnectorMetrics and returns the data updated in the database.
     * @param {ConnectorMetricUpdateManyAndReturnArgs} args - Arguments to update many ConnectorMetrics.
     * @example
     * // Update many ConnectorMetrics
     * const connectorMetric = await prisma.connectorMetric.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConnectorMetrics and only return the `id`
     * const connectorMetricWithIdOnly = await prisma.connectorMetric.updateManyAndReturn({
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
    updateManyAndReturn<T extends ConnectorMetricUpdateManyAndReturnArgs>(args: SelectSubset<T, ConnectorMetricUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConnectorMetric.
     * @param {ConnectorMetricUpsertArgs} args - Arguments to update or create a ConnectorMetric.
     * @example
     * // Update or create a ConnectorMetric
     * const connectorMetric = await prisma.connectorMetric.upsert({
     *   create: {
     *     // ... data to create a ConnectorMetric
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConnectorMetric we want to update
     *   }
     * })
     */
    upsert<T extends ConnectorMetricUpsertArgs>(args: SelectSubset<T, ConnectorMetricUpsertArgs<ExtArgs>>): Prisma__ConnectorMetricClient<$Result.GetResult<Prisma.$ConnectorMetricPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConnectorMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorMetricCountArgs} args - Arguments to filter ConnectorMetrics to count.
     * @example
     * // Count the number of ConnectorMetrics
     * const count = await prisma.connectorMetric.count({
     *   where: {
     *     // ... the filter for the ConnectorMetrics we want to count
     *   }
     * })
    **/
    count<T extends ConnectorMetricCountArgs>(
      args?: Subset<T, ConnectorMetricCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConnectorMetricCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConnectorMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorMetricAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConnectorMetricAggregateArgs>(args: Subset<T, ConnectorMetricAggregateArgs>): Prisma.PrismaPromise<GetConnectorMetricAggregateType<T>>

    /**
     * Group by ConnectorMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorMetricGroupByArgs} args - Group by arguments.
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
      T extends ConnectorMetricGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConnectorMetricGroupByArgs['orderBy'] }
        : { orderBy?: ConnectorMetricGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConnectorMetricGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConnectorMetricGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConnectorMetric model
   */
  readonly fields: ConnectorMetricFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConnectorMetric.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConnectorMetricClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    connector<T extends ConnectorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ConnectorDefaultArgs<ExtArgs>>): Prisma__ConnectorClient<$Result.GetResult<Prisma.$ConnectorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ConnectorMetric model
   */
  interface ConnectorMetricFieldRefs {
    readonly id: FieldRef<"ConnectorMetric", 'String'>
    readonly connectorId: FieldRef<"ConnectorMetric", 'String'>
    readonly metricType: FieldRef<"ConnectorMetric", 'MetricType'>
    readonly metricName: FieldRef<"ConnectorMetric", 'String'>
    readonly value: FieldRef<"ConnectorMetric", 'Float'>
    readonly unit: FieldRef<"ConnectorMetric", 'String'>
    readonly dimensions: FieldRef<"ConnectorMetric", 'Json'>
    readonly tags: FieldRef<"ConnectorMetric", 'String[]'>
    readonly timestamp: FieldRef<"ConnectorMetric", 'DateTime'>
    readonly interval: FieldRef<"ConnectorMetric", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ConnectorMetric findUnique
   */
  export type ConnectorMetricFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    /**
     * Filter, which ConnectorMetric to fetch.
     */
    where: ConnectorMetricWhereUniqueInput
  }

  /**
   * ConnectorMetric findUniqueOrThrow
   */
  export type ConnectorMetricFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    /**
     * Filter, which ConnectorMetric to fetch.
     */
    where: ConnectorMetricWhereUniqueInput
  }

  /**
   * ConnectorMetric findFirst
   */
  export type ConnectorMetricFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    /**
     * Filter, which ConnectorMetric to fetch.
     */
    where?: ConnectorMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectorMetrics to fetch.
     */
    orderBy?: ConnectorMetricOrderByWithRelationInput | ConnectorMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConnectorMetrics.
     */
    cursor?: ConnectorMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectorMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectorMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConnectorMetrics.
     */
    distinct?: ConnectorMetricScalarFieldEnum | ConnectorMetricScalarFieldEnum[]
  }

  /**
   * ConnectorMetric findFirstOrThrow
   */
  export type ConnectorMetricFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    /**
     * Filter, which ConnectorMetric to fetch.
     */
    where?: ConnectorMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectorMetrics to fetch.
     */
    orderBy?: ConnectorMetricOrderByWithRelationInput | ConnectorMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConnectorMetrics.
     */
    cursor?: ConnectorMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectorMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectorMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConnectorMetrics.
     */
    distinct?: ConnectorMetricScalarFieldEnum | ConnectorMetricScalarFieldEnum[]
  }

  /**
   * ConnectorMetric findMany
   */
  export type ConnectorMetricFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    /**
     * Filter, which ConnectorMetrics to fetch.
     */
    where?: ConnectorMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectorMetrics to fetch.
     */
    orderBy?: ConnectorMetricOrderByWithRelationInput | ConnectorMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConnectorMetrics.
     */
    cursor?: ConnectorMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectorMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectorMetrics.
     */
    skip?: number
    distinct?: ConnectorMetricScalarFieldEnum | ConnectorMetricScalarFieldEnum[]
  }

  /**
   * ConnectorMetric create
   */
  export type ConnectorMetricCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    /**
     * The data needed to create a ConnectorMetric.
     */
    data: XOR<ConnectorMetricCreateInput, ConnectorMetricUncheckedCreateInput>
  }

  /**
   * ConnectorMetric createMany
   */
  export type ConnectorMetricCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConnectorMetrics.
     */
    data: ConnectorMetricCreateManyInput | ConnectorMetricCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConnectorMetric createManyAndReturn
   */
  export type ConnectorMetricCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * The data used to create many ConnectorMetrics.
     */
    data: ConnectorMetricCreateManyInput | ConnectorMetricCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConnectorMetric update
   */
  export type ConnectorMetricUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    /**
     * The data needed to update a ConnectorMetric.
     */
    data: XOR<ConnectorMetricUpdateInput, ConnectorMetricUncheckedUpdateInput>
    /**
     * Choose, which ConnectorMetric to update.
     */
    where: ConnectorMetricWhereUniqueInput
  }

  /**
   * ConnectorMetric updateMany
   */
  export type ConnectorMetricUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConnectorMetrics.
     */
    data: XOR<ConnectorMetricUpdateManyMutationInput, ConnectorMetricUncheckedUpdateManyInput>
    /**
     * Filter which ConnectorMetrics to update
     */
    where?: ConnectorMetricWhereInput
    /**
     * Limit how many ConnectorMetrics to update.
     */
    limit?: number
  }

  /**
   * ConnectorMetric updateManyAndReturn
   */
  export type ConnectorMetricUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * The data used to update ConnectorMetrics.
     */
    data: XOR<ConnectorMetricUpdateManyMutationInput, ConnectorMetricUncheckedUpdateManyInput>
    /**
     * Filter which ConnectorMetrics to update
     */
    where?: ConnectorMetricWhereInput
    /**
     * Limit how many ConnectorMetrics to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConnectorMetric upsert
   */
  export type ConnectorMetricUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    /**
     * The filter to search for the ConnectorMetric to update in case it exists.
     */
    where: ConnectorMetricWhereUniqueInput
    /**
     * In case the ConnectorMetric found by the `where` argument doesn't exist, create a new ConnectorMetric with this data.
     */
    create: XOR<ConnectorMetricCreateInput, ConnectorMetricUncheckedCreateInput>
    /**
     * In case the ConnectorMetric was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConnectorMetricUpdateInput, ConnectorMetricUncheckedUpdateInput>
  }

  /**
   * ConnectorMetric delete
   */
  export type ConnectorMetricDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
    /**
     * Filter which ConnectorMetric to delete.
     */
    where: ConnectorMetricWhereUniqueInput
  }

  /**
   * ConnectorMetric deleteMany
   */
  export type ConnectorMetricDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConnectorMetrics to delete
     */
    where?: ConnectorMetricWhereInput
    /**
     * Limit how many ConnectorMetrics to delete.
     */
    limit?: number
  }

  /**
   * ConnectorMetric without action
   */
  export type ConnectorMetricDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorMetric
     */
    select?: ConnectorMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorMetric
     */
    omit?: ConnectorMetricOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConnectorMetricInclude<ExtArgs> | null
  }


  /**
   * Model DataQualityCheck
   */

  export type AggregateDataQualityCheck = {
    _count: DataQualityCheckCountAggregateOutputType | null
    _avg: DataQualityCheckAvgAggregateOutputType | null
    _sum: DataQualityCheckSumAggregateOutputType | null
    _min: DataQualityCheckMinAggregateOutputType | null
    _max: DataQualityCheckMaxAggregateOutputType | null
  }

  export type DataQualityCheckAvgAggregateOutputType = {
    score: number | null
    recordsChecked: number | null
    recordsPassed: number | null
    recordsFailed: number | null
    duration: number | null
  }

  export type DataQualityCheckSumAggregateOutputType = {
    score: number | null
    recordsChecked: number | null
    recordsPassed: number | null
    recordsFailed: number | null
    duration: number | null
  }

  export type DataQualityCheckMinAggregateOutputType = {
    id: string | null
    checkName: string | null
    checkType: $Enums.QualityCheckType | null
    dataSource: string | null
    field: string | null
    status: $Enums.QualityStatus | null
    score: number | null
    recordsChecked: number | null
    recordsPassed: number | null
    recordsFailed: number | null
    severity: $Enums.QualitySeverity | null
    executedAt: Date | null
    duration: number | null
  }

  export type DataQualityCheckMaxAggregateOutputType = {
    id: string | null
    checkName: string | null
    checkType: $Enums.QualityCheckType | null
    dataSource: string | null
    field: string | null
    status: $Enums.QualityStatus | null
    score: number | null
    recordsChecked: number | null
    recordsPassed: number | null
    recordsFailed: number | null
    severity: $Enums.QualitySeverity | null
    executedAt: Date | null
    duration: number | null
  }

  export type DataQualityCheckCountAggregateOutputType = {
    id: number
    checkName: number
    checkType: number
    dataSource: number
    field: number
    rules: number
    status: number
    score: number
    recordsChecked: number
    recordsPassed: number
    recordsFailed: number
    issues: number
    severity: number
    executedAt: number
    duration: number
    _all: number
  }


  export type DataQualityCheckAvgAggregateInputType = {
    score?: true
    recordsChecked?: true
    recordsPassed?: true
    recordsFailed?: true
    duration?: true
  }

  export type DataQualityCheckSumAggregateInputType = {
    score?: true
    recordsChecked?: true
    recordsPassed?: true
    recordsFailed?: true
    duration?: true
  }

  export type DataQualityCheckMinAggregateInputType = {
    id?: true
    checkName?: true
    checkType?: true
    dataSource?: true
    field?: true
    status?: true
    score?: true
    recordsChecked?: true
    recordsPassed?: true
    recordsFailed?: true
    severity?: true
    executedAt?: true
    duration?: true
  }

  export type DataQualityCheckMaxAggregateInputType = {
    id?: true
    checkName?: true
    checkType?: true
    dataSource?: true
    field?: true
    status?: true
    score?: true
    recordsChecked?: true
    recordsPassed?: true
    recordsFailed?: true
    severity?: true
    executedAt?: true
    duration?: true
  }

  export type DataQualityCheckCountAggregateInputType = {
    id?: true
    checkName?: true
    checkType?: true
    dataSource?: true
    field?: true
    rules?: true
    status?: true
    score?: true
    recordsChecked?: true
    recordsPassed?: true
    recordsFailed?: true
    issues?: true
    severity?: true
    executedAt?: true
    duration?: true
    _all?: true
  }

  export type DataQualityCheckAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataQualityCheck to aggregate.
     */
    where?: DataQualityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataQualityChecks to fetch.
     */
    orderBy?: DataQualityCheckOrderByWithRelationInput | DataQualityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DataQualityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataQualityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataQualityChecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DataQualityChecks
    **/
    _count?: true | DataQualityCheckCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DataQualityCheckAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DataQualityCheckSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DataQualityCheckMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DataQualityCheckMaxAggregateInputType
  }

  export type GetDataQualityCheckAggregateType<T extends DataQualityCheckAggregateArgs> = {
        [P in keyof T & keyof AggregateDataQualityCheck]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDataQualityCheck[P]>
      : GetScalarType<T[P], AggregateDataQualityCheck[P]>
  }




  export type DataQualityCheckGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DataQualityCheckWhereInput
    orderBy?: DataQualityCheckOrderByWithAggregationInput | DataQualityCheckOrderByWithAggregationInput[]
    by: DataQualityCheckScalarFieldEnum[] | DataQualityCheckScalarFieldEnum
    having?: DataQualityCheckScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DataQualityCheckCountAggregateInputType | true
    _avg?: DataQualityCheckAvgAggregateInputType
    _sum?: DataQualityCheckSumAggregateInputType
    _min?: DataQualityCheckMinAggregateInputType
    _max?: DataQualityCheckMaxAggregateInputType
  }

  export type DataQualityCheckGroupByOutputType = {
    id: string
    checkName: string
    checkType: $Enums.QualityCheckType
    dataSource: string
    field: string | null
    rules: JsonValue
    status: $Enums.QualityStatus
    score: number | null
    recordsChecked: number
    recordsPassed: number
    recordsFailed: number
    issues: JsonValue | null
    severity: $Enums.QualitySeverity
    executedAt: Date
    duration: number | null
    _count: DataQualityCheckCountAggregateOutputType | null
    _avg: DataQualityCheckAvgAggregateOutputType | null
    _sum: DataQualityCheckSumAggregateOutputType | null
    _min: DataQualityCheckMinAggregateOutputType | null
    _max: DataQualityCheckMaxAggregateOutputType | null
  }

  type GetDataQualityCheckGroupByPayload<T extends DataQualityCheckGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DataQualityCheckGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DataQualityCheckGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DataQualityCheckGroupByOutputType[P]>
            : GetScalarType<T[P], DataQualityCheckGroupByOutputType[P]>
        }
      >
    >


  export type DataQualityCheckSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    checkName?: boolean
    checkType?: boolean
    dataSource?: boolean
    field?: boolean
    rules?: boolean
    status?: boolean
    score?: boolean
    recordsChecked?: boolean
    recordsPassed?: boolean
    recordsFailed?: boolean
    issues?: boolean
    severity?: boolean
    executedAt?: boolean
    duration?: boolean
  }, ExtArgs["result"]["dataQualityCheck"]>

  export type DataQualityCheckSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    checkName?: boolean
    checkType?: boolean
    dataSource?: boolean
    field?: boolean
    rules?: boolean
    status?: boolean
    score?: boolean
    recordsChecked?: boolean
    recordsPassed?: boolean
    recordsFailed?: boolean
    issues?: boolean
    severity?: boolean
    executedAt?: boolean
    duration?: boolean
  }, ExtArgs["result"]["dataQualityCheck"]>

  export type DataQualityCheckSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    checkName?: boolean
    checkType?: boolean
    dataSource?: boolean
    field?: boolean
    rules?: boolean
    status?: boolean
    score?: boolean
    recordsChecked?: boolean
    recordsPassed?: boolean
    recordsFailed?: boolean
    issues?: boolean
    severity?: boolean
    executedAt?: boolean
    duration?: boolean
  }, ExtArgs["result"]["dataQualityCheck"]>

  export type DataQualityCheckSelectScalar = {
    id?: boolean
    checkName?: boolean
    checkType?: boolean
    dataSource?: boolean
    field?: boolean
    rules?: boolean
    status?: boolean
    score?: boolean
    recordsChecked?: boolean
    recordsPassed?: boolean
    recordsFailed?: boolean
    issues?: boolean
    severity?: boolean
    executedAt?: boolean
    duration?: boolean
  }

  export type DataQualityCheckOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "checkName" | "checkType" | "dataSource" | "field" | "rules" | "status" | "score" | "recordsChecked" | "recordsPassed" | "recordsFailed" | "issues" | "severity" | "executedAt" | "duration", ExtArgs["result"]["dataQualityCheck"]>

  export type $DataQualityCheckPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DataQualityCheck"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      checkName: string
      checkType: $Enums.QualityCheckType
      dataSource: string
      field: string | null
      rules: Prisma.JsonValue
      status: $Enums.QualityStatus
      score: number | null
      recordsChecked: number
      recordsPassed: number
      recordsFailed: number
      issues: Prisma.JsonValue | null
      severity: $Enums.QualitySeverity
      executedAt: Date
      duration: number | null
    }, ExtArgs["result"]["dataQualityCheck"]>
    composites: {}
  }

  type DataQualityCheckGetPayload<S extends boolean | null | undefined | DataQualityCheckDefaultArgs> = $Result.GetResult<Prisma.$DataQualityCheckPayload, S>

  type DataQualityCheckCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DataQualityCheckFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DataQualityCheckCountAggregateInputType | true
    }

  export interface DataQualityCheckDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DataQualityCheck'], meta: { name: 'DataQualityCheck' } }
    /**
     * Find zero or one DataQualityCheck that matches the filter.
     * @param {DataQualityCheckFindUniqueArgs} args - Arguments to find a DataQualityCheck
     * @example
     * // Get one DataQualityCheck
     * const dataQualityCheck = await prisma.dataQualityCheck.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DataQualityCheckFindUniqueArgs>(args: SelectSubset<T, DataQualityCheckFindUniqueArgs<ExtArgs>>): Prisma__DataQualityCheckClient<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DataQualityCheck that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DataQualityCheckFindUniqueOrThrowArgs} args - Arguments to find a DataQualityCheck
     * @example
     * // Get one DataQualityCheck
     * const dataQualityCheck = await prisma.dataQualityCheck.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DataQualityCheckFindUniqueOrThrowArgs>(args: SelectSubset<T, DataQualityCheckFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DataQualityCheckClient<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataQualityCheck that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataQualityCheckFindFirstArgs} args - Arguments to find a DataQualityCheck
     * @example
     * // Get one DataQualityCheck
     * const dataQualityCheck = await prisma.dataQualityCheck.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DataQualityCheckFindFirstArgs>(args?: SelectSubset<T, DataQualityCheckFindFirstArgs<ExtArgs>>): Prisma__DataQualityCheckClient<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataQualityCheck that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataQualityCheckFindFirstOrThrowArgs} args - Arguments to find a DataQualityCheck
     * @example
     * // Get one DataQualityCheck
     * const dataQualityCheck = await prisma.dataQualityCheck.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DataQualityCheckFindFirstOrThrowArgs>(args?: SelectSubset<T, DataQualityCheckFindFirstOrThrowArgs<ExtArgs>>): Prisma__DataQualityCheckClient<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DataQualityChecks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataQualityCheckFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DataQualityChecks
     * const dataQualityChecks = await prisma.dataQualityCheck.findMany()
     * 
     * // Get first 10 DataQualityChecks
     * const dataQualityChecks = await prisma.dataQualityCheck.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dataQualityCheckWithIdOnly = await prisma.dataQualityCheck.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DataQualityCheckFindManyArgs>(args?: SelectSubset<T, DataQualityCheckFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DataQualityCheck.
     * @param {DataQualityCheckCreateArgs} args - Arguments to create a DataQualityCheck.
     * @example
     * // Create one DataQualityCheck
     * const DataQualityCheck = await prisma.dataQualityCheck.create({
     *   data: {
     *     // ... data to create a DataQualityCheck
     *   }
     * })
     * 
     */
    create<T extends DataQualityCheckCreateArgs>(args: SelectSubset<T, DataQualityCheckCreateArgs<ExtArgs>>): Prisma__DataQualityCheckClient<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DataQualityChecks.
     * @param {DataQualityCheckCreateManyArgs} args - Arguments to create many DataQualityChecks.
     * @example
     * // Create many DataQualityChecks
     * const dataQualityCheck = await prisma.dataQualityCheck.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DataQualityCheckCreateManyArgs>(args?: SelectSubset<T, DataQualityCheckCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DataQualityChecks and returns the data saved in the database.
     * @param {DataQualityCheckCreateManyAndReturnArgs} args - Arguments to create many DataQualityChecks.
     * @example
     * // Create many DataQualityChecks
     * const dataQualityCheck = await prisma.dataQualityCheck.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DataQualityChecks and only return the `id`
     * const dataQualityCheckWithIdOnly = await prisma.dataQualityCheck.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DataQualityCheckCreateManyAndReturnArgs>(args?: SelectSubset<T, DataQualityCheckCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DataQualityCheck.
     * @param {DataQualityCheckDeleteArgs} args - Arguments to delete one DataQualityCheck.
     * @example
     * // Delete one DataQualityCheck
     * const DataQualityCheck = await prisma.dataQualityCheck.delete({
     *   where: {
     *     // ... filter to delete one DataQualityCheck
     *   }
     * })
     * 
     */
    delete<T extends DataQualityCheckDeleteArgs>(args: SelectSubset<T, DataQualityCheckDeleteArgs<ExtArgs>>): Prisma__DataQualityCheckClient<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DataQualityCheck.
     * @param {DataQualityCheckUpdateArgs} args - Arguments to update one DataQualityCheck.
     * @example
     * // Update one DataQualityCheck
     * const dataQualityCheck = await prisma.dataQualityCheck.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DataQualityCheckUpdateArgs>(args: SelectSubset<T, DataQualityCheckUpdateArgs<ExtArgs>>): Prisma__DataQualityCheckClient<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DataQualityChecks.
     * @param {DataQualityCheckDeleteManyArgs} args - Arguments to filter DataQualityChecks to delete.
     * @example
     * // Delete a few DataQualityChecks
     * const { count } = await prisma.dataQualityCheck.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DataQualityCheckDeleteManyArgs>(args?: SelectSubset<T, DataQualityCheckDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataQualityChecks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataQualityCheckUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DataQualityChecks
     * const dataQualityCheck = await prisma.dataQualityCheck.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DataQualityCheckUpdateManyArgs>(args: SelectSubset<T, DataQualityCheckUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataQualityChecks and returns the data updated in the database.
     * @param {DataQualityCheckUpdateManyAndReturnArgs} args - Arguments to update many DataQualityChecks.
     * @example
     * // Update many DataQualityChecks
     * const dataQualityCheck = await prisma.dataQualityCheck.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DataQualityChecks and only return the `id`
     * const dataQualityCheckWithIdOnly = await prisma.dataQualityCheck.updateManyAndReturn({
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
    updateManyAndReturn<T extends DataQualityCheckUpdateManyAndReturnArgs>(args: SelectSubset<T, DataQualityCheckUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DataQualityCheck.
     * @param {DataQualityCheckUpsertArgs} args - Arguments to update or create a DataQualityCheck.
     * @example
     * // Update or create a DataQualityCheck
     * const dataQualityCheck = await prisma.dataQualityCheck.upsert({
     *   create: {
     *     // ... data to create a DataQualityCheck
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DataQualityCheck we want to update
     *   }
     * })
     */
    upsert<T extends DataQualityCheckUpsertArgs>(args: SelectSubset<T, DataQualityCheckUpsertArgs<ExtArgs>>): Prisma__DataQualityCheckClient<$Result.GetResult<Prisma.$DataQualityCheckPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DataQualityChecks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataQualityCheckCountArgs} args - Arguments to filter DataQualityChecks to count.
     * @example
     * // Count the number of DataQualityChecks
     * const count = await prisma.dataQualityCheck.count({
     *   where: {
     *     // ... the filter for the DataQualityChecks we want to count
     *   }
     * })
    **/
    count<T extends DataQualityCheckCountArgs>(
      args?: Subset<T, DataQualityCheckCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DataQualityCheckCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DataQualityCheck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataQualityCheckAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DataQualityCheckAggregateArgs>(args: Subset<T, DataQualityCheckAggregateArgs>): Prisma.PrismaPromise<GetDataQualityCheckAggregateType<T>>

    /**
     * Group by DataQualityCheck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataQualityCheckGroupByArgs} args - Group by arguments.
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
      T extends DataQualityCheckGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DataQualityCheckGroupByArgs['orderBy'] }
        : { orderBy?: DataQualityCheckGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DataQualityCheckGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDataQualityCheckGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DataQualityCheck model
   */
  readonly fields: DataQualityCheckFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DataQualityCheck.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DataQualityCheckClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DataQualityCheck model
   */
  interface DataQualityCheckFieldRefs {
    readonly id: FieldRef<"DataQualityCheck", 'String'>
    readonly checkName: FieldRef<"DataQualityCheck", 'String'>
    readonly checkType: FieldRef<"DataQualityCheck", 'QualityCheckType'>
    readonly dataSource: FieldRef<"DataQualityCheck", 'String'>
    readonly field: FieldRef<"DataQualityCheck", 'String'>
    readonly rules: FieldRef<"DataQualityCheck", 'Json'>
    readonly status: FieldRef<"DataQualityCheck", 'QualityStatus'>
    readonly score: FieldRef<"DataQualityCheck", 'Float'>
    readonly recordsChecked: FieldRef<"DataQualityCheck", 'Int'>
    readonly recordsPassed: FieldRef<"DataQualityCheck", 'Int'>
    readonly recordsFailed: FieldRef<"DataQualityCheck", 'Int'>
    readonly issues: FieldRef<"DataQualityCheck", 'Json'>
    readonly severity: FieldRef<"DataQualityCheck", 'QualitySeverity'>
    readonly executedAt: FieldRef<"DataQualityCheck", 'DateTime'>
    readonly duration: FieldRef<"DataQualityCheck", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * DataQualityCheck findUnique
   */
  export type DataQualityCheckFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * Filter, which DataQualityCheck to fetch.
     */
    where: DataQualityCheckWhereUniqueInput
  }

  /**
   * DataQualityCheck findUniqueOrThrow
   */
  export type DataQualityCheckFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * Filter, which DataQualityCheck to fetch.
     */
    where: DataQualityCheckWhereUniqueInput
  }

  /**
   * DataQualityCheck findFirst
   */
  export type DataQualityCheckFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * Filter, which DataQualityCheck to fetch.
     */
    where?: DataQualityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataQualityChecks to fetch.
     */
    orderBy?: DataQualityCheckOrderByWithRelationInput | DataQualityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataQualityChecks.
     */
    cursor?: DataQualityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataQualityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataQualityChecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataQualityChecks.
     */
    distinct?: DataQualityCheckScalarFieldEnum | DataQualityCheckScalarFieldEnum[]
  }

  /**
   * DataQualityCheck findFirstOrThrow
   */
  export type DataQualityCheckFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * Filter, which DataQualityCheck to fetch.
     */
    where?: DataQualityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataQualityChecks to fetch.
     */
    orderBy?: DataQualityCheckOrderByWithRelationInput | DataQualityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataQualityChecks.
     */
    cursor?: DataQualityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataQualityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataQualityChecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataQualityChecks.
     */
    distinct?: DataQualityCheckScalarFieldEnum | DataQualityCheckScalarFieldEnum[]
  }

  /**
   * DataQualityCheck findMany
   */
  export type DataQualityCheckFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * Filter, which DataQualityChecks to fetch.
     */
    where?: DataQualityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataQualityChecks to fetch.
     */
    orderBy?: DataQualityCheckOrderByWithRelationInput | DataQualityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DataQualityChecks.
     */
    cursor?: DataQualityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataQualityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataQualityChecks.
     */
    skip?: number
    distinct?: DataQualityCheckScalarFieldEnum | DataQualityCheckScalarFieldEnum[]
  }

  /**
   * DataQualityCheck create
   */
  export type DataQualityCheckCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * The data needed to create a DataQualityCheck.
     */
    data: XOR<DataQualityCheckCreateInput, DataQualityCheckUncheckedCreateInput>
  }

  /**
   * DataQualityCheck createMany
   */
  export type DataQualityCheckCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DataQualityChecks.
     */
    data: DataQualityCheckCreateManyInput | DataQualityCheckCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DataQualityCheck createManyAndReturn
   */
  export type DataQualityCheckCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * The data used to create many DataQualityChecks.
     */
    data: DataQualityCheckCreateManyInput | DataQualityCheckCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DataQualityCheck update
   */
  export type DataQualityCheckUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * The data needed to update a DataQualityCheck.
     */
    data: XOR<DataQualityCheckUpdateInput, DataQualityCheckUncheckedUpdateInput>
    /**
     * Choose, which DataQualityCheck to update.
     */
    where: DataQualityCheckWhereUniqueInput
  }

  /**
   * DataQualityCheck updateMany
   */
  export type DataQualityCheckUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DataQualityChecks.
     */
    data: XOR<DataQualityCheckUpdateManyMutationInput, DataQualityCheckUncheckedUpdateManyInput>
    /**
     * Filter which DataQualityChecks to update
     */
    where?: DataQualityCheckWhereInput
    /**
     * Limit how many DataQualityChecks to update.
     */
    limit?: number
  }

  /**
   * DataQualityCheck updateManyAndReturn
   */
  export type DataQualityCheckUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * The data used to update DataQualityChecks.
     */
    data: XOR<DataQualityCheckUpdateManyMutationInput, DataQualityCheckUncheckedUpdateManyInput>
    /**
     * Filter which DataQualityChecks to update
     */
    where?: DataQualityCheckWhereInput
    /**
     * Limit how many DataQualityChecks to update.
     */
    limit?: number
  }

  /**
   * DataQualityCheck upsert
   */
  export type DataQualityCheckUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * The filter to search for the DataQualityCheck to update in case it exists.
     */
    where: DataQualityCheckWhereUniqueInput
    /**
     * In case the DataQualityCheck found by the `where` argument doesn't exist, create a new DataQualityCheck with this data.
     */
    create: XOR<DataQualityCheckCreateInput, DataQualityCheckUncheckedCreateInput>
    /**
     * In case the DataQualityCheck was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DataQualityCheckUpdateInput, DataQualityCheckUncheckedUpdateInput>
  }

  /**
   * DataQualityCheck delete
   */
  export type DataQualityCheckDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
    /**
     * Filter which DataQualityCheck to delete.
     */
    where: DataQualityCheckWhereUniqueInput
  }

  /**
   * DataQualityCheck deleteMany
   */
  export type DataQualityCheckDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataQualityChecks to delete
     */
    where?: DataQualityCheckWhereInput
    /**
     * Limit how many DataQualityChecks to delete.
     */
    limit?: number
  }

  /**
   * DataQualityCheck without action
   */
  export type DataQualityCheckDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataQualityCheck
     */
    select?: DataQualityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataQualityCheck
     */
    omit?: DataQualityCheckOmit<ExtArgs> | null
  }


  /**
   * Model IntegrationPolicy
   */

  export type AggregateIntegrationPolicy = {
    _count: IntegrationPolicyCountAggregateOutputType | null
    _avg: IntegrationPolicyAvgAggregateOutputType | null
    _sum: IntegrationPolicySumAggregateOutputType | null
    _min: IntegrationPolicyMinAggregateOutputType | null
    _max: IntegrationPolicyMaxAggregateOutputType | null
  }

  export type IntegrationPolicyAvgAggregateOutputType = {
    priority: number | null
  }

  export type IntegrationPolicySumAggregateOutputType = {
    priority: number | null
  }

  export type IntegrationPolicyMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    policyType: $Enums.PolicyType | null
    enabled: boolean | null
    priority: number | null
    enforcementMode: $Enums.EnforcementMode | null
    violationAction: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type IntegrationPolicyMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    policyType: $Enums.PolicyType | null
    enabled: boolean | null
    priority: number | null
    enforcementMode: $Enums.EnforcementMode | null
    violationAction: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type IntegrationPolicyCountAggregateOutputType = {
    id: number
    name: number
    description: number
    policyType: number
    scope: number
    rules: number
    conditions: number
    actions: number
    enabled: number
    priority: number
    enforcementMode: number
    violationAction: number
    createdAt: number
    updatedAt: number
    createdBy: number
    _all: number
  }


  export type IntegrationPolicyAvgAggregateInputType = {
    priority?: true
  }

  export type IntegrationPolicySumAggregateInputType = {
    priority?: true
  }

  export type IntegrationPolicyMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    policyType?: true
    enabled?: true
    priority?: true
    enforcementMode?: true
    violationAction?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type IntegrationPolicyMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    policyType?: true
    enabled?: true
    priority?: true
    enforcementMode?: true
    violationAction?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type IntegrationPolicyCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    policyType?: true
    scope?: true
    rules?: true
    conditions?: true
    actions?: true
    enabled?: true
    priority?: true
    enforcementMode?: true
    violationAction?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    _all?: true
  }

  export type IntegrationPolicyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntegrationPolicy to aggregate.
     */
    where?: IntegrationPolicyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntegrationPolicies to fetch.
     */
    orderBy?: IntegrationPolicyOrderByWithRelationInput | IntegrationPolicyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IntegrationPolicyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntegrationPolicies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntegrationPolicies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IntegrationPolicies
    **/
    _count?: true | IntegrationPolicyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IntegrationPolicyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IntegrationPolicySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntegrationPolicyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntegrationPolicyMaxAggregateInputType
  }

  export type GetIntegrationPolicyAggregateType<T extends IntegrationPolicyAggregateArgs> = {
        [P in keyof T & keyof AggregateIntegrationPolicy]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntegrationPolicy[P]>
      : GetScalarType<T[P], AggregateIntegrationPolicy[P]>
  }




  export type IntegrationPolicyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IntegrationPolicyWhereInput
    orderBy?: IntegrationPolicyOrderByWithAggregationInput | IntegrationPolicyOrderByWithAggregationInput[]
    by: IntegrationPolicyScalarFieldEnum[] | IntegrationPolicyScalarFieldEnum
    having?: IntegrationPolicyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntegrationPolicyCountAggregateInputType | true
    _avg?: IntegrationPolicyAvgAggregateInputType
    _sum?: IntegrationPolicySumAggregateInputType
    _min?: IntegrationPolicyMinAggregateInputType
    _max?: IntegrationPolicyMaxAggregateInputType
  }

  export type IntegrationPolicyGroupByOutputType = {
    id: string
    name: string
    description: string | null
    policyType: $Enums.PolicyType
    scope: JsonValue
    rules: JsonValue
    conditions: JsonValue | null
    actions: JsonValue | null
    enabled: boolean
    priority: number
    enforcementMode: $Enums.EnforcementMode
    violationAction: string | null
    createdAt: Date
    updatedAt: Date
    createdBy: string
    _count: IntegrationPolicyCountAggregateOutputType | null
    _avg: IntegrationPolicyAvgAggregateOutputType | null
    _sum: IntegrationPolicySumAggregateOutputType | null
    _min: IntegrationPolicyMinAggregateOutputType | null
    _max: IntegrationPolicyMaxAggregateOutputType | null
  }

  type GetIntegrationPolicyGroupByPayload<T extends IntegrationPolicyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntegrationPolicyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntegrationPolicyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntegrationPolicyGroupByOutputType[P]>
            : GetScalarType<T[P], IntegrationPolicyGroupByOutputType[P]>
        }
      >
    >


  export type IntegrationPolicySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    policyType?: boolean
    scope?: boolean
    rules?: boolean
    conditions?: boolean
    actions?: boolean
    enabled?: boolean
    priority?: boolean
    enforcementMode?: boolean
    violationAction?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["integrationPolicy"]>

  export type IntegrationPolicySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    policyType?: boolean
    scope?: boolean
    rules?: boolean
    conditions?: boolean
    actions?: boolean
    enabled?: boolean
    priority?: boolean
    enforcementMode?: boolean
    violationAction?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["integrationPolicy"]>

  export type IntegrationPolicySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    policyType?: boolean
    scope?: boolean
    rules?: boolean
    conditions?: boolean
    actions?: boolean
    enabled?: boolean
    priority?: boolean
    enforcementMode?: boolean
    violationAction?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["integrationPolicy"]>

  export type IntegrationPolicySelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    policyType?: boolean
    scope?: boolean
    rules?: boolean
    conditions?: boolean
    actions?: boolean
    enabled?: boolean
    priority?: boolean
    enforcementMode?: boolean
    violationAction?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }

  export type IntegrationPolicyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "policyType" | "scope" | "rules" | "conditions" | "actions" | "enabled" | "priority" | "enforcementMode" | "violationAction" | "createdAt" | "updatedAt" | "createdBy", ExtArgs["result"]["integrationPolicy"]>

  export type $IntegrationPolicyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IntegrationPolicy"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      policyType: $Enums.PolicyType
      scope: Prisma.JsonValue
      rules: Prisma.JsonValue
      conditions: Prisma.JsonValue | null
      actions: Prisma.JsonValue | null
      enabled: boolean
      priority: number
      enforcementMode: $Enums.EnforcementMode
      violationAction: string | null
      createdAt: Date
      updatedAt: Date
      createdBy: string
    }, ExtArgs["result"]["integrationPolicy"]>
    composites: {}
  }

  type IntegrationPolicyGetPayload<S extends boolean | null | undefined | IntegrationPolicyDefaultArgs> = $Result.GetResult<Prisma.$IntegrationPolicyPayload, S>

  type IntegrationPolicyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IntegrationPolicyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IntegrationPolicyCountAggregateInputType | true
    }

  export interface IntegrationPolicyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IntegrationPolicy'], meta: { name: 'IntegrationPolicy' } }
    /**
     * Find zero or one IntegrationPolicy that matches the filter.
     * @param {IntegrationPolicyFindUniqueArgs} args - Arguments to find a IntegrationPolicy
     * @example
     * // Get one IntegrationPolicy
     * const integrationPolicy = await prisma.integrationPolicy.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IntegrationPolicyFindUniqueArgs>(args: SelectSubset<T, IntegrationPolicyFindUniqueArgs<ExtArgs>>): Prisma__IntegrationPolicyClient<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one IntegrationPolicy that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IntegrationPolicyFindUniqueOrThrowArgs} args - Arguments to find a IntegrationPolicy
     * @example
     * // Get one IntegrationPolicy
     * const integrationPolicy = await prisma.integrationPolicy.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IntegrationPolicyFindUniqueOrThrowArgs>(args: SelectSubset<T, IntegrationPolicyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IntegrationPolicyClient<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IntegrationPolicy that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationPolicyFindFirstArgs} args - Arguments to find a IntegrationPolicy
     * @example
     * // Get one IntegrationPolicy
     * const integrationPolicy = await prisma.integrationPolicy.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IntegrationPolicyFindFirstArgs>(args?: SelectSubset<T, IntegrationPolicyFindFirstArgs<ExtArgs>>): Prisma__IntegrationPolicyClient<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IntegrationPolicy that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationPolicyFindFirstOrThrowArgs} args - Arguments to find a IntegrationPolicy
     * @example
     * // Get one IntegrationPolicy
     * const integrationPolicy = await prisma.integrationPolicy.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IntegrationPolicyFindFirstOrThrowArgs>(args?: SelectSubset<T, IntegrationPolicyFindFirstOrThrowArgs<ExtArgs>>): Prisma__IntegrationPolicyClient<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more IntegrationPolicies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationPolicyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IntegrationPolicies
     * const integrationPolicies = await prisma.integrationPolicy.findMany()
     * 
     * // Get first 10 IntegrationPolicies
     * const integrationPolicies = await prisma.integrationPolicy.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const integrationPolicyWithIdOnly = await prisma.integrationPolicy.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IntegrationPolicyFindManyArgs>(args?: SelectSubset<T, IntegrationPolicyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a IntegrationPolicy.
     * @param {IntegrationPolicyCreateArgs} args - Arguments to create a IntegrationPolicy.
     * @example
     * // Create one IntegrationPolicy
     * const IntegrationPolicy = await prisma.integrationPolicy.create({
     *   data: {
     *     // ... data to create a IntegrationPolicy
     *   }
     * })
     * 
     */
    create<T extends IntegrationPolicyCreateArgs>(args: SelectSubset<T, IntegrationPolicyCreateArgs<ExtArgs>>): Prisma__IntegrationPolicyClient<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many IntegrationPolicies.
     * @param {IntegrationPolicyCreateManyArgs} args - Arguments to create many IntegrationPolicies.
     * @example
     * // Create many IntegrationPolicies
     * const integrationPolicy = await prisma.integrationPolicy.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IntegrationPolicyCreateManyArgs>(args?: SelectSubset<T, IntegrationPolicyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IntegrationPolicies and returns the data saved in the database.
     * @param {IntegrationPolicyCreateManyAndReturnArgs} args - Arguments to create many IntegrationPolicies.
     * @example
     * // Create many IntegrationPolicies
     * const integrationPolicy = await prisma.integrationPolicy.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IntegrationPolicies and only return the `id`
     * const integrationPolicyWithIdOnly = await prisma.integrationPolicy.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IntegrationPolicyCreateManyAndReturnArgs>(args?: SelectSubset<T, IntegrationPolicyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a IntegrationPolicy.
     * @param {IntegrationPolicyDeleteArgs} args - Arguments to delete one IntegrationPolicy.
     * @example
     * // Delete one IntegrationPolicy
     * const IntegrationPolicy = await prisma.integrationPolicy.delete({
     *   where: {
     *     // ... filter to delete one IntegrationPolicy
     *   }
     * })
     * 
     */
    delete<T extends IntegrationPolicyDeleteArgs>(args: SelectSubset<T, IntegrationPolicyDeleteArgs<ExtArgs>>): Prisma__IntegrationPolicyClient<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one IntegrationPolicy.
     * @param {IntegrationPolicyUpdateArgs} args - Arguments to update one IntegrationPolicy.
     * @example
     * // Update one IntegrationPolicy
     * const integrationPolicy = await prisma.integrationPolicy.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IntegrationPolicyUpdateArgs>(args: SelectSubset<T, IntegrationPolicyUpdateArgs<ExtArgs>>): Prisma__IntegrationPolicyClient<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more IntegrationPolicies.
     * @param {IntegrationPolicyDeleteManyArgs} args - Arguments to filter IntegrationPolicies to delete.
     * @example
     * // Delete a few IntegrationPolicies
     * const { count } = await prisma.integrationPolicy.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IntegrationPolicyDeleteManyArgs>(args?: SelectSubset<T, IntegrationPolicyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntegrationPolicies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationPolicyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IntegrationPolicies
     * const integrationPolicy = await prisma.integrationPolicy.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IntegrationPolicyUpdateManyArgs>(args: SelectSubset<T, IntegrationPolicyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IntegrationPolicies and returns the data updated in the database.
     * @param {IntegrationPolicyUpdateManyAndReturnArgs} args - Arguments to update many IntegrationPolicies.
     * @example
     * // Update many IntegrationPolicies
     * const integrationPolicy = await prisma.integrationPolicy.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more IntegrationPolicies and only return the `id`
     * const integrationPolicyWithIdOnly = await prisma.integrationPolicy.updateManyAndReturn({
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
    updateManyAndReturn<T extends IntegrationPolicyUpdateManyAndReturnArgs>(args: SelectSubset<T, IntegrationPolicyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one IntegrationPolicy.
     * @param {IntegrationPolicyUpsertArgs} args - Arguments to update or create a IntegrationPolicy.
     * @example
     * // Update or create a IntegrationPolicy
     * const integrationPolicy = await prisma.integrationPolicy.upsert({
     *   create: {
     *     // ... data to create a IntegrationPolicy
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IntegrationPolicy we want to update
     *   }
     * })
     */
    upsert<T extends IntegrationPolicyUpsertArgs>(args: SelectSubset<T, IntegrationPolicyUpsertArgs<ExtArgs>>): Prisma__IntegrationPolicyClient<$Result.GetResult<Prisma.$IntegrationPolicyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of IntegrationPolicies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationPolicyCountArgs} args - Arguments to filter IntegrationPolicies to count.
     * @example
     * // Count the number of IntegrationPolicies
     * const count = await prisma.integrationPolicy.count({
     *   where: {
     *     // ... the filter for the IntegrationPolicies we want to count
     *   }
     * })
    **/
    count<T extends IntegrationPolicyCountArgs>(
      args?: Subset<T, IntegrationPolicyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntegrationPolicyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IntegrationPolicy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationPolicyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends IntegrationPolicyAggregateArgs>(args: Subset<T, IntegrationPolicyAggregateArgs>): Prisma.PrismaPromise<GetIntegrationPolicyAggregateType<T>>

    /**
     * Group by IntegrationPolicy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationPolicyGroupByArgs} args - Group by arguments.
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
      T extends IntegrationPolicyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IntegrationPolicyGroupByArgs['orderBy'] }
        : { orderBy?: IntegrationPolicyGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, IntegrationPolicyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntegrationPolicyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IntegrationPolicy model
   */
  readonly fields: IntegrationPolicyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IntegrationPolicy.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IntegrationPolicyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the IntegrationPolicy model
   */
  interface IntegrationPolicyFieldRefs {
    readonly id: FieldRef<"IntegrationPolicy", 'String'>
    readonly name: FieldRef<"IntegrationPolicy", 'String'>
    readonly description: FieldRef<"IntegrationPolicy", 'String'>
    readonly policyType: FieldRef<"IntegrationPolicy", 'PolicyType'>
    readonly scope: FieldRef<"IntegrationPolicy", 'Json'>
    readonly rules: FieldRef<"IntegrationPolicy", 'Json'>
    readonly conditions: FieldRef<"IntegrationPolicy", 'Json'>
    readonly actions: FieldRef<"IntegrationPolicy", 'Json'>
    readonly enabled: FieldRef<"IntegrationPolicy", 'Boolean'>
    readonly priority: FieldRef<"IntegrationPolicy", 'Int'>
    readonly enforcementMode: FieldRef<"IntegrationPolicy", 'EnforcementMode'>
    readonly violationAction: FieldRef<"IntegrationPolicy", 'String'>
    readonly createdAt: FieldRef<"IntegrationPolicy", 'DateTime'>
    readonly updatedAt: FieldRef<"IntegrationPolicy", 'DateTime'>
    readonly createdBy: FieldRef<"IntegrationPolicy", 'String'>
  }
    

  // Custom InputTypes
  /**
   * IntegrationPolicy findUnique
   */
  export type IntegrationPolicyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * Filter, which IntegrationPolicy to fetch.
     */
    where: IntegrationPolicyWhereUniqueInput
  }

  /**
   * IntegrationPolicy findUniqueOrThrow
   */
  export type IntegrationPolicyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * Filter, which IntegrationPolicy to fetch.
     */
    where: IntegrationPolicyWhereUniqueInput
  }

  /**
   * IntegrationPolicy findFirst
   */
  export type IntegrationPolicyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * Filter, which IntegrationPolicy to fetch.
     */
    where?: IntegrationPolicyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntegrationPolicies to fetch.
     */
    orderBy?: IntegrationPolicyOrderByWithRelationInput | IntegrationPolicyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntegrationPolicies.
     */
    cursor?: IntegrationPolicyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntegrationPolicies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntegrationPolicies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntegrationPolicies.
     */
    distinct?: IntegrationPolicyScalarFieldEnum | IntegrationPolicyScalarFieldEnum[]
  }

  /**
   * IntegrationPolicy findFirstOrThrow
   */
  export type IntegrationPolicyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * Filter, which IntegrationPolicy to fetch.
     */
    where?: IntegrationPolicyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntegrationPolicies to fetch.
     */
    orderBy?: IntegrationPolicyOrderByWithRelationInput | IntegrationPolicyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IntegrationPolicies.
     */
    cursor?: IntegrationPolicyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntegrationPolicies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntegrationPolicies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IntegrationPolicies.
     */
    distinct?: IntegrationPolicyScalarFieldEnum | IntegrationPolicyScalarFieldEnum[]
  }

  /**
   * IntegrationPolicy findMany
   */
  export type IntegrationPolicyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * Filter, which IntegrationPolicies to fetch.
     */
    where?: IntegrationPolicyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IntegrationPolicies to fetch.
     */
    orderBy?: IntegrationPolicyOrderByWithRelationInput | IntegrationPolicyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IntegrationPolicies.
     */
    cursor?: IntegrationPolicyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IntegrationPolicies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IntegrationPolicies.
     */
    skip?: number
    distinct?: IntegrationPolicyScalarFieldEnum | IntegrationPolicyScalarFieldEnum[]
  }

  /**
   * IntegrationPolicy create
   */
  export type IntegrationPolicyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * The data needed to create a IntegrationPolicy.
     */
    data: XOR<IntegrationPolicyCreateInput, IntegrationPolicyUncheckedCreateInput>
  }

  /**
   * IntegrationPolicy createMany
   */
  export type IntegrationPolicyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IntegrationPolicies.
     */
    data: IntegrationPolicyCreateManyInput | IntegrationPolicyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntegrationPolicy createManyAndReturn
   */
  export type IntegrationPolicyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * The data used to create many IntegrationPolicies.
     */
    data: IntegrationPolicyCreateManyInput | IntegrationPolicyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IntegrationPolicy update
   */
  export type IntegrationPolicyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * The data needed to update a IntegrationPolicy.
     */
    data: XOR<IntegrationPolicyUpdateInput, IntegrationPolicyUncheckedUpdateInput>
    /**
     * Choose, which IntegrationPolicy to update.
     */
    where: IntegrationPolicyWhereUniqueInput
  }

  /**
   * IntegrationPolicy updateMany
   */
  export type IntegrationPolicyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IntegrationPolicies.
     */
    data: XOR<IntegrationPolicyUpdateManyMutationInput, IntegrationPolicyUncheckedUpdateManyInput>
    /**
     * Filter which IntegrationPolicies to update
     */
    where?: IntegrationPolicyWhereInput
    /**
     * Limit how many IntegrationPolicies to update.
     */
    limit?: number
  }

  /**
   * IntegrationPolicy updateManyAndReturn
   */
  export type IntegrationPolicyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * The data used to update IntegrationPolicies.
     */
    data: XOR<IntegrationPolicyUpdateManyMutationInput, IntegrationPolicyUncheckedUpdateManyInput>
    /**
     * Filter which IntegrationPolicies to update
     */
    where?: IntegrationPolicyWhereInput
    /**
     * Limit how many IntegrationPolicies to update.
     */
    limit?: number
  }

  /**
   * IntegrationPolicy upsert
   */
  export type IntegrationPolicyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * The filter to search for the IntegrationPolicy to update in case it exists.
     */
    where: IntegrationPolicyWhereUniqueInput
    /**
     * In case the IntegrationPolicy found by the `where` argument doesn't exist, create a new IntegrationPolicy with this data.
     */
    create: XOR<IntegrationPolicyCreateInput, IntegrationPolicyUncheckedCreateInput>
    /**
     * In case the IntegrationPolicy was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IntegrationPolicyUpdateInput, IntegrationPolicyUncheckedUpdateInput>
  }

  /**
   * IntegrationPolicy delete
   */
  export type IntegrationPolicyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
    /**
     * Filter which IntegrationPolicy to delete.
     */
    where: IntegrationPolicyWhereUniqueInput
  }

  /**
   * IntegrationPolicy deleteMany
   */
  export type IntegrationPolicyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IntegrationPolicies to delete
     */
    where?: IntegrationPolicyWhereInput
    /**
     * Limit how many IntegrationPolicies to delete.
     */
    limit?: number
  }

  /**
   * IntegrationPolicy without action
   */
  export type IntegrationPolicyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntegrationPolicy
     */
    select?: IntegrationPolicySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IntegrationPolicy
     */
    omit?: IntegrationPolicyOmit<ExtArgs> | null
  }


  /**
   * Model ConnectorTemplate
   */

  export type AggregateConnectorTemplate = {
    _count: ConnectorTemplateCountAggregateOutputType | null
    _avg: ConnectorTemplateAvgAggregateOutputType | null
    _sum: ConnectorTemplateSumAggregateOutputType | null
    _min: ConnectorTemplateMinAggregateOutputType | null
    _max: ConnectorTemplateMaxAggregateOutputType | null
  }

  export type ConnectorTemplateAvgAggregateOutputType = {
    usageCount: number | null
    rating: number | null
  }

  export type ConnectorTemplateSumAggregateOutputType = {
    usageCount: number | null
    rating: number | null
  }

  export type ConnectorTemplateMinAggregateOutputType = {
    id: string | null
    name: string | null
    connectorType: $Enums.ConnectorType | null
    documentation: string | null
    category: string | null
    isOfficial: boolean | null
    version: string | null
    minNovaVersion: string | null
    maxNovaVersion: string | null
    usageCount: number | null
    rating: number | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type ConnectorTemplateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    connectorType: $Enums.ConnectorType | null
    documentation: string | null
    category: string | null
    isOfficial: boolean | null
    version: string | null
    minNovaVersion: string | null
    maxNovaVersion: string | null
    usageCount: number | null
    rating: number | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type ConnectorTemplateCountAggregateOutputType = {
    id: number
    name: number
    connectorType: number
    configTemplate: number
    validation: number
    documentation: number
    category: number
    tags: number
    isOfficial: number
    version: number
    minNovaVersion: number
    maxNovaVersion: number
    usageCount: number
    rating: number
    createdAt: number
    updatedAt: number
    createdBy: number
    _all: number
  }


  export type ConnectorTemplateAvgAggregateInputType = {
    usageCount?: true
    rating?: true
  }

  export type ConnectorTemplateSumAggregateInputType = {
    usageCount?: true
    rating?: true
  }

  export type ConnectorTemplateMinAggregateInputType = {
    id?: true
    name?: true
    connectorType?: true
    documentation?: true
    category?: true
    isOfficial?: true
    version?: true
    minNovaVersion?: true
    maxNovaVersion?: true
    usageCount?: true
    rating?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type ConnectorTemplateMaxAggregateInputType = {
    id?: true
    name?: true
    connectorType?: true
    documentation?: true
    category?: true
    isOfficial?: true
    version?: true
    minNovaVersion?: true
    maxNovaVersion?: true
    usageCount?: true
    rating?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type ConnectorTemplateCountAggregateInputType = {
    id?: true
    name?: true
    connectorType?: true
    configTemplate?: true
    validation?: true
    documentation?: true
    category?: true
    tags?: true
    isOfficial?: true
    version?: true
    minNovaVersion?: true
    maxNovaVersion?: true
    usageCount?: true
    rating?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    _all?: true
  }

  export type ConnectorTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConnectorTemplate to aggregate.
     */
    where?: ConnectorTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectorTemplates to fetch.
     */
    orderBy?: ConnectorTemplateOrderByWithRelationInput | ConnectorTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConnectorTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectorTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectorTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConnectorTemplates
    **/
    _count?: true | ConnectorTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ConnectorTemplateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ConnectorTemplateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConnectorTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConnectorTemplateMaxAggregateInputType
  }

  export type GetConnectorTemplateAggregateType<T extends ConnectorTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateConnectorTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConnectorTemplate[P]>
      : GetScalarType<T[P], AggregateConnectorTemplate[P]>
  }




  export type ConnectorTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConnectorTemplateWhereInput
    orderBy?: ConnectorTemplateOrderByWithAggregationInput | ConnectorTemplateOrderByWithAggregationInput[]
    by: ConnectorTemplateScalarFieldEnum[] | ConnectorTemplateScalarFieldEnum
    having?: ConnectorTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConnectorTemplateCountAggregateInputType | true
    _avg?: ConnectorTemplateAvgAggregateInputType
    _sum?: ConnectorTemplateSumAggregateInputType
    _min?: ConnectorTemplateMinAggregateInputType
    _max?: ConnectorTemplateMaxAggregateInputType
  }

  export type ConnectorTemplateGroupByOutputType = {
    id: string
    name: string
    connectorType: $Enums.ConnectorType
    configTemplate: JsonValue
    validation: JsonValue | null
    documentation: string | null
    category: string | null
    tags: string[]
    isOfficial: boolean
    version: string
    minNovaVersion: string | null
    maxNovaVersion: string | null
    usageCount: number
    rating: number | null
    createdAt: Date
    updatedAt: Date
    createdBy: string
    _count: ConnectorTemplateCountAggregateOutputType | null
    _avg: ConnectorTemplateAvgAggregateOutputType | null
    _sum: ConnectorTemplateSumAggregateOutputType | null
    _min: ConnectorTemplateMinAggregateOutputType | null
    _max: ConnectorTemplateMaxAggregateOutputType | null
  }

  type GetConnectorTemplateGroupByPayload<T extends ConnectorTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConnectorTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConnectorTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConnectorTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], ConnectorTemplateGroupByOutputType[P]>
        }
      >
    >


  export type ConnectorTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    connectorType?: boolean
    configTemplate?: boolean
    validation?: boolean
    documentation?: boolean
    category?: boolean
    tags?: boolean
    isOfficial?: boolean
    version?: boolean
    minNovaVersion?: boolean
    maxNovaVersion?: boolean
    usageCount?: boolean
    rating?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["connectorTemplate"]>

  export type ConnectorTemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    connectorType?: boolean
    configTemplate?: boolean
    validation?: boolean
    documentation?: boolean
    category?: boolean
    tags?: boolean
    isOfficial?: boolean
    version?: boolean
    minNovaVersion?: boolean
    maxNovaVersion?: boolean
    usageCount?: boolean
    rating?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["connectorTemplate"]>

  export type ConnectorTemplateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    connectorType?: boolean
    configTemplate?: boolean
    validation?: boolean
    documentation?: boolean
    category?: boolean
    tags?: boolean
    isOfficial?: boolean
    version?: boolean
    minNovaVersion?: boolean
    maxNovaVersion?: boolean
    usageCount?: boolean
    rating?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["connectorTemplate"]>

  export type ConnectorTemplateSelectScalar = {
    id?: boolean
    name?: boolean
    connectorType?: boolean
    configTemplate?: boolean
    validation?: boolean
    documentation?: boolean
    category?: boolean
    tags?: boolean
    isOfficial?: boolean
    version?: boolean
    minNovaVersion?: boolean
    maxNovaVersion?: boolean
    usageCount?: boolean
    rating?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }

  export type ConnectorTemplateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "connectorType" | "configTemplate" | "validation" | "documentation" | "category" | "tags" | "isOfficial" | "version" | "minNovaVersion" | "maxNovaVersion" | "usageCount" | "rating" | "createdAt" | "updatedAt" | "createdBy", ExtArgs["result"]["connectorTemplate"]>

  export type $ConnectorTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConnectorTemplate"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      connectorType: $Enums.ConnectorType
      configTemplate: Prisma.JsonValue
      validation: Prisma.JsonValue | null
      documentation: string | null
      category: string | null
      tags: string[]
      isOfficial: boolean
      version: string
      minNovaVersion: string | null
      maxNovaVersion: string | null
      usageCount: number
      rating: number | null
      createdAt: Date
      updatedAt: Date
      createdBy: string
    }, ExtArgs["result"]["connectorTemplate"]>
    composites: {}
  }

  type ConnectorTemplateGetPayload<S extends boolean | null | undefined | ConnectorTemplateDefaultArgs> = $Result.GetResult<Prisma.$ConnectorTemplatePayload, S>

  type ConnectorTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConnectorTemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConnectorTemplateCountAggregateInputType | true
    }

  export interface ConnectorTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConnectorTemplate'], meta: { name: 'ConnectorTemplate' } }
    /**
     * Find zero or one ConnectorTemplate that matches the filter.
     * @param {ConnectorTemplateFindUniqueArgs} args - Arguments to find a ConnectorTemplate
     * @example
     * // Get one ConnectorTemplate
     * const connectorTemplate = await prisma.connectorTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConnectorTemplateFindUniqueArgs>(args: SelectSubset<T, ConnectorTemplateFindUniqueArgs<ExtArgs>>): Prisma__ConnectorTemplateClient<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConnectorTemplate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConnectorTemplateFindUniqueOrThrowArgs} args - Arguments to find a ConnectorTemplate
     * @example
     * // Get one ConnectorTemplate
     * const connectorTemplate = await prisma.connectorTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConnectorTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, ConnectorTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConnectorTemplateClient<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConnectorTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorTemplateFindFirstArgs} args - Arguments to find a ConnectorTemplate
     * @example
     * // Get one ConnectorTemplate
     * const connectorTemplate = await prisma.connectorTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConnectorTemplateFindFirstArgs>(args?: SelectSubset<T, ConnectorTemplateFindFirstArgs<ExtArgs>>): Prisma__ConnectorTemplateClient<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConnectorTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorTemplateFindFirstOrThrowArgs} args - Arguments to find a ConnectorTemplate
     * @example
     * // Get one ConnectorTemplate
     * const connectorTemplate = await prisma.connectorTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConnectorTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, ConnectorTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConnectorTemplateClient<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConnectorTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConnectorTemplates
     * const connectorTemplates = await prisma.connectorTemplate.findMany()
     * 
     * // Get first 10 ConnectorTemplates
     * const connectorTemplates = await prisma.connectorTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const connectorTemplateWithIdOnly = await prisma.connectorTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConnectorTemplateFindManyArgs>(args?: SelectSubset<T, ConnectorTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConnectorTemplate.
     * @param {ConnectorTemplateCreateArgs} args - Arguments to create a ConnectorTemplate.
     * @example
     * // Create one ConnectorTemplate
     * const ConnectorTemplate = await prisma.connectorTemplate.create({
     *   data: {
     *     // ... data to create a ConnectorTemplate
     *   }
     * })
     * 
     */
    create<T extends ConnectorTemplateCreateArgs>(args: SelectSubset<T, ConnectorTemplateCreateArgs<ExtArgs>>): Prisma__ConnectorTemplateClient<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConnectorTemplates.
     * @param {ConnectorTemplateCreateManyArgs} args - Arguments to create many ConnectorTemplates.
     * @example
     * // Create many ConnectorTemplates
     * const connectorTemplate = await prisma.connectorTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConnectorTemplateCreateManyArgs>(args?: SelectSubset<T, ConnectorTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConnectorTemplates and returns the data saved in the database.
     * @param {ConnectorTemplateCreateManyAndReturnArgs} args - Arguments to create many ConnectorTemplates.
     * @example
     * // Create many ConnectorTemplates
     * const connectorTemplate = await prisma.connectorTemplate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConnectorTemplates and only return the `id`
     * const connectorTemplateWithIdOnly = await prisma.connectorTemplate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConnectorTemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, ConnectorTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConnectorTemplate.
     * @param {ConnectorTemplateDeleteArgs} args - Arguments to delete one ConnectorTemplate.
     * @example
     * // Delete one ConnectorTemplate
     * const ConnectorTemplate = await prisma.connectorTemplate.delete({
     *   where: {
     *     // ... filter to delete one ConnectorTemplate
     *   }
     * })
     * 
     */
    delete<T extends ConnectorTemplateDeleteArgs>(args: SelectSubset<T, ConnectorTemplateDeleteArgs<ExtArgs>>): Prisma__ConnectorTemplateClient<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConnectorTemplate.
     * @param {ConnectorTemplateUpdateArgs} args - Arguments to update one ConnectorTemplate.
     * @example
     * // Update one ConnectorTemplate
     * const connectorTemplate = await prisma.connectorTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConnectorTemplateUpdateArgs>(args: SelectSubset<T, ConnectorTemplateUpdateArgs<ExtArgs>>): Prisma__ConnectorTemplateClient<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConnectorTemplates.
     * @param {ConnectorTemplateDeleteManyArgs} args - Arguments to filter ConnectorTemplates to delete.
     * @example
     * // Delete a few ConnectorTemplates
     * const { count } = await prisma.connectorTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConnectorTemplateDeleteManyArgs>(args?: SelectSubset<T, ConnectorTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConnectorTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConnectorTemplates
     * const connectorTemplate = await prisma.connectorTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConnectorTemplateUpdateManyArgs>(args: SelectSubset<T, ConnectorTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConnectorTemplates and returns the data updated in the database.
     * @param {ConnectorTemplateUpdateManyAndReturnArgs} args - Arguments to update many ConnectorTemplates.
     * @example
     * // Update many ConnectorTemplates
     * const connectorTemplate = await prisma.connectorTemplate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConnectorTemplates and only return the `id`
     * const connectorTemplateWithIdOnly = await prisma.connectorTemplate.updateManyAndReturn({
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
    updateManyAndReturn<T extends ConnectorTemplateUpdateManyAndReturnArgs>(args: SelectSubset<T, ConnectorTemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConnectorTemplate.
     * @param {ConnectorTemplateUpsertArgs} args - Arguments to update or create a ConnectorTemplate.
     * @example
     * // Update or create a ConnectorTemplate
     * const connectorTemplate = await prisma.connectorTemplate.upsert({
     *   create: {
     *     // ... data to create a ConnectorTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConnectorTemplate we want to update
     *   }
     * })
     */
    upsert<T extends ConnectorTemplateUpsertArgs>(args: SelectSubset<T, ConnectorTemplateUpsertArgs<ExtArgs>>): Prisma__ConnectorTemplateClient<$Result.GetResult<Prisma.$ConnectorTemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConnectorTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorTemplateCountArgs} args - Arguments to filter ConnectorTemplates to count.
     * @example
     * // Count the number of ConnectorTemplates
     * const count = await prisma.connectorTemplate.count({
     *   where: {
     *     // ... the filter for the ConnectorTemplates we want to count
     *   }
     * })
    **/
    count<T extends ConnectorTemplateCountArgs>(
      args?: Subset<T, ConnectorTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConnectorTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConnectorTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConnectorTemplateAggregateArgs>(args: Subset<T, ConnectorTemplateAggregateArgs>): Prisma.PrismaPromise<GetConnectorTemplateAggregateType<T>>

    /**
     * Group by ConnectorTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConnectorTemplateGroupByArgs} args - Group by arguments.
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
      T extends ConnectorTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConnectorTemplateGroupByArgs['orderBy'] }
        : { orderBy?: ConnectorTemplateGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConnectorTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConnectorTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConnectorTemplate model
   */
  readonly fields: ConnectorTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConnectorTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConnectorTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ConnectorTemplate model
   */
  interface ConnectorTemplateFieldRefs {
    readonly id: FieldRef<"ConnectorTemplate", 'String'>
    readonly name: FieldRef<"ConnectorTemplate", 'String'>
    readonly connectorType: FieldRef<"ConnectorTemplate", 'ConnectorType'>
    readonly configTemplate: FieldRef<"ConnectorTemplate", 'Json'>
    readonly validation: FieldRef<"ConnectorTemplate", 'Json'>
    readonly documentation: FieldRef<"ConnectorTemplate", 'String'>
    readonly category: FieldRef<"ConnectorTemplate", 'String'>
    readonly tags: FieldRef<"ConnectorTemplate", 'String[]'>
    readonly isOfficial: FieldRef<"ConnectorTemplate", 'Boolean'>
    readonly version: FieldRef<"ConnectorTemplate", 'String'>
    readonly minNovaVersion: FieldRef<"ConnectorTemplate", 'String'>
    readonly maxNovaVersion: FieldRef<"ConnectorTemplate", 'String'>
    readonly usageCount: FieldRef<"ConnectorTemplate", 'Int'>
    readonly rating: FieldRef<"ConnectorTemplate", 'Float'>
    readonly createdAt: FieldRef<"ConnectorTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"ConnectorTemplate", 'DateTime'>
    readonly createdBy: FieldRef<"ConnectorTemplate", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ConnectorTemplate findUnique
   */
  export type ConnectorTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * Filter, which ConnectorTemplate to fetch.
     */
    where: ConnectorTemplateWhereUniqueInput
  }

  /**
   * ConnectorTemplate findUniqueOrThrow
   */
  export type ConnectorTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * Filter, which ConnectorTemplate to fetch.
     */
    where: ConnectorTemplateWhereUniqueInput
  }

  /**
   * ConnectorTemplate findFirst
   */
  export type ConnectorTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * Filter, which ConnectorTemplate to fetch.
     */
    where?: ConnectorTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectorTemplates to fetch.
     */
    orderBy?: ConnectorTemplateOrderByWithRelationInput | ConnectorTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConnectorTemplates.
     */
    cursor?: ConnectorTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectorTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectorTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConnectorTemplates.
     */
    distinct?: ConnectorTemplateScalarFieldEnum | ConnectorTemplateScalarFieldEnum[]
  }

  /**
   * ConnectorTemplate findFirstOrThrow
   */
  export type ConnectorTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * Filter, which ConnectorTemplate to fetch.
     */
    where?: ConnectorTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectorTemplates to fetch.
     */
    orderBy?: ConnectorTemplateOrderByWithRelationInput | ConnectorTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConnectorTemplates.
     */
    cursor?: ConnectorTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectorTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectorTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConnectorTemplates.
     */
    distinct?: ConnectorTemplateScalarFieldEnum | ConnectorTemplateScalarFieldEnum[]
  }

  /**
   * ConnectorTemplate findMany
   */
  export type ConnectorTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * Filter, which ConnectorTemplates to fetch.
     */
    where?: ConnectorTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConnectorTemplates to fetch.
     */
    orderBy?: ConnectorTemplateOrderByWithRelationInput | ConnectorTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConnectorTemplates.
     */
    cursor?: ConnectorTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConnectorTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConnectorTemplates.
     */
    skip?: number
    distinct?: ConnectorTemplateScalarFieldEnum | ConnectorTemplateScalarFieldEnum[]
  }

  /**
   * ConnectorTemplate create
   */
  export type ConnectorTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * The data needed to create a ConnectorTemplate.
     */
    data: XOR<ConnectorTemplateCreateInput, ConnectorTemplateUncheckedCreateInput>
  }

  /**
   * ConnectorTemplate createMany
   */
  export type ConnectorTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConnectorTemplates.
     */
    data: ConnectorTemplateCreateManyInput | ConnectorTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConnectorTemplate createManyAndReturn
   */
  export type ConnectorTemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * The data used to create many ConnectorTemplates.
     */
    data: ConnectorTemplateCreateManyInput | ConnectorTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConnectorTemplate update
   */
  export type ConnectorTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * The data needed to update a ConnectorTemplate.
     */
    data: XOR<ConnectorTemplateUpdateInput, ConnectorTemplateUncheckedUpdateInput>
    /**
     * Choose, which ConnectorTemplate to update.
     */
    where: ConnectorTemplateWhereUniqueInput
  }

  /**
   * ConnectorTemplate updateMany
   */
  export type ConnectorTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConnectorTemplates.
     */
    data: XOR<ConnectorTemplateUpdateManyMutationInput, ConnectorTemplateUncheckedUpdateManyInput>
    /**
     * Filter which ConnectorTemplates to update
     */
    where?: ConnectorTemplateWhereInput
    /**
     * Limit how many ConnectorTemplates to update.
     */
    limit?: number
  }

  /**
   * ConnectorTemplate updateManyAndReturn
   */
  export type ConnectorTemplateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * The data used to update ConnectorTemplates.
     */
    data: XOR<ConnectorTemplateUpdateManyMutationInput, ConnectorTemplateUncheckedUpdateManyInput>
    /**
     * Filter which ConnectorTemplates to update
     */
    where?: ConnectorTemplateWhereInput
    /**
     * Limit how many ConnectorTemplates to update.
     */
    limit?: number
  }

  /**
   * ConnectorTemplate upsert
   */
  export type ConnectorTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * The filter to search for the ConnectorTemplate to update in case it exists.
     */
    where: ConnectorTemplateWhereUniqueInput
    /**
     * In case the ConnectorTemplate found by the `where` argument doesn't exist, create a new ConnectorTemplate with this data.
     */
    create: XOR<ConnectorTemplateCreateInput, ConnectorTemplateUncheckedCreateInput>
    /**
     * In case the ConnectorTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConnectorTemplateUpdateInput, ConnectorTemplateUncheckedUpdateInput>
  }

  /**
   * ConnectorTemplate delete
   */
  export type ConnectorTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
    /**
     * Filter which ConnectorTemplate to delete.
     */
    where: ConnectorTemplateWhereUniqueInput
  }

  /**
   * ConnectorTemplate deleteMany
   */
  export type ConnectorTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConnectorTemplates to delete
     */
    where?: ConnectorTemplateWhereInput
    /**
     * Limit how many ConnectorTemplates to delete.
     */
    limit?: number
  }

  /**
   * ConnectorTemplate without action
   */
  export type ConnectorTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConnectorTemplate
     */
    select?: ConnectorTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConnectorTemplate
     */
    omit?: ConnectorTemplateOmit<ExtArgs> | null
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


  export const ConnectorScalarFieldEnum: {
    id: 'id',
    name: 'name',
    type: 'type',
    version: 'version',
    provider: 'provider',
    config: 'config',
    capabilities: 'capabilities',
    status: 'status',
    health: 'health',
    lastHealthCheck: 'lastHealthCheck',
    lastSync: 'lastSync',
    nextSync: 'nextSync',
    syncEnabled: 'syncEnabled',
    syncInterval: 'syncInterval',
    syncStrategy: 'syncStrategy',
    rateLimitPerMin: 'rateLimitPerMin',
    rateLimitPerHour: 'rateLimitPerHour',
    encryptionKey: 'encryptionKey',
    certificate: 'certificate',
    tenantId: 'tenantId',
    createdBy: 'createdBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ConnectorScalarFieldEnum = (typeof ConnectorScalarFieldEnum)[keyof typeof ConnectorScalarFieldEnum]


  export const SyncJobScalarFieldEnum: {
    id: 'id',
    connectorId: 'connectorId',
    jobType: 'jobType',
    strategy: 'strategy',
    options: 'options',
    status: 'status',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    duration: 'duration',
    recordsProcessed: 'recordsProcessed',
    recordsSucceeded: 'recordsSucceeded',
    recordsFailed: 'recordsFailed',
    errorMessage: 'errorMessage',
    errorDetails: 'errorDetails',
    correlationId: 'correlationId',
    triggerType: 'triggerType',
    triggeredBy: 'triggeredBy',
    createdAt: 'createdAt'
  };

  export type SyncJobScalarFieldEnum = (typeof SyncJobScalarFieldEnum)[keyof typeof SyncJobScalarFieldEnum]


  export const IdentityMappingScalarFieldEnum: {
    id: 'id',
    novaUserId: 'novaUserId',
    email: 'email',
    emailCanonical: 'emailCanonical',
    externalMappings: 'externalMappings',
    confidence: 'confidence',
    lastVerified: 'lastVerified',
    verificationMethod: 'verificationMethod',
    status: 'status',
    conflictResolution: 'conflictResolution',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy'
  };

  export type IdentityMappingScalarFieldEnum = (typeof IdentityMappingScalarFieldEnum)[keyof typeof IdentityMappingScalarFieldEnum]


  export const TransformationRuleScalarFieldEnum: {
    id: 'id',
    name: 'name',
    sourceConnector: 'sourceConnector',
    sourceField: 'sourceField',
    targetField: 'targetField',
    transformType: 'transformType',
    transformConfig: 'transformConfig',
    validationRules: 'validationRules',
    defaultValue: 'defaultValue',
    enabled: 'enabled',
    priority: 'priority',
    lastApplied: 'lastApplied',
    successCount: 'successCount',
    errorCount: 'errorCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy'
  };

  export type TransformationRuleScalarFieldEnum = (typeof TransformationRuleScalarFieldEnum)[keyof typeof TransformationRuleScalarFieldEnum]


  export const IntegrationEventScalarFieldEnum: {
    id: 'id',
    eventType: 'eventType',
    eventCategory: 'eventCategory',
    source: 'source',
    data: 'data',
    metadata: 'metadata',
    correlationId: 'correlationId',
    status: 'status',
    processedAt: 'processedAt',
    retryCount: 'retryCount',
    maxRetries: 'maxRetries',
    errorMessage: 'errorMessage',
    errorDetails: 'errorDetails',
    deadLetterQueue: 'deadLetterQueue',
    connectorId: 'connectorId',
    timestamp: 'timestamp',
    expiresAt: 'expiresAt'
  };

  export type IntegrationEventScalarFieldEnum = (typeof IntegrationEventScalarFieldEnum)[keyof typeof IntegrationEventScalarFieldEnum]


  export const ConnectorMetricScalarFieldEnum: {
    id: 'id',
    connectorId: 'connectorId',
    metricType: 'metricType',
    metricName: 'metricName',
    value: 'value',
    unit: 'unit',
    dimensions: 'dimensions',
    tags: 'tags',
    timestamp: 'timestamp',
    interval: 'interval'
  };

  export type ConnectorMetricScalarFieldEnum = (typeof ConnectorMetricScalarFieldEnum)[keyof typeof ConnectorMetricScalarFieldEnum]


  export const DataQualityCheckScalarFieldEnum: {
    id: 'id',
    checkName: 'checkName',
    checkType: 'checkType',
    dataSource: 'dataSource',
    field: 'field',
    rules: 'rules',
    status: 'status',
    score: 'score',
    recordsChecked: 'recordsChecked',
    recordsPassed: 'recordsPassed',
    recordsFailed: 'recordsFailed',
    issues: 'issues',
    severity: 'severity',
    executedAt: 'executedAt',
    duration: 'duration'
  };

  export type DataQualityCheckScalarFieldEnum = (typeof DataQualityCheckScalarFieldEnum)[keyof typeof DataQualityCheckScalarFieldEnum]


  export const IntegrationPolicyScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    policyType: 'policyType',
    scope: 'scope',
    rules: 'rules',
    conditions: 'conditions',
    actions: 'actions',
    enabled: 'enabled',
    priority: 'priority',
    enforcementMode: 'enforcementMode',
    violationAction: 'violationAction',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy'
  };

  export type IntegrationPolicyScalarFieldEnum = (typeof IntegrationPolicyScalarFieldEnum)[keyof typeof IntegrationPolicyScalarFieldEnum]


  export const ConnectorTemplateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    connectorType: 'connectorType',
    configTemplate: 'configTemplate',
    validation: 'validation',
    documentation: 'documentation',
    category: 'category',
    tags: 'tags',
    isOfficial: 'isOfficial',
    version: 'version',
    minNovaVersion: 'minNovaVersion',
    maxNovaVersion: 'maxNovaVersion',
    usageCount: 'usageCount',
    rating: 'rating',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy'
  };

  export type ConnectorTemplateScalarFieldEnum = (typeof ConnectorTemplateScalarFieldEnum)[keyof typeof ConnectorTemplateScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


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


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


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
   * Reference to a field of type 'ConnectorType'
   */
  export type EnumConnectorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConnectorType'>
    


  /**
   * Reference to a field of type 'ConnectorType[]'
   */
  export type ListEnumConnectorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConnectorType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'ConnectorStatus'
   */
  export type EnumConnectorStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConnectorStatus'>
    


  /**
   * Reference to a field of type 'ConnectorStatus[]'
   */
  export type ListEnumConnectorStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConnectorStatus[]'>
    


  /**
   * Reference to a field of type 'HealthStatus'
   */
  export type EnumHealthStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HealthStatus'>
    


  /**
   * Reference to a field of type 'HealthStatus[]'
   */
  export type ListEnumHealthStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HealthStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


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
   * Reference to a field of type 'SyncStrategy'
   */
  export type EnumSyncStrategyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SyncStrategy'>
    


  /**
   * Reference to a field of type 'SyncStrategy[]'
   */
  export type ListEnumSyncStrategyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SyncStrategy[]'>
    


  /**
   * Reference to a field of type 'SyncJobType'
   */
  export type EnumSyncJobTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SyncJobType'>
    


  /**
   * Reference to a field of type 'SyncJobType[]'
   */
  export type ListEnumSyncJobTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SyncJobType[]'>
    


  /**
   * Reference to a field of type 'JobStatus'
   */
  export type EnumJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobStatus'>
    


  /**
   * Reference to a field of type 'JobStatus[]'
   */
  export type ListEnumJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobStatus[]'>
    


  /**
   * Reference to a field of type 'TriggerType'
   */
  export type EnumTriggerTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TriggerType'>
    


  /**
   * Reference to a field of type 'TriggerType[]'
   */
  export type ListEnumTriggerTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TriggerType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'MappingStatus'
   */
  export type EnumMappingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MappingStatus'>
    


  /**
   * Reference to a field of type 'MappingStatus[]'
   */
  export type ListEnumMappingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MappingStatus[]'>
    


  /**
   * Reference to a field of type 'TransformationType'
   */
  export type EnumTransformationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransformationType'>
    


  /**
   * Reference to a field of type 'TransformationType[]'
   */
  export type ListEnumTransformationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransformationType[]'>
    


  /**
   * Reference to a field of type 'EventCategory'
   */
  export type EnumEventCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EventCategory'>
    


  /**
   * Reference to a field of type 'EventCategory[]'
   */
  export type ListEnumEventCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EventCategory[]'>
    


  /**
   * Reference to a field of type 'EventStatus'
   */
  export type EnumEventStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EventStatus'>
    


  /**
   * Reference to a field of type 'EventStatus[]'
   */
  export type ListEnumEventStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EventStatus[]'>
    


  /**
   * Reference to a field of type 'MetricType'
   */
  export type EnumMetricTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MetricType'>
    


  /**
   * Reference to a field of type 'MetricType[]'
   */
  export type ListEnumMetricTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MetricType[]'>
    


  /**
   * Reference to a field of type 'QualityCheckType'
   */
  export type EnumQualityCheckTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QualityCheckType'>
    


  /**
   * Reference to a field of type 'QualityCheckType[]'
   */
  export type ListEnumQualityCheckTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QualityCheckType[]'>
    


  /**
   * Reference to a field of type 'QualityStatus'
   */
  export type EnumQualityStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QualityStatus'>
    


  /**
   * Reference to a field of type 'QualityStatus[]'
   */
  export type ListEnumQualityStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QualityStatus[]'>
    


  /**
   * Reference to a field of type 'QualitySeverity'
   */
  export type EnumQualitySeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QualitySeverity'>
    


  /**
   * Reference to a field of type 'QualitySeverity[]'
   */
  export type ListEnumQualitySeverityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QualitySeverity[]'>
    


  /**
   * Reference to a field of type 'PolicyType'
   */
  export type EnumPolicyTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PolicyType'>
    


  /**
   * Reference to a field of type 'PolicyType[]'
   */
  export type ListEnumPolicyTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PolicyType[]'>
    


  /**
   * Reference to a field of type 'EnforcementMode'
   */
  export type EnumEnforcementModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EnforcementMode'>
    


  /**
   * Reference to a field of type 'EnforcementMode[]'
   */
  export type ListEnumEnforcementModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EnforcementMode[]'>
    
  /**
   * Deep Input Types
   */


  export type ConnectorWhereInput = {
    AND?: ConnectorWhereInput | ConnectorWhereInput[]
    OR?: ConnectorWhereInput[]
    NOT?: ConnectorWhereInput | ConnectorWhereInput[]
    id?: StringFilter<"Connector"> | string
    name?: StringFilter<"Connector"> | string
    type?: EnumConnectorTypeFilter<"Connector"> | $Enums.ConnectorType
    version?: StringFilter<"Connector"> | string
    provider?: StringFilter<"Connector"> | string
    config?: JsonFilter<"Connector">
    capabilities?: JsonFilter<"Connector">
    status?: EnumConnectorStatusFilter<"Connector"> | $Enums.ConnectorStatus
    health?: EnumHealthStatusFilter<"Connector"> | $Enums.HealthStatus
    lastHealthCheck?: DateTimeNullableFilter<"Connector"> | Date | string | null
    lastSync?: DateTimeNullableFilter<"Connector"> | Date | string | null
    nextSync?: DateTimeNullableFilter<"Connector"> | Date | string | null
    syncEnabled?: BoolFilter<"Connector"> | boolean
    syncInterval?: IntFilter<"Connector"> | number
    syncStrategy?: EnumSyncStrategyFilter<"Connector"> | $Enums.SyncStrategy
    rateLimitPerMin?: IntFilter<"Connector"> | number
    rateLimitPerHour?: IntFilter<"Connector"> | number
    encryptionKey?: StringNullableFilter<"Connector"> | string | null
    certificate?: StringNullableFilter<"Connector"> | string | null
    tenantId?: StringFilter<"Connector"> | string
    createdBy?: StringFilter<"Connector"> | string
    createdAt?: DateTimeFilter<"Connector"> | Date | string
    updatedAt?: DateTimeFilter<"Connector"> | Date | string
    syncJobs?: SyncJobListRelationFilter
    events?: IntegrationEventListRelationFilter
    metrics?: ConnectorMetricListRelationFilter
  }

  export type ConnectorOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    version?: SortOrder
    provider?: SortOrder
    config?: SortOrder
    capabilities?: SortOrder
    status?: SortOrder
    health?: SortOrder
    lastHealthCheck?: SortOrderInput | SortOrder
    lastSync?: SortOrderInput | SortOrder
    nextSync?: SortOrderInput | SortOrder
    syncEnabled?: SortOrder
    syncInterval?: SortOrder
    syncStrategy?: SortOrder
    rateLimitPerMin?: SortOrder
    rateLimitPerHour?: SortOrder
    encryptionKey?: SortOrderInput | SortOrder
    certificate?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    syncJobs?: SyncJobOrderByRelationAggregateInput
    events?: IntegrationEventOrderByRelationAggregateInput
    metrics?: ConnectorMetricOrderByRelationAggregateInput
  }

  export type ConnectorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: ConnectorWhereInput | ConnectorWhereInput[]
    OR?: ConnectorWhereInput[]
    NOT?: ConnectorWhereInput | ConnectorWhereInput[]
    type?: EnumConnectorTypeFilter<"Connector"> | $Enums.ConnectorType
    version?: StringFilter<"Connector"> | string
    provider?: StringFilter<"Connector"> | string
    config?: JsonFilter<"Connector">
    capabilities?: JsonFilter<"Connector">
    status?: EnumConnectorStatusFilter<"Connector"> | $Enums.ConnectorStatus
    health?: EnumHealthStatusFilter<"Connector"> | $Enums.HealthStatus
    lastHealthCheck?: DateTimeNullableFilter<"Connector"> | Date | string | null
    lastSync?: DateTimeNullableFilter<"Connector"> | Date | string | null
    nextSync?: DateTimeNullableFilter<"Connector"> | Date | string | null
    syncEnabled?: BoolFilter<"Connector"> | boolean
    syncInterval?: IntFilter<"Connector"> | number
    syncStrategy?: EnumSyncStrategyFilter<"Connector"> | $Enums.SyncStrategy
    rateLimitPerMin?: IntFilter<"Connector"> | number
    rateLimitPerHour?: IntFilter<"Connector"> | number
    encryptionKey?: StringNullableFilter<"Connector"> | string | null
    certificate?: StringNullableFilter<"Connector"> | string | null
    tenantId?: StringFilter<"Connector"> | string
    createdBy?: StringFilter<"Connector"> | string
    createdAt?: DateTimeFilter<"Connector"> | Date | string
    updatedAt?: DateTimeFilter<"Connector"> | Date | string
    syncJobs?: SyncJobListRelationFilter
    events?: IntegrationEventListRelationFilter
    metrics?: ConnectorMetricListRelationFilter
  }, "id" | "name">

  export type ConnectorOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    version?: SortOrder
    provider?: SortOrder
    config?: SortOrder
    capabilities?: SortOrder
    status?: SortOrder
    health?: SortOrder
    lastHealthCheck?: SortOrderInput | SortOrder
    lastSync?: SortOrderInput | SortOrder
    nextSync?: SortOrderInput | SortOrder
    syncEnabled?: SortOrder
    syncInterval?: SortOrder
    syncStrategy?: SortOrder
    rateLimitPerMin?: SortOrder
    rateLimitPerHour?: SortOrder
    encryptionKey?: SortOrderInput | SortOrder
    certificate?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ConnectorCountOrderByAggregateInput
    _avg?: ConnectorAvgOrderByAggregateInput
    _max?: ConnectorMaxOrderByAggregateInput
    _min?: ConnectorMinOrderByAggregateInput
    _sum?: ConnectorSumOrderByAggregateInput
  }

  export type ConnectorScalarWhereWithAggregatesInput = {
    AND?: ConnectorScalarWhereWithAggregatesInput | ConnectorScalarWhereWithAggregatesInput[]
    OR?: ConnectorScalarWhereWithAggregatesInput[]
    NOT?: ConnectorScalarWhereWithAggregatesInput | ConnectorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Connector"> | string
    name?: StringWithAggregatesFilter<"Connector"> | string
    type?: EnumConnectorTypeWithAggregatesFilter<"Connector"> | $Enums.ConnectorType
    version?: StringWithAggregatesFilter<"Connector"> | string
    provider?: StringWithAggregatesFilter<"Connector"> | string
    config?: JsonWithAggregatesFilter<"Connector">
    capabilities?: JsonWithAggregatesFilter<"Connector">
    status?: EnumConnectorStatusWithAggregatesFilter<"Connector"> | $Enums.ConnectorStatus
    health?: EnumHealthStatusWithAggregatesFilter<"Connector"> | $Enums.HealthStatus
    lastHealthCheck?: DateTimeNullableWithAggregatesFilter<"Connector"> | Date | string | null
    lastSync?: DateTimeNullableWithAggregatesFilter<"Connector"> | Date | string | null
    nextSync?: DateTimeNullableWithAggregatesFilter<"Connector"> | Date | string | null
    syncEnabled?: BoolWithAggregatesFilter<"Connector"> | boolean
    syncInterval?: IntWithAggregatesFilter<"Connector"> | number
    syncStrategy?: EnumSyncStrategyWithAggregatesFilter<"Connector"> | $Enums.SyncStrategy
    rateLimitPerMin?: IntWithAggregatesFilter<"Connector"> | number
    rateLimitPerHour?: IntWithAggregatesFilter<"Connector"> | number
    encryptionKey?: StringNullableWithAggregatesFilter<"Connector"> | string | null
    certificate?: StringNullableWithAggregatesFilter<"Connector"> | string | null
    tenantId?: StringWithAggregatesFilter<"Connector"> | string
    createdBy?: StringWithAggregatesFilter<"Connector"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Connector"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Connector"> | Date | string
  }

  export type SyncJobWhereInput = {
    AND?: SyncJobWhereInput | SyncJobWhereInput[]
    OR?: SyncJobWhereInput[]
    NOT?: SyncJobWhereInput | SyncJobWhereInput[]
    id?: StringFilter<"SyncJob"> | string
    connectorId?: StringFilter<"SyncJob"> | string
    jobType?: EnumSyncJobTypeFilter<"SyncJob"> | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFilter<"SyncJob"> | $Enums.SyncStrategy
    options?: JsonNullableFilter<"SyncJob">
    status?: EnumJobStatusFilter<"SyncJob"> | $Enums.JobStatus
    startedAt?: DateTimeNullableFilter<"SyncJob"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"SyncJob"> | Date | string | null
    duration?: IntNullableFilter<"SyncJob"> | number | null
    recordsProcessed?: IntFilter<"SyncJob"> | number
    recordsSucceeded?: IntFilter<"SyncJob"> | number
    recordsFailed?: IntFilter<"SyncJob"> | number
    errorMessage?: StringNullableFilter<"SyncJob"> | string | null
    errorDetails?: JsonNullableFilter<"SyncJob">
    correlationId?: StringNullableFilter<"SyncJob"> | string | null
    triggerType?: EnumTriggerTypeFilter<"SyncJob"> | $Enums.TriggerType
    triggeredBy?: StringNullableFilter<"SyncJob"> | string | null
    createdAt?: DateTimeFilter<"SyncJob"> | Date | string
    connector?: XOR<ConnectorScalarRelationFilter, ConnectorWhereInput>
  }

  export type SyncJobOrderByWithRelationInput = {
    id?: SortOrder
    connectorId?: SortOrder
    jobType?: SortOrder
    strategy?: SortOrder
    options?: SortOrderInput | SortOrder
    status?: SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    duration?: SortOrderInput | SortOrder
    recordsProcessed?: SortOrder
    recordsSucceeded?: SortOrder
    recordsFailed?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    errorDetails?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    triggerType?: SortOrder
    triggeredBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    connector?: ConnectorOrderByWithRelationInput
  }

  export type SyncJobWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SyncJobWhereInput | SyncJobWhereInput[]
    OR?: SyncJobWhereInput[]
    NOT?: SyncJobWhereInput | SyncJobWhereInput[]
    connectorId?: StringFilter<"SyncJob"> | string
    jobType?: EnumSyncJobTypeFilter<"SyncJob"> | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFilter<"SyncJob"> | $Enums.SyncStrategy
    options?: JsonNullableFilter<"SyncJob">
    status?: EnumJobStatusFilter<"SyncJob"> | $Enums.JobStatus
    startedAt?: DateTimeNullableFilter<"SyncJob"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"SyncJob"> | Date | string | null
    duration?: IntNullableFilter<"SyncJob"> | number | null
    recordsProcessed?: IntFilter<"SyncJob"> | number
    recordsSucceeded?: IntFilter<"SyncJob"> | number
    recordsFailed?: IntFilter<"SyncJob"> | number
    errorMessage?: StringNullableFilter<"SyncJob"> | string | null
    errorDetails?: JsonNullableFilter<"SyncJob">
    correlationId?: StringNullableFilter<"SyncJob"> | string | null
    triggerType?: EnumTriggerTypeFilter<"SyncJob"> | $Enums.TriggerType
    triggeredBy?: StringNullableFilter<"SyncJob"> | string | null
    createdAt?: DateTimeFilter<"SyncJob"> | Date | string
    connector?: XOR<ConnectorScalarRelationFilter, ConnectorWhereInput>
  }, "id">

  export type SyncJobOrderByWithAggregationInput = {
    id?: SortOrder
    connectorId?: SortOrder
    jobType?: SortOrder
    strategy?: SortOrder
    options?: SortOrderInput | SortOrder
    status?: SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    duration?: SortOrderInput | SortOrder
    recordsProcessed?: SortOrder
    recordsSucceeded?: SortOrder
    recordsFailed?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    errorDetails?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    triggerType?: SortOrder
    triggeredBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: SyncJobCountOrderByAggregateInput
    _avg?: SyncJobAvgOrderByAggregateInput
    _max?: SyncJobMaxOrderByAggregateInput
    _min?: SyncJobMinOrderByAggregateInput
    _sum?: SyncJobSumOrderByAggregateInput
  }

  export type SyncJobScalarWhereWithAggregatesInput = {
    AND?: SyncJobScalarWhereWithAggregatesInput | SyncJobScalarWhereWithAggregatesInput[]
    OR?: SyncJobScalarWhereWithAggregatesInput[]
    NOT?: SyncJobScalarWhereWithAggregatesInput | SyncJobScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SyncJob"> | string
    connectorId?: StringWithAggregatesFilter<"SyncJob"> | string
    jobType?: EnumSyncJobTypeWithAggregatesFilter<"SyncJob"> | $Enums.SyncJobType
    strategy?: EnumSyncStrategyWithAggregatesFilter<"SyncJob"> | $Enums.SyncStrategy
    options?: JsonNullableWithAggregatesFilter<"SyncJob">
    status?: EnumJobStatusWithAggregatesFilter<"SyncJob"> | $Enums.JobStatus
    startedAt?: DateTimeNullableWithAggregatesFilter<"SyncJob"> | Date | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter<"SyncJob"> | Date | string | null
    duration?: IntNullableWithAggregatesFilter<"SyncJob"> | number | null
    recordsProcessed?: IntWithAggregatesFilter<"SyncJob"> | number
    recordsSucceeded?: IntWithAggregatesFilter<"SyncJob"> | number
    recordsFailed?: IntWithAggregatesFilter<"SyncJob"> | number
    errorMessage?: StringNullableWithAggregatesFilter<"SyncJob"> | string | null
    errorDetails?: JsonNullableWithAggregatesFilter<"SyncJob">
    correlationId?: StringNullableWithAggregatesFilter<"SyncJob"> | string | null
    triggerType?: EnumTriggerTypeWithAggregatesFilter<"SyncJob"> | $Enums.TriggerType
    triggeredBy?: StringNullableWithAggregatesFilter<"SyncJob"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SyncJob"> | Date | string
  }

  export type IdentityMappingWhereInput = {
    AND?: IdentityMappingWhereInput | IdentityMappingWhereInput[]
    OR?: IdentityMappingWhereInput[]
    NOT?: IdentityMappingWhereInput | IdentityMappingWhereInput[]
    id?: StringFilter<"IdentityMapping"> | string
    novaUserId?: StringFilter<"IdentityMapping"> | string
    email?: StringFilter<"IdentityMapping"> | string
    emailCanonical?: StringFilter<"IdentityMapping"> | string
    externalMappings?: JsonFilter<"IdentityMapping">
    confidence?: FloatFilter<"IdentityMapping"> | number
    lastVerified?: DateTimeNullableFilter<"IdentityMapping"> | Date | string | null
    verificationMethod?: StringNullableFilter<"IdentityMapping"> | string | null
    status?: EnumMappingStatusFilter<"IdentityMapping"> | $Enums.MappingStatus
    conflictResolution?: JsonNullableFilter<"IdentityMapping">
    createdAt?: DateTimeFilter<"IdentityMapping"> | Date | string
    updatedAt?: DateTimeFilter<"IdentityMapping"> | Date | string
    createdBy?: StringFilter<"IdentityMapping"> | string
  }

  export type IdentityMappingOrderByWithRelationInput = {
    id?: SortOrder
    novaUserId?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    externalMappings?: SortOrder
    confidence?: SortOrder
    lastVerified?: SortOrderInput | SortOrder
    verificationMethod?: SortOrderInput | SortOrder
    status?: SortOrder
    conflictResolution?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type IdentityMappingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    novaUserId?: string
    emailCanonical?: string
    AND?: IdentityMappingWhereInput | IdentityMappingWhereInput[]
    OR?: IdentityMappingWhereInput[]
    NOT?: IdentityMappingWhereInput | IdentityMappingWhereInput[]
    email?: StringFilter<"IdentityMapping"> | string
    externalMappings?: JsonFilter<"IdentityMapping">
    confidence?: FloatFilter<"IdentityMapping"> | number
    lastVerified?: DateTimeNullableFilter<"IdentityMapping"> | Date | string | null
    verificationMethod?: StringNullableFilter<"IdentityMapping"> | string | null
    status?: EnumMappingStatusFilter<"IdentityMapping"> | $Enums.MappingStatus
    conflictResolution?: JsonNullableFilter<"IdentityMapping">
    createdAt?: DateTimeFilter<"IdentityMapping"> | Date | string
    updatedAt?: DateTimeFilter<"IdentityMapping"> | Date | string
    createdBy?: StringFilter<"IdentityMapping"> | string
  }, "id" | "novaUserId" | "emailCanonical">

  export type IdentityMappingOrderByWithAggregationInput = {
    id?: SortOrder
    novaUserId?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    externalMappings?: SortOrder
    confidence?: SortOrder
    lastVerified?: SortOrderInput | SortOrder
    verificationMethod?: SortOrderInput | SortOrder
    status?: SortOrder
    conflictResolution?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    _count?: IdentityMappingCountOrderByAggregateInput
    _avg?: IdentityMappingAvgOrderByAggregateInput
    _max?: IdentityMappingMaxOrderByAggregateInput
    _min?: IdentityMappingMinOrderByAggregateInput
    _sum?: IdentityMappingSumOrderByAggregateInput
  }

  export type IdentityMappingScalarWhereWithAggregatesInput = {
    AND?: IdentityMappingScalarWhereWithAggregatesInput | IdentityMappingScalarWhereWithAggregatesInput[]
    OR?: IdentityMappingScalarWhereWithAggregatesInput[]
    NOT?: IdentityMappingScalarWhereWithAggregatesInput | IdentityMappingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IdentityMapping"> | string
    novaUserId?: StringWithAggregatesFilter<"IdentityMapping"> | string
    email?: StringWithAggregatesFilter<"IdentityMapping"> | string
    emailCanonical?: StringWithAggregatesFilter<"IdentityMapping"> | string
    externalMappings?: JsonWithAggregatesFilter<"IdentityMapping">
    confidence?: FloatWithAggregatesFilter<"IdentityMapping"> | number
    lastVerified?: DateTimeNullableWithAggregatesFilter<"IdentityMapping"> | Date | string | null
    verificationMethod?: StringNullableWithAggregatesFilter<"IdentityMapping"> | string | null
    status?: EnumMappingStatusWithAggregatesFilter<"IdentityMapping"> | $Enums.MappingStatus
    conflictResolution?: JsonNullableWithAggregatesFilter<"IdentityMapping">
    createdAt?: DateTimeWithAggregatesFilter<"IdentityMapping"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"IdentityMapping"> | Date | string
    createdBy?: StringWithAggregatesFilter<"IdentityMapping"> | string
  }

  export type TransformationRuleWhereInput = {
    AND?: TransformationRuleWhereInput | TransformationRuleWhereInput[]
    OR?: TransformationRuleWhereInput[]
    NOT?: TransformationRuleWhereInput | TransformationRuleWhereInput[]
    id?: StringFilter<"TransformationRule"> | string
    name?: StringFilter<"TransformationRule"> | string
    sourceConnector?: StringFilter<"TransformationRule"> | string
    sourceField?: StringFilter<"TransformationRule"> | string
    targetField?: StringFilter<"TransformationRule"> | string
    transformType?: EnumTransformationTypeFilter<"TransformationRule"> | $Enums.TransformationType
    transformConfig?: JsonFilter<"TransformationRule">
    validationRules?: JsonNullableFilter<"TransformationRule">
    defaultValue?: StringNullableFilter<"TransformationRule"> | string | null
    enabled?: BoolFilter<"TransformationRule"> | boolean
    priority?: IntFilter<"TransformationRule"> | number
    lastApplied?: DateTimeNullableFilter<"TransformationRule"> | Date | string | null
    successCount?: IntFilter<"TransformationRule"> | number
    errorCount?: IntFilter<"TransformationRule"> | number
    createdAt?: DateTimeFilter<"TransformationRule"> | Date | string
    updatedAt?: DateTimeFilter<"TransformationRule"> | Date | string
    createdBy?: StringFilter<"TransformationRule"> | string
  }

  export type TransformationRuleOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    sourceConnector?: SortOrder
    sourceField?: SortOrder
    targetField?: SortOrder
    transformType?: SortOrder
    transformConfig?: SortOrder
    validationRules?: SortOrderInput | SortOrder
    defaultValue?: SortOrderInput | SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    lastApplied?: SortOrderInput | SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type TransformationRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sourceConnector_sourceField_targetField?: TransformationRuleSourceConnectorSourceFieldTargetFieldCompoundUniqueInput
    AND?: TransformationRuleWhereInput | TransformationRuleWhereInput[]
    OR?: TransformationRuleWhereInput[]
    NOT?: TransformationRuleWhereInput | TransformationRuleWhereInput[]
    name?: StringFilter<"TransformationRule"> | string
    sourceConnector?: StringFilter<"TransformationRule"> | string
    sourceField?: StringFilter<"TransformationRule"> | string
    targetField?: StringFilter<"TransformationRule"> | string
    transformType?: EnumTransformationTypeFilter<"TransformationRule"> | $Enums.TransformationType
    transformConfig?: JsonFilter<"TransformationRule">
    validationRules?: JsonNullableFilter<"TransformationRule">
    defaultValue?: StringNullableFilter<"TransformationRule"> | string | null
    enabled?: BoolFilter<"TransformationRule"> | boolean
    priority?: IntFilter<"TransformationRule"> | number
    lastApplied?: DateTimeNullableFilter<"TransformationRule"> | Date | string | null
    successCount?: IntFilter<"TransformationRule"> | number
    errorCount?: IntFilter<"TransformationRule"> | number
    createdAt?: DateTimeFilter<"TransformationRule"> | Date | string
    updatedAt?: DateTimeFilter<"TransformationRule"> | Date | string
    createdBy?: StringFilter<"TransformationRule"> | string
  }, "id" | "sourceConnector_sourceField_targetField">

  export type TransformationRuleOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    sourceConnector?: SortOrder
    sourceField?: SortOrder
    targetField?: SortOrder
    transformType?: SortOrder
    transformConfig?: SortOrder
    validationRules?: SortOrderInput | SortOrder
    defaultValue?: SortOrderInput | SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    lastApplied?: SortOrderInput | SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    _count?: TransformationRuleCountOrderByAggregateInput
    _avg?: TransformationRuleAvgOrderByAggregateInput
    _max?: TransformationRuleMaxOrderByAggregateInput
    _min?: TransformationRuleMinOrderByAggregateInput
    _sum?: TransformationRuleSumOrderByAggregateInput
  }

  export type TransformationRuleScalarWhereWithAggregatesInput = {
    AND?: TransformationRuleScalarWhereWithAggregatesInput | TransformationRuleScalarWhereWithAggregatesInput[]
    OR?: TransformationRuleScalarWhereWithAggregatesInput[]
    NOT?: TransformationRuleScalarWhereWithAggregatesInput | TransformationRuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TransformationRule"> | string
    name?: StringWithAggregatesFilter<"TransformationRule"> | string
    sourceConnector?: StringWithAggregatesFilter<"TransformationRule"> | string
    sourceField?: StringWithAggregatesFilter<"TransformationRule"> | string
    targetField?: StringWithAggregatesFilter<"TransformationRule"> | string
    transformType?: EnumTransformationTypeWithAggregatesFilter<"TransformationRule"> | $Enums.TransformationType
    transformConfig?: JsonWithAggregatesFilter<"TransformationRule">
    validationRules?: JsonNullableWithAggregatesFilter<"TransformationRule">
    defaultValue?: StringNullableWithAggregatesFilter<"TransformationRule"> | string | null
    enabled?: BoolWithAggregatesFilter<"TransformationRule"> | boolean
    priority?: IntWithAggregatesFilter<"TransformationRule"> | number
    lastApplied?: DateTimeNullableWithAggregatesFilter<"TransformationRule"> | Date | string | null
    successCount?: IntWithAggregatesFilter<"TransformationRule"> | number
    errorCount?: IntWithAggregatesFilter<"TransformationRule"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TransformationRule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TransformationRule"> | Date | string
    createdBy?: StringWithAggregatesFilter<"TransformationRule"> | string
  }

  export type IntegrationEventWhereInput = {
    AND?: IntegrationEventWhereInput | IntegrationEventWhereInput[]
    OR?: IntegrationEventWhereInput[]
    NOT?: IntegrationEventWhereInput | IntegrationEventWhereInput[]
    id?: StringFilter<"IntegrationEvent"> | string
    eventType?: StringFilter<"IntegrationEvent"> | string
    eventCategory?: EnumEventCategoryFilter<"IntegrationEvent"> | $Enums.EventCategory
    source?: StringFilter<"IntegrationEvent"> | string
    data?: JsonFilter<"IntegrationEvent">
    metadata?: JsonNullableFilter<"IntegrationEvent">
    correlationId?: StringNullableFilter<"IntegrationEvent"> | string | null
    status?: EnumEventStatusFilter<"IntegrationEvent"> | $Enums.EventStatus
    processedAt?: DateTimeNullableFilter<"IntegrationEvent"> | Date | string | null
    retryCount?: IntFilter<"IntegrationEvent"> | number
    maxRetries?: IntFilter<"IntegrationEvent"> | number
    errorMessage?: StringNullableFilter<"IntegrationEvent"> | string | null
    errorDetails?: JsonNullableFilter<"IntegrationEvent">
    deadLetterQueue?: BoolFilter<"IntegrationEvent"> | boolean
    connectorId?: StringNullableFilter<"IntegrationEvent"> | string | null
    timestamp?: DateTimeFilter<"IntegrationEvent"> | Date | string
    expiresAt?: DateTimeNullableFilter<"IntegrationEvent"> | Date | string | null
    connector?: XOR<ConnectorNullableScalarRelationFilter, ConnectorWhereInput> | null
  }

  export type IntegrationEventOrderByWithRelationInput = {
    id?: SortOrder
    eventType?: SortOrder
    eventCategory?: SortOrder
    source?: SortOrder
    data?: SortOrder
    metadata?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    status?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    retryCount?: SortOrder
    maxRetries?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    errorDetails?: SortOrderInput | SortOrder
    deadLetterQueue?: SortOrder
    connectorId?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    connector?: ConnectorOrderByWithRelationInput
  }

  export type IntegrationEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IntegrationEventWhereInput | IntegrationEventWhereInput[]
    OR?: IntegrationEventWhereInput[]
    NOT?: IntegrationEventWhereInput | IntegrationEventWhereInput[]
    eventType?: StringFilter<"IntegrationEvent"> | string
    eventCategory?: EnumEventCategoryFilter<"IntegrationEvent"> | $Enums.EventCategory
    source?: StringFilter<"IntegrationEvent"> | string
    data?: JsonFilter<"IntegrationEvent">
    metadata?: JsonNullableFilter<"IntegrationEvent">
    correlationId?: StringNullableFilter<"IntegrationEvent"> | string | null
    status?: EnumEventStatusFilter<"IntegrationEvent"> | $Enums.EventStatus
    processedAt?: DateTimeNullableFilter<"IntegrationEvent"> | Date | string | null
    retryCount?: IntFilter<"IntegrationEvent"> | number
    maxRetries?: IntFilter<"IntegrationEvent"> | number
    errorMessage?: StringNullableFilter<"IntegrationEvent"> | string | null
    errorDetails?: JsonNullableFilter<"IntegrationEvent">
    deadLetterQueue?: BoolFilter<"IntegrationEvent"> | boolean
    connectorId?: StringNullableFilter<"IntegrationEvent"> | string | null
    timestamp?: DateTimeFilter<"IntegrationEvent"> | Date | string
    expiresAt?: DateTimeNullableFilter<"IntegrationEvent"> | Date | string | null
    connector?: XOR<ConnectorNullableScalarRelationFilter, ConnectorWhereInput> | null
  }, "id">

  export type IntegrationEventOrderByWithAggregationInput = {
    id?: SortOrder
    eventType?: SortOrder
    eventCategory?: SortOrder
    source?: SortOrder
    data?: SortOrder
    metadata?: SortOrderInput | SortOrder
    correlationId?: SortOrderInput | SortOrder
    status?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    retryCount?: SortOrder
    maxRetries?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    errorDetails?: SortOrderInput | SortOrder
    deadLetterQueue?: SortOrder
    connectorId?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    _count?: IntegrationEventCountOrderByAggregateInput
    _avg?: IntegrationEventAvgOrderByAggregateInput
    _max?: IntegrationEventMaxOrderByAggregateInput
    _min?: IntegrationEventMinOrderByAggregateInput
    _sum?: IntegrationEventSumOrderByAggregateInput
  }

  export type IntegrationEventScalarWhereWithAggregatesInput = {
    AND?: IntegrationEventScalarWhereWithAggregatesInput | IntegrationEventScalarWhereWithAggregatesInput[]
    OR?: IntegrationEventScalarWhereWithAggregatesInput[]
    NOT?: IntegrationEventScalarWhereWithAggregatesInput | IntegrationEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntegrationEvent"> | string
    eventType?: StringWithAggregatesFilter<"IntegrationEvent"> | string
    eventCategory?: EnumEventCategoryWithAggregatesFilter<"IntegrationEvent"> | $Enums.EventCategory
    source?: StringWithAggregatesFilter<"IntegrationEvent"> | string
    data?: JsonWithAggregatesFilter<"IntegrationEvent">
    metadata?: JsonNullableWithAggregatesFilter<"IntegrationEvent">
    correlationId?: StringNullableWithAggregatesFilter<"IntegrationEvent"> | string | null
    status?: EnumEventStatusWithAggregatesFilter<"IntegrationEvent"> | $Enums.EventStatus
    processedAt?: DateTimeNullableWithAggregatesFilter<"IntegrationEvent"> | Date | string | null
    retryCount?: IntWithAggregatesFilter<"IntegrationEvent"> | number
    maxRetries?: IntWithAggregatesFilter<"IntegrationEvent"> | number
    errorMessage?: StringNullableWithAggregatesFilter<"IntegrationEvent"> | string | null
    errorDetails?: JsonNullableWithAggregatesFilter<"IntegrationEvent">
    deadLetterQueue?: BoolWithAggregatesFilter<"IntegrationEvent"> | boolean
    connectorId?: StringNullableWithAggregatesFilter<"IntegrationEvent"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"IntegrationEvent"> | Date | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"IntegrationEvent"> | Date | string | null
  }

  export type ConnectorMetricWhereInput = {
    AND?: ConnectorMetricWhereInput | ConnectorMetricWhereInput[]
    OR?: ConnectorMetricWhereInput[]
    NOT?: ConnectorMetricWhereInput | ConnectorMetricWhereInput[]
    id?: StringFilter<"ConnectorMetric"> | string
    connectorId?: StringFilter<"ConnectorMetric"> | string
    metricType?: EnumMetricTypeFilter<"ConnectorMetric"> | $Enums.MetricType
    metricName?: StringFilter<"ConnectorMetric"> | string
    value?: FloatFilter<"ConnectorMetric"> | number
    unit?: StringNullableFilter<"ConnectorMetric"> | string | null
    dimensions?: JsonNullableFilter<"ConnectorMetric">
    tags?: StringNullableListFilter<"ConnectorMetric">
    timestamp?: DateTimeFilter<"ConnectorMetric"> | Date | string
    interval?: IntNullableFilter<"ConnectorMetric"> | number | null
    connector?: XOR<ConnectorScalarRelationFilter, ConnectorWhereInput>
  }

  export type ConnectorMetricOrderByWithRelationInput = {
    id?: SortOrder
    connectorId?: SortOrder
    metricType?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    unit?: SortOrderInput | SortOrder
    dimensions?: SortOrderInput | SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrderInput | SortOrder
    connector?: ConnectorOrderByWithRelationInput
  }

  export type ConnectorMetricWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConnectorMetricWhereInput | ConnectorMetricWhereInput[]
    OR?: ConnectorMetricWhereInput[]
    NOT?: ConnectorMetricWhereInput | ConnectorMetricWhereInput[]
    connectorId?: StringFilter<"ConnectorMetric"> | string
    metricType?: EnumMetricTypeFilter<"ConnectorMetric"> | $Enums.MetricType
    metricName?: StringFilter<"ConnectorMetric"> | string
    value?: FloatFilter<"ConnectorMetric"> | number
    unit?: StringNullableFilter<"ConnectorMetric"> | string | null
    dimensions?: JsonNullableFilter<"ConnectorMetric">
    tags?: StringNullableListFilter<"ConnectorMetric">
    timestamp?: DateTimeFilter<"ConnectorMetric"> | Date | string
    interval?: IntNullableFilter<"ConnectorMetric"> | number | null
    connector?: XOR<ConnectorScalarRelationFilter, ConnectorWhereInput>
  }, "id">

  export type ConnectorMetricOrderByWithAggregationInput = {
    id?: SortOrder
    connectorId?: SortOrder
    metricType?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    unit?: SortOrderInput | SortOrder
    dimensions?: SortOrderInput | SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrderInput | SortOrder
    _count?: ConnectorMetricCountOrderByAggregateInput
    _avg?: ConnectorMetricAvgOrderByAggregateInput
    _max?: ConnectorMetricMaxOrderByAggregateInput
    _min?: ConnectorMetricMinOrderByAggregateInput
    _sum?: ConnectorMetricSumOrderByAggregateInput
  }

  export type ConnectorMetricScalarWhereWithAggregatesInput = {
    AND?: ConnectorMetricScalarWhereWithAggregatesInput | ConnectorMetricScalarWhereWithAggregatesInput[]
    OR?: ConnectorMetricScalarWhereWithAggregatesInput[]
    NOT?: ConnectorMetricScalarWhereWithAggregatesInput | ConnectorMetricScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConnectorMetric"> | string
    connectorId?: StringWithAggregatesFilter<"ConnectorMetric"> | string
    metricType?: EnumMetricTypeWithAggregatesFilter<"ConnectorMetric"> | $Enums.MetricType
    metricName?: StringWithAggregatesFilter<"ConnectorMetric"> | string
    value?: FloatWithAggregatesFilter<"ConnectorMetric"> | number
    unit?: StringNullableWithAggregatesFilter<"ConnectorMetric"> | string | null
    dimensions?: JsonNullableWithAggregatesFilter<"ConnectorMetric">
    tags?: StringNullableListFilter<"ConnectorMetric">
    timestamp?: DateTimeWithAggregatesFilter<"ConnectorMetric"> | Date | string
    interval?: IntNullableWithAggregatesFilter<"ConnectorMetric"> | number | null
  }

  export type DataQualityCheckWhereInput = {
    AND?: DataQualityCheckWhereInput | DataQualityCheckWhereInput[]
    OR?: DataQualityCheckWhereInput[]
    NOT?: DataQualityCheckWhereInput | DataQualityCheckWhereInput[]
    id?: StringFilter<"DataQualityCheck"> | string
    checkName?: StringFilter<"DataQualityCheck"> | string
    checkType?: EnumQualityCheckTypeFilter<"DataQualityCheck"> | $Enums.QualityCheckType
    dataSource?: StringFilter<"DataQualityCheck"> | string
    field?: StringNullableFilter<"DataQualityCheck"> | string | null
    rules?: JsonFilter<"DataQualityCheck">
    status?: EnumQualityStatusFilter<"DataQualityCheck"> | $Enums.QualityStatus
    score?: FloatNullableFilter<"DataQualityCheck"> | number | null
    recordsChecked?: IntFilter<"DataQualityCheck"> | number
    recordsPassed?: IntFilter<"DataQualityCheck"> | number
    recordsFailed?: IntFilter<"DataQualityCheck"> | number
    issues?: JsonNullableFilter<"DataQualityCheck">
    severity?: EnumQualitySeverityFilter<"DataQualityCheck"> | $Enums.QualitySeverity
    executedAt?: DateTimeFilter<"DataQualityCheck"> | Date | string
    duration?: IntNullableFilter<"DataQualityCheck"> | number | null
  }

  export type DataQualityCheckOrderByWithRelationInput = {
    id?: SortOrder
    checkName?: SortOrder
    checkType?: SortOrder
    dataSource?: SortOrder
    field?: SortOrderInput | SortOrder
    rules?: SortOrder
    status?: SortOrder
    score?: SortOrderInput | SortOrder
    recordsChecked?: SortOrder
    recordsPassed?: SortOrder
    recordsFailed?: SortOrder
    issues?: SortOrderInput | SortOrder
    severity?: SortOrder
    executedAt?: SortOrder
    duration?: SortOrderInput | SortOrder
  }

  export type DataQualityCheckWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DataQualityCheckWhereInput | DataQualityCheckWhereInput[]
    OR?: DataQualityCheckWhereInput[]
    NOT?: DataQualityCheckWhereInput | DataQualityCheckWhereInput[]
    checkName?: StringFilter<"DataQualityCheck"> | string
    checkType?: EnumQualityCheckTypeFilter<"DataQualityCheck"> | $Enums.QualityCheckType
    dataSource?: StringFilter<"DataQualityCheck"> | string
    field?: StringNullableFilter<"DataQualityCheck"> | string | null
    rules?: JsonFilter<"DataQualityCheck">
    status?: EnumQualityStatusFilter<"DataQualityCheck"> | $Enums.QualityStatus
    score?: FloatNullableFilter<"DataQualityCheck"> | number | null
    recordsChecked?: IntFilter<"DataQualityCheck"> | number
    recordsPassed?: IntFilter<"DataQualityCheck"> | number
    recordsFailed?: IntFilter<"DataQualityCheck"> | number
    issues?: JsonNullableFilter<"DataQualityCheck">
    severity?: EnumQualitySeverityFilter<"DataQualityCheck"> | $Enums.QualitySeverity
    executedAt?: DateTimeFilter<"DataQualityCheck"> | Date | string
    duration?: IntNullableFilter<"DataQualityCheck"> | number | null
  }, "id">

  export type DataQualityCheckOrderByWithAggregationInput = {
    id?: SortOrder
    checkName?: SortOrder
    checkType?: SortOrder
    dataSource?: SortOrder
    field?: SortOrderInput | SortOrder
    rules?: SortOrder
    status?: SortOrder
    score?: SortOrderInput | SortOrder
    recordsChecked?: SortOrder
    recordsPassed?: SortOrder
    recordsFailed?: SortOrder
    issues?: SortOrderInput | SortOrder
    severity?: SortOrder
    executedAt?: SortOrder
    duration?: SortOrderInput | SortOrder
    _count?: DataQualityCheckCountOrderByAggregateInput
    _avg?: DataQualityCheckAvgOrderByAggregateInput
    _max?: DataQualityCheckMaxOrderByAggregateInput
    _min?: DataQualityCheckMinOrderByAggregateInput
    _sum?: DataQualityCheckSumOrderByAggregateInput
  }

  export type DataQualityCheckScalarWhereWithAggregatesInput = {
    AND?: DataQualityCheckScalarWhereWithAggregatesInput | DataQualityCheckScalarWhereWithAggregatesInput[]
    OR?: DataQualityCheckScalarWhereWithAggregatesInput[]
    NOT?: DataQualityCheckScalarWhereWithAggregatesInput | DataQualityCheckScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DataQualityCheck"> | string
    checkName?: StringWithAggregatesFilter<"DataQualityCheck"> | string
    checkType?: EnumQualityCheckTypeWithAggregatesFilter<"DataQualityCheck"> | $Enums.QualityCheckType
    dataSource?: StringWithAggregatesFilter<"DataQualityCheck"> | string
    field?: StringNullableWithAggregatesFilter<"DataQualityCheck"> | string | null
    rules?: JsonWithAggregatesFilter<"DataQualityCheck">
    status?: EnumQualityStatusWithAggregatesFilter<"DataQualityCheck"> | $Enums.QualityStatus
    score?: FloatNullableWithAggregatesFilter<"DataQualityCheck"> | number | null
    recordsChecked?: IntWithAggregatesFilter<"DataQualityCheck"> | number
    recordsPassed?: IntWithAggregatesFilter<"DataQualityCheck"> | number
    recordsFailed?: IntWithAggregatesFilter<"DataQualityCheck"> | number
    issues?: JsonNullableWithAggregatesFilter<"DataQualityCheck">
    severity?: EnumQualitySeverityWithAggregatesFilter<"DataQualityCheck"> | $Enums.QualitySeverity
    executedAt?: DateTimeWithAggregatesFilter<"DataQualityCheck"> | Date | string
    duration?: IntNullableWithAggregatesFilter<"DataQualityCheck"> | number | null
  }

  export type IntegrationPolicyWhereInput = {
    AND?: IntegrationPolicyWhereInput | IntegrationPolicyWhereInput[]
    OR?: IntegrationPolicyWhereInput[]
    NOT?: IntegrationPolicyWhereInput | IntegrationPolicyWhereInput[]
    id?: StringFilter<"IntegrationPolicy"> | string
    name?: StringFilter<"IntegrationPolicy"> | string
    description?: StringNullableFilter<"IntegrationPolicy"> | string | null
    policyType?: EnumPolicyTypeFilter<"IntegrationPolicy"> | $Enums.PolicyType
    scope?: JsonFilter<"IntegrationPolicy">
    rules?: JsonFilter<"IntegrationPolicy">
    conditions?: JsonNullableFilter<"IntegrationPolicy">
    actions?: JsonNullableFilter<"IntegrationPolicy">
    enabled?: BoolFilter<"IntegrationPolicy"> | boolean
    priority?: IntFilter<"IntegrationPolicy"> | number
    enforcementMode?: EnumEnforcementModeFilter<"IntegrationPolicy"> | $Enums.EnforcementMode
    violationAction?: StringNullableFilter<"IntegrationPolicy"> | string | null
    createdAt?: DateTimeFilter<"IntegrationPolicy"> | Date | string
    updatedAt?: DateTimeFilter<"IntegrationPolicy"> | Date | string
    createdBy?: StringFilter<"IntegrationPolicy"> | string
  }

  export type IntegrationPolicyOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    policyType?: SortOrder
    scope?: SortOrder
    rules?: SortOrder
    conditions?: SortOrderInput | SortOrder
    actions?: SortOrderInput | SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    enforcementMode?: SortOrder
    violationAction?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type IntegrationPolicyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: IntegrationPolicyWhereInput | IntegrationPolicyWhereInput[]
    OR?: IntegrationPolicyWhereInput[]
    NOT?: IntegrationPolicyWhereInput | IntegrationPolicyWhereInput[]
    description?: StringNullableFilter<"IntegrationPolicy"> | string | null
    policyType?: EnumPolicyTypeFilter<"IntegrationPolicy"> | $Enums.PolicyType
    scope?: JsonFilter<"IntegrationPolicy">
    rules?: JsonFilter<"IntegrationPolicy">
    conditions?: JsonNullableFilter<"IntegrationPolicy">
    actions?: JsonNullableFilter<"IntegrationPolicy">
    enabled?: BoolFilter<"IntegrationPolicy"> | boolean
    priority?: IntFilter<"IntegrationPolicy"> | number
    enforcementMode?: EnumEnforcementModeFilter<"IntegrationPolicy"> | $Enums.EnforcementMode
    violationAction?: StringNullableFilter<"IntegrationPolicy"> | string | null
    createdAt?: DateTimeFilter<"IntegrationPolicy"> | Date | string
    updatedAt?: DateTimeFilter<"IntegrationPolicy"> | Date | string
    createdBy?: StringFilter<"IntegrationPolicy"> | string
  }, "id" | "name">

  export type IntegrationPolicyOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    policyType?: SortOrder
    scope?: SortOrder
    rules?: SortOrder
    conditions?: SortOrderInput | SortOrder
    actions?: SortOrderInput | SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    enforcementMode?: SortOrder
    violationAction?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    _count?: IntegrationPolicyCountOrderByAggregateInput
    _avg?: IntegrationPolicyAvgOrderByAggregateInput
    _max?: IntegrationPolicyMaxOrderByAggregateInput
    _min?: IntegrationPolicyMinOrderByAggregateInput
    _sum?: IntegrationPolicySumOrderByAggregateInput
  }

  export type IntegrationPolicyScalarWhereWithAggregatesInput = {
    AND?: IntegrationPolicyScalarWhereWithAggregatesInput | IntegrationPolicyScalarWhereWithAggregatesInput[]
    OR?: IntegrationPolicyScalarWhereWithAggregatesInput[]
    NOT?: IntegrationPolicyScalarWhereWithAggregatesInput | IntegrationPolicyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IntegrationPolicy"> | string
    name?: StringWithAggregatesFilter<"IntegrationPolicy"> | string
    description?: StringNullableWithAggregatesFilter<"IntegrationPolicy"> | string | null
    policyType?: EnumPolicyTypeWithAggregatesFilter<"IntegrationPolicy"> | $Enums.PolicyType
    scope?: JsonWithAggregatesFilter<"IntegrationPolicy">
    rules?: JsonWithAggregatesFilter<"IntegrationPolicy">
    conditions?: JsonNullableWithAggregatesFilter<"IntegrationPolicy">
    actions?: JsonNullableWithAggregatesFilter<"IntegrationPolicy">
    enabled?: BoolWithAggregatesFilter<"IntegrationPolicy"> | boolean
    priority?: IntWithAggregatesFilter<"IntegrationPolicy"> | number
    enforcementMode?: EnumEnforcementModeWithAggregatesFilter<"IntegrationPolicy"> | $Enums.EnforcementMode
    violationAction?: StringNullableWithAggregatesFilter<"IntegrationPolicy"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"IntegrationPolicy"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"IntegrationPolicy"> | Date | string
    createdBy?: StringWithAggregatesFilter<"IntegrationPolicy"> | string
  }

  export type ConnectorTemplateWhereInput = {
    AND?: ConnectorTemplateWhereInput | ConnectorTemplateWhereInput[]
    OR?: ConnectorTemplateWhereInput[]
    NOT?: ConnectorTemplateWhereInput | ConnectorTemplateWhereInput[]
    id?: StringFilter<"ConnectorTemplate"> | string
    name?: StringFilter<"ConnectorTemplate"> | string
    connectorType?: EnumConnectorTypeFilter<"ConnectorTemplate"> | $Enums.ConnectorType
    configTemplate?: JsonFilter<"ConnectorTemplate">
    validation?: JsonNullableFilter<"ConnectorTemplate">
    documentation?: StringNullableFilter<"ConnectorTemplate"> | string | null
    category?: StringNullableFilter<"ConnectorTemplate"> | string | null
    tags?: StringNullableListFilter<"ConnectorTemplate">
    isOfficial?: BoolFilter<"ConnectorTemplate"> | boolean
    version?: StringFilter<"ConnectorTemplate"> | string
    minNovaVersion?: StringNullableFilter<"ConnectorTemplate"> | string | null
    maxNovaVersion?: StringNullableFilter<"ConnectorTemplate"> | string | null
    usageCount?: IntFilter<"ConnectorTemplate"> | number
    rating?: FloatNullableFilter<"ConnectorTemplate"> | number | null
    createdAt?: DateTimeFilter<"ConnectorTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"ConnectorTemplate"> | Date | string
    createdBy?: StringFilter<"ConnectorTemplate"> | string
  }

  export type ConnectorTemplateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    connectorType?: SortOrder
    configTemplate?: SortOrder
    validation?: SortOrderInput | SortOrder
    documentation?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    tags?: SortOrder
    isOfficial?: SortOrder
    version?: SortOrder
    minNovaVersion?: SortOrderInput | SortOrder
    maxNovaVersion?: SortOrderInput | SortOrder
    usageCount?: SortOrder
    rating?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type ConnectorTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: ConnectorTemplateWhereInput | ConnectorTemplateWhereInput[]
    OR?: ConnectorTemplateWhereInput[]
    NOT?: ConnectorTemplateWhereInput | ConnectorTemplateWhereInput[]
    connectorType?: EnumConnectorTypeFilter<"ConnectorTemplate"> | $Enums.ConnectorType
    configTemplate?: JsonFilter<"ConnectorTemplate">
    validation?: JsonNullableFilter<"ConnectorTemplate">
    documentation?: StringNullableFilter<"ConnectorTemplate"> | string | null
    category?: StringNullableFilter<"ConnectorTemplate"> | string | null
    tags?: StringNullableListFilter<"ConnectorTemplate">
    isOfficial?: BoolFilter<"ConnectorTemplate"> | boolean
    version?: StringFilter<"ConnectorTemplate"> | string
    minNovaVersion?: StringNullableFilter<"ConnectorTemplate"> | string | null
    maxNovaVersion?: StringNullableFilter<"ConnectorTemplate"> | string | null
    usageCount?: IntFilter<"ConnectorTemplate"> | number
    rating?: FloatNullableFilter<"ConnectorTemplate"> | number | null
    createdAt?: DateTimeFilter<"ConnectorTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"ConnectorTemplate"> | Date | string
    createdBy?: StringFilter<"ConnectorTemplate"> | string
  }, "id" | "name">

  export type ConnectorTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    connectorType?: SortOrder
    configTemplate?: SortOrder
    validation?: SortOrderInput | SortOrder
    documentation?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    tags?: SortOrder
    isOfficial?: SortOrder
    version?: SortOrder
    minNovaVersion?: SortOrderInput | SortOrder
    maxNovaVersion?: SortOrderInput | SortOrder
    usageCount?: SortOrder
    rating?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    _count?: ConnectorTemplateCountOrderByAggregateInput
    _avg?: ConnectorTemplateAvgOrderByAggregateInput
    _max?: ConnectorTemplateMaxOrderByAggregateInput
    _min?: ConnectorTemplateMinOrderByAggregateInput
    _sum?: ConnectorTemplateSumOrderByAggregateInput
  }

  export type ConnectorTemplateScalarWhereWithAggregatesInput = {
    AND?: ConnectorTemplateScalarWhereWithAggregatesInput | ConnectorTemplateScalarWhereWithAggregatesInput[]
    OR?: ConnectorTemplateScalarWhereWithAggregatesInput[]
    NOT?: ConnectorTemplateScalarWhereWithAggregatesInput | ConnectorTemplateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConnectorTemplate"> | string
    name?: StringWithAggregatesFilter<"ConnectorTemplate"> | string
    connectorType?: EnumConnectorTypeWithAggregatesFilter<"ConnectorTemplate"> | $Enums.ConnectorType
    configTemplate?: JsonWithAggregatesFilter<"ConnectorTemplate">
    validation?: JsonNullableWithAggregatesFilter<"ConnectorTemplate">
    documentation?: StringNullableWithAggregatesFilter<"ConnectorTemplate"> | string | null
    category?: StringNullableWithAggregatesFilter<"ConnectorTemplate"> | string | null
    tags?: StringNullableListFilter<"ConnectorTemplate">
    isOfficial?: BoolWithAggregatesFilter<"ConnectorTemplate"> | boolean
    version?: StringWithAggregatesFilter<"ConnectorTemplate"> | string
    minNovaVersion?: StringNullableWithAggregatesFilter<"ConnectorTemplate"> | string | null
    maxNovaVersion?: StringNullableWithAggregatesFilter<"ConnectorTemplate"> | string | null
    usageCount?: IntWithAggregatesFilter<"ConnectorTemplate"> | number
    rating?: FloatNullableWithAggregatesFilter<"ConnectorTemplate"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"ConnectorTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ConnectorTemplate"> | Date | string
    createdBy?: StringWithAggregatesFilter<"ConnectorTemplate"> | string
  }

  export type ConnectorCreateInput = {
    id?: string
    name: string
    type: $Enums.ConnectorType
    version?: string
    provider: string
    config: JsonNullValueInput | InputJsonValue
    capabilities: JsonNullValueInput | InputJsonValue
    status?: $Enums.ConnectorStatus
    health?: $Enums.HealthStatus
    lastHealthCheck?: Date | string | null
    lastSync?: Date | string | null
    nextSync?: Date | string | null
    syncEnabled?: boolean
    syncInterval?: number
    syncStrategy?: $Enums.SyncStrategy
    rateLimitPerMin?: number
    rateLimitPerHour?: number
    encryptionKey?: string | null
    certificate?: string | null
    tenantId: string
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    syncJobs?: SyncJobCreateNestedManyWithoutConnectorInput
    events?: IntegrationEventCreateNestedManyWithoutConnectorInput
    metrics?: ConnectorMetricCreateNestedManyWithoutConnectorInput
  }

  export type ConnectorUncheckedCreateInput = {
    id?: string
    name: string
    type: $Enums.ConnectorType
    version?: string
    provider: string
    config: JsonNullValueInput | InputJsonValue
    capabilities: JsonNullValueInput | InputJsonValue
    status?: $Enums.ConnectorStatus
    health?: $Enums.HealthStatus
    lastHealthCheck?: Date | string | null
    lastSync?: Date | string | null
    nextSync?: Date | string | null
    syncEnabled?: boolean
    syncInterval?: number
    syncStrategy?: $Enums.SyncStrategy
    rateLimitPerMin?: number
    rateLimitPerHour?: number
    encryptionKey?: string | null
    certificate?: string | null
    tenantId: string
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    syncJobs?: SyncJobUncheckedCreateNestedManyWithoutConnectorInput
    events?: IntegrationEventUncheckedCreateNestedManyWithoutConnectorInput
    metrics?: ConnectorMetricUncheckedCreateNestedManyWithoutConnectorInput
  }

  export type ConnectorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncJobs?: SyncJobUpdateManyWithoutConnectorNestedInput
    events?: IntegrationEventUpdateManyWithoutConnectorNestedInput
    metrics?: ConnectorMetricUpdateManyWithoutConnectorNestedInput
  }

  export type ConnectorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncJobs?: SyncJobUncheckedUpdateManyWithoutConnectorNestedInput
    events?: IntegrationEventUncheckedUpdateManyWithoutConnectorNestedInput
    metrics?: ConnectorMetricUncheckedUpdateManyWithoutConnectorNestedInput
  }

  export type ConnectorCreateManyInput = {
    id?: string
    name: string
    type: $Enums.ConnectorType
    version?: string
    provider: string
    config: JsonNullValueInput | InputJsonValue
    capabilities: JsonNullValueInput | InputJsonValue
    status?: $Enums.ConnectorStatus
    health?: $Enums.HealthStatus
    lastHealthCheck?: Date | string | null
    lastSync?: Date | string | null
    nextSync?: Date | string | null
    syncEnabled?: boolean
    syncInterval?: number
    syncStrategy?: $Enums.SyncStrategy
    rateLimitPerMin?: number
    rateLimitPerHour?: number
    encryptionKey?: string | null
    certificate?: string | null
    tenantId: string
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConnectorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConnectorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SyncJobCreateInput = {
    id?: string
    jobType: $Enums.SyncJobType
    strategy: $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.JobStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    duration?: number | null
    recordsProcessed?: number
    recordsSucceeded?: number
    recordsFailed?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    triggerType?: $Enums.TriggerType
    triggeredBy?: string | null
    createdAt?: Date | string
    connector: ConnectorCreateNestedOneWithoutSyncJobsInput
  }

  export type SyncJobUncheckedCreateInput = {
    id?: string
    connectorId: string
    jobType: $Enums.SyncJobType
    strategy: $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.JobStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    duration?: number | null
    recordsProcessed?: number
    recordsSucceeded?: number
    recordsFailed?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    triggerType?: $Enums.TriggerType
    triggeredBy?: string | null
    createdAt?: Date | string
  }

  export type SyncJobUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: EnumSyncJobTypeFieldUpdateOperationsInput | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    recordsProcessed?: IntFieldUpdateOperationsInput | number
    recordsSucceeded?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerType?: EnumTriggerTypeFieldUpdateOperationsInput | $Enums.TriggerType
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connector?: ConnectorUpdateOneRequiredWithoutSyncJobsNestedInput
  }

  export type SyncJobUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    connectorId?: StringFieldUpdateOperationsInput | string
    jobType?: EnumSyncJobTypeFieldUpdateOperationsInput | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    recordsProcessed?: IntFieldUpdateOperationsInput | number
    recordsSucceeded?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerType?: EnumTriggerTypeFieldUpdateOperationsInput | $Enums.TriggerType
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SyncJobCreateManyInput = {
    id?: string
    connectorId: string
    jobType: $Enums.SyncJobType
    strategy: $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.JobStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    duration?: number | null
    recordsProcessed?: number
    recordsSucceeded?: number
    recordsFailed?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    triggerType?: $Enums.TriggerType
    triggeredBy?: string | null
    createdAt?: Date | string
  }

  export type SyncJobUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: EnumSyncJobTypeFieldUpdateOperationsInput | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    recordsProcessed?: IntFieldUpdateOperationsInput | number
    recordsSucceeded?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerType?: EnumTriggerTypeFieldUpdateOperationsInput | $Enums.TriggerType
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SyncJobUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    connectorId?: StringFieldUpdateOperationsInput | string
    jobType?: EnumSyncJobTypeFieldUpdateOperationsInput | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    recordsProcessed?: IntFieldUpdateOperationsInput | number
    recordsSucceeded?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerType?: EnumTriggerTypeFieldUpdateOperationsInput | $Enums.TriggerType
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IdentityMappingCreateInput = {
    id?: string
    novaUserId: string
    email: string
    emailCanonical: string
    externalMappings: JsonNullValueInput | InputJsonValue
    confidence?: number
    lastVerified?: Date | string | null
    verificationMethod?: string | null
    status?: $Enums.MappingStatus
    conflictResolution?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type IdentityMappingUncheckedCreateInput = {
    id?: string
    novaUserId: string
    email: string
    emailCanonical: string
    externalMappings: JsonNullValueInput | InputJsonValue
    confidence?: number
    lastVerified?: Date | string | null
    verificationMethod?: string | null
    status?: $Enums.MappingStatus
    conflictResolution?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type IdentityMappingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    novaUserId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    externalMappings?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    lastVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    verificationMethod?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMappingStatusFieldUpdateOperationsInput | $Enums.MappingStatus
    conflictResolution?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type IdentityMappingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    novaUserId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    externalMappings?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    lastVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    verificationMethod?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMappingStatusFieldUpdateOperationsInput | $Enums.MappingStatus
    conflictResolution?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type IdentityMappingCreateManyInput = {
    id?: string
    novaUserId: string
    email: string
    emailCanonical: string
    externalMappings: JsonNullValueInput | InputJsonValue
    confidence?: number
    lastVerified?: Date | string | null
    verificationMethod?: string | null
    status?: $Enums.MappingStatus
    conflictResolution?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type IdentityMappingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    novaUserId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    externalMappings?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    lastVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    verificationMethod?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMappingStatusFieldUpdateOperationsInput | $Enums.MappingStatus
    conflictResolution?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type IdentityMappingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    novaUserId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailCanonical?: StringFieldUpdateOperationsInput | string
    externalMappings?: JsonNullValueInput | InputJsonValue
    confidence?: FloatFieldUpdateOperationsInput | number
    lastVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    verificationMethod?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumMappingStatusFieldUpdateOperationsInput | $Enums.MappingStatus
    conflictResolution?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type TransformationRuleCreateInput = {
    id?: string
    name: string
    sourceConnector: string
    sourceField: string
    targetField: string
    transformType: $Enums.TransformationType
    transformConfig: JsonNullValueInput | InputJsonValue
    validationRules?: NullableJsonNullValueInput | InputJsonValue
    defaultValue?: string | null
    enabled?: boolean
    priority?: number
    lastApplied?: Date | string | null
    successCount?: number
    errorCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type TransformationRuleUncheckedCreateInput = {
    id?: string
    name: string
    sourceConnector: string
    sourceField: string
    targetField: string
    transformType: $Enums.TransformationType
    transformConfig: JsonNullValueInput | InputJsonValue
    validationRules?: NullableJsonNullValueInput | InputJsonValue
    defaultValue?: string | null
    enabled?: boolean
    priority?: number
    lastApplied?: Date | string | null
    successCount?: number
    errorCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type TransformationRuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sourceConnector?: StringFieldUpdateOperationsInput | string
    sourceField?: StringFieldUpdateOperationsInput | string
    targetField?: StringFieldUpdateOperationsInput | string
    transformType?: EnumTransformationTypeFieldUpdateOperationsInput | $Enums.TransformationType
    transformConfig?: JsonNullValueInput | InputJsonValue
    validationRules?: NullableJsonNullValueInput | InputJsonValue
    defaultValue?: NullableStringFieldUpdateOperationsInput | string | null
    enabled?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    lastApplied?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type TransformationRuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sourceConnector?: StringFieldUpdateOperationsInput | string
    sourceField?: StringFieldUpdateOperationsInput | string
    targetField?: StringFieldUpdateOperationsInput | string
    transformType?: EnumTransformationTypeFieldUpdateOperationsInput | $Enums.TransformationType
    transformConfig?: JsonNullValueInput | InputJsonValue
    validationRules?: NullableJsonNullValueInput | InputJsonValue
    defaultValue?: NullableStringFieldUpdateOperationsInput | string | null
    enabled?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    lastApplied?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type TransformationRuleCreateManyInput = {
    id?: string
    name: string
    sourceConnector: string
    sourceField: string
    targetField: string
    transformType: $Enums.TransformationType
    transformConfig: JsonNullValueInput | InputJsonValue
    validationRules?: NullableJsonNullValueInput | InputJsonValue
    defaultValue?: string | null
    enabled?: boolean
    priority?: number
    lastApplied?: Date | string | null
    successCount?: number
    errorCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type TransformationRuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sourceConnector?: StringFieldUpdateOperationsInput | string
    sourceField?: StringFieldUpdateOperationsInput | string
    targetField?: StringFieldUpdateOperationsInput | string
    transformType?: EnumTransformationTypeFieldUpdateOperationsInput | $Enums.TransformationType
    transformConfig?: JsonNullValueInput | InputJsonValue
    validationRules?: NullableJsonNullValueInput | InputJsonValue
    defaultValue?: NullableStringFieldUpdateOperationsInput | string | null
    enabled?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    lastApplied?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type TransformationRuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sourceConnector?: StringFieldUpdateOperationsInput | string
    sourceField?: StringFieldUpdateOperationsInput | string
    targetField?: StringFieldUpdateOperationsInput | string
    transformType?: EnumTransformationTypeFieldUpdateOperationsInput | $Enums.TransformationType
    transformConfig?: JsonNullValueInput | InputJsonValue
    validationRules?: NullableJsonNullValueInput | InputJsonValue
    defaultValue?: NullableStringFieldUpdateOperationsInput | string | null
    enabled?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    lastApplied?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type IntegrationEventCreateInput = {
    id?: string
    eventType: string
    eventCategory: $Enums.EventCategory
    source: string
    data: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    status?: $Enums.EventStatus
    processedAt?: Date | string | null
    retryCount?: number
    maxRetries?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: boolean
    timestamp?: Date | string
    expiresAt?: Date | string | null
    connector?: ConnectorCreateNestedOneWithoutEventsInput
  }

  export type IntegrationEventUncheckedCreateInput = {
    id?: string
    eventType: string
    eventCategory: $Enums.EventCategory
    source: string
    data: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    status?: $Enums.EventStatus
    processedAt?: Date | string | null
    retryCount?: number
    maxRetries?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: boolean
    connectorId?: string | null
    timestamp?: Date | string
    expiresAt?: Date | string | null
  }

  export type IntegrationEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    eventCategory?: EnumEventCategoryFieldUpdateOperationsInput | $Enums.EventCategory
    source?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: BoolFieldUpdateOperationsInput | boolean
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    connector?: ConnectorUpdateOneWithoutEventsNestedInput
  }

  export type IntegrationEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    eventCategory?: EnumEventCategoryFieldUpdateOperationsInput | $Enums.EventCategory
    source?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: BoolFieldUpdateOperationsInput | boolean
    connectorId?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type IntegrationEventCreateManyInput = {
    id?: string
    eventType: string
    eventCategory: $Enums.EventCategory
    source: string
    data: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    status?: $Enums.EventStatus
    processedAt?: Date | string | null
    retryCount?: number
    maxRetries?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: boolean
    connectorId?: string | null
    timestamp?: Date | string
    expiresAt?: Date | string | null
  }

  export type IntegrationEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    eventCategory?: EnumEventCategoryFieldUpdateOperationsInput | $Enums.EventCategory
    source?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: BoolFieldUpdateOperationsInput | boolean
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type IntegrationEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    eventCategory?: EnumEventCategoryFieldUpdateOperationsInput | $Enums.EventCategory
    source?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: BoolFieldUpdateOperationsInput | boolean
    connectorId?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ConnectorMetricCreateInput = {
    id?: string
    metricType: $Enums.MetricType
    metricName: string
    value: number
    unit?: string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricCreatetagsInput | string[]
    timestamp?: Date | string
    interval?: number | null
    connector: ConnectorCreateNestedOneWithoutMetricsInput
  }

  export type ConnectorMetricUncheckedCreateInput = {
    id?: string
    connectorId: string
    metricType: $Enums.MetricType
    metricName: string
    value: number
    unit?: string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricCreatetagsInput | string[]
    timestamp?: Date | string
    interval?: number | null
  }

  export type ConnectorMetricUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricType?: EnumMetricTypeFieldUpdateOperationsInput | $Enums.MetricType
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
    connector?: ConnectorUpdateOneRequiredWithoutMetricsNestedInput
  }

  export type ConnectorMetricUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    connectorId?: StringFieldUpdateOperationsInput | string
    metricType?: EnumMetricTypeFieldUpdateOperationsInput | $Enums.MetricType
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ConnectorMetricCreateManyInput = {
    id?: string
    connectorId: string
    metricType: $Enums.MetricType
    metricName: string
    value: number
    unit?: string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricCreatetagsInput | string[]
    timestamp?: Date | string
    interval?: number | null
  }

  export type ConnectorMetricUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricType?: EnumMetricTypeFieldUpdateOperationsInput | $Enums.MetricType
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ConnectorMetricUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    connectorId?: StringFieldUpdateOperationsInput | string
    metricType?: EnumMetricTypeFieldUpdateOperationsInput | $Enums.MetricType
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DataQualityCheckCreateInput = {
    id?: string
    checkName: string
    checkType: $Enums.QualityCheckType
    dataSource: string
    field?: string | null
    rules: JsonNullValueInput | InputJsonValue
    status?: $Enums.QualityStatus
    score?: number | null
    recordsChecked?: number
    recordsPassed?: number
    recordsFailed?: number
    issues?: NullableJsonNullValueInput | InputJsonValue
    severity?: $Enums.QualitySeverity
    executedAt?: Date | string
    duration?: number | null
  }

  export type DataQualityCheckUncheckedCreateInput = {
    id?: string
    checkName: string
    checkType: $Enums.QualityCheckType
    dataSource: string
    field?: string | null
    rules: JsonNullValueInput | InputJsonValue
    status?: $Enums.QualityStatus
    score?: number | null
    recordsChecked?: number
    recordsPassed?: number
    recordsFailed?: number
    issues?: NullableJsonNullValueInput | InputJsonValue
    severity?: $Enums.QualitySeverity
    executedAt?: Date | string
    duration?: number | null
  }

  export type DataQualityCheckUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkName?: StringFieldUpdateOperationsInput | string
    checkType?: EnumQualityCheckTypeFieldUpdateOperationsInput | $Enums.QualityCheckType
    dataSource?: StringFieldUpdateOperationsInput | string
    field?: NullableStringFieldUpdateOperationsInput | string | null
    rules?: JsonNullValueInput | InputJsonValue
    status?: EnumQualityStatusFieldUpdateOperationsInput | $Enums.QualityStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    recordsChecked?: IntFieldUpdateOperationsInput | number
    recordsPassed?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    issues?: NullableJsonNullValueInput | InputJsonValue
    severity?: EnumQualitySeverityFieldUpdateOperationsInput | $Enums.QualitySeverity
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DataQualityCheckUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkName?: StringFieldUpdateOperationsInput | string
    checkType?: EnumQualityCheckTypeFieldUpdateOperationsInput | $Enums.QualityCheckType
    dataSource?: StringFieldUpdateOperationsInput | string
    field?: NullableStringFieldUpdateOperationsInput | string | null
    rules?: JsonNullValueInput | InputJsonValue
    status?: EnumQualityStatusFieldUpdateOperationsInput | $Enums.QualityStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    recordsChecked?: IntFieldUpdateOperationsInput | number
    recordsPassed?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    issues?: NullableJsonNullValueInput | InputJsonValue
    severity?: EnumQualitySeverityFieldUpdateOperationsInput | $Enums.QualitySeverity
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DataQualityCheckCreateManyInput = {
    id?: string
    checkName: string
    checkType: $Enums.QualityCheckType
    dataSource: string
    field?: string | null
    rules: JsonNullValueInput | InputJsonValue
    status?: $Enums.QualityStatus
    score?: number | null
    recordsChecked?: number
    recordsPassed?: number
    recordsFailed?: number
    issues?: NullableJsonNullValueInput | InputJsonValue
    severity?: $Enums.QualitySeverity
    executedAt?: Date | string
    duration?: number | null
  }

  export type DataQualityCheckUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkName?: StringFieldUpdateOperationsInput | string
    checkType?: EnumQualityCheckTypeFieldUpdateOperationsInput | $Enums.QualityCheckType
    dataSource?: StringFieldUpdateOperationsInput | string
    field?: NullableStringFieldUpdateOperationsInput | string | null
    rules?: JsonNullValueInput | InputJsonValue
    status?: EnumQualityStatusFieldUpdateOperationsInput | $Enums.QualityStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    recordsChecked?: IntFieldUpdateOperationsInput | number
    recordsPassed?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    issues?: NullableJsonNullValueInput | InputJsonValue
    severity?: EnumQualitySeverityFieldUpdateOperationsInput | $Enums.QualitySeverity
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DataQualityCheckUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkName?: StringFieldUpdateOperationsInput | string
    checkType?: EnumQualityCheckTypeFieldUpdateOperationsInput | $Enums.QualityCheckType
    dataSource?: StringFieldUpdateOperationsInput | string
    field?: NullableStringFieldUpdateOperationsInput | string | null
    rules?: JsonNullValueInput | InputJsonValue
    status?: EnumQualityStatusFieldUpdateOperationsInput | $Enums.QualityStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    recordsChecked?: IntFieldUpdateOperationsInput | number
    recordsPassed?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    issues?: NullableJsonNullValueInput | InputJsonValue
    severity?: EnumQualitySeverityFieldUpdateOperationsInput | $Enums.QualitySeverity
    executedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type IntegrationPolicyCreateInput = {
    id?: string
    name: string
    description?: string | null
    policyType: $Enums.PolicyType
    scope: JsonNullValueInput | InputJsonValue
    rules: JsonNullValueInput | InputJsonValue
    conditions?: NullableJsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    enabled?: boolean
    priority?: number
    enforcementMode?: $Enums.EnforcementMode
    violationAction?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type IntegrationPolicyUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    policyType: $Enums.PolicyType
    scope: JsonNullValueInput | InputJsonValue
    rules: JsonNullValueInput | InputJsonValue
    conditions?: NullableJsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    enabled?: boolean
    priority?: number
    enforcementMode?: $Enums.EnforcementMode
    violationAction?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type IntegrationPolicyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    policyType?: EnumPolicyTypeFieldUpdateOperationsInput | $Enums.PolicyType
    scope?: JsonNullValueInput | InputJsonValue
    rules?: JsonNullValueInput | InputJsonValue
    conditions?: NullableJsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    enforcementMode?: EnumEnforcementModeFieldUpdateOperationsInput | $Enums.EnforcementMode
    violationAction?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type IntegrationPolicyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    policyType?: EnumPolicyTypeFieldUpdateOperationsInput | $Enums.PolicyType
    scope?: JsonNullValueInput | InputJsonValue
    rules?: JsonNullValueInput | InputJsonValue
    conditions?: NullableJsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    enforcementMode?: EnumEnforcementModeFieldUpdateOperationsInput | $Enums.EnforcementMode
    violationAction?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type IntegrationPolicyCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    policyType: $Enums.PolicyType
    scope: JsonNullValueInput | InputJsonValue
    rules: JsonNullValueInput | InputJsonValue
    conditions?: NullableJsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    enabled?: boolean
    priority?: number
    enforcementMode?: $Enums.EnforcementMode
    violationAction?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type IntegrationPolicyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    policyType?: EnumPolicyTypeFieldUpdateOperationsInput | $Enums.PolicyType
    scope?: JsonNullValueInput | InputJsonValue
    rules?: JsonNullValueInput | InputJsonValue
    conditions?: NullableJsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    enforcementMode?: EnumEnforcementModeFieldUpdateOperationsInput | $Enums.EnforcementMode
    violationAction?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type IntegrationPolicyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    policyType?: EnumPolicyTypeFieldUpdateOperationsInput | $Enums.PolicyType
    scope?: JsonNullValueInput | InputJsonValue
    rules?: JsonNullValueInput | InputJsonValue
    conditions?: NullableJsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    priority?: IntFieldUpdateOperationsInput | number
    enforcementMode?: EnumEnforcementModeFieldUpdateOperationsInput | $Enums.EnforcementMode
    violationAction?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type ConnectorTemplateCreateInput = {
    id?: string
    name: string
    connectorType: $Enums.ConnectorType
    configTemplate: JsonNullValueInput | InputJsonValue
    validation?: NullableJsonNullValueInput | InputJsonValue
    documentation?: string | null
    category?: string | null
    tags?: ConnectorTemplateCreatetagsInput | string[]
    isOfficial?: boolean
    version?: string
    minNovaVersion?: string | null
    maxNovaVersion?: string | null
    usageCount?: number
    rating?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type ConnectorTemplateUncheckedCreateInput = {
    id?: string
    name: string
    connectorType: $Enums.ConnectorType
    configTemplate: JsonNullValueInput | InputJsonValue
    validation?: NullableJsonNullValueInput | InputJsonValue
    documentation?: string | null
    category?: string | null
    tags?: ConnectorTemplateCreatetagsInput | string[]
    isOfficial?: boolean
    version?: string
    minNovaVersion?: string | null
    maxNovaVersion?: string | null
    usageCount?: number
    rating?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type ConnectorTemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    connectorType?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    configTemplate?: JsonNullValueInput | InputJsonValue
    validation?: NullableJsonNullValueInput | InputJsonValue
    documentation?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ConnectorTemplateUpdatetagsInput | string[]
    isOfficial?: BoolFieldUpdateOperationsInput | boolean
    version?: StringFieldUpdateOperationsInput | string
    minNovaVersion?: NullableStringFieldUpdateOperationsInput | string | null
    maxNovaVersion?: NullableStringFieldUpdateOperationsInput | string | null
    usageCount?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type ConnectorTemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    connectorType?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    configTemplate?: JsonNullValueInput | InputJsonValue
    validation?: NullableJsonNullValueInput | InputJsonValue
    documentation?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ConnectorTemplateUpdatetagsInput | string[]
    isOfficial?: BoolFieldUpdateOperationsInput | boolean
    version?: StringFieldUpdateOperationsInput | string
    minNovaVersion?: NullableStringFieldUpdateOperationsInput | string | null
    maxNovaVersion?: NullableStringFieldUpdateOperationsInput | string | null
    usageCount?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type ConnectorTemplateCreateManyInput = {
    id?: string
    name: string
    connectorType: $Enums.ConnectorType
    configTemplate: JsonNullValueInput | InputJsonValue
    validation?: NullableJsonNullValueInput | InputJsonValue
    documentation?: string | null
    category?: string | null
    tags?: ConnectorTemplateCreatetagsInput | string[]
    isOfficial?: boolean
    version?: string
    minNovaVersion?: string | null
    maxNovaVersion?: string | null
    usageCount?: number
    rating?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type ConnectorTemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    connectorType?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    configTemplate?: JsonNullValueInput | InputJsonValue
    validation?: NullableJsonNullValueInput | InputJsonValue
    documentation?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ConnectorTemplateUpdatetagsInput | string[]
    isOfficial?: BoolFieldUpdateOperationsInput | boolean
    version?: StringFieldUpdateOperationsInput | string
    minNovaVersion?: NullableStringFieldUpdateOperationsInput | string | null
    maxNovaVersion?: NullableStringFieldUpdateOperationsInput | string | null
    usageCount?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type ConnectorTemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    connectorType?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    configTemplate?: JsonNullValueInput | InputJsonValue
    validation?: NullableJsonNullValueInput | InputJsonValue
    documentation?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ConnectorTemplateUpdatetagsInput | string[]
    isOfficial?: BoolFieldUpdateOperationsInput | boolean
    version?: StringFieldUpdateOperationsInput | string
    minNovaVersion?: NullableStringFieldUpdateOperationsInput | string | null
    maxNovaVersion?: NullableStringFieldUpdateOperationsInput | string | null
    usageCount?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
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

  export type EnumConnectorTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ConnectorType | EnumConnectorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConnectorType[] | ListEnumConnectorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConnectorType[] | ListEnumConnectorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConnectorTypeFilter<$PrismaModel> | $Enums.ConnectorType
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
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

  export type EnumConnectorStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ConnectorStatus | EnumConnectorStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ConnectorStatus[] | ListEnumConnectorStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConnectorStatus[] | ListEnumConnectorStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumConnectorStatusFilter<$PrismaModel> | $Enums.ConnectorStatus
  }

  export type EnumHealthStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.HealthStatus | EnumHealthStatusFieldRefInput<$PrismaModel>
    in?: $Enums.HealthStatus[] | ListEnumHealthStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.HealthStatus[] | ListEnumHealthStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumHealthStatusFilter<$PrismaModel> | $Enums.HealthStatus
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type EnumSyncStrategyFilter<$PrismaModel = never> = {
    equals?: $Enums.SyncStrategy | EnumSyncStrategyFieldRefInput<$PrismaModel>
    in?: $Enums.SyncStrategy[] | ListEnumSyncStrategyFieldRefInput<$PrismaModel>
    notIn?: $Enums.SyncStrategy[] | ListEnumSyncStrategyFieldRefInput<$PrismaModel>
    not?: NestedEnumSyncStrategyFilter<$PrismaModel> | $Enums.SyncStrategy
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

  export type SyncJobListRelationFilter = {
    every?: SyncJobWhereInput
    some?: SyncJobWhereInput
    none?: SyncJobWhereInput
  }

  export type IntegrationEventListRelationFilter = {
    every?: IntegrationEventWhereInput
    some?: IntegrationEventWhereInput
    none?: IntegrationEventWhereInput
  }

  export type ConnectorMetricListRelationFilter = {
    every?: ConnectorMetricWhereInput
    some?: ConnectorMetricWhereInput
    none?: ConnectorMetricWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SyncJobOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IntegrationEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ConnectorMetricOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ConnectorCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    version?: SortOrder
    provider?: SortOrder
    config?: SortOrder
    capabilities?: SortOrder
    status?: SortOrder
    health?: SortOrder
    lastHealthCheck?: SortOrder
    lastSync?: SortOrder
    nextSync?: SortOrder
    syncEnabled?: SortOrder
    syncInterval?: SortOrder
    syncStrategy?: SortOrder
    rateLimitPerMin?: SortOrder
    rateLimitPerHour?: SortOrder
    encryptionKey?: SortOrder
    certificate?: SortOrder
    tenantId?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConnectorAvgOrderByAggregateInput = {
    syncInterval?: SortOrder
    rateLimitPerMin?: SortOrder
    rateLimitPerHour?: SortOrder
  }

  export type ConnectorMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    version?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    health?: SortOrder
    lastHealthCheck?: SortOrder
    lastSync?: SortOrder
    nextSync?: SortOrder
    syncEnabled?: SortOrder
    syncInterval?: SortOrder
    syncStrategy?: SortOrder
    rateLimitPerMin?: SortOrder
    rateLimitPerHour?: SortOrder
    encryptionKey?: SortOrder
    certificate?: SortOrder
    tenantId?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConnectorMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    version?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    health?: SortOrder
    lastHealthCheck?: SortOrder
    lastSync?: SortOrder
    nextSync?: SortOrder
    syncEnabled?: SortOrder
    syncInterval?: SortOrder
    syncStrategy?: SortOrder
    rateLimitPerMin?: SortOrder
    rateLimitPerHour?: SortOrder
    encryptionKey?: SortOrder
    certificate?: SortOrder
    tenantId?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConnectorSumOrderByAggregateInput = {
    syncInterval?: SortOrder
    rateLimitPerMin?: SortOrder
    rateLimitPerHour?: SortOrder
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

  export type EnumConnectorTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConnectorType | EnumConnectorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConnectorType[] | ListEnumConnectorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConnectorType[] | ListEnumConnectorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConnectorTypeWithAggregatesFilter<$PrismaModel> | $Enums.ConnectorType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConnectorTypeFilter<$PrismaModel>
    _max?: NestedEnumConnectorTypeFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumConnectorStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConnectorStatus | EnumConnectorStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ConnectorStatus[] | ListEnumConnectorStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConnectorStatus[] | ListEnumConnectorStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumConnectorStatusWithAggregatesFilter<$PrismaModel> | $Enums.ConnectorStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConnectorStatusFilter<$PrismaModel>
    _max?: NestedEnumConnectorStatusFilter<$PrismaModel>
  }

  export type EnumHealthStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HealthStatus | EnumHealthStatusFieldRefInput<$PrismaModel>
    in?: $Enums.HealthStatus[] | ListEnumHealthStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.HealthStatus[] | ListEnumHealthStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumHealthStatusWithAggregatesFilter<$PrismaModel> | $Enums.HealthStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumHealthStatusFilter<$PrismaModel>
    _max?: NestedEnumHealthStatusFilter<$PrismaModel>
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type EnumSyncStrategyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SyncStrategy | EnumSyncStrategyFieldRefInput<$PrismaModel>
    in?: $Enums.SyncStrategy[] | ListEnumSyncStrategyFieldRefInput<$PrismaModel>
    notIn?: $Enums.SyncStrategy[] | ListEnumSyncStrategyFieldRefInput<$PrismaModel>
    not?: NestedEnumSyncStrategyWithAggregatesFilter<$PrismaModel> | $Enums.SyncStrategy
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSyncStrategyFilter<$PrismaModel>
    _max?: NestedEnumSyncStrategyFilter<$PrismaModel>
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

  export type EnumSyncJobTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SyncJobType | EnumSyncJobTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SyncJobType[] | ListEnumSyncJobTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SyncJobType[] | ListEnumSyncJobTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSyncJobTypeFilter<$PrismaModel> | $Enums.SyncJobType
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

  export type EnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus
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

  export type EnumTriggerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TriggerType | EnumTriggerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TriggerType[] | ListEnumTriggerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TriggerType[] | ListEnumTriggerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTriggerTypeFilter<$PrismaModel> | $Enums.TriggerType
  }

  export type ConnectorScalarRelationFilter = {
    is?: ConnectorWhereInput
    isNot?: ConnectorWhereInput
  }

  export type SyncJobCountOrderByAggregateInput = {
    id?: SortOrder
    connectorId?: SortOrder
    jobType?: SortOrder
    strategy?: SortOrder
    options?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    duration?: SortOrder
    recordsProcessed?: SortOrder
    recordsSucceeded?: SortOrder
    recordsFailed?: SortOrder
    errorMessage?: SortOrder
    errorDetails?: SortOrder
    correlationId?: SortOrder
    triggerType?: SortOrder
    triggeredBy?: SortOrder
    createdAt?: SortOrder
  }

  export type SyncJobAvgOrderByAggregateInput = {
    duration?: SortOrder
    recordsProcessed?: SortOrder
    recordsSucceeded?: SortOrder
    recordsFailed?: SortOrder
  }

  export type SyncJobMaxOrderByAggregateInput = {
    id?: SortOrder
    connectorId?: SortOrder
    jobType?: SortOrder
    strategy?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    duration?: SortOrder
    recordsProcessed?: SortOrder
    recordsSucceeded?: SortOrder
    recordsFailed?: SortOrder
    errorMessage?: SortOrder
    correlationId?: SortOrder
    triggerType?: SortOrder
    triggeredBy?: SortOrder
    createdAt?: SortOrder
  }

  export type SyncJobMinOrderByAggregateInput = {
    id?: SortOrder
    connectorId?: SortOrder
    jobType?: SortOrder
    strategy?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    duration?: SortOrder
    recordsProcessed?: SortOrder
    recordsSucceeded?: SortOrder
    recordsFailed?: SortOrder
    errorMessage?: SortOrder
    correlationId?: SortOrder
    triggerType?: SortOrder
    triggeredBy?: SortOrder
    createdAt?: SortOrder
  }

  export type SyncJobSumOrderByAggregateInput = {
    duration?: SortOrder
    recordsProcessed?: SortOrder
    recordsSucceeded?: SortOrder
    recordsFailed?: SortOrder
  }

  export type EnumSyncJobTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SyncJobType | EnumSyncJobTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SyncJobType[] | ListEnumSyncJobTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SyncJobType[] | ListEnumSyncJobTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSyncJobTypeWithAggregatesFilter<$PrismaModel> | $Enums.SyncJobType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSyncJobTypeFilter<$PrismaModel>
    _max?: NestedEnumSyncJobTypeFilter<$PrismaModel>
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

  export type EnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobStatusFilter<$PrismaModel>
    _max?: NestedEnumJobStatusFilter<$PrismaModel>
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

  export type EnumTriggerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TriggerType | EnumTriggerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TriggerType[] | ListEnumTriggerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TriggerType[] | ListEnumTriggerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTriggerTypeWithAggregatesFilter<$PrismaModel> | $Enums.TriggerType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTriggerTypeFilter<$PrismaModel>
    _max?: NestedEnumTriggerTypeFilter<$PrismaModel>
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

  export type EnumMappingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MappingStatus | EnumMappingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MappingStatus[] | ListEnumMappingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MappingStatus[] | ListEnumMappingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMappingStatusFilter<$PrismaModel> | $Enums.MappingStatus
  }

  export type IdentityMappingCountOrderByAggregateInput = {
    id?: SortOrder
    novaUserId?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    externalMappings?: SortOrder
    confidence?: SortOrder
    lastVerified?: SortOrder
    verificationMethod?: SortOrder
    status?: SortOrder
    conflictResolution?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type IdentityMappingAvgOrderByAggregateInput = {
    confidence?: SortOrder
  }

  export type IdentityMappingMaxOrderByAggregateInput = {
    id?: SortOrder
    novaUserId?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    confidence?: SortOrder
    lastVerified?: SortOrder
    verificationMethod?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type IdentityMappingMinOrderByAggregateInput = {
    id?: SortOrder
    novaUserId?: SortOrder
    email?: SortOrder
    emailCanonical?: SortOrder
    confidence?: SortOrder
    lastVerified?: SortOrder
    verificationMethod?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type IdentityMappingSumOrderByAggregateInput = {
    confidence?: SortOrder
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

  export type EnumMappingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MappingStatus | EnumMappingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MappingStatus[] | ListEnumMappingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MappingStatus[] | ListEnumMappingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMappingStatusWithAggregatesFilter<$PrismaModel> | $Enums.MappingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMappingStatusFilter<$PrismaModel>
    _max?: NestedEnumMappingStatusFilter<$PrismaModel>
  }

  export type EnumTransformationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransformationType | EnumTransformationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransformationType[] | ListEnumTransformationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransformationType[] | ListEnumTransformationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransformationTypeFilter<$PrismaModel> | $Enums.TransformationType
  }

  export type TransformationRuleSourceConnectorSourceFieldTargetFieldCompoundUniqueInput = {
    sourceConnector: string
    sourceField: string
    targetField: string
  }

  export type TransformationRuleCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sourceConnector?: SortOrder
    sourceField?: SortOrder
    targetField?: SortOrder
    transformType?: SortOrder
    transformConfig?: SortOrder
    validationRules?: SortOrder
    defaultValue?: SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    lastApplied?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type TransformationRuleAvgOrderByAggregateInput = {
    priority?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
  }

  export type TransformationRuleMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sourceConnector?: SortOrder
    sourceField?: SortOrder
    targetField?: SortOrder
    transformType?: SortOrder
    defaultValue?: SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    lastApplied?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type TransformationRuleMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sourceConnector?: SortOrder
    sourceField?: SortOrder
    targetField?: SortOrder
    transformType?: SortOrder
    defaultValue?: SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    lastApplied?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type TransformationRuleSumOrderByAggregateInput = {
    priority?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
  }

  export type EnumTransformationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransformationType | EnumTransformationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransformationType[] | ListEnumTransformationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransformationType[] | ListEnumTransformationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransformationTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransformationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransformationTypeFilter<$PrismaModel>
    _max?: NestedEnumTransformationTypeFilter<$PrismaModel>
  }

  export type EnumEventCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.EventCategory | EnumEventCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.EventCategory[] | ListEnumEventCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventCategory[] | ListEnumEventCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumEventCategoryFilter<$PrismaModel> | $Enums.EventCategory
  }

  export type EnumEventStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EventStatus | EnumEventStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEventStatusFilter<$PrismaModel> | $Enums.EventStatus
  }

  export type ConnectorNullableScalarRelationFilter = {
    is?: ConnectorWhereInput | null
    isNot?: ConnectorWhereInput | null
  }

  export type IntegrationEventCountOrderByAggregateInput = {
    id?: SortOrder
    eventType?: SortOrder
    eventCategory?: SortOrder
    source?: SortOrder
    data?: SortOrder
    metadata?: SortOrder
    correlationId?: SortOrder
    status?: SortOrder
    processedAt?: SortOrder
    retryCount?: SortOrder
    maxRetries?: SortOrder
    errorMessage?: SortOrder
    errorDetails?: SortOrder
    deadLetterQueue?: SortOrder
    connectorId?: SortOrder
    timestamp?: SortOrder
    expiresAt?: SortOrder
  }

  export type IntegrationEventAvgOrderByAggregateInput = {
    retryCount?: SortOrder
    maxRetries?: SortOrder
  }

  export type IntegrationEventMaxOrderByAggregateInput = {
    id?: SortOrder
    eventType?: SortOrder
    eventCategory?: SortOrder
    source?: SortOrder
    correlationId?: SortOrder
    status?: SortOrder
    processedAt?: SortOrder
    retryCount?: SortOrder
    maxRetries?: SortOrder
    errorMessage?: SortOrder
    deadLetterQueue?: SortOrder
    connectorId?: SortOrder
    timestamp?: SortOrder
    expiresAt?: SortOrder
  }

  export type IntegrationEventMinOrderByAggregateInput = {
    id?: SortOrder
    eventType?: SortOrder
    eventCategory?: SortOrder
    source?: SortOrder
    correlationId?: SortOrder
    status?: SortOrder
    processedAt?: SortOrder
    retryCount?: SortOrder
    maxRetries?: SortOrder
    errorMessage?: SortOrder
    deadLetterQueue?: SortOrder
    connectorId?: SortOrder
    timestamp?: SortOrder
    expiresAt?: SortOrder
  }

  export type IntegrationEventSumOrderByAggregateInput = {
    retryCount?: SortOrder
    maxRetries?: SortOrder
  }

  export type EnumEventCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EventCategory | EnumEventCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.EventCategory[] | ListEnumEventCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventCategory[] | ListEnumEventCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumEventCategoryWithAggregatesFilter<$PrismaModel> | $Enums.EventCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEventCategoryFilter<$PrismaModel>
    _max?: NestedEnumEventCategoryFilter<$PrismaModel>
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

  export type EnumMetricTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MetricType | EnumMetricTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MetricType[] | ListEnumMetricTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MetricType[] | ListEnumMetricTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMetricTypeFilter<$PrismaModel> | $Enums.MetricType
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type ConnectorMetricCountOrderByAggregateInput = {
    id?: SortOrder
    connectorId?: SortOrder
    metricType?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    dimensions?: SortOrder
    tags?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrder
  }

  export type ConnectorMetricAvgOrderByAggregateInput = {
    value?: SortOrder
    interval?: SortOrder
  }

  export type ConnectorMetricMaxOrderByAggregateInput = {
    id?: SortOrder
    connectorId?: SortOrder
    metricType?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrder
  }

  export type ConnectorMetricMinOrderByAggregateInput = {
    id?: SortOrder
    connectorId?: SortOrder
    metricType?: SortOrder
    metricName?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    timestamp?: SortOrder
    interval?: SortOrder
  }

  export type ConnectorMetricSumOrderByAggregateInput = {
    value?: SortOrder
    interval?: SortOrder
  }

  export type EnumMetricTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MetricType | EnumMetricTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MetricType[] | ListEnumMetricTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MetricType[] | ListEnumMetricTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMetricTypeWithAggregatesFilter<$PrismaModel> | $Enums.MetricType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMetricTypeFilter<$PrismaModel>
    _max?: NestedEnumMetricTypeFilter<$PrismaModel>
  }

  export type EnumQualityCheckTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.QualityCheckType | EnumQualityCheckTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QualityCheckType[] | ListEnumQualityCheckTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualityCheckType[] | ListEnumQualityCheckTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQualityCheckTypeFilter<$PrismaModel> | $Enums.QualityCheckType
  }

  export type EnumQualityStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.QualityStatus | EnumQualityStatusFieldRefInput<$PrismaModel>
    in?: $Enums.QualityStatus[] | ListEnumQualityStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualityStatus[] | ListEnumQualityStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumQualityStatusFilter<$PrismaModel> | $Enums.QualityStatus
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
  }

  export type EnumQualitySeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.QualitySeverity | EnumQualitySeverityFieldRefInput<$PrismaModel>
    in?: $Enums.QualitySeverity[] | ListEnumQualitySeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualitySeverity[] | ListEnumQualitySeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumQualitySeverityFilter<$PrismaModel> | $Enums.QualitySeverity
  }

  export type DataQualityCheckCountOrderByAggregateInput = {
    id?: SortOrder
    checkName?: SortOrder
    checkType?: SortOrder
    dataSource?: SortOrder
    field?: SortOrder
    rules?: SortOrder
    status?: SortOrder
    score?: SortOrder
    recordsChecked?: SortOrder
    recordsPassed?: SortOrder
    recordsFailed?: SortOrder
    issues?: SortOrder
    severity?: SortOrder
    executedAt?: SortOrder
    duration?: SortOrder
  }

  export type DataQualityCheckAvgOrderByAggregateInput = {
    score?: SortOrder
    recordsChecked?: SortOrder
    recordsPassed?: SortOrder
    recordsFailed?: SortOrder
    duration?: SortOrder
  }

  export type DataQualityCheckMaxOrderByAggregateInput = {
    id?: SortOrder
    checkName?: SortOrder
    checkType?: SortOrder
    dataSource?: SortOrder
    field?: SortOrder
    status?: SortOrder
    score?: SortOrder
    recordsChecked?: SortOrder
    recordsPassed?: SortOrder
    recordsFailed?: SortOrder
    severity?: SortOrder
    executedAt?: SortOrder
    duration?: SortOrder
  }

  export type DataQualityCheckMinOrderByAggregateInput = {
    id?: SortOrder
    checkName?: SortOrder
    checkType?: SortOrder
    dataSource?: SortOrder
    field?: SortOrder
    status?: SortOrder
    score?: SortOrder
    recordsChecked?: SortOrder
    recordsPassed?: SortOrder
    recordsFailed?: SortOrder
    severity?: SortOrder
    executedAt?: SortOrder
    duration?: SortOrder
  }

  export type DataQualityCheckSumOrderByAggregateInput = {
    score?: SortOrder
    recordsChecked?: SortOrder
    recordsPassed?: SortOrder
    recordsFailed?: SortOrder
    duration?: SortOrder
  }

  export type EnumQualityCheckTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QualityCheckType | EnumQualityCheckTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QualityCheckType[] | ListEnumQualityCheckTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualityCheckType[] | ListEnumQualityCheckTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQualityCheckTypeWithAggregatesFilter<$PrismaModel> | $Enums.QualityCheckType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQualityCheckTypeFilter<$PrismaModel>
    _max?: NestedEnumQualityCheckTypeFilter<$PrismaModel>
  }

  export type EnumQualityStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QualityStatus | EnumQualityStatusFieldRefInput<$PrismaModel>
    in?: $Enums.QualityStatus[] | ListEnumQualityStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualityStatus[] | ListEnumQualityStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumQualityStatusWithAggregatesFilter<$PrismaModel> | $Enums.QualityStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQualityStatusFilter<$PrismaModel>
    _max?: NestedEnumQualityStatusFilter<$PrismaModel>
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
  }

  export type EnumQualitySeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QualitySeverity | EnumQualitySeverityFieldRefInput<$PrismaModel>
    in?: $Enums.QualitySeverity[] | ListEnumQualitySeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualitySeverity[] | ListEnumQualitySeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumQualitySeverityWithAggregatesFilter<$PrismaModel> | $Enums.QualitySeverity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQualitySeverityFilter<$PrismaModel>
    _max?: NestedEnumQualitySeverityFilter<$PrismaModel>
  }

  export type EnumPolicyTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyType | EnumPolicyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PolicyType[] | ListEnumPolicyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PolicyType[] | ListEnumPolicyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPolicyTypeFilter<$PrismaModel> | $Enums.PolicyType
  }

  export type EnumEnforcementModeFilter<$PrismaModel = never> = {
    equals?: $Enums.EnforcementMode | EnumEnforcementModeFieldRefInput<$PrismaModel>
    in?: $Enums.EnforcementMode[] | ListEnumEnforcementModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EnforcementMode[] | ListEnumEnforcementModeFieldRefInput<$PrismaModel>
    not?: NestedEnumEnforcementModeFilter<$PrismaModel> | $Enums.EnforcementMode
  }

  export type IntegrationPolicyCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    policyType?: SortOrder
    scope?: SortOrder
    rules?: SortOrder
    conditions?: SortOrder
    actions?: SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    enforcementMode?: SortOrder
    violationAction?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type IntegrationPolicyAvgOrderByAggregateInput = {
    priority?: SortOrder
  }

  export type IntegrationPolicyMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    policyType?: SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    enforcementMode?: SortOrder
    violationAction?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type IntegrationPolicyMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    policyType?: SortOrder
    enabled?: SortOrder
    priority?: SortOrder
    enforcementMode?: SortOrder
    violationAction?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type IntegrationPolicySumOrderByAggregateInput = {
    priority?: SortOrder
  }

  export type EnumPolicyTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyType | EnumPolicyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PolicyType[] | ListEnumPolicyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PolicyType[] | ListEnumPolicyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPolicyTypeWithAggregatesFilter<$PrismaModel> | $Enums.PolicyType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPolicyTypeFilter<$PrismaModel>
    _max?: NestedEnumPolicyTypeFilter<$PrismaModel>
  }

  export type EnumEnforcementModeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EnforcementMode | EnumEnforcementModeFieldRefInput<$PrismaModel>
    in?: $Enums.EnforcementMode[] | ListEnumEnforcementModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EnforcementMode[] | ListEnumEnforcementModeFieldRefInput<$PrismaModel>
    not?: NestedEnumEnforcementModeWithAggregatesFilter<$PrismaModel> | $Enums.EnforcementMode
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEnforcementModeFilter<$PrismaModel>
    _max?: NestedEnumEnforcementModeFilter<$PrismaModel>
  }

  export type ConnectorTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    connectorType?: SortOrder
    configTemplate?: SortOrder
    validation?: SortOrder
    documentation?: SortOrder
    category?: SortOrder
    tags?: SortOrder
    isOfficial?: SortOrder
    version?: SortOrder
    minNovaVersion?: SortOrder
    maxNovaVersion?: SortOrder
    usageCount?: SortOrder
    rating?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type ConnectorTemplateAvgOrderByAggregateInput = {
    usageCount?: SortOrder
    rating?: SortOrder
  }

  export type ConnectorTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    connectorType?: SortOrder
    documentation?: SortOrder
    category?: SortOrder
    isOfficial?: SortOrder
    version?: SortOrder
    minNovaVersion?: SortOrder
    maxNovaVersion?: SortOrder
    usageCount?: SortOrder
    rating?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type ConnectorTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    connectorType?: SortOrder
    documentation?: SortOrder
    category?: SortOrder
    isOfficial?: SortOrder
    version?: SortOrder
    minNovaVersion?: SortOrder
    maxNovaVersion?: SortOrder
    usageCount?: SortOrder
    rating?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type ConnectorTemplateSumOrderByAggregateInput = {
    usageCount?: SortOrder
    rating?: SortOrder
  }

  export type SyncJobCreateNestedManyWithoutConnectorInput = {
    create?: XOR<SyncJobCreateWithoutConnectorInput, SyncJobUncheckedCreateWithoutConnectorInput> | SyncJobCreateWithoutConnectorInput[] | SyncJobUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: SyncJobCreateOrConnectWithoutConnectorInput | SyncJobCreateOrConnectWithoutConnectorInput[]
    createMany?: SyncJobCreateManyConnectorInputEnvelope
    connect?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
  }

  export type IntegrationEventCreateNestedManyWithoutConnectorInput = {
    create?: XOR<IntegrationEventCreateWithoutConnectorInput, IntegrationEventUncheckedCreateWithoutConnectorInput> | IntegrationEventCreateWithoutConnectorInput[] | IntegrationEventUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: IntegrationEventCreateOrConnectWithoutConnectorInput | IntegrationEventCreateOrConnectWithoutConnectorInput[]
    createMany?: IntegrationEventCreateManyConnectorInputEnvelope
    connect?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
  }

  export type ConnectorMetricCreateNestedManyWithoutConnectorInput = {
    create?: XOR<ConnectorMetricCreateWithoutConnectorInput, ConnectorMetricUncheckedCreateWithoutConnectorInput> | ConnectorMetricCreateWithoutConnectorInput[] | ConnectorMetricUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: ConnectorMetricCreateOrConnectWithoutConnectorInput | ConnectorMetricCreateOrConnectWithoutConnectorInput[]
    createMany?: ConnectorMetricCreateManyConnectorInputEnvelope
    connect?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
  }

  export type SyncJobUncheckedCreateNestedManyWithoutConnectorInput = {
    create?: XOR<SyncJobCreateWithoutConnectorInput, SyncJobUncheckedCreateWithoutConnectorInput> | SyncJobCreateWithoutConnectorInput[] | SyncJobUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: SyncJobCreateOrConnectWithoutConnectorInput | SyncJobCreateOrConnectWithoutConnectorInput[]
    createMany?: SyncJobCreateManyConnectorInputEnvelope
    connect?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
  }

  export type IntegrationEventUncheckedCreateNestedManyWithoutConnectorInput = {
    create?: XOR<IntegrationEventCreateWithoutConnectorInput, IntegrationEventUncheckedCreateWithoutConnectorInput> | IntegrationEventCreateWithoutConnectorInput[] | IntegrationEventUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: IntegrationEventCreateOrConnectWithoutConnectorInput | IntegrationEventCreateOrConnectWithoutConnectorInput[]
    createMany?: IntegrationEventCreateManyConnectorInputEnvelope
    connect?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
  }

  export type ConnectorMetricUncheckedCreateNestedManyWithoutConnectorInput = {
    create?: XOR<ConnectorMetricCreateWithoutConnectorInput, ConnectorMetricUncheckedCreateWithoutConnectorInput> | ConnectorMetricCreateWithoutConnectorInput[] | ConnectorMetricUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: ConnectorMetricCreateOrConnectWithoutConnectorInput | ConnectorMetricCreateOrConnectWithoutConnectorInput[]
    createMany?: ConnectorMetricCreateManyConnectorInputEnvelope
    connect?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumConnectorTypeFieldUpdateOperationsInput = {
    set?: $Enums.ConnectorType
  }

  export type EnumConnectorStatusFieldUpdateOperationsInput = {
    set?: $Enums.ConnectorStatus
  }

  export type EnumHealthStatusFieldUpdateOperationsInput = {
    set?: $Enums.HealthStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumSyncStrategyFieldUpdateOperationsInput = {
    set?: $Enums.SyncStrategy
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SyncJobUpdateManyWithoutConnectorNestedInput = {
    create?: XOR<SyncJobCreateWithoutConnectorInput, SyncJobUncheckedCreateWithoutConnectorInput> | SyncJobCreateWithoutConnectorInput[] | SyncJobUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: SyncJobCreateOrConnectWithoutConnectorInput | SyncJobCreateOrConnectWithoutConnectorInput[]
    upsert?: SyncJobUpsertWithWhereUniqueWithoutConnectorInput | SyncJobUpsertWithWhereUniqueWithoutConnectorInput[]
    createMany?: SyncJobCreateManyConnectorInputEnvelope
    set?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
    disconnect?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
    delete?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
    connect?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
    update?: SyncJobUpdateWithWhereUniqueWithoutConnectorInput | SyncJobUpdateWithWhereUniqueWithoutConnectorInput[]
    updateMany?: SyncJobUpdateManyWithWhereWithoutConnectorInput | SyncJobUpdateManyWithWhereWithoutConnectorInput[]
    deleteMany?: SyncJobScalarWhereInput | SyncJobScalarWhereInput[]
  }

  export type IntegrationEventUpdateManyWithoutConnectorNestedInput = {
    create?: XOR<IntegrationEventCreateWithoutConnectorInput, IntegrationEventUncheckedCreateWithoutConnectorInput> | IntegrationEventCreateWithoutConnectorInput[] | IntegrationEventUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: IntegrationEventCreateOrConnectWithoutConnectorInput | IntegrationEventCreateOrConnectWithoutConnectorInput[]
    upsert?: IntegrationEventUpsertWithWhereUniqueWithoutConnectorInput | IntegrationEventUpsertWithWhereUniqueWithoutConnectorInput[]
    createMany?: IntegrationEventCreateManyConnectorInputEnvelope
    set?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
    disconnect?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
    delete?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
    connect?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
    update?: IntegrationEventUpdateWithWhereUniqueWithoutConnectorInput | IntegrationEventUpdateWithWhereUniqueWithoutConnectorInput[]
    updateMany?: IntegrationEventUpdateManyWithWhereWithoutConnectorInput | IntegrationEventUpdateManyWithWhereWithoutConnectorInput[]
    deleteMany?: IntegrationEventScalarWhereInput | IntegrationEventScalarWhereInput[]
  }

  export type ConnectorMetricUpdateManyWithoutConnectorNestedInput = {
    create?: XOR<ConnectorMetricCreateWithoutConnectorInput, ConnectorMetricUncheckedCreateWithoutConnectorInput> | ConnectorMetricCreateWithoutConnectorInput[] | ConnectorMetricUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: ConnectorMetricCreateOrConnectWithoutConnectorInput | ConnectorMetricCreateOrConnectWithoutConnectorInput[]
    upsert?: ConnectorMetricUpsertWithWhereUniqueWithoutConnectorInput | ConnectorMetricUpsertWithWhereUniqueWithoutConnectorInput[]
    createMany?: ConnectorMetricCreateManyConnectorInputEnvelope
    set?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
    disconnect?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
    delete?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
    connect?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
    update?: ConnectorMetricUpdateWithWhereUniqueWithoutConnectorInput | ConnectorMetricUpdateWithWhereUniqueWithoutConnectorInput[]
    updateMany?: ConnectorMetricUpdateManyWithWhereWithoutConnectorInput | ConnectorMetricUpdateManyWithWhereWithoutConnectorInput[]
    deleteMany?: ConnectorMetricScalarWhereInput | ConnectorMetricScalarWhereInput[]
  }

  export type SyncJobUncheckedUpdateManyWithoutConnectorNestedInput = {
    create?: XOR<SyncJobCreateWithoutConnectorInput, SyncJobUncheckedCreateWithoutConnectorInput> | SyncJobCreateWithoutConnectorInput[] | SyncJobUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: SyncJobCreateOrConnectWithoutConnectorInput | SyncJobCreateOrConnectWithoutConnectorInput[]
    upsert?: SyncJobUpsertWithWhereUniqueWithoutConnectorInput | SyncJobUpsertWithWhereUniqueWithoutConnectorInput[]
    createMany?: SyncJobCreateManyConnectorInputEnvelope
    set?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
    disconnect?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
    delete?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
    connect?: SyncJobWhereUniqueInput | SyncJobWhereUniqueInput[]
    update?: SyncJobUpdateWithWhereUniqueWithoutConnectorInput | SyncJobUpdateWithWhereUniqueWithoutConnectorInput[]
    updateMany?: SyncJobUpdateManyWithWhereWithoutConnectorInput | SyncJobUpdateManyWithWhereWithoutConnectorInput[]
    deleteMany?: SyncJobScalarWhereInput | SyncJobScalarWhereInput[]
  }

  export type IntegrationEventUncheckedUpdateManyWithoutConnectorNestedInput = {
    create?: XOR<IntegrationEventCreateWithoutConnectorInput, IntegrationEventUncheckedCreateWithoutConnectorInput> | IntegrationEventCreateWithoutConnectorInput[] | IntegrationEventUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: IntegrationEventCreateOrConnectWithoutConnectorInput | IntegrationEventCreateOrConnectWithoutConnectorInput[]
    upsert?: IntegrationEventUpsertWithWhereUniqueWithoutConnectorInput | IntegrationEventUpsertWithWhereUniqueWithoutConnectorInput[]
    createMany?: IntegrationEventCreateManyConnectorInputEnvelope
    set?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
    disconnect?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
    delete?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
    connect?: IntegrationEventWhereUniqueInput | IntegrationEventWhereUniqueInput[]
    update?: IntegrationEventUpdateWithWhereUniqueWithoutConnectorInput | IntegrationEventUpdateWithWhereUniqueWithoutConnectorInput[]
    updateMany?: IntegrationEventUpdateManyWithWhereWithoutConnectorInput | IntegrationEventUpdateManyWithWhereWithoutConnectorInput[]
    deleteMany?: IntegrationEventScalarWhereInput | IntegrationEventScalarWhereInput[]
  }

  export type ConnectorMetricUncheckedUpdateManyWithoutConnectorNestedInput = {
    create?: XOR<ConnectorMetricCreateWithoutConnectorInput, ConnectorMetricUncheckedCreateWithoutConnectorInput> | ConnectorMetricCreateWithoutConnectorInput[] | ConnectorMetricUncheckedCreateWithoutConnectorInput[]
    connectOrCreate?: ConnectorMetricCreateOrConnectWithoutConnectorInput | ConnectorMetricCreateOrConnectWithoutConnectorInput[]
    upsert?: ConnectorMetricUpsertWithWhereUniqueWithoutConnectorInput | ConnectorMetricUpsertWithWhereUniqueWithoutConnectorInput[]
    createMany?: ConnectorMetricCreateManyConnectorInputEnvelope
    set?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
    disconnect?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
    delete?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
    connect?: ConnectorMetricWhereUniqueInput | ConnectorMetricWhereUniqueInput[]
    update?: ConnectorMetricUpdateWithWhereUniqueWithoutConnectorInput | ConnectorMetricUpdateWithWhereUniqueWithoutConnectorInput[]
    updateMany?: ConnectorMetricUpdateManyWithWhereWithoutConnectorInput | ConnectorMetricUpdateManyWithWhereWithoutConnectorInput[]
    deleteMany?: ConnectorMetricScalarWhereInput | ConnectorMetricScalarWhereInput[]
  }

  export type ConnectorCreateNestedOneWithoutSyncJobsInput = {
    create?: XOR<ConnectorCreateWithoutSyncJobsInput, ConnectorUncheckedCreateWithoutSyncJobsInput>
    connectOrCreate?: ConnectorCreateOrConnectWithoutSyncJobsInput
    connect?: ConnectorWhereUniqueInput
  }

  export type EnumSyncJobTypeFieldUpdateOperationsInput = {
    set?: $Enums.SyncJobType
  }

  export type EnumJobStatusFieldUpdateOperationsInput = {
    set?: $Enums.JobStatus
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumTriggerTypeFieldUpdateOperationsInput = {
    set?: $Enums.TriggerType
  }

  export type ConnectorUpdateOneRequiredWithoutSyncJobsNestedInput = {
    create?: XOR<ConnectorCreateWithoutSyncJobsInput, ConnectorUncheckedCreateWithoutSyncJobsInput>
    connectOrCreate?: ConnectorCreateOrConnectWithoutSyncJobsInput
    upsert?: ConnectorUpsertWithoutSyncJobsInput
    connect?: ConnectorWhereUniqueInput
    update?: XOR<XOR<ConnectorUpdateToOneWithWhereWithoutSyncJobsInput, ConnectorUpdateWithoutSyncJobsInput>, ConnectorUncheckedUpdateWithoutSyncJobsInput>
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumMappingStatusFieldUpdateOperationsInput = {
    set?: $Enums.MappingStatus
  }

  export type EnumTransformationTypeFieldUpdateOperationsInput = {
    set?: $Enums.TransformationType
  }

  export type ConnectorCreateNestedOneWithoutEventsInput = {
    create?: XOR<ConnectorCreateWithoutEventsInput, ConnectorUncheckedCreateWithoutEventsInput>
    connectOrCreate?: ConnectorCreateOrConnectWithoutEventsInput
    connect?: ConnectorWhereUniqueInput
  }

  export type EnumEventCategoryFieldUpdateOperationsInput = {
    set?: $Enums.EventCategory
  }

  export type EnumEventStatusFieldUpdateOperationsInput = {
    set?: $Enums.EventStatus
  }

  export type ConnectorUpdateOneWithoutEventsNestedInput = {
    create?: XOR<ConnectorCreateWithoutEventsInput, ConnectorUncheckedCreateWithoutEventsInput>
    connectOrCreate?: ConnectorCreateOrConnectWithoutEventsInput
    upsert?: ConnectorUpsertWithoutEventsInput
    disconnect?: ConnectorWhereInput | boolean
    delete?: ConnectorWhereInput | boolean
    connect?: ConnectorWhereUniqueInput
    update?: XOR<XOR<ConnectorUpdateToOneWithWhereWithoutEventsInput, ConnectorUpdateWithoutEventsInput>, ConnectorUncheckedUpdateWithoutEventsInput>
  }

  export type ConnectorMetricCreatetagsInput = {
    set: string[]
  }

  export type ConnectorCreateNestedOneWithoutMetricsInput = {
    create?: XOR<ConnectorCreateWithoutMetricsInput, ConnectorUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: ConnectorCreateOrConnectWithoutMetricsInput
    connect?: ConnectorWhereUniqueInput
  }

  export type EnumMetricTypeFieldUpdateOperationsInput = {
    set?: $Enums.MetricType
  }

  export type ConnectorMetricUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ConnectorUpdateOneRequiredWithoutMetricsNestedInput = {
    create?: XOR<ConnectorCreateWithoutMetricsInput, ConnectorUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: ConnectorCreateOrConnectWithoutMetricsInput
    upsert?: ConnectorUpsertWithoutMetricsInput
    connect?: ConnectorWhereUniqueInput
    update?: XOR<XOR<ConnectorUpdateToOneWithWhereWithoutMetricsInput, ConnectorUpdateWithoutMetricsInput>, ConnectorUncheckedUpdateWithoutMetricsInput>
  }

  export type EnumQualityCheckTypeFieldUpdateOperationsInput = {
    set?: $Enums.QualityCheckType
  }

  export type EnumQualityStatusFieldUpdateOperationsInput = {
    set?: $Enums.QualityStatus
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumQualitySeverityFieldUpdateOperationsInput = {
    set?: $Enums.QualitySeverity
  }

  export type EnumPolicyTypeFieldUpdateOperationsInput = {
    set?: $Enums.PolicyType
  }

  export type EnumEnforcementModeFieldUpdateOperationsInput = {
    set?: $Enums.EnforcementMode
  }

  export type ConnectorTemplateCreatetagsInput = {
    set: string[]
  }

  export type ConnectorTemplateUpdatetagsInput = {
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

  export type NestedEnumConnectorTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ConnectorType | EnumConnectorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConnectorType[] | ListEnumConnectorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConnectorType[] | ListEnumConnectorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConnectorTypeFilter<$PrismaModel> | $Enums.ConnectorType
  }

  export type NestedEnumConnectorStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ConnectorStatus | EnumConnectorStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ConnectorStatus[] | ListEnumConnectorStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConnectorStatus[] | ListEnumConnectorStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumConnectorStatusFilter<$PrismaModel> | $Enums.ConnectorStatus
  }

  export type NestedEnumHealthStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.HealthStatus | EnumHealthStatusFieldRefInput<$PrismaModel>
    in?: $Enums.HealthStatus[] | ListEnumHealthStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.HealthStatus[] | ListEnumHealthStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumHealthStatusFilter<$PrismaModel> | $Enums.HealthStatus
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedEnumSyncStrategyFilter<$PrismaModel = never> = {
    equals?: $Enums.SyncStrategy | EnumSyncStrategyFieldRefInput<$PrismaModel>
    in?: $Enums.SyncStrategy[] | ListEnumSyncStrategyFieldRefInput<$PrismaModel>
    notIn?: $Enums.SyncStrategy[] | ListEnumSyncStrategyFieldRefInput<$PrismaModel>
    not?: NestedEnumSyncStrategyFilter<$PrismaModel> | $Enums.SyncStrategy
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

  export type NestedEnumConnectorTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConnectorType | EnumConnectorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ConnectorType[] | ListEnumConnectorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConnectorType[] | ListEnumConnectorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumConnectorTypeWithAggregatesFilter<$PrismaModel> | $Enums.ConnectorType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConnectorTypeFilter<$PrismaModel>
    _max?: NestedEnumConnectorTypeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
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

  export type NestedEnumConnectorStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ConnectorStatus | EnumConnectorStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ConnectorStatus[] | ListEnumConnectorStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ConnectorStatus[] | ListEnumConnectorStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumConnectorStatusWithAggregatesFilter<$PrismaModel> | $Enums.ConnectorStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumConnectorStatusFilter<$PrismaModel>
    _max?: NestedEnumConnectorStatusFilter<$PrismaModel>
  }

  export type NestedEnumHealthStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HealthStatus | EnumHealthStatusFieldRefInput<$PrismaModel>
    in?: $Enums.HealthStatus[] | ListEnumHealthStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.HealthStatus[] | ListEnumHealthStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumHealthStatusWithAggregatesFilter<$PrismaModel> | $Enums.HealthStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumHealthStatusFilter<$PrismaModel>
    _max?: NestedEnumHealthStatusFilter<$PrismaModel>
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedEnumSyncStrategyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SyncStrategy | EnumSyncStrategyFieldRefInput<$PrismaModel>
    in?: $Enums.SyncStrategy[] | ListEnumSyncStrategyFieldRefInput<$PrismaModel>
    notIn?: $Enums.SyncStrategy[] | ListEnumSyncStrategyFieldRefInput<$PrismaModel>
    not?: NestedEnumSyncStrategyWithAggregatesFilter<$PrismaModel> | $Enums.SyncStrategy
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSyncStrategyFilter<$PrismaModel>
    _max?: NestedEnumSyncStrategyFilter<$PrismaModel>
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

  export type NestedEnumSyncJobTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SyncJobType | EnumSyncJobTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SyncJobType[] | ListEnumSyncJobTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SyncJobType[] | ListEnumSyncJobTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSyncJobTypeFilter<$PrismaModel> | $Enums.SyncJobType
  }

  export type NestedEnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus
  }

  export type NestedEnumTriggerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TriggerType | EnumTriggerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TriggerType[] | ListEnumTriggerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TriggerType[] | ListEnumTriggerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTriggerTypeFilter<$PrismaModel> | $Enums.TriggerType
  }

  export type NestedEnumSyncJobTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SyncJobType | EnumSyncJobTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SyncJobType[] | ListEnumSyncJobTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SyncJobType[] | ListEnumSyncJobTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSyncJobTypeWithAggregatesFilter<$PrismaModel> | $Enums.SyncJobType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSyncJobTypeFilter<$PrismaModel>
    _max?: NestedEnumSyncJobTypeFilter<$PrismaModel>
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

  export type NestedEnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobStatusFilter<$PrismaModel>
    _max?: NestedEnumJobStatusFilter<$PrismaModel>
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

  export type NestedEnumTriggerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TriggerType | EnumTriggerTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TriggerType[] | ListEnumTriggerTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TriggerType[] | ListEnumTriggerTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTriggerTypeWithAggregatesFilter<$PrismaModel> | $Enums.TriggerType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTriggerTypeFilter<$PrismaModel>
    _max?: NestedEnumTriggerTypeFilter<$PrismaModel>
  }

  export type NestedEnumMappingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MappingStatus | EnumMappingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MappingStatus[] | ListEnumMappingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MappingStatus[] | ListEnumMappingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMappingStatusFilter<$PrismaModel> | $Enums.MappingStatus
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

  export type NestedEnumMappingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MappingStatus | EnumMappingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MappingStatus[] | ListEnumMappingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MappingStatus[] | ListEnumMappingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMappingStatusWithAggregatesFilter<$PrismaModel> | $Enums.MappingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMappingStatusFilter<$PrismaModel>
    _max?: NestedEnumMappingStatusFilter<$PrismaModel>
  }

  export type NestedEnumTransformationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransformationType | EnumTransformationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransformationType[] | ListEnumTransformationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransformationType[] | ListEnumTransformationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransformationTypeFilter<$PrismaModel> | $Enums.TransformationType
  }

  export type NestedEnumTransformationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransformationType | EnumTransformationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransformationType[] | ListEnumTransformationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransformationType[] | ListEnumTransformationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransformationTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransformationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransformationTypeFilter<$PrismaModel>
    _max?: NestedEnumTransformationTypeFilter<$PrismaModel>
  }

  export type NestedEnumEventCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.EventCategory | EnumEventCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.EventCategory[] | ListEnumEventCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventCategory[] | ListEnumEventCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumEventCategoryFilter<$PrismaModel> | $Enums.EventCategory
  }

  export type NestedEnumEventStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EventStatus | EnumEventStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventStatus[] | ListEnumEventStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEventStatusFilter<$PrismaModel> | $Enums.EventStatus
  }

  export type NestedEnumEventCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EventCategory | EnumEventCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.EventCategory[] | ListEnumEventCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.EventCategory[] | ListEnumEventCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumEventCategoryWithAggregatesFilter<$PrismaModel> | $Enums.EventCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEventCategoryFilter<$PrismaModel>
    _max?: NestedEnumEventCategoryFilter<$PrismaModel>
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

  export type NestedEnumMetricTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MetricType | EnumMetricTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MetricType[] | ListEnumMetricTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MetricType[] | ListEnumMetricTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMetricTypeFilter<$PrismaModel> | $Enums.MetricType
  }

  export type NestedEnumMetricTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MetricType | EnumMetricTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MetricType[] | ListEnumMetricTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MetricType[] | ListEnumMetricTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMetricTypeWithAggregatesFilter<$PrismaModel> | $Enums.MetricType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMetricTypeFilter<$PrismaModel>
    _max?: NestedEnumMetricTypeFilter<$PrismaModel>
  }

  export type NestedEnumQualityCheckTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.QualityCheckType | EnumQualityCheckTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QualityCheckType[] | ListEnumQualityCheckTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualityCheckType[] | ListEnumQualityCheckTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQualityCheckTypeFilter<$PrismaModel> | $Enums.QualityCheckType
  }

  export type NestedEnumQualityStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.QualityStatus | EnumQualityStatusFieldRefInput<$PrismaModel>
    in?: $Enums.QualityStatus[] | ListEnumQualityStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualityStatus[] | ListEnumQualityStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumQualityStatusFilter<$PrismaModel> | $Enums.QualityStatus
  }

  export type NestedEnumQualitySeverityFilter<$PrismaModel = never> = {
    equals?: $Enums.QualitySeverity | EnumQualitySeverityFieldRefInput<$PrismaModel>
    in?: $Enums.QualitySeverity[] | ListEnumQualitySeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualitySeverity[] | ListEnumQualitySeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumQualitySeverityFilter<$PrismaModel> | $Enums.QualitySeverity
  }

  export type NestedEnumQualityCheckTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QualityCheckType | EnumQualityCheckTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QualityCheckType[] | ListEnumQualityCheckTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualityCheckType[] | ListEnumQualityCheckTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQualityCheckTypeWithAggregatesFilter<$PrismaModel> | $Enums.QualityCheckType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQualityCheckTypeFilter<$PrismaModel>
    _max?: NestedEnumQualityCheckTypeFilter<$PrismaModel>
  }

  export type NestedEnumQualityStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QualityStatus | EnumQualityStatusFieldRefInput<$PrismaModel>
    in?: $Enums.QualityStatus[] | ListEnumQualityStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualityStatus[] | ListEnumQualityStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumQualityStatusWithAggregatesFilter<$PrismaModel> | $Enums.QualityStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQualityStatusFilter<$PrismaModel>
    _max?: NestedEnumQualityStatusFilter<$PrismaModel>
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
  }

  export type NestedEnumQualitySeverityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QualitySeverity | EnumQualitySeverityFieldRefInput<$PrismaModel>
    in?: $Enums.QualitySeverity[] | ListEnumQualitySeverityFieldRefInput<$PrismaModel>
    notIn?: $Enums.QualitySeverity[] | ListEnumQualitySeverityFieldRefInput<$PrismaModel>
    not?: NestedEnumQualitySeverityWithAggregatesFilter<$PrismaModel> | $Enums.QualitySeverity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQualitySeverityFilter<$PrismaModel>
    _max?: NestedEnumQualitySeverityFilter<$PrismaModel>
  }

  export type NestedEnumPolicyTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyType | EnumPolicyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PolicyType[] | ListEnumPolicyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PolicyType[] | ListEnumPolicyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPolicyTypeFilter<$PrismaModel> | $Enums.PolicyType
  }

  export type NestedEnumEnforcementModeFilter<$PrismaModel = never> = {
    equals?: $Enums.EnforcementMode | EnumEnforcementModeFieldRefInput<$PrismaModel>
    in?: $Enums.EnforcementMode[] | ListEnumEnforcementModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EnforcementMode[] | ListEnumEnforcementModeFieldRefInput<$PrismaModel>
    not?: NestedEnumEnforcementModeFilter<$PrismaModel> | $Enums.EnforcementMode
  }

  export type NestedEnumPolicyTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyType | EnumPolicyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PolicyType[] | ListEnumPolicyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PolicyType[] | ListEnumPolicyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPolicyTypeWithAggregatesFilter<$PrismaModel> | $Enums.PolicyType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPolicyTypeFilter<$PrismaModel>
    _max?: NestedEnumPolicyTypeFilter<$PrismaModel>
  }

  export type NestedEnumEnforcementModeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EnforcementMode | EnumEnforcementModeFieldRefInput<$PrismaModel>
    in?: $Enums.EnforcementMode[] | ListEnumEnforcementModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.EnforcementMode[] | ListEnumEnforcementModeFieldRefInput<$PrismaModel>
    not?: NestedEnumEnforcementModeWithAggregatesFilter<$PrismaModel> | $Enums.EnforcementMode
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEnforcementModeFilter<$PrismaModel>
    _max?: NestedEnumEnforcementModeFilter<$PrismaModel>
  }

  export type SyncJobCreateWithoutConnectorInput = {
    id?: string
    jobType: $Enums.SyncJobType
    strategy: $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.JobStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    duration?: number | null
    recordsProcessed?: number
    recordsSucceeded?: number
    recordsFailed?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    triggerType?: $Enums.TriggerType
    triggeredBy?: string | null
    createdAt?: Date | string
  }

  export type SyncJobUncheckedCreateWithoutConnectorInput = {
    id?: string
    jobType: $Enums.SyncJobType
    strategy: $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.JobStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    duration?: number | null
    recordsProcessed?: number
    recordsSucceeded?: number
    recordsFailed?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    triggerType?: $Enums.TriggerType
    triggeredBy?: string | null
    createdAt?: Date | string
  }

  export type SyncJobCreateOrConnectWithoutConnectorInput = {
    where: SyncJobWhereUniqueInput
    create: XOR<SyncJobCreateWithoutConnectorInput, SyncJobUncheckedCreateWithoutConnectorInput>
  }

  export type SyncJobCreateManyConnectorInputEnvelope = {
    data: SyncJobCreateManyConnectorInput | SyncJobCreateManyConnectorInput[]
    skipDuplicates?: boolean
  }

  export type IntegrationEventCreateWithoutConnectorInput = {
    id?: string
    eventType: string
    eventCategory: $Enums.EventCategory
    source: string
    data: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    status?: $Enums.EventStatus
    processedAt?: Date | string | null
    retryCount?: number
    maxRetries?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: boolean
    timestamp?: Date | string
    expiresAt?: Date | string | null
  }

  export type IntegrationEventUncheckedCreateWithoutConnectorInput = {
    id?: string
    eventType: string
    eventCategory: $Enums.EventCategory
    source: string
    data: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    status?: $Enums.EventStatus
    processedAt?: Date | string | null
    retryCount?: number
    maxRetries?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: boolean
    timestamp?: Date | string
    expiresAt?: Date | string | null
  }

  export type IntegrationEventCreateOrConnectWithoutConnectorInput = {
    where: IntegrationEventWhereUniqueInput
    create: XOR<IntegrationEventCreateWithoutConnectorInput, IntegrationEventUncheckedCreateWithoutConnectorInput>
  }

  export type IntegrationEventCreateManyConnectorInputEnvelope = {
    data: IntegrationEventCreateManyConnectorInput | IntegrationEventCreateManyConnectorInput[]
    skipDuplicates?: boolean
  }

  export type ConnectorMetricCreateWithoutConnectorInput = {
    id?: string
    metricType: $Enums.MetricType
    metricName: string
    value: number
    unit?: string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricCreatetagsInput | string[]
    timestamp?: Date | string
    interval?: number | null
  }

  export type ConnectorMetricUncheckedCreateWithoutConnectorInput = {
    id?: string
    metricType: $Enums.MetricType
    metricName: string
    value: number
    unit?: string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricCreatetagsInput | string[]
    timestamp?: Date | string
    interval?: number | null
  }

  export type ConnectorMetricCreateOrConnectWithoutConnectorInput = {
    where: ConnectorMetricWhereUniqueInput
    create: XOR<ConnectorMetricCreateWithoutConnectorInput, ConnectorMetricUncheckedCreateWithoutConnectorInput>
  }

  export type ConnectorMetricCreateManyConnectorInputEnvelope = {
    data: ConnectorMetricCreateManyConnectorInput | ConnectorMetricCreateManyConnectorInput[]
    skipDuplicates?: boolean
  }

  export type SyncJobUpsertWithWhereUniqueWithoutConnectorInput = {
    where: SyncJobWhereUniqueInput
    update: XOR<SyncJobUpdateWithoutConnectorInput, SyncJobUncheckedUpdateWithoutConnectorInput>
    create: XOR<SyncJobCreateWithoutConnectorInput, SyncJobUncheckedCreateWithoutConnectorInput>
  }

  export type SyncJobUpdateWithWhereUniqueWithoutConnectorInput = {
    where: SyncJobWhereUniqueInput
    data: XOR<SyncJobUpdateWithoutConnectorInput, SyncJobUncheckedUpdateWithoutConnectorInput>
  }

  export type SyncJobUpdateManyWithWhereWithoutConnectorInput = {
    where: SyncJobScalarWhereInput
    data: XOR<SyncJobUpdateManyMutationInput, SyncJobUncheckedUpdateManyWithoutConnectorInput>
  }

  export type SyncJobScalarWhereInput = {
    AND?: SyncJobScalarWhereInput | SyncJobScalarWhereInput[]
    OR?: SyncJobScalarWhereInput[]
    NOT?: SyncJobScalarWhereInput | SyncJobScalarWhereInput[]
    id?: StringFilter<"SyncJob"> | string
    connectorId?: StringFilter<"SyncJob"> | string
    jobType?: EnumSyncJobTypeFilter<"SyncJob"> | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFilter<"SyncJob"> | $Enums.SyncStrategy
    options?: JsonNullableFilter<"SyncJob">
    status?: EnumJobStatusFilter<"SyncJob"> | $Enums.JobStatus
    startedAt?: DateTimeNullableFilter<"SyncJob"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"SyncJob"> | Date | string | null
    duration?: IntNullableFilter<"SyncJob"> | number | null
    recordsProcessed?: IntFilter<"SyncJob"> | number
    recordsSucceeded?: IntFilter<"SyncJob"> | number
    recordsFailed?: IntFilter<"SyncJob"> | number
    errorMessage?: StringNullableFilter<"SyncJob"> | string | null
    errorDetails?: JsonNullableFilter<"SyncJob">
    correlationId?: StringNullableFilter<"SyncJob"> | string | null
    triggerType?: EnumTriggerTypeFilter<"SyncJob"> | $Enums.TriggerType
    triggeredBy?: StringNullableFilter<"SyncJob"> | string | null
    createdAt?: DateTimeFilter<"SyncJob"> | Date | string
  }

  export type IntegrationEventUpsertWithWhereUniqueWithoutConnectorInput = {
    where: IntegrationEventWhereUniqueInput
    update: XOR<IntegrationEventUpdateWithoutConnectorInput, IntegrationEventUncheckedUpdateWithoutConnectorInput>
    create: XOR<IntegrationEventCreateWithoutConnectorInput, IntegrationEventUncheckedCreateWithoutConnectorInput>
  }

  export type IntegrationEventUpdateWithWhereUniqueWithoutConnectorInput = {
    where: IntegrationEventWhereUniqueInput
    data: XOR<IntegrationEventUpdateWithoutConnectorInput, IntegrationEventUncheckedUpdateWithoutConnectorInput>
  }

  export type IntegrationEventUpdateManyWithWhereWithoutConnectorInput = {
    where: IntegrationEventScalarWhereInput
    data: XOR<IntegrationEventUpdateManyMutationInput, IntegrationEventUncheckedUpdateManyWithoutConnectorInput>
  }

  export type IntegrationEventScalarWhereInput = {
    AND?: IntegrationEventScalarWhereInput | IntegrationEventScalarWhereInput[]
    OR?: IntegrationEventScalarWhereInput[]
    NOT?: IntegrationEventScalarWhereInput | IntegrationEventScalarWhereInput[]
    id?: StringFilter<"IntegrationEvent"> | string
    eventType?: StringFilter<"IntegrationEvent"> | string
    eventCategory?: EnumEventCategoryFilter<"IntegrationEvent"> | $Enums.EventCategory
    source?: StringFilter<"IntegrationEvent"> | string
    data?: JsonFilter<"IntegrationEvent">
    metadata?: JsonNullableFilter<"IntegrationEvent">
    correlationId?: StringNullableFilter<"IntegrationEvent"> | string | null
    status?: EnumEventStatusFilter<"IntegrationEvent"> | $Enums.EventStatus
    processedAt?: DateTimeNullableFilter<"IntegrationEvent"> | Date | string | null
    retryCount?: IntFilter<"IntegrationEvent"> | number
    maxRetries?: IntFilter<"IntegrationEvent"> | number
    errorMessage?: StringNullableFilter<"IntegrationEvent"> | string | null
    errorDetails?: JsonNullableFilter<"IntegrationEvent">
    deadLetterQueue?: BoolFilter<"IntegrationEvent"> | boolean
    connectorId?: StringNullableFilter<"IntegrationEvent"> | string | null
    timestamp?: DateTimeFilter<"IntegrationEvent"> | Date | string
    expiresAt?: DateTimeNullableFilter<"IntegrationEvent"> | Date | string | null
  }

  export type ConnectorMetricUpsertWithWhereUniqueWithoutConnectorInput = {
    where: ConnectorMetricWhereUniqueInput
    update: XOR<ConnectorMetricUpdateWithoutConnectorInput, ConnectorMetricUncheckedUpdateWithoutConnectorInput>
    create: XOR<ConnectorMetricCreateWithoutConnectorInput, ConnectorMetricUncheckedCreateWithoutConnectorInput>
  }

  export type ConnectorMetricUpdateWithWhereUniqueWithoutConnectorInput = {
    where: ConnectorMetricWhereUniqueInput
    data: XOR<ConnectorMetricUpdateWithoutConnectorInput, ConnectorMetricUncheckedUpdateWithoutConnectorInput>
  }

  export type ConnectorMetricUpdateManyWithWhereWithoutConnectorInput = {
    where: ConnectorMetricScalarWhereInput
    data: XOR<ConnectorMetricUpdateManyMutationInput, ConnectorMetricUncheckedUpdateManyWithoutConnectorInput>
  }

  export type ConnectorMetricScalarWhereInput = {
    AND?: ConnectorMetricScalarWhereInput | ConnectorMetricScalarWhereInput[]
    OR?: ConnectorMetricScalarWhereInput[]
    NOT?: ConnectorMetricScalarWhereInput | ConnectorMetricScalarWhereInput[]
    id?: StringFilter<"ConnectorMetric"> | string
    connectorId?: StringFilter<"ConnectorMetric"> | string
    metricType?: EnumMetricTypeFilter<"ConnectorMetric"> | $Enums.MetricType
    metricName?: StringFilter<"ConnectorMetric"> | string
    value?: FloatFilter<"ConnectorMetric"> | number
    unit?: StringNullableFilter<"ConnectorMetric"> | string | null
    dimensions?: JsonNullableFilter<"ConnectorMetric">
    tags?: StringNullableListFilter<"ConnectorMetric">
    timestamp?: DateTimeFilter<"ConnectorMetric"> | Date | string
    interval?: IntNullableFilter<"ConnectorMetric"> | number | null
  }

  export type ConnectorCreateWithoutSyncJobsInput = {
    id?: string
    name: string
    type: $Enums.ConnectorType
    version?: string
    provider: string
    config: JsonNullValueInput | InputJsonValue
    capabilities: JsonNullValueInput | InputJsonValue
    status?: $Enums.ConnectorStatus
    health?: $Enums.HealthStatus
    lastHealthCheck?: Date | string | null
    lastSync?: Date | string | null
    nextSync?: Date | string | null
    syncEnabled?: boolean
    syncInterval?: number
    syncStrategy?: $Enums.SyncStrategy
    rateLimitPerMin?: number
    rateLimitPerHour?: number
    encryptionKey?: string | null
    certificate?: string | null
    tenantId: string
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    events?: IntegrationEventCreateNestedManyWithoutConnectorInput
    metrics?: ConnectorMetricCreateNestedManyWithoutConnectorInput
  }

  export type ConnectorUncheckedCreateWithoutSyncJobsInput = {
    id?: string
    name: string
    type: $Enums.ConnectorType
    version?: string
    provider: string
    config: JsonNullValueInput | InputJsonValue
    capabilities: JsonNullValueInput | InputJsonValue
    status?: $Enums.ConnectorStatus
    health?: $Enums.HealthStatus
    lastHealthCheck?: Date | string | null
    lastSync?: Date | string | null
    nextSync?: Date | string | null
    syncEnabled?: boolean
    syncInterval?: number
    syncStrategy?: $Enums.SyncStrategy
    rateLimitPerMin?: number
    rateLimitPerHour?: number
    encryptionKey?: string | null
    certificate?: string | null
    tenantId: string
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    events?: IntegrationEventUncheckedCreateNestedManyWithoutConnectorInput
    metrics?: ConnectorMetricUncheckedCreateNestedManyWithoutConnectorInput
  }

  export type ConnectorCreateOrConnectWithoutSyncJobsInput = {
    where: ConnectorWhereUniqueInput
    create: XOR<ConnectorCreateWithoutSyncJobsInput, ConnectorUncheckedCreateWithoutSyncJobsInput>
  }

  export type ConnectorUpsertWithoutSyncJobsInput = {
    update: XOR<ConnectorUpdateWithoutSyncJobsInput, ConnectorUncheckedUpdateWithoutSyncJobsInput>
    create: XOR<ConnectorCreateWithoutSyncJobsInput, ConnectorUncheckedCreateWithoutSyncJobsInput>
    where?: ConnectorWhereInput
  }

  export type ConnectorUpdateToOneWithWhereWithoutSyncJobsInput = {
    where?: ConnectorWhereInput
    data: XOR<ConnectorUpdateWithoutSyncJobsInput, ConnectorUncheckedUpdateWithoutSyncJobsInput>
  }

  export type ConnectorUpdateWithoutSyncJobsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    events?: IntegrationEventUpdateManyWithoutConnectorNestedInput
    metrics?: ConnectorMetricUpdateManyWithoutConnectorNestedInput
  }

  export type ConnectorUncheckedUpdateWithoutSyncJobsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    events?: IntegrationEventUncheckedUpdateManyWithoutConnectorNestedInput
    metrics?: ConnectorMetricUncheckedUpdateManyWithoutConnectorNestedInput
  }

  export type ConnectorCreateWithoutEventsInput = {
    id?: string
    name: string
    type: $Enums.ConnectorType
    version?: string
    provider: string
    config: JsonNullValueInput | InputJsonValue
    capabilities: JsonNullValueInput | InputJsonValue
    status?: $Enums.ConnectorStatus
    health?: $Enums.HealthStatus
    lastHealthCheck?: Date | string | null
    lastSync?: Date | string | null
    nextSync?: Date | string | null
    syncEnabled?: boolean
    syncInterval?: number
    syncStrategy?: $Enums.SyncStrategy
    rateLimitPerMin?: number
    rateLimitPerHour?: number
    encryptionKey?: string | null
    certificate?: string | null
    tenantId: string
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    syncJobs?: SyncJobCreateNestedManyWithoutConnectorInput
    metrics?: ConnectorMetricCreateNestedManyWithoutConnectorInput
  }

  export type ConnectorUncheckedCreateWithoutEventsInput = {
    id?: string
    name: string
    type: $Enums.ConnectorType
    version?: string
    provider: string
    config: JsonNullValueInput | InputJsonValue
    capabilities: JsonNullValueInput | InputJsonValue
    status?: $Enums.ConnectorStatus
    health?: $Enums.HealthStatus
    lastHealthCheck?: Date | string | null
    lastSync?: Date | string | null
    nextSync?: Date | string | null
    syncEnabled?: boolean
    syncInterval?: number
    syncStrategy?: $Enums.SyncStrategy
    rateLimitPerMin?: number
    rateLimitPerHour?: number
    encryptionKey?: string | null
    certificate?: string | null
    tenantId: string
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    syncJobs?: SyncJobUncheckedCreateNestedManyWithoutConnectorInput
    metrics?: ConnectorMetricUncheckedCreateNestedManyWithoutConnectorInput
  }

  export type ConnectorCreateOrConnectWithoutEventsInput = {
    where: ConnectorWhereUniqueInput
    create: XOR<ConnectorCreateWithoutEventsInput, ConnectorUncheckedCreateWithoutEventsInput>
  }

  export type ConnectorUpsertWithoutEventsInput = {
    update: XOR<ConnectorUpdateWithoutEventsInput, ConnectorUncheckedUpdateWithoutEventsInput>
    create: XOR<ConnectorCreateWithoutEventsInput, ConnectorUncheckedCreateWithoutEventsInput>
    where?: ConnectorWhereInput
  }

  export type ConnectorUpdateToOneWithWhereWithoutEventsInput = {
    where?: ConnectorWhereInput
    data: XOR<ConnectorUpdateWithoutEventsInput, ConnectorUncheckedUpdateWithoutEventsInput>
  }

  export type ConnectorUpdateWithoutEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncJobs?: SyncJobUpdateManyWithoutConnectorNestedInput
    metrics?: ConnectorMetricUpdateManyWithoutConnectorNestedInput
  }

  export type ConnectorUncheckedUpdateWithoutEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncJobs?: SyncJobUncheckedUpdateManyWithoutConnectorNestedInput
    metrics?: ConnectorMetricUncheckedUpdateManyWithoutConnectorNestedInput
  }

  export type ConnectorCreateWithoutMetricsInput = {
    id?: string
    name: string
    type: $Enums.ConnectorType
    version?: string
    provider: string
    config: JsonNullValueInput | InputJsonValue
    capabilities: JsonNullValueInput | InputJsonValue
    status?: $Enums.ConnectorStatus
    health?: $Enums.HealthStatus
    lastHealthCheck?: Date | string | null
    lastSync?: Date | string | null
    nextSync?: Date | string | null
    syncEnabled?: boolean
    syncInterval?: number
    syncStrategy?: $Enums.SyncStrategy
    rateLimitPerMin?: number
    rateLimitPerHour?: number
    encryptionKey?: string | null
    certificate?: string | null
    tenantId: string
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    syncJobs?: SyncJobCreateNestedManyWithoutConnectorInput
    events?: IntegrationEventCreateNestedManyWithoutConnectorInput
  }

  export type ConnectorUncheckedCreateWithoutMetricsInput = {
    id?: string
    name: string
    type: $Enums.ConnectorType
    version?: string
    provider: string
    config: JsonNullValueInput | InputJsonValue
    capabilities: JsonNullValueInput | InputJsonValue
    status?: $Enums.ConnectorStatus
    health?: $Enums.HealthStatus
    lastHealthCheck?: Date | string | null
    lastSync?: Date | string | null
    nextSync?: Date | string | null
    syncEnabled?: boolean
    syncInterval?: number
    syncStrategy?: $Enums.SyncStrategy
    rateLimitPerMin?: number
    rateLimitPerHour?: number
    encryptionKey?: string | null
    certificate?: string | null
    tenantId: string
    createdBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
    syncJobs?: SyncJobUncheckedCreateNestedManyWithoutConnectorInput
    events?: IntegrationEventUncheckedCreateNestedManyWithoutConnectorInput
  }

  export type ConnectorCreateOrConnectWithoutMetricsInput = {
    where: ConnectorWhereUniqueInput
    create: XOR<ConnectorCreateWithoutMetricsInput, ConnectorUncheckedCreateWithoutMetricsInput>
  }

  export type ConnectorUpsertWithoutMetricsInput = {
    update: XOR<ConnectorUpdateWithoutMetricsInput, ConnectorUncheckedUpdateWithoutMetricsInput>
    create: XOR<ConnectorCreateWithoutMetricsInput, ConnectorUncheckedCreateWithoutMetricsInput>
    where?: ConnectorWhereInput
  }

  export type ConnectorUpdateToOneWithWhereWithoutMetricsInput = {
    where?: ConnectorWhereInput
    data: XOR<ConnectorUpdateWithoutMetricsInput, ConnectorUncheckedUpdateWithoutMetricsInput>
  }

  export type ConnectorUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncJobs?: SyncJobUpdateManyWithoutConnectorNestedInput
    events?: IntegrationEventUpdateManyWithoutConnectorNestedInput
  }

  export type ConnectorUncheckedUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumConnectorTypeFieldUpdateOperationsInput | $Enums.ConnectorType
    version?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    capabilities?: JsonNullValueInput | InputJsonValue
    status?: EnumConnectorStatusFieldUpdateOperationsInput | $Enums.ConnectorStatus
    health?: EnumHealthStatusFieldUpdateOperationsInput | $Enums.HealthStatus
    lastHealthCheck?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextSync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    syncEnabled?: BoolFieldUpdateOperationsInput | boolean
    syncInterval?: IntFieldUpdateOperationsInput | number
    syncStrategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    rateLimitPerMin?: IntFieldUpdateOperationsInput | number
    rateLimitPerHour?: IntFieldUpdateOperationsInput | number
    encryptionKey?: NullableStringFieldUpdateOperationsInput | string | null
    certificate?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncJobs?: SyncJobUncheckedUpdateManyWithoutConnectorNestedInput
    events?: IntegrationEventUncheckedUpdateManyWithoutConnectorNestedInput
  }

  export type SyncJobCreateManyConnectorInput = {
    id?: string
    jobType: $Enums.SyncJobType
    strategy: $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.JobStatus
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    duration?: number | null
    recordsProcessed?: number
    recordsSucceeded?: number
    recordsFailed?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    triggerType?: $Enums.TriggerType
    triggeredBy?: string | null
    createdAt?: Date | string
  }

  export type IntegrationEventCreateManyConnectorInput = {
    id?: string
    eventType: string
    eventCategory: $Enums.EventCategory
    source: string
    data: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: string | null
    status?: $Enums.EventStatus
    processedAt?: Date | string | null
    retryCount?: number
    maxRetries?: number
    errorMessage?: string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: boolean
    timestamp?: Date | string
    expiresAt?: Date | string | null
  }

  export type ConnectorMetricCreateManyConnectorInput = {
    id?: string
    metricType: $Enums.MetricType
    metricName: string
    value: number
    unit?: string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricCreatetagsInput | string[]
    timestamp?: Date | string
    interval?: number | null
  }

  export type SyncJobUpdateWithoutConnectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: EnumSyncJobTypeFieldUpdateOperationsInput | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    recordsProcessed?: IntFieldUpdateOperationsInput | number
    recordsSucceeded?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerType?: EnumTriggerTypeFieldUpdateOperationsInput | $Enums.TriggerType
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SyncJobUncheckedUpdateWithoutConnectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: EnumSyncJobTypeFieldUpdateOperationsInput | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    recordsProcessed?: IntFieldUpdateOperationsInput | number
    recordsSucceeded?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerType?: EnumTriggerTypeFieldUpdateOperationsInput | $Enums.TriggerType
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SyncJobUncheckedUpdateManyWithoutConnectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: EnumSyncJobTypeFieldUpdateOperationsInput | $Enums.SyncJobType
    strategy?: EnumSyncStrategyFieldUpdateOperationsInput | $Enums.SyncStrategy
    options?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    recordsProcessed?: IntFieldUpdateOperationsInput | number
    recordsSucceeded?: IntFieldUpdateOperationsInput | number
    recordsFailed?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerType?: EnumTriggerTypeFieldUpdateOperationsInput | $Enums.TriggerType
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntegrationEventUpdateWithoutConnectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    eventCategory?: EnumEventCategoryFieldUpdateOperationsInput | $Enums.EventCategory
    source?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: BoolFieldUpdateOperationsInput | boolean
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type IntegrationEventUncheckedUpdateWithoutConnectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    eventCategory?: EnumEventCategoryFieldUpdateOperationsInput | $Enums.EventCategory
    source?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: BoolFieldUpdateOperationsInput | boolean
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type IntegrationEventUncheckedUpdateManyWithoutConnectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    eventCategory?: EnumEventCategoryFieldUpdateOperationsInput | $Enums.EventCategory
    source?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    retryCount?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    errorDetails?: NullableJsonNullValueInput | InputJsonValue
    deadLetterQueue?: BoolFieldUpdateOperationsInput | boolean
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ConnectorMetricUpdateWithoutConnectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricType?: EnumMetricTypeFieldUpdateOperationsInput | $Enums.MetricType
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ConnectorMetricUncheckedUpdateWithoutConnectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricType?: EnumMetricTypeFieldUpdateOperationsInput | $Enums.MetricType
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ConnectorMetricUncheckedUpdateManyWithoutConnectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricType?: EnumMetricTypeFieldUpdateOperationsInput | $Enums.MetricType
    metricName?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableJsonNullValueInput | InputJsonValue
    tags?: ConnectorMetricUpdatetagsInput | string[]
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    interval?: NullableIntFieldUpdateOperationsInput | number | null
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