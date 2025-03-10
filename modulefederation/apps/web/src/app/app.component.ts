/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, HostListener, Injectable, Injector, ViewChild, forwardRef } from '@angular/core';
import {
  AboutDialogService, AbstractFeature, Command, DialogService, ErrorContext,
  ErrorHandler,
  MessageBus,
  HelpAdministrationService,
  LocaleManager,
  SessionManager,
  ShortcutManager,
  SpeechRecognitionManager,
  StateStorage,
  WithCommands,
  WithRouting,
  WithState
} from "@modulefederation/portal";
import { StringBuilder } from '@modulefederation/common';
import { ErrorDialog } from "./error/error-dialog";
import { ErrorEntry, ErrorStorage } from "./error/error-storage";
import { MatSidenav } from '@angular/material/sidenav';
import { ResizeEvent } from 'angular-resizable-element';
import { MatIconButton } from '@angular/material/button';
import { PluginManager, PluginsPlugin } from './plugin';

@Injectable({ providedIn: 'root' })
export class ApplicationErrorHandler {
  // constructor

  constructor( private errorStorage: ErrorStorage, private dialog: DialogService, private messageBus: MessageBus) {
  }

  // private

  private openDialog(error: ErrorEntry) {
    this.errorStorage.add(error)

    const configuration = {
      title: "Error",
      message: "Caught fatal error",
      error: error
    }

    return this.dialog.openDialog(ErrorDialog, {
      data: configuration
    })
  }

  // handler

  @ErrorHandler()
  handleAnyError(e: any, context: ErrorContext) {
    this.openDialog({error: e, context: context, date: new Date()})
  }

  @ErrorHandler()
  handleStringError(e: string, context: ErrorContext) {
    this.openDialog({error: e, context: context, date: new Date()})
  }

  @ErrorHandler()
  handleError(e: Error, context: ErrorContext) {
    this.openDialog({error: e, context: context, date: new Date()})

    // and broadcast

    this.messageBus.broadcast({
      topic: 'errors',
      message: 'new',
      arguments: {
        error: e,
        context: context
      }
    });
  }
}

interface ApplicationState {
   url?: string
   feature?: string
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [{
      provide: AbstractFeature,
      useExisting: forwardRef(() => AppComponent)
    }]
})
export class AppComponent extends WithRouting(WithCommands(WithState<ApplicationState>()(AbstractFeature))) {
  //
  resizeStyle : any  = {
    "max-width": `30%`,
  };

  resizeValidate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX = 50;
    
    if ( event.rectangle.width &&  event.rectangle.height &&
      (event.rectangle.width < MIN_DIMENSIONS_PX || event.rectangle.height < MIN_DIMENSIONS_PX)
    ) {
      return false;
    }

