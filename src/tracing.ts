'use strict';
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK, api } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as dotenv from 'dotenv';
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { B3Propagator } from '@opentelemetry/propagator-b3';

// const traceExporter = new ConsoleSpanExporter();

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
});

// const oltpExporter = new OTLPTraceExporter({
//   url: `https://api.honeycomb.io/v1/traces`,
//   headers: {
//     'x-honeycomb-team': process.env.HONEYCOMB_API_KEY,
//   },
// });

const traceExporter = jaegerExporter;

const spanProcessor =
  process.env.NODE_ENV === `development`
    ? new SimpleSpanProcessor(traceExporter)
    : new BatchSpanProcessor(traceExporter);

// Set B3 Propagator
api.propagation.setGlobalPropagator(new B3Propagator());

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'nestjs-online-shop-otel',
  }),
  spanProcessor,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
  ],
});

// start the SDK
otelSDK.start();

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(() => console.log('SDK shut down successfully'))
    .catch((err) => console.log('Error shutting down SDK', err))
    .finally(() => process.exit(0));
});

export default otelSDK;
