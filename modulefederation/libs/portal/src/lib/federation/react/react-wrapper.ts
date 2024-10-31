import { AfterContentInit, Component } from "@angular/core";

@Component({
    selector: 'react-component-wrapper',
    template: '<div #vc></div>',
  })
  // eslint-disable-next-line @angular-eslint/component-class-suffix
  export class ReactComponentWrapper implements AfterContentInit {
    // implement AfterContentInit

    ngAfterContentInit(): void {
        // TODO
        console.log()
    }
  }