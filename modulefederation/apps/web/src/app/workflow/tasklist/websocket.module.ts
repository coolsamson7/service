import { Injector, ModuleWithProviders, NgModule } from "@angular/core";
import { RxStomp } from "@stomp/rx-stomp";
import { ReplaySubject } from "rxjs";

export interface WebsocketConfiguration {
    url: string
}

@NgModule({
    declarations: [],
    providers: [],
    bootstrap: [],
    imports: []
})
export class WebsocketModule /*extends AbstractModule()*/ {
    static injector = new ReplaySubject<Injector>(1);

    // static methods

    public static forRoot(configuration: WebsocketConfiguration): ModuleWithProviders<WebsocketModule>  {
        return {
          ngModule: WebsocketModule,
          providers: [
            {
                provide: RxStomp,
                useFactory: () => {
                  const rxStomp = new RxStomp();

                  rxStomp.configure({
                    brokerURL: configuration.url,
                  })

                  return rxStomp;
                },
            },
          ]
        };
    }

    // constructor

    constructor(injector: Injector) {
        //super(injector)

        WebsocketModule.injector.next(injector);
    }
}
