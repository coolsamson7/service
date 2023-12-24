import { Injector, NgModule } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { MatDialogModule } from "@angular/material/dialog";
import { AboutDialog } from "./about.dialog";
import { MatTableModule } from "@angular/material/table";

@NgModule({
    imports: [
        MatDialogModule,
        MatTableModule,
    ],
    declarations: [
        AboutDialog
    ],
    providers: []
})
export class AboutModule {
    static injector = new ReplaySubject<Injector>(1);

    constructor(injector : Injector) {
        AboutModule.injector.next(injector);
    }
}
