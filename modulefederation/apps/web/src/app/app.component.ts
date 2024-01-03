import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NullValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { AboutDialogService, Environment, LocaleManager, ShortcutManager } from "@modulefederation/portal";

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
