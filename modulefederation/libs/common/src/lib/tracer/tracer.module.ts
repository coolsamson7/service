import { ModuleWithProviders, NgModule } from '@angular/core';
import { Tracer } from './tracer';
import { TracerConfiguration } from './tracer-configuration';
import { TraceLevel } from './trace-level.enum';
import { ConsoleTrace } from './traces';

/**
 * the tracer module
 */
@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class TracerModule {
  // static

  static tracerConfiguration: TracerConfiguration = {
    enabled: true,
    trace: new ConsoleTrace("%d [%p]: %m\n"),
    paths: {
      "": TraceLevel.HIGH, // TODO
    },
  }

  // public

  /**
   * configure the tracing module
   * @param tracerConfiguration the configuration object
   */
  public static forRoot(tracerConfiguration: TracerConfiguration): ModuleWithProviders<TracerModule> {
    TracerModule.tracerConfiguration = tracerConfiguration

    return {
      ngModule: TracerModule,
      providers: [
        {
          provide: Tracer,
          useValue: new Tracer()
        }
      ]
    };
  }
}