    return true;
  }
 
              
  onResizeEnd(event: ResizeEvent): void {
    this.resizeStyle = {
                     // enable/disable these per your needs
      //position: 'fixed',
      //left: `${event.rectangle.left}px`,
      //top: `${event.rectangle.top}px`,
      //height: `${event.rectangle.height}px`,
      width: `${event.rectangle.width}px`,
    };
  }


  //
  @ViewChild('help') sidenav!: MatSidenav
  @ViewChild('mic') mic!: MatIconButton

  
    // instance data

    locales: string[] = []
    helpEntries: string[] = []

    pluginsListening = false

    // constructor

    constructor(private pluginManager: PluginManager, private plugins: PluginsPlugin, private speechRecognitionManager : SpeechRecognitionManager, private messageBus: MessageBus, helpAdministrationService : HelpAdministrationService, private aboutService: AboutDialogService, private stateStorage: StateStorage, private sessionManager : SessionManager, private shortcutManager: ShortcutManager, injector: Injector,  localeManager: LocaleManager) {
      super(injector)

      pluginManager.open$.subscribe(open => {
        this.pluginsListening = open

        console.log("state = " + open)
      })

      helpAdministrationService.readEntries().subscribe(entries => this.helpEntries = entries)

      speechRecognitionManager.addListener(result => {
        this.mic.ripple.launch({centered: true}) 
        return false
      }, -1)

      const printHierarchy = () => {
        const builder = new StringBuilder()

        const print = (feature: AbstractFeature, level: number) => {
          const ctr = <any>feature.constructor
          const config = ctr.$$config
          const selector = config?.componentDefinition.selectors[0][0]

          builder
            .append(" ".repeat(level))
            .append( (<any>feature.constructor)["$$feature"]?.id || "AppComponent")

            if ( selector )
              builder.append("<" + selector + ">")

            builder.append("\n")

          for ( const child of feature.children)
             print(child, level + 1)
        }

        print(this, 1)

        console.log(builder.toString())

        return
      }

      /*
        injector.get(FeatureManager).addListener({
          created: function (feature: AbstractFeature): void {
            console.log("created feature" + (<any>feature.constructor)["$$feature"]?.id)

            printHierarchy();
          },
          destroyed: function (feature: AbstractFeature): void {
            console.log("destroyed feature" + (<any>feature.constructor)["$$feature"]?.id)

            printHierarchy()
          }
        })*/

      this.locales = localeManager.supportedLocales

      this.onInit(() => this.loadState())


      this.sessionManager.start()
    }

    @Command({
      shortcut: "f1"
    })
    help() {
      for (let i = this.featureStack.length - 1; i >= 0; i--) {
        const feature = this.featureStack[i]

         if (this.helpEntries.includes(feature.path!)) {
          this.sidenav.open()
          this.messageBus.broadcast({topic: "help", message: "show", arguments: {feature: feature.path}})
          return
         }
        }
      /*let element = window.document.activeElement
      while ( element ) {
          //console.log(element.localName)

          if ((<any>element).__ngContext__ ) {
            let feature = this.features[element.localName]

            if ( feature) {
              console.log("next feature is " + feature.id)

              if ( this.entries.includes(feature.id)) {
                this.sidenav.open()
              this.messageBus.broadcast({topic: "help", message: "show", payload: {feature: feature.id}})
          


               return
               }
               else {
                console.log("skip angualr component")
               }
          } // if feature
        }

        element = element.parentElement
      } // while
      */
    }

    isRecording() : boolean {
      return this.speechRecognitionManager.isRunning()
    }

    showPlugins() {
      console.log("plugins")

      this.plugins.plugins().then(plugins => {
        console.log(plugins)
      })
    }
  
    toggleSpeech() {
        if ( this.isRecording() ) 
          this.speechRecognitionManager.stop()
        else 
          this.speechRecognitionManager.start() 
    }

    // private

    override stateID(): any {
      return {
          component: "app"
      };
  }

   override loadState() {
      this.state = this.stateStorage.load("portal" /* TODO */, this.sessionManager.currentSession());
      if ( !this.state)
         this.state = this.createState()
   }

   override saveState() {
      this.writeState(this.state?.data)

      this.stateStorage.save(this.state!, "portal" /* TODO */, this.sessionManager.currentSession());
   }

    // implement Stateful

    override applyState(state: ApplicationState) : void {
       //if (state.url)
       // this.router.navigate([state.url]);

      //if ( this.featureRegistry.findFeature(state.feature || ""))
      //this.router.navigate(["/" + state.feature?.replace(".", "/")]);
      console.log("### would redirect to " + state.url + " feature " + state.feature)
    }

    override writeState(state: ApplicationState) : void {
      state.url = this.router?.url;
      state.feature = this.getCurrentFeature().path
    }

    // host listeners

    @HostListener('window:keydown', ['$event'])
    public handleKeydown(e : any) {
      this.shortcutManager.handleKeydown(e);
    }

    // public

    about() {
        this.aboutService.show()
    }
}
