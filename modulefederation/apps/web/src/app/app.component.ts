import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NullValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { AboutDialogService, Environment, LocaleManager } from "@modulefederation/portal";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    // instance data

    locales: string[] = []

    // constructor

    constructor(private aboutService: AboutDialogService, private localeManager: LocaleManager) {
        this.locales = localeManager.supportedLocales
    }

    // public

    switch(locale: string) {
        this.localeManager.setLocale(new Intl.Locale(locale))
    }

    about() {
        this.aboutService.show()
    }
}
