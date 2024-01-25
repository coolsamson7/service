/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, HostListener, Injectable, Injector, forwardRef } from '@angular/core';
import {
  AboutDialogService, AbstractFeature, DialogService, ErrorContext,
  ErrorHandler, FeatureData, FeatureRegistry, HandleError,
  LocaleManager,
  SessionManager,
  ShortcutManager,
  StateStorage,
  WithState
} from "@modulefederation/portal";
import { MessageBus } from "./message-bus/message-bus";
import { filter, map, switchMap } from "rxjs/operators";
import { ErrorDialog } from "./error/error-dialog";
import { ErrorEntry } from "./error/global-error-handler";
import { ErrorStorage } from "./error/error-storage";
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
@ErrorHandler()
export class Handler {
  // constructor

  constructor(private errorStorage: ErrorStorage, private dialog: DialogService, private messageBus: MessageBus, private shortcutManager: ShortcutManager) {
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

  @HandleError()
  handleAnyError(e: any, context: ErrorContext) {
    this.openDialog({error: e, context: context, date: new Date()})
  }

  @HandleError()
  handleStringError(e: string, context: ErrorContext) {
    this.openDialog({error: e, context: context, date: new Date()})
  }

  @HandleError()
  handleError(e: Error, context: ErrorContext) {
    this.openDialog({error: e, context: context, date: new Date()})

    // and broadcast

    this.messageBus.broadcast({
      topic: 'errors',
      message: 'new',
      payload: {
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
export class AppComponent extends WithState<ApplicationState>()(AbstractFeature){
    // instance data

    locales: string[] = []
    loading = false
    currentFeature? : FeatureData

    // constructor

    constructor(private activatedRoute: ActivatedRoute, private featureRegistry: FeatureRegistry, private router: Router, private aboutService: AboutDialogService, private stateStorage: StateStorage, private sessionManager : SessionManager, private shortcutManager: ShortcutManager, injector: Injector,  localeManager: LocaleManager) {
      super(injector)

      this.locales = localeManager.supportedLocales

      this.onInit(() => this.loadState())

      this.router.events
      .pipe(
          filter(event => event instanceof NavigationEnd),
          map(() => this.activatedRoute),
          map(route => route.firstChild),
          switchMap(route => (route as any).data)
      )
      .subscribe((data : any) => {
          this.currentFeature = data['feature']
      });

      this.router.events.subscribe(event => {
        switch (true) {
          case event instanceof NavigationStart: {
            this.loading = true;
            break;
          }
  
          case event instanceof NavigationEnd:
            //this.currentFeature = this.activatedRoute.firstChild?.data.feature
            this.loading = false;
            break;

          case event instanceof NavigationCancel:
          case event instanceof NavigationError: {
            this.loading = false;
            break;
          }
          default: {
            break;
          }
        }
      });

      this.sessionManager.start()
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
      state.feature = this.currentFeature?.path
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