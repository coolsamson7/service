import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NullValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { AboutDialogService, Environment } from "@modulefederation/portal";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    // constructor

    constructor(private aboutService: AboutDialogService) {
    }

    about() {
        this.aboutService.show()
    }
}
