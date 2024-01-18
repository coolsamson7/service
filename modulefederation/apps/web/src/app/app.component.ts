/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, HostListener, Injectable, Injector, forwardRef } from '@angular/core';
import {
  AboutDialogService, AbstractFeature, ErrorContext,
  ErrorHandler, Feature, HandleError,
  LocaleManager,
  SessionManager,
  ShortcutManager,
  StateStorage,
  WithState
} from "@modulefederation/portal";
import { MessageBus } from "./message-bus/message-bus";
import { tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ErrorDialog } from "./error/error-dialog";
import { ErrorEntry } from "./error/global-error-handler";
import { ErrorStorage } from "./error/error-storage";
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
@ErrorHandler()
export class Handler {
  // constructor

  constructor(private errorStorage: ErrorStorage, private dialog: MatDialog, private messageBus: MessageBus, private shortcutManager: ShortcutManager) {
  }

  // private

  private openDialog(error: ErrorEntry) {
    this.errorStorage.add(error)
    this.shortcutManager.pushLevel()

    let configuration = {
      title: "Error",
      message: "Caught fatal error",
      error: error
    }

    const dialogRef = this.dialog.open(ErrorDialog, {
      data: configuration
    });

    return dialogRef.afterClosed().pipe(tap(() => this.shortcutManager.popLevel()))
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
export class AppComponent extends WithState(AbstractFeature) {
    // instance data

    locales: string[] = []

    // constructor

    constructor(private router: Router, private aboutService: AboutDialogService, private stateStorage: StateStorage, private sessionManager : SessionManager, private shortcutManager: ShortcutManager, injector: Injector,  localeManager: LocaleManager) {
      super(injector)

      this.locales = localeManager.supportedLocales

      this.onInit(() => this.loadState())
    }

    // private

   override loadState() {
      this.state = this.stateStorage.load("portal" /* TODO */, this.sessionManager.currentSession());
      if ( this.state) 
         this.applyState(this.state.data)
      else
         this.state = this.createState()
   }

   override saveState() {
      this.writeState(this.state?.data)

      this.stateStorage.save(this.state!, "portal" /* TODO */, this.sessionManager.currentSession());
   }

    // implement Stateful

    override applyState(state: any) : void {
      if (state.url)
        this.router.navigate([state.url]);
    }

    override writeState(state: any) : void {
      state.url = this.router?.url;
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