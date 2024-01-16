import { Injector } from "@angular/core"

export type Injection = (injector: Injector) => any

export class InjectProperty {
  // constructor

  constructor(private property: string, private injection: Injection) {}

  // public

  inject(target: any, injector: Injector) {
    target[this.property] = this.injection(injector)
  }
}
