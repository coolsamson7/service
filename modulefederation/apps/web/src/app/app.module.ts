import "reflect-metadata";

import { environment } from "../environments/environment"

import { CommandErrorInterceptor, ConfigurationManager, ConfigurationModule, SpeechRecognitionModule, TypeDescriptor, ValueConfigurationSource } from "@modulefederation/portal";
import { Tracer } from "@modulefederation/common";
Tracer.ENABLED = environment.production !== true

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, Injectable, Injector, NgModule } from '@angular/core';

import { OAuthModule } from 'angular-oauth2-oidc';
import { AppComponent, ApplicationErrorHandler } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';
import { NodesModule } from './nodes/nodes.module';
import { PortalComponentModule } from './portal/portal.module';
import { SharedModule } from './auth/auth.guard';

import {
  AbstractModule,
  CanActivateGuard,
  CanDeactivateGuard,
  CommandModule,
  EndpointLocator,
  ErrorModule,
  I18nModule, I18nResolver, LocaleModule,
  Manifest,
  OIDCAuthentication, OIDCModule,
  OIDCSessionManager,
  PortalComponentsModule,
  PortalModule,
  SecurityModule, ServerTranslationLoader,
  SessionGuard,
  Shell,
  StateModule,

} from "@modulefederation/portal";
import { TraceLevel,TracerModule, ConsoleTrace} from "@modulefederation/common"
import { MonacoEditorModule } from "@modulefederation/components";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";

import { localRoutes } from "./local.routes";
import { Route, RouteReuseStrategy } from "@angular/router";

import * as localManifest from "../assets/manifest.json"
import { ComponentsModule } from "./components/components.module";
import { authConfig } from './auth.config';
import { TranslationModule } from "./translation/translation.module";
import { UserComponent } from "./header/user/user.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuillModule } from "ngx-quill";
import { HelpComponent } from "./help/help.component";
import { ResizableModule } from "angular-resizable-element";
import { CommonModule } from "@angular/common";
import {FormDesignerModule} from "@modulefederation/form/designer";
import { MatChipsModule } from "@angular/material/chips";
import { MatSliderModule } from "@angular/material/slider";
import { MatSelectModule } from "@angular/material/select";
import {FormRendererModule} from "@modulefederation/form/renderer";
import {ThemeRuntimeModule} from "@modulefederation/form/theme/runtime";
import {ThemeDesignModule} from "@modulefederation/form/theme/design";
import {LayoutModule} from "@modulefederation/components";
import {QuestionnaireDesignerModule} from "@modulefederation/questionnaire/designer";
import {QuestionnaireModule} from "@modulefederation/questionnaire/renderer";
//import { MarkdownModule } from "ngx-markdown";
import { RxStomp } from "@stomp/rx-stomp";
import { map, Observable, ReplaySubject, share, Subject } from "rxjs";
import { PluginModule } from "./plugin";

// NEW


// NEW
@Injectable({providedIn: 'root'})
export class ApplicationEndpointLocator extends EndpointLocator {
  // constructor

  constructor(private configuration : ConfigurationManager) {
    super()
  }

  // implement

  getEndpoint(domain : string) : string {
    return this.configuration.get<string>("backend." + domain)!
  }
}

const viaThemeRuntimeModule = ThemeRuntimeModule.forRoot({
  style: 'outline'
});

const viaThemeDesignModule = ThemeDesignModule.forRoot({
  style: 'outline'
});

const questionnaireModule = QuestionnaireModule.forRoot({
  valueSetProvider: undefined
});

@Shell({
    name: "shell"
})
@NgModule({
    declarations: [
        AppComponent
    ],
    providers: [

        {
            provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
            useValue: { duration: 2500 }
        },
        {
            provide: EndpointLocator,
            useClass: ApplicationEndpointLocator
        },
    ],
    bootstrap: [AppComponent],
    imports: [
      // TODO just guessing
      CommonModule,
      MatIconModule,
      MatSliderModule,
      MatSelectModule,
      MatChipsModule,

      LayoutModule,

      PluginModule.forRoot({url:  'ws://localhost:8088/ws'}),

      // theme

      viaThemeRuntimeModule,
      viaThemeDesignModule,

      QuestionnaireDesignerModule,

      FormRendererModule,

      FormDesignerModule,

     // MarkdownModule.forRoot(),

      // form



      // questionnaire

      questionnaireModule,



        ConfigurationModule.forRoot(new ValueConfigurationSource(environment)),

        /*ErrorModule.forRoot({
           handler: [ApplicationErrorHandler]
        }),*/

        TracerModule.forRoot({
            enabled: environment.production !== true,
            trace: new ConsoleTrace('%d [%p]: %m %f\n'), // d(ate), l(evel), p(ath), m(message), f(rame)
            paths: {
                "": TraceLevel.OFF,
                "plugin": TraceLevel.FULL,
                //"form": TraceLevel.FULL,
              //"form.editor": TraceLevel.FULL,
               //"form.designer": TraceLevel.FULL,
              //"ui.dd": TraceLevel.FULL,
                //"questionnaire": TraceLevel.FULL,
                "type": TraceLevel.OFF,
                "speech": TraceLevel.OFF,
                //"portal": TraceLevel.FULL,
                "session": TraceLevel.FULL,
            }
        }),

        ResizableModule,

        MatSnackBarModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatIconModule,
        AppRoutingModule,
        ComponentsModule,
        TranslationModule,
        NodesModule,
        PortalComponentsModule,
        PortalComponentModule,
        MaterialModule,
        ErrorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,

        SpeechRecognitionModule.forRoot({
            lang: 'de-DE',
            continuous: true,
            interimResults: false
        }),

        LocaleModule.forRoot({
            locale: 'en-US',
            supportedLocales: ['en-US', 'de-DE']
        }),

        I18nModule.forRoot({
            loader: { type: ServerTranslationLoader }
        }),

        PortalModule.forRoot({
            loader: {
                //server: {},
                local: {
                    remotes: []
                  }
            },
            localRoutes: localRoutes,
            localManifest: localManifest as Manifest,
            decorateRoutes: (route: Route) => {
                route.resolve = { i18n: I18nResolver };
                route.canActivate = [CanActivateGuard, SessionGuard];
                route.canDeactivate = [CanDeactivateGuard];
            }
        }),

        QuillModule.forRoot({
        //theme: "bubble"
        }),

        CommandModule.forRoot({
          interceptors: [CommandErrorInterceptor]
        }),

        OIDCModule.forRoot({
            authConfig: authConfig
        }),

        StateModule.forRoot({}),

        SecurityModule.forRoot({
            sessionManager: OIDCSessionManager,
            authentication: OIDCAuthentication
        }),

        MonacoEditorModule.forRoot({
            defaultOptions: { theme: 'vs-dark', language: 'json' }
        }),

        SharedModule.forRoot(),
        OAuthModule.forRoot({
            resourceServer: {
                allowedUrls: [environment.backend.admin + '/administration'], // no service available yet...
                sendAccessToken: true
            }
        }),
        UserComponent,
        HelpComponent
    ]
})
export class AppModule extends AbstractModule() {
    static injector = new ReplaySubject<Injector>(1);

