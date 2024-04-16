import {
  ParentBasedSampler,
  SimpleSpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

const init = function (serviceName: string) {
  console.log('Initializing OpenTelemetry...');
  const traceExporter = new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  });
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(1),
    }),
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new ExpressInstrumentation({
        requestHook: (span, reqInfo) => {
          span.setAttribute(
            'request-headers',
            JSON.stringify(reqInfo.request.headers),
          );
        },
      }),
      new HttpInstrumentation(),
      new NestInstrumentation(),
    ],
  });
  const tracer = provider.getTracer(serviceName);
  console.log('Success run OpenTelemetry...');
  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    provider
      .shutdown()
      .then(() => console.log('SDK shut down successfully'))
      .catch((err) => console.log('Error shutting down SDK', err))
      .finally(() => process.exit(0));
  });
  return { tracer };
};

export default init;
