import { Injector, ModuleWithProviders, NgModule } from "@angular/core";
import { RxStomp } from "@stomp/rx-stomp";
import { ReplaySubject } from "rxjs";

interface PluginConfiguration {
    url: string
}

@NgModule({
    declarations: [],
    providers: [],
    bootstrap: [],
    imports: []
})
export class PluginModule /*extends AbstractModule()*/ {
    static injector = new ReplaySubject<Injector>(1);

    // static methods

    public static forRoot(configuration: PluginConfiguration): ModuleWithProviders<PluginModule>  {
        return {
          ngModule: PluginModule,
          providers: [
            {
                provide: RxStomp,
                useFactory: () => {
                  const rxStomp = new RxStomp();

                  rxStomp.configure({
                    brokerURL: configuration.url,
                  });
          
                  //rxStomp.activate();

                  return rxStomp;
                },
            },
          ]
        };
    }

    // constructor

    constructor(injector: Injector) {
        //super(injector)

        PluginModule.injector.next(injector);
    }
}