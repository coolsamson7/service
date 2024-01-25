import { Injectable } from "@angular/core";
import { AboutDialog } from "./about.dialog";
import { DialogService } from "../dialog";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class AboutDialogService {
    // instance data

    // constructor

    constructor(private dialogs: DialogService) {
    }

    // public
    show(): Observable<any> {
        return this.dialogs.openDialog(AboutDialog, {
            data: {}
        });
    }
}


