// nova-api/logger.js
// Centralized structured logger with multi-transport support (stdout, file, syslog, Splunk, Azure)

import pino from 'pino';
import pinoHttp from 'pino-http';
import * as rfs from 'rotating-file-stream';
import syslog from 'syslog-client';
import crypto from 'crypto';
import https from 'https';

// Environment-driven config
const ENV = process.env.NODE_ENV || 'development';
const SERVICE_NAME = process.env.SERVICE_NAME || 'nova-api';
const ENVIRONMENT = process.env.RUNTIME_ENV || ENV;

// SIEM toggles
const ENABLE_SYSLOG = process.env.LOG_SYSLOG_ENABLED === 'true';
const ENABLE_SPLUNK = process.env.LOG_SPLUNK_HEC_ENABLED === 'true';
const ENABLE_AZURE = process.env.LOG_AZURE_LA_ENABLED === 'true';
const ENABLE_FILE = process.env.LOG_FILE_ENABLED === 'true';

// Common log base (ECS-like fields)
const base = {
  'service.name': SERVICE_NAME,
  'cloud.account.id': process.env.CLOUD_ACCOUNT_ID || undefined,
  environment: ENVIRONMENT,
};

// Destination: stdout (pretty in dev)
const transport = ENV === 'development' && process.env.LOG_PRETTY !== 'false'
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        singleLine: true,
        messageKey: 'message',
      },
    }
  : undefined;

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || (ENV === 'production' ? 'info' : 'debug'),
  base,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'user.password',
      'password',
      'token',
      'secret',
      'authorization',
    ],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport,
});

// Optional rotating file stream
let fileStream;
if (ENABLE_FILE) {
  const logDir = process.env.LOG_DIR || '/var/log/nova';
  const fileName = process.env.LOG_FILE_NAME || `${SERVICE_NAME}.log`;
  try {
    const fs = await import('fs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch {}
  fileStream = rfs.createStream(fileName, {
    path: logDir,
    size: process.env.LOG_FILE_ROTATE_SIZE || '10M',
    interval: process.env.LOG_FILE_INTERVAL || '1d',
    maxFiles: parseInt(process.env.LOG_FILE_MAX || '14', 10),
    compress: process.env.LOG_FILE_COMPRESS === 'true' ? 'gzip' : false,
  });
}

// Optional syslog client (RFC 5424 over UDP/TCP)
let syslogClient;
if (ENABLE_SYSLOG) {
  const syslogOptions = {
    transport: (process.env.LOG_SYSLOG_PROTOCOL || 'udp').toLowerCase() === 'tcp' ? syslog.Transport.Tcp : syslog.Transport.Udp,
    port: parseInt(process.env.LOG_SYSLOG_PORT || '514', 10),
    syslogHostname: process.env.LOG_SYSLOG_HOSTNAME || undefined,
    tls: process.env.LOG_SYSLOG_TLS === 'true',
  };
  syslogClient = syslog.createClient(process.env.LOG_SYSLOG_HOST || '127.0.0.1', syslogOptions);
}

// Splunk HEC sender
async function sendToSplunkHEC(event) {
  if (!ENABLE_SPLUNK) return;
  const url = (process.env.LOG_SPLUNK_HEC_URL || '').replace(/\/$/, '') + '/services/collector/event';
  const token = process.env.LOG_SPLUNK_HEC_TOKEN;
  if (!url || !token) return;

  const payload = {
    time: Math.floor(Date.now() / 1000),
    host: process.env.LOG_HOSTNAME || SERVICE_NAME,
    source: SERVICE_NAME,
    sourcetype: process.env.LOG_SPLUNK_SOURCETYPE || 'json',
    index: process.env.LOG_SPLUNK_INDEX,
    event,
  };

  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': `Splunk ${token}`,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      res.on('data', () => {});
      res.on('end', resolve);
    });
    req.on('error', resolve);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Azure Log Analytics (Data Collector API)
function buildAzureSignature(contentLength, date, resource, sharedKey) {
  const stringToSign = `POST\n${contentLength}\napplication/json\nx-ms-date:${date}\n/api/logs`;
  const decodedKey = Buffer.from(sharedKey, 'base64');
  const hashed = crypto.createHmac('sha256', decodedKey).update(stringToSign, 'utf8').digest('base64');
  return `SharedKey ${resource}:${hashed}`;
}

async function sendToAzureLA(event) {
  if (!ENABLE_AZURE) return;
  const workspaceId = process.env.LOG_AZURE_WORKSPACE_ID;
  const sharedKey = process.env.LOG_AZURE_SHARED_KEY;
  const logType = process.env.LOG_AZURE_LOG_TYPE || 'NovaAppLogs';
  if (!workspaceId || !sharedKey) return;

  const body = JSON.stringify([event]);
  const date = new Date().toUTCString();
  const contentLength = Buffer.byteLength(body, 'utf8');
  const signature = buildAzureSignature(contentLength, date, workspaceId, sharedKey);
  const url = `https://${workspaceId}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`;

  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': signature,
        'Log-Type': logType,
        'x-ms-date': date,
        'time-generated-field': 'time',
      },
    }, (res) => {
      res.on('data', () => {});
      res.on('end', resolve);
    });
    req.on('error', resolve);
    req.write(body);
    req.end();
  });
}

// Unified emit function to fan-out to configured transports
function emit(level, event) {
  try {
    // stdout
    pinoLogger[level](event, event.message);

    // file
    if (fileStream) {
      fileStream.write(JSON.stringify({ level, ...event }) + '\n');
    }

    // syslog (map levels)
    if (syslogClient) {
      const severityMap = { fatal: 2, error: 3, warn: 4, info: 6, debug: 7, trace: 7 };
      const severity = severityMap[level] ?? 6;
      const msg = `<${severity}> ${SERVICE_NAME}: ${event.message}`;
      syslogClient.log(msg, { facility: syslog.Facility.Local0, severity });
    }

    // Splunk & Azure async (fire-and-forget)
    void sendToSplunkHEC(event);
    void sendToAzureLA(event);
  } catch {
    // Never throw from logger
  }
}

// Public logger API (compatible with existing usage)
export const logger = {
  fatal: (...args) => emit('fatal', { message: args.join(' '), time: new Date().toISOString() }),
  error: (...args) => emit('error', { message: args.join(' '), time: new Date().toISOString() }),
  warn: (...args) => emit('warn', { message: args.join(' '), time: new Date().toISOString() }),
  info: (...args) => emit('info', { message: args.join(' '), time: new Date().toISOString() }),
  debug: (...args) => emit('debug', { message: args.join(' '), time: new Date().toISOString() }),
  trace: (...args) => emit('trace', { message: args.join(' '), time: new Date().toISOString() }),
  child: (bindings = {}) => {
    const childBase = { ...base, ...bindings };
    return {
      error: (...args) => emit('error', { ...childBase, message: args.join(' '), time: new Date().toISOString() }),
      warn: (...args) => emit('warn', { ...childBase, message: args.join(' '), time: new Date().toISOString() }),
      info: (...args) => emit('info', { ...childBase, message: args.join(' '), time: new Date().toISOString() }),
      debug: (...args) => emit('debug', { ...childBase, message: args.join(' '), time: new Date().toISOString() }),
      trace: (...args) => emit('trace', { ...childBase, message: args.join(' '), time: new Date().toISOString() }),
    };
  },
};

// HTTP logger middleware (optional export)
export const httpLogger = pinoHttp({
  logger: pinoLogger,
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
      remoteAddress: req.ip,
      headers: {
        'user-agent': req.headers['user-agent'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
