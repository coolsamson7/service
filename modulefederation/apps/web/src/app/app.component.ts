import { Component, HostListener, Injectable } from '@angular/core';
import {
  AboutDialogService,
  Environment, ErrorContext,
  ErrorHandler, HandleError,
  LocaleManager,
  ShortcutManager
} from "@modulefederation/portal";
import { MessageBus } from "./message-bus/message-bus";

@Injectable({ providedIn: 'root' })
@ErrorHandler()
export class Handler {
  // constructor

  constructor(private messageBus: MessageBus) {

  }

  // handler

  @HandleError()
  handleAnyError(e: any, context: ErrorContext) {
    console.log(e)
  }
  @HandleError()
  handleStringError(e: string, context: ErrorContext) {
    console.log(e)
  }
  @HandleError()
  handleError(e: Error, context: ErrorContext) {
    // log it

    console.log(e.message)
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
