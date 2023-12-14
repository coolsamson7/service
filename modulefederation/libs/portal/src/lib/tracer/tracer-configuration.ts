import { TraceLevel } from'./trace-level.enum';
import { Trace } from'./trace';
import { InjectionToken } from '@angular/core';

/**
 * @ignore
 */
export const TracerConfigurationInjectionToken = new InjectionToken<TracerConfiguration>('TracerConfigInjectionToken');

/**
 * the configuration object for the tracer module
 */
export interface TracerConfiguration {
  /**
   * if <code>true</code> tracing is active
   */
  enabled: boolean;
  /**
   * the configured {@link Trace}
   */
  trace?: Trace;
  /**
   * the paths.
   */
  paths?: { [path: string]: TraceLevel };
}
