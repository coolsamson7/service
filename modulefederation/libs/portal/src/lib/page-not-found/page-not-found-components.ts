import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { take } from "rxjs";
import { FeatureRegistry } from "@modulefederation/portal";

@Component({
  selector: 'page-not-found',
  templateUrl: './page-not-found-components.html',
  //styleUrls: ['./page-not-found-components.scss'],
})
export class PageNotFoundComponent {
  // instance data

  path: string = "ouch";

  // constructor

  constructor(private route: ActivatedRoute, private featureRegistry: FeatureRegistry) {}

  ngOnInit() {
   this.route.data.pipe(take(1))
      .subscribe(data => {
        console.log(data)
        this.path = data['path']
      });
  }

}
