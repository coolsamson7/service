import { Component } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Observable, filter, map, of, switchMap } from "rxjs";
import { LocaleManager, OnLocaleChange } from "../../locale";
import { FeatureConfig } from "../../feature-config";

@Component({
    selector: 'current-feature',
    templateUrl: './current-feature.component.html',
    styleUrls: ['./current-feature.component.scss']
})
export class CurrentFeatureComponent implements OnLocaleChange {
    // instance data

    feature?: FeatureConfig = {
        id: "",
        label: "",
        icon: ""
    }

    // constructor

    constructor(private router : Router, private activatedRoute : ActivatedRoute, private localeManager: LocaleManager) {
        // listen to locale changes

        localeManager.subscribe(this)

        // listen to router events

        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => this.activatedRoute),
                map(route => route.firstChild),
                switchMap(route => (route as any).data)
            )
            .subscribe((data : any) => {
                this.feature = data['feature']
                //this.label = data['feature'].label
                //this.icon = data['feature'].icon
            });
    }

    onLocaleChange(locale: Intl.Locale): Observable<any> {
        return of()
    }
}
