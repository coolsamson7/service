import { Component } from "@angular/core";
import { SessionManager } from "../../security";


@Component({
    selector: 'current-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class CurrentUserComponent {
    // constructor

    constructor(public sessionManager : SessionManager) {
    }
}