    constructor(injector: Injector) {
        super(injector)

        AppModule.injector.next(injector);
    }
}

/* TEST

class Foo {
    // variables

    @Injected()
    locator!: EndpointLocator

    bar!: SessionManager

    // constructor

    constructor(private id: string) {
        console.log("created " + id)
    }
}

let d = PortalModule.New(Foo, {bar: SessionManager})("foo")

console.log(d)
*/

class Version {
    // instance data

    private numbers: number[]

    // constructor

    constructor(v: string) {
       this.numbers = v.split(".").map(digit => +digit)
    }

    // 1.0.0 < 2
    // 1.0 < 1.1
    // x 1.1 < 1.1
    // 1 < 2.0.0
    // 1.0 = 1??? 1.0.0

    private pos(i: number) {
        return i < this.numbers.length ? this.numbers[i] : 0
    }

    private len() : number {
        return this.numbers.length
    }

    // public

    eq(version: Version) :boolean {
        // exactly same length

        if (this.len() !== version.len())
            return false

        // and same elements

        for ( let i = this.len() - 1; i >= 0; i--)
            if ( this.pos(i) !== version.pos(i))
                return false

        return true
    }

    lt(version: Version) :boolean {
        const len = Math.max(this.numbers.length, version.numbers.length)

        let eq = true
        for ( let i = 0; i < len; i++) {
            if ( this.pos(i) < version.pos(i))
                return true
            else if (this.pos(i) !== version.pos(i))
                eq = false
        }

        return !eq
    }

    le(version: Version) :boolean {
        const len = Math.max(this.numbers.length, version.numbers.length)

        for ( let i = 0; i < len; i++) {
            if ( this.pos(i) > version.pos(i))
                return false
        }

        return true
    }

    gt(version: Version) :boolean {
        const len = Math.max(this.numbers.length, version.numbers.length)

        let eq = true
        for ( let i = 0; i < len; i++) {
            if ( this.pos(i) > version.pos(i))
                return true
            else if (this.pos(i) !== version.pos(i))
                eq = false
        }

        return !eq
    }

    ge(version: Version) :boolean {
        const len = Math.max(this.numbers.length, version.numbers.length)


        for ( let i = 0; i < len; i++) {
            if ( this.pos(i) < version.pos(i))
                return false
        }

        return true
    }
}

type VersionComparator = (version: Version) => boolean

class VersionRange {
    // instance data

    private operations: VersionComparator[] = []

    // constructor

    constructor(version: string) {
        this.parse(version)
    }

    // private

    private compare(version: Version, op: string) : VersionComparator{
        switch (op) {
            case "<":
                return (v: Version) => v.lt(version)
            case "<=":
                return (v: Version) => v.le(version)
            case ">":
                return (v: Version) => v.gt(version)
            case ">=":
                return (v: Version) => v.ge(version)
            default:
                throw new Error("bad operator")
        }
    }

    private parse(version: string) {
        const exp = /^(?<op>(>|>=|<|<=))(?<v>\d[.\d]+)(,(?<op1>(>|>=|<|<=))(?<v1>\d[.\d]+))*$/
        const result = exp.exec(version)
        if ( result?.groups ) {
            this.operations.push(this.compare(new Version(result.groups["v"]), result.groups["op"]))

            if ( result?.groups["op1"])
                this.operations.push(this.compare(new Version(result.groups["v1"]), result.groups["op1"]))
        }
        else throw new Error(`could not parse version '${version}'`)
    }

    // public

    matches(version: Version) : boolean {
        for ( const operation of this.operations)
            if ( !operation(version))
                return false

        return true
    }
}

let t1 = new VersionRange(">1.0,<2.0.0").matches(new Version("1.2"))
let t2 = new VersionRange(">1.0,<2.0.0").matches(new Version("1.0"))
let t3 = new VersionRange(">=1.0,<2.0.0").matches(new Version("1"))
let t4 = new VersionRange(">1.0").matches(new Version("2.0.0.0"))
let t5 = new VersionRange(">=1.0,<2.0.0").matches(new Version("1"))


console.log(t1)


// NEW
