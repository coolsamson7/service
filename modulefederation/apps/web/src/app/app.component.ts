import { Component, HostListener, Injectable } from '@angular/core';
import {
  AboutDialogService, ErrorContext,
  ErrorHandler, HandleError,
  LocaleManager,
  ShortcutManager
} from "@modulefederation/portal";
import { MessageBus } from "./message-bus/message-bus";
import { tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ErrorDialog } from "./error/error-dialog";
import { ErrorEntry } from "./error/global-error-handler";
import { ErrorStorage } from "./error/error-storage";

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
      title: "Errors",
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

    //this.logger.error('caught error {0}: {1}', e.name, e.message);

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

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    // instance data

    locales: string[] = []

    // constructor

    constructor(private aboutService: AboutDialogService, private localeManager: LocaleManager, private shortcutManager: ShortcutManager) {
        this.locales = localeManager.supportedLocales
    }

  @HostListener('window:keydown', ['$event'])
  public handleKeydown(e : any) {
    this.shortcutManager.handleKeydown(e);
  }

    // public

    switch(locale: string) {
        this.localeManager.setLocale(new Intl.Locale(locale))
    }

    about() {
        this.aboutService.show()
    }
}
