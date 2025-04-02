import { Injector, ModuleWithProviders, NgModule } from "@angular/core";
import { RxStomp } from "@stomp/rx-stomp";
import { ReplaySubject } from "rxjs";

interface WorkflowConfiguration {
    url: string
}

@NgModule({
    declarations: [],
    providers: [],
    bootstrap: [],
    imports: []
})
export class WorkflowModule {
    static injector = new ReplaySubject<Injector>(1);

    // static methods

    public static forRoot(configuration: WorkflowConfiguration): ModuleWithProviders<WorkflowModule>  {
        return {
          ngModule: WorkflowModule,
          providers: [
            {
                provide: RxStomp,
                useFactory: () => {
                  const rxStomp = new RxStomp();

                  rxStomp.configure({
                    brokerURL: configuration.url,
                    debug: (msg: string): void => {
                       console.log(new Date(), msg);
                    },
                });

                  return rxStomp;
                },
            },
          ]
        };
    }

    // constructor

    constructor(injector: Injector) {
        WorkflowModule.injector.next(injector);
    }
}